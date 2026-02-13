'use client';
import { useState, useEffect } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useBrand } from '@/components/providers/BrandProvider';
import db, { logActivity } from '@/lib/memory/db';
import styles from './team.module.css';

const ROLES = ['Owner', 'Manager', 'Developer', 'Designer', 'Marketer', 'Content Creator', 'Analyst', 'Support', 'Intern'];

export default function TeamPage() {
    const { brand } = useBrand();
    const [members, setMembers] = useState([]);
    const [showAdd, setShowAdd] = useState(false);
    const [form, setForm] = useState({ name: '', role: '', email: '', phone: '', notes: '' });

    useEffect(() => { if (brand) loadMembers(); }, [brand]);

    const loadMembers = async () => {
        const m = await db.members.where('brandId').equals(brand.id).toArray();
        setMembers(m);
    };

    const addMember = async () => {
        if (!form.name.trim()) return;
        await db.members.add({ brandId: brand.id, ...form, createdAt: new Date().toISOString() });
        await logActivity(brand.id, 'team', `${form.name} joined as ${form.role}`);
        setForm({ name: '', role: '', email: '', phone: '', notes: '' });
        setShowAdd(false);
        await loadMembers();
    };

    const removeMember = async (id) => {
        await db.members.delete(id);
        await loadMembers();
    };

    if (!brand) {
        return (
            <AppShell pageTitle="Team">
                <div className={styles.empty}><div className={styles.emptyIcon}>👥</div><h2>Setup your brand first</h2></div>
            </AppShell>
        );
    }

    return (
        <AppShell pageTitle="Team">
            <div className={styles.page}>
                <div className={styles.header}>
                    <div>
                        <h2 className={styles.title}>Team ({members.length})</h2>
                        <p className={styles.subtitle}>Manage your team members and their roles</p>
                    </div>
                    <button className={styles.btnPrimary} onClick={() => setShowAdd(true)}>+ Add Member</button>
                </div>

                {members.length > 0 ? (
                    <div className={styles.grid}>
                        {members.map(m => (
                            <div key={m.id} className={styles.memberCard}>
                                <div className={styles.avatar}>{m.name.charAt(0).toUpperCase()}</div>
                                <h4 className={styles.memberName}>{m.name}</h4>
                                <span className={styles.memberRole}>{m.role}</span>
                                {m.email && <p className={styles.memberEmail}>📧 {m.email}</p>}
                                {m.phone && <p className={styles.memberPhone}>📞 {m.phone}</p>}
                                <button className={styles.removeBtn} onClick={() => removeMember(m.id)}>Remove</button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={styles.empty}>
                        <div className={styles.emptyIcon}>👥</div>
                        <h2>No team members yet</h2>
                        <button className={styles.btnPrimary} onClick={() => setShowAdd(true)}>+ Add First Member</button>
                    </div>
                )}

                {showAdd && (
                    <div className={styles.modal}>
                        <div className={styles.modalContent}>
                            <h3>Add Team Member</h3>
                            <input placeholder="Full name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                            <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                                <option value="">Select role</option>
                                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                            <input placeholder="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                            <input placeholder="Phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                            <div className={styles.modalActions}>
                                <button className={styles.btnSecondary} onClick={() => setShowAdd(false)}>Cancel</button>
                                <button className={styles.btnPrimary} onClick={addMember}>Add</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppShell>
    );
}
