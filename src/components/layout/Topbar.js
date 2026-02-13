'use client';
import { useTheme } from '../providers/ThemeProvider';
import styles from './Topbar.module.css';

export default function Topbar({ title, onMenuClick }) {
    const { theme, toggleTheme } = useTheme();

    return (
        <header className={styles.topbar}>
            <div className={styles.leftSection}>
                <button className={styles.menuBtn} onClick={onMenuClick}>☰</button>
                <h1 className={styles.pageTitle}>{title || 'Dashboard'}</h1>
            </div>

            <div className={styles.rightSection}>
                {/* Search */}
                <div className={styles.searchBar}>
                    <span className={styles.searchIcon}>🔍</span>
                    <input
                        className={styles.searchInput}
                        placeholder="Search anything..."
                        type="text"
                    />
                </div>

                {/* Theme Toggle */}
                <button className={styles.iconBtn} onClick={toggleTheme} title="Toggle theme">
                    {theme === 'dark' ? '☀️' : '🌙'}
                </button>

                {/* Notifications */}
                <button className={styles.iconBtn}>
                    🔔
                    <span className={styles.badge}></span>
                </button>

                {/* Avatar */}
                <div className={styles.avatar}>U</div>
            </div>
        </header>
    );
}
