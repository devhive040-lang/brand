'use client';
import { useState, useEffect } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useBrand } from '@/components/providers/BrandProvider';
import db, { logActivity } from '@/lib/memory/db';
import styles from './documents.module.css';

const DOC_TYPES = [
    { type: 'report', icon: '📊', label: 'Business Report', desc: 'Generate professional PDF reports' },
    { type: 'proposal', icon: '📝', label: 'Proposal', desc: 'Client proposals and pitches' },
    { type: 'invoice', icon: '💰', label: 'Invoice', desc: 'Professional invoices' },
    { type: 'contract', icon: '📋', label: 'Contract', desc: 'Business agreements' },
    { type: 'presentation', icon: '🎯', label: 'Presentation', desc: 'Slide-based presentations' },
    { type: 'spreadsheet', icon: '📈', label: 'Spreadsheet', desc: 'Data and financial sheets' },
];

export default function DocumentsPage() {
    const { brand } = useBrand();
    const [docs, setDocs] = useState([]);
    const [showCreate, setShowCreate] = useState(false);
    const [newDoc, setNewDoc] = useState({ title: '', type: 'report', content: '' });

    useEffect(() => { if (brand) loadDocs(); }, [brand]);

    const loadDocs = async () => {
        const d = await db.documents.where('brandId').equals(brand.id).reverse().toArray();
        setDocs(d);
    };

    const createDoc = async () => {
        if (!newDoc.title.trim()) return;
        await db.documents.add({
            brandId: brand.id, ...newDoc, createdAt: new Date().toISOString(),
        });
        await logActivity(brand.id, 'document', `Document "${newDoc.title}" created`);
        setNewDoc({ title: '', type: 'report', content: '' });
        setShowCreate(false);
        await loadDocs();
    };

    const deleteDoc = async (id) => {
        await db.documents.delete(id);
        await loadDocs();
    };

    if (!brand) {
        return (
            <AppShell pageTitle="Documents">
                <div className={styles.empty}><div className={styles.emptyIcon}>📄</div><h2>Setup your brand first</h2></div>
            </AppShell>
        );
    }

    return (
        <AppShell pageTitle="Documents">
            <div className={styles.page}>
                <div className={styles.header}>
                    <div>
                        <h2 className={styles.title}>Documents</h2>
                        <p className={styles.subtitle}>Generate branded reports, proposals, and templates</p>
                    </div>
                    <button className={styles.btnPrimary} onClick={() => setShowCreate(true)}>+ New Document</button>
                </div>

                {/* Document Types */}
                <div className={styles.typesGrid}>
                    {DOC_TYPES.map(dt => (
                        <div key={dt.type} className={styles.typeCard} onClick={() => { setNewDoc(d => ({ ...d, type: dt.type })); setShowCreate(true); }}>
                            <div className={styles.typeIcon}>{dt.icon}</div>
                            <h4>{dt.label}</h4>
                            <p>{dt.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Documents List */}
                {docs.length > 0 && (
                    <>
                        <h3 className={styles.sectionTitle}>Recent Documents</h3>
                        <div className={styles.docList}>
                            {docs.map(d => (
                                <div key={d.id} className={styles.docItem}>
                                    <div className={styles.docIcon}>{DOC_TYPES.find(t => t.type === d.type)?.icon || '📄'}</div>
                                    <div className={styles.docInfo}>
                                        <h4>{d.title}</h4>
                                        <span>{d.type} · {new Date(d.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <button className={styles.deleteBtn} onClick={() => deleteDoc(d.id)}>🗑️</button>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {showCreate && (
                    <div className={styles.modal}>
                        <div className={styles.modalContent}>
                            <h3>Create Document</h3>
                            <input placeholder="Document title" value={newDoc.title} onChange={e => setNewDoc(d => ({ ...d, title: e.target.value }))} />
                            <select value={newDoc.type} onChange={e => setNewDoc(d => ({ ...d, type: e.target.value }))}>
                                {DOC_TYPES.map(dt => <option key={dt.type} value={dt.type}>{dt.label}</option>)}
                            </select>
                            <textarea placeholder="Content or notes..." value={newDoc.content} onChange={e => setNewDoc(d => ({ ...d, content: e.target.value }))} rows={5} />
                            <div className={styles.modalActions}>
                                <button className={styles.btnSecondary} onClick={() => setShowCreate(false)}>Cancel</button>
                                <button className={styles.btnPrimary} onClick={createDoc}>Create</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppShell>
    );
}
