'use client';
import AppShell from '@/components/layout/AppShell';

export default function ChatPage() {
    return (
        <AppShell pageTitle="AI Assistant">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ fontSize: '4rem' }}>🤖</div>
                <h2 className="gradient-text" style={{ fontSize: '2rem', fontWeight: 700 }}>AI Assistant</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Coming in Phase 2 — Your intelligent brand companion</p>
            </div>
        </AppShell>
    );
}
