'use client';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import styles from './Sidebar.module.css';

const NAV_ITEMS = [
    {
        label: 'Main',
        items: [
            { name: 'Dashboard', icon: '📊', path: '/' },
            { name: 'AI Assistant', icon: '🤖', path: '/chat' },
            { name: 'AI Agent', icon: '⚡', path: '/agent' },
        ]
    },
    {
        label: 'Brand',
        items: [
            { name: 'Brand Identity', icon: '🎨', path: '/brand' },
            { name: 'Marketing', icon: '📣', path: '/marketing' },
            { name: 'Social Media', icon: '📱', path: '/social' },
        ]
    },
    {
        label: 'Tools',
        items: [
            { name: 'Projects', icon: '📋', path: '/projects' },
            { name: 'Team', icon: '👥', path: '/team' },
            { name: 'Documents', icon: '📄', path: '/documents' },
            { name: 'Video Studio', icon: '🎬', path: '/video' },
        ]
    },
];

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
    const pathname = usePathname();

    return (
        <>
            <div className={`${styles.overlay} ${mobileOpen ? styles.visible : ''}`} onClick={onMobileClose} />
            <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''} ${mobileOpen ? styles.mobileOpen : ''}`}>

                {/* Logo */}
                <div className={styles.logoArea}>
                    <div className={styles.logoIcon}>B</div>
                    {!collapsed && <div className={styles.logoText}>Brand<span>AI</span></div>}
                </div>

                {/* Navigation */}
                <nav className={styles.navSection}>
                    {NAV_ITEMS.map((section) => (
                        <div key={section.label}>
                            {!collapsed && <div className={styles.navLabel}>{section.label}</div>}
                            {section.items.map((item) => (
                                <Link
                                    key={item.path}
                                    href={item.path}
                                    className={`${styles.navItem} ${pathname === item.path ? styles.active : ''}`}
                                    onClick={onMobileClose}
                                >
                                    <span className={styles.navIcon}>{item.icon}</span>
                                    {!collapsed && <span className={styles.navText}>{item.name}</span>}
                                </Link>
                            ))}
                        </div>
                    ))}
                </nav>

                {/* Bottom */}
                <div className={styles.bottomSection}>
                    <Link href="/settings" className={`${styles.navItem} ${pathname === '/settings' ? styles.active : ''}`}>
                        <span className={styles.navIcon}>⚙️</span>
                        {!collapsed && <span className={styles.navText}>Settings</span>}
                    </Link>
                    <button className={styles.collapseBtn} onClick={onToggle}>
                        <span className={styles.navIcon}>{collapsed ? '▶' : '◀'}</span>
                        {!collapsed && <span className={styles.navText}>Collapse</span>}
                    </button>
                </div>
            </aside>
        </>
    );
}
