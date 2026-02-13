'use client';
import AppShell from '@/components/layout/AppShell';

export default function SettingsPage() {
    return (
        <AppShell pageTitle="Settings">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ fontSize: '4rem' }}>⚙️</div>
                <h2 className="gradient-text" style={{ fontSize: '2rem', fontWeight: 700 }}>Settings</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Theme, AI providers, storage &amp; preferences</p>
            </div>
        </AppShell>
    );
}
