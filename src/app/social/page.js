'use client';
import AppShell from '@/components/layout/AppShell';

export default function SocialPage() {
    return (
        <AppShell pageTitle="Social Media">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ fontSize: '4rem' }}>📱</div>
                <h2 className="gradient-text" style={{ fontSize: '2rem', fontWeight: 700 }}>Social Media Designer</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Coming in Phase 6 — Create stunning posts</p>
            </div>
        </AppShell>
    );
}
