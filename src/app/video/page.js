'use client';
import AppShell from '@/components/layout/AppShell';

export default function VideoPage() {
    return (
        <AppShell pageTitle="Video Studio">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ fontSize: '4rem' }}>🎬</div>
                <h2 className="gradient-text" style={{ fontSize: '2rem', fontWeight: 700 }}>Video Studio</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Coming in Phase 7 — FFmpeg-powered brand videos</p>
            </div>
        </AppShell>
    );
}
