'use client';
import { useState, useEffect } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useBrand } from '@/components/providers/BrandProvider';
import { useAI } from '@/components/providers/AIProvider';
import { sendMessage } from '@/lib/ai/router';
import db, { logActivity } from '@/lib/memory/db';
import styles from './social.module.css';

const PLATFORMS = [
    { name: 'Instagram', icon: '📸', sizes: { post: '1080×1080', story: '1080×1920', reel: '1080×1920' } },
    { name: 'Facebook', icon: '📘', sizes: { post: '1200×630', story: '1080×1920', cover: '820×312' } },
    { name: 'Twitter/X', icon: '🐦', sizes: { tweet: '1200×675', header: '1500×500' } },
    { name: 'LinkedIn', icon: '💼', sizes: { post: '1200×627', banner: '1584×396' } },
    { name: 'TikTok', icon: '🎵', sizes: { video: '1080×1920' } },
    { name: 'YouTube', icon: '🎬', sizes: { thumbnail: '1280×720', banner: '2560×1440' } },
];

export default function SocialPage() {
    const { brand } = useBrand();
    const { provider, apiKeys, models } = useAI();
    const [platform, setPlatform] = useState(PLATFORMS[0]);
    const [content, setContent] = useState('');
    const [caption, setCaption] = useState('');
    const [hashtags, setHashtags] = useState('');
    const [generating, setGenerating] = useState(false);
    const [bgColor, setBgColor] = useState(brand?.colors?.[0] || '#6366f1');
    const [textColor, setTextColor] = useState('#ffffff');

    const generateContent = async () => {
        if (!content.trim()) return;
        setGenerating(true);
        try {
            const result = await sendMessage({
                provider, apiKey: apiKeys[provider] || '', model: models[provider],
                messages: [{ role: 'user', content: `Generate a ${platform.name} post caption and relevant hashtags for the following topic: "${content}". Brand: ${brand?.name || 'Unknown'}. Tone: ${brand?.tone || 'Professional'}. Format: First the caption, then on a new line starting with "Hashtags:" provide relevant hashtags.` }],
                systemPrompt: 'You are a social media expert. Generate engaging captions and relevant hashtags.'
            });
            const parts = result.split('Hashtags:');
            setCaption(parts[0]?.trim() || result);
            setHashtags(parts[1]?.trim() || '');
            if (brand) await logActivity(brand.id, 'social', `AI generated ${platform.name} content`);
        } catch (err) {
            setCaption(`⚠️ Error: ${err.message}`);
        }
        setGenerating(false);
    };

    if (!brand) {
        return (
            <AppShell pageTitle="Social Media">
                <div className={styles.empty}><div className={styles.emptyIcon}>📱</div><h2>Setup your brand first</h2></div>
            </AppShell>
        );
    }

    return (
        <AppShell pageTitle="Social Media Designer">
            <div className={styles.page}>
                <div className={styles.header}>
                    <div><h2 className={styles.title}>Social Media Designer</h2><p className={styles.subtitle}>Create and schedule branded content</p></div>
                </div>

                <div className={styles.layout}>
                    {/* Platform Selector */}
                    <div className={styles.sidebar}>
                        <h3 className={styles.sidebarTitle}>Platforms</h3>
                        {PLATFORMS.map(p => (
                            <button key={p.name} className={`${styles.platBtn} ${platform.name === p.name ? styles.activePlat : ''}`}
                                onClick={() => setPlatform(p)}>
                                <span>{p.icon}</span> {p.name}
                            </button>
                        ))}
                    </div>

                    {/* Canvas / Preview */}
                    <div className={styles.canvas}>
                        <div className={styles.preview} style={{ background: bgColor, color: textColor }}>
                            <div className={styles.previewContent}>
                                {brand?.logo && <img src={brand.logo} alt="Logo" className={styles.previewLogo} />}
                                <h3 style={{ color: textColor }}>{content || 'Your message here...'}</h3>
                                {brand?.name && <p className={styles.previewBrand}>{brand.name}</p>}
                            </div>
                        </div>

                        <div className={styles.controls}>
                            <div className={styles.controlRow}>
                                <label>Background</label>
                                <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} />
                            </div>
                            <div className={styles.controlRow}>
                                <label>Text Color</label>
                                <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} />
                            </div>
                            <div className={styles.controlRow}>
                                <label>Size</label>
                                <select>
                                    {Object.entries(platform.sizes).map(([k, v]) => (
                                        <option key={k} value={v}>{k}: {v}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Content Editor */}
                    <div className={styles.editor}>
                        <h3 className={styles.sidebarTitle}>Content</h3>
                        <textarea className={styles.contentInput} placeholder="What do you want to post about?" value={content}
                            onChange={e => setContent(e.target.value)} rows={3} />
                        <button className={styles.btnPrimary} onClick={generateContent} disabled={generating}>
                            {generating ? '⏳ Generating...' : '🤖 AI Generate Caption'}
                        </button>

                        {caption && (
                            <div className={styles.captionBox}>
                                <h4>Generated Caption</h4>
                                <p>{caption}</p>
                            </div>
                        )}
                        {hashtags && (
                            <div className={styles.hashtagBox}>
                                <h4>Hashtags</h4>
                                <p>{hashtags}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
