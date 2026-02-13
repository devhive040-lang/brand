'use client';
import { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import styles from './AppShell.module.css';

export default function AppShell({ children, pageTitle }) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className={styles.shell}>
            {/* Animated Background Orbs */}
            <div className={styles.bgOrb1} />
            <div className={styles.bgOrb2} />
            <div className={styles.bgOrb3} />

            <Sidebar
                collapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                mobileOpen={mobileOpen}
                onMobileClose={() => setMobileOpen(false)}
            />

            <div className={`${styles.main} ${sidebarCollapsed ? styles.sidebarCollapsed : ''}`}>
                <Topbar
                    title={pageTitle}
                    onMenuClick={() => setMobileOpen(true)}
                />
                <main className={styles.content}>
                    {children}
                </main>
            </div>
        </div>
    );
}
