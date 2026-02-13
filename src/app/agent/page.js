'use client';
import AppShell from '@/components/layout/AppShell';

export default function AgentPage() {
    return (
        <AppShell pageTitle="AI Agent">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ fontSize: '4rem' }}>⚡</div>
                <h2 className="gradient-text" style={{ fontSize: '2rem', fontWeight: 700 }}>AI Agent</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Coming in Phase 8 — Autonomous task execution</p>
            </div>
        </AppShell>
    );
}
