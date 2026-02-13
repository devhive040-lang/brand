'use client';
import AppShell from '@/components/layout/AppShell';
import Link from 'next/link';
import styles from './page.module.css';

const STATS = [
  { icon: '📋', label: 'Active Projects', value: '0', trend: 'New', trendType: 'up' },
  { icon: '✅', label: 'Tasks Completed', value: '0', trend: 'Start', trendType: 'up' },
  { icon: '🎯', label: 'Brand Score', value: '—', trend: 'Setup', trendType: 'up' },
  { icon: '📈', label: 'Growth Rate', value: '—', trend: 'Track', trendType: 'up' },
];

const QUICK_ACTIONS = [
  { icon: '🤖', label: 'Chat with AI', desc: 'Ask your brand assistant', path: '/chat' },
  { icon: '🎨', label: 'Brand Setup', desc: 'Define your identity', path: '/brand' },
  { icon: '📋', label: 'New Project', desc: 'Start a new project', path: '/projects' },
  { icon: '📣', label: 'Marketing Plan', desc: 'Create a campaign', path: '/marketing' },
  { icon: '🎬', label: 'Create Video', desc: 'Generate brand video', path: '/video' },
  { icon: '📄', label: 'New Document', desc: 'Generate reports', path: '/documents' },
];

const ACTIVITIES = [
  { color: 'var(--brand-primary)', text: 'Welcome to Brand AI! Start by setting up your brand identity.', time: 'Just now' },
  { color: 'var(--success)', text: 'Platform initialized successfully.', time: 'Just now' },
  { color: 'var(--brand-secondary)', text: 'AI Assistant is ready and waiting for your first conversation.', time: 'Just now' },
];

export default function Dashboard() {
  return (
    <AppShell pageTitle="Dashboard">
      <div className={styles.dashboard}>
        {/* Welcome Section */}
        <div className={styles.welcome}>
          <h2 className={styles.welcomeTitle}>
            Welcome to <span className="gradient-text">Brand AI</span> 👋
          </h2>
          <p className={styles.welcomeSub}>Your intelligent business companion is ready. Let&apos;s build something amazing.</p>
        </div>

        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          {STATS.map((stat, i) => (
            <div key={i} className={styles.statCard}>
              <div className={styles.statHeader}>
                <div className={styles.statIcon}>{stat.icon}</div>
                <span className={`${styles.statTrend} ${stat.trendType === 'up' ? styles.trendUp : styles.trendDown}`}>
                  {stat.trend}
                </span>
              </div>
              <div className={styles.statValue}>{stat.value}</div>
              <div className={styles.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <h3 className={styles.sectionTitle}>Quick Actions</h3>
        <div className={styles.actionsGrid}>
          {QUICK_ACTIONS.map((action, i) => (
            <Link key={i} href={action.path} className={styles.actionCard}>
              <div className={styles.actionIcon}>{action.icon}</div>
              <div>
                <div className={styles.actionLabel}>{action.label}</div>
                <div className={styles.actionDesc}>{action.desc}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Two Column: Activity + AI Status */}
        <div className={styles.twoCol}>
          {/* Recent Activity */}
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <h3 className={styles.panelTitle}>Recent Activity</h3>
              <span className={styles.viewAll}>View All</span>
            </div>
            {ACTIVITIES.map((activity, i) => (
              <div key={i} className={styles.activityItem}>
                <div className={styles.activityDot} style={{ background: activity.color }} />
                <div>
                  <div className={styles.activityText}>{activity.text}</div>
                  <div className={styles.activityTime}>{activity.time}</div>
                </div>
              </div>
            ))}
          </div>

          {/* AI Status */}
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <h3 className={styles.panelTitle}>AI Status</h3>
            </div>
            <div className={styles.aiStatus}>
              <div className={styles.aiCard}>
                <div className={styles.aiCardIcon}>🤖</div>
                <div className={styles.aiCardInfo}>
                  <div className={styles.aiCardTitle}>AI Assistant</div>
                  <div className={styles.aiCardStatus}>
                    <span className={`${styles.statusDot} ${styles.online}`} />
                    Ready
                  </div>
                </div>
              </div>
              <div className={styles.aiCard}>
                <div className={styles.aiCardIcon}>⚡</div>
                <div className={styles.aiCardInfo}>
                  <div className={styles.aiCardTitle}>AI Agent</div>
                  <div className={styles.aiCardStatus}>
                    <span className={`${styles.statusDot} ${styles.online}`} />
                    Standing By
                  </div>
                </div>
              </div>
              <div className={styles.aiCard}>
                <div className={styles.aiCardIcon}>🧠</div>
                <div className={styles.aiCardInfo}>
                  <div className={styles.aiCardTitle}>Memory System</div>
                  <div className={styles.aiCardStatus}>
                    <span className={`${styles.statusDot} ${styles.online}`} />
                    Active · 0 items stored
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
