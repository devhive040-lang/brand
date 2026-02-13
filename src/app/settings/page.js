'use client';
import { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useTheme } from '@/components/providers/ThemeProvider';
import { useAI } from '@/components/providers/AIProvider';
import { PROVIDERS, testConnection } from '@/lib/ai/router';
import db from '@/lib/memory/db';
import styles from './settings.module.css';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { provider, apiKeys, models, saveProvider, saveApiKey, saveModel } = useAI();
  const [tab, setTab] = useState('ai');
  const [connectionStatus, setConnectionStatus] = useState({});
  const [testing, setTesting] = useState('');

  const handleTestConnection = async (prov) => {
    setTesting(prov);
    const ok = await testConnection(prov, apiKeys[prov] || '');
    setConnectionStatus(prev => ({ ...prev, [prov]: ok }));
    setTesting('');
  };

  const clearAllData = async () => {
    if (confirm('⚠️ This will delete ALL data (brands, projects, conversations, etc.). Are you sure?')) {
      await db.delete();
      window.location.reload();
    }
  };

  const TABS = [
    { key: 'ai', label: '🤖 AI Providers' },
    { key: 'appearance', label: '🎨 Appearance' },
    { key: 'data', label: '💾 Data & Storage' },
    { key: 'about', label: 'ℹ️ About' },
  ];

  return (
    <AppShell pageTitle="Settings">
      <div className={styles.page}>
        <h2 className={styles.title}>Settings</h2>

        <div className={styles.layout}>
          <div className={styles.sidebar}>
            {TABS.map(t => (
              <button key={t.key} className={`${styles.tab} ${tab === t.key ? styles.activeTab : ''}`}
                onClick={() => setTab(t.key)}>
                {t.label}
              </button>
            ))}
          </div>

          <div className={styles.content}>
            {tab === 'ai' && (
              <div className={styles.section}>
                <h3>AI Provider Configuration</h3>
                <p className={styles.desc}>Select your default AI provider and enter API keys.</p>
                <div className={styles.providersList}>
                  {Object.entries(PROVIDERS).map(([key, prov]) => (
                    <div key={key} className={`${styles.providerCard} ${provider === key ? styles.activeProvider : ''}`}>
                      <div className={styles.providerHeader}>
                        <div>
                          <h4>{prov.name}</h4>
                          <span className={styles.modelLabel}>Model: {models[key] || prov.defaultModel}</span>
                        </div>
                        <button className={provider === key ? styles.selectedBtn : styles.selectBtn}
                          onClick={() => saveProvider(key)}>
                          {provider === key ? '✓ Active' : 'Select'}
                        </button>
                      </div>
                      {key !== 'ollama' && (
                        <div className={styles.formGroup}>
                          <label>API Key</label>
                          <input type="password" placeholder={`Enter ${prov.name} API key`}
                            value={apiKeys[key] || ''} onChange={e => saveApiKey(key, e.target.value)} />
                        </div>
                      )}
                      <div className={styles.formGroup}>
                        <label>Model</label>
                        <input placeholder={prov.defaultModel} value={models[key] || ''}
                          onChange={e => saveModel(key, e.target.value)} />
                      </div>
                      <div className={styles.providerFooter}>
                        <button className={styles.testBtn} onClick={() => handleTestConnection(key)} disabled={testing === key}>
                          {testing === key ? '⏳ Testing...' : '🔌 Test Connection'}
                        </button>
                        {connectionStatus[key] !== undefined && (
                          <span className={connectionStatus[key] ? styles.connected : styles.disconnected}>
                            {connectionStatus[key] ? '✅ Connected' : '❌ Failed'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'appearance' && (
              <div className={styles.section}>
                <h3>Appearance</h3>
                <div className={styles.themeSelector}>
                  {['dark', 'light'].map(t => (
                    <button key={t} className={`${styles.themeCard} ${theme === t ? styles.activeTheme : ''}`}
                      onClick={() => setTheme(t)}>
                      <div className={styles.themePreview} data-theme-preview={t}>
                        <div className={styles.themePreviewBar} />
                        <div className={styles.themePreviewContent} />
                      </div>
                      <span>{t === 'dark' ? '🌙 Dark' : '☀️ Light'}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {tab === 'data' && (
              <div className={styles.section}>
                <h3>Data & Storage</h3>
                <p className={styles.desc}>All data is stored locally in your browser using IndexedDB.</p>
                <div className={styles.dangerZone}>
                  <h4>⚠️ Danger Zone</h4>
                  <p>Clear all data from the application. This cannot be undone.</p>
                  <button className={styles.dangerBtn} onClick={clearAllData}>🗑️ Clear All Data</button>
                </div>
              </div>
            )}

            {tab === 'about' && (
              <div className={styles.section}>
                <h3>About Brand AI</h3>
                <div className={styles.aboutCard}>
                  <h2 className="gradient-text">Brand AI</h2>
                  <p>Smart Business Intelligence Platform</p>
                  <p className={styles.version}>Version 1.0.0</p>
                  <div className={styles.techStack}>
                    <span>Next.js</span><span>•</span><span>Dexie.js</span><span>•</span><span>OpenAI / Gemini / Ollama</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
