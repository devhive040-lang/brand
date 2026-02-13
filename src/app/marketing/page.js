'use client';
import { useState, useEffect } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useBrand } from '@/components/providers/BrandProvider';
import db, { logActivity } from '@/lib/memory/db';
import styles from './marketing.module.css';

const PLATFORMS = ['Instagram', 'Facebook', 'Twitter/X', 'LinkedIn', 'TikTok', 'YouTube', 'Email'];
const STATUSES = ['draft', 'planned', 'active', 'paused', 'completed'];

export default function MarketingPage() {
    const { brand } = useBrand();
    const [campaigns, setCampaigns] = useState([]);
    const [posts, setPosts] = useState([]);
    const [showNew, setShowNew] = useState(false);
    const [showNewPost, setShowNewPost] = useState(false);
    const [activeCampaign, setActiveCampaign] = useState(null);
    const [form, setForm] = useState({ name: '', description: '', status: 'draft', startDate: '', endDate: '', budget: '' });
    const [postForm, setPostForm] = useState({ platform: 'Instagram', content: '', scheduledAt: '', status: 'draft' });
    const [tab, setTab] = useState('campaigns');

    useEffect(() => { if (brand) loadCampaigns(); }, [brand]);
    useEffect(() => { if (activeCampaign) loadPosts(); }, [activeCampaign]);

    const loadCampaigns = async () => {
        const c = await db.campaigns.where('brandId').equals(brand.id).toArray();
        setCampaigns(c);
        if (c.length > 0 && !activeCampaign) setActiveCampaign(c[0]);
    };

    const loadPosts = async () => {
        const p = await db.posts.where('campaignId').equals(activeCampaign.id).toArray();
        setPosts(p);
    };

    const addCampaign = async () => {
        if (!form.name.trim()) return;
        const id = await db.campaigns.add({ brandId: brand.id, ...form, createdAt: new Date().toISOString() });
        await logActivity(brand.id, 'campaign', `Campaign "${form.name}" created`);
        setForm({ name: '', description: '', status: 'draft', startDate: '', endDate: '', budget: '' });
        setShowNew(false);
        await loadCampaigns();
        setActiveCampaign(await db.campaigns.get(id));
    };

    const addPost = async () => {
        if (!postForm.content.trim()) return;
        await db.posts.add({ campaignId: activeCampaign.id, brandId: brand.id, ...postForm, createdAt: new Date().toISOString() });
        await logActivity(brand.id, 'post', `Post created for ${postForm.platform}`);
        setPostForm({ platform: 'Instagram', content: '', scheduledAt: '', status: 'draft' });
        setShowNewPost(false);
        await loadPosts();
    };

    const deletePost = async (id) => { await db.posts.delete(id); await loadPosts(); };

    if (!brand) {
        return (
            <AppShell pageTitle="Marketing Hub">
                <div className={styles.empty}><div className={styles.emptyIcon}>📣</div><h2>Setup your brand first</h2></div>
            </AppShell>
        );
    }

    return (
        <AppShell pageTitle="Marketing Hub">
            <div className={styles.page}>
                <div className={styles.header}>
                    <div><h2 className={styles.title}>Marketing Hub</h2><p className={styles.subtitle}>Plan campaigns and manage content</p></div>
                    <div className={styles.headerActions}>
                        <button className={styles.btnPrimary} onClick={() => setShowNew(true)}>+ New Campaign</button>
                    </div>
                </div>

                {/* Tabs */}
                <div className={styles.tabs}>
                    <button className={`${styles.tab} ${tab === 'campaigns' ? styles.active : ''}`} onClick={() => setTab('campaigns')}>📊 Campaigns</button>
                    <button className={`${styles.tab} ${tab === 'content' ? styles.active : ''}`} onClick={() => setTab('content')}>📝 Content Calendar</button>
                </div>

                {/* Campaigns Tab */}
                {tab === 'campaigns' && (
                    <div className={styles.campaignGrid}>
                        {campaigns.map(c => (
                            <div key={c.id} className={`${styles.campaignCard} ${activeCampaign?.id === c.id ? styles.activeCampaign : ''}`}
                                onClick={() => { setActiveCampaign(c); setTab('content'); }}>
                                <div className={styles.campaignHeader}>
                                    <h4>{c.name}</h4>
                                    <span className={`${styles.status} ${styles[c.status]}`}>{c.status}</span>
                                </div>
                                {c.description && <p className={styles.campaignDesc}>{c.description}</p>}
                                <div className={styles.campaignMeta}>
                                    {c.startDate && <span>📅 {c.startDate}</span>}
                                    {c.budget && <span>💰 ${c.budget}</span>}
                                </div>
                            </div>
                        ))}
                        {campaigns.length === 0 && (
                            <div className={styles.emptyInline}>
                                <p>No campaigns yet. Create your first campaign to get started.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Content Calendar Tab */}
                {tab === 'content' && activeCampaign && (
                    <div>
                        <div className={styles.contentHeader}>
                            <h3>{activeCampaign.name} — Content</h3>
                            <button className={styles.btnPrimary} onClick={() => setShowNewPost(true)}>+ Add Post</button>
                        </div>
                        <div className={styles.postsGrid}>
                            {posts.map(p => (
                                <div key={p.id} className={styles.postCard}>
                                    <div className={styles.postPlatform}>{p.platform}</div>
                                    <p className={styles.postContent}>{p.content}</p>
                                    {p.scheduledAt && <span className={styles.postDate}>📅 {p.scheduledAt}</span>}
                                    <div className={styles.postActions}>
                                        <span className={`${styles.status} ${styles[p.status]}`}>{p.status}</span>
                                        <button className={styles.deleteBtn} onClick={() => deletePost(p.id)}>🗑️</button>
                                    </div>
                                </div>
                            ))}
                            {posts.length === 0 && <p className={styles.emptyInline}>No posts yet for this campaign.</p>}
                        </div>
                    </div>
                )}

                {/* New Campaign Modal */}
                {showNew && (
                    <div className={styles.modal}>
                        <div className={styles.modalContent}>
                            <h3>New Campaign</h3>
                            <input placeholder="Campaign name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                            <textarea placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} />
                            <div className={styles.row}>
                                <input type="date" placeholder="Start" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
                                <input type="date" placeholder="End" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
                            </div>
                            <input placeholder="Budget" type="number" value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} />
                            <div className={styles.modalActions}>
                                <button className={styles.btnSecondary} onClick={() => setShowNew(false)}>Cancel</button>
                                <button className={styles.btnPrimary} onClick={addCampaign}>Create</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* New Post Modal */}
                {showNewPost && (
                    <div className={styles.modal}>
                        <div className={styles.modalContent}>
                            <h3>New Post</h3>
                            <select value={postForm.platform} onChange={e => setPostForm(f => ({ ...f, platform: e.target.value }))}>
                                {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                            <textarea placeholder="Post content..." value={postForm.content} onChange={e => setPostForm(f => ({ ...f, content: e.target.value }))} rows={4} />
                            <input type="datetime-local" value={postForm.scheduledAt} onChange={e => setPostForm(f => ({ ...f, scheduledAt: e.target.value }))} />
                            <div className={styles.modalActions}>
                                <button className={styles.btnSecondary} onClick={() => setShowNewPost(false)}>Cancel</button>
                                <button className={styles.btnPrimary} onClick={addPost}>Add Post</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppShell>
    );
}
