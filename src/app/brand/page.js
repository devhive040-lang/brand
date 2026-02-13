'use client';
import { useState, useEffect, useRef } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useBrand } from '@/components/providers/BrandProvider';
import db, { logActivity } from '@/lib/memory/db';
import styles from './brand.module.css';

const PALETTES = [
    ['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe'],
    ['#a855f7', '#c084fc', '#d8b4fe', '#e9d5ff'],
    ['#06b6d4', '#22d3ee', '#67e8f9', '#a5f3fc'],
    ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0'],
    ['#f59e0b', '#fbbf24', '#fcd34d', '#fde68a'],
    ['#ef4444', '#f87171', '#fca5a5', '#fecaca'],
];

const FONTS = [
    'Inter', 'Roboto', 'Poppins', 'Montserrat', 'Outfit',
    'DM Sans', 'Plus Jakarta Sans', 'Nunito', 'Space Grotesk', 'Cairo',
];

const INDUSTRIES = [
    'Technology', 'E-commerce', 'Healthcare', 'Education', 'Finance',
    'Food & Beverage', 'Real Estate', 'Fashion', 'Travel', 'Media',
    'Consulting', 'Manufacturing', 'SaaS', 'Non-profit', 'Other',
];

const TONES = [
    'Professional', 'Friendly', 'Bold', 'Elegant', 'Playful',
    'Authoritative', 'Casual', 'Innovative', 'Warm', 'Minimalist',
];

export default function BrandPage() {
    const { brand, createBrand, updateBrand, loadBrands } = useBrand();
    const [form, setForm] = useState({
        name: '', tagline: '', mission: '', vision: '',
        industry: '', audience: '', tone: '', description: '',
        colors: [], fonts: '', logo: null,
    });
    const [editing, setEditing] = useState(!brand);
    const [tab, setTab] = useState('profile');
    const logoRef = useRef(null);

    useEffect(() => {
        if (brand) {
            setForm({
                name: brand.name || '',
                tagline: brand.tagline || '',
                mission: brand.mission || '',
                vision: brand.vision || '',
                industry: brand.industry || '',
                audience: brand.audience || '',
                tone: brand.tone || '',
                description: brand.description || '',
                colors: brand.colors || [],
                fonts: brand.fonts || '',
                logo: brand.logo || null,
            });
            setEditing(false);
        } else {
            setEditing(true);
        }
    }, [brand]);

    const updateField = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

    const handleSave = async () => {
        if (!form.name.trim()) return;
        if (brand) {
            await updateBrand(brand.id, form);
        } else {
            await createBrand(form);
        }
        setEditing(false);
    };

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => updateField('logo', ev.target.result);
        reader.readAsDataURL(file);
    };

    const toggleColor = (color) => {
        setForm(prev => {
            const exists = prev.colors.includes(color);
            return {
                ...prev,
                colors: exists ? prev.colors.filter(c => c !== color) : [...prev.colors, color],
            };
        });
    };

    const TABS = [
        { key: 'profile', label: '📋 Profile', icon: '📋' },
        { key: 'visual', label: '🎨 Visual Identity', icon: '🎨' },
        { key: 'voice', label: '🗣️ Voice & Tone', icon: '🗣️' },
    ];

    return (
        <AppShell pageTitle="Brand Identity">
            <div className={styles.page}>
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.headerInfo}>
                        <h2 className={styles.title}>
                            {brand ? brand.name : <span className="gradient-text">Create Your Brand</span>}
                        </h2>
                        <p className={styles.subtitle}>
                            {brand ? 'Manage your brand identity and guidelines' : 'Define who you are and what you stand for'}
                        </p>
                    </div>
                    <div className={styles.headerActions}>
                        {brand && !editing && (
                            <button className={styles.btnPrimary} onClick={() => setEditing(true)}>✏️ Edit Brand</button>
                        )}
                        {editing && (
                            <button className={styles.btnPrimary} onClick={handleSave}>💾 Save Brand</button>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className={styles.tabs}>
                    {TABS.map(t => (
                        <button
                            key={t.key}
                            className={`${styles.tab} ${tab === t.key ? styles.activeTab : ''}`}
                            onClick={() => setTab(t.key)}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Profile Tab */}
                {tab === 'profile' && (
                    <div className={styles.grid}>
                        {/* Logo */}
                        <div className={styles.card}>
                            <h3 className={styles.cardTitle}>Brand Logo</h3>
                            <div className={styles.logoArea} onClick={() => editing && logoRef.current?.click()}>
                                {form.logo ? (
                                    <img src={form.logo} alt="Logo" className={styles.logoImg} />
                                ) : (
                                    <div className={styles.logoPlaceholder}>
                                        <span>🎨</span>
                                        <p>{editing ? 'Click to upload' : 'No logo yet'}</p>
                                    </div>
                                )}
                                <input ref={logoRef} type="file" accept="image/*" hidden onChange={handleLogoUpload} />
                            </div>
                        </div>

                        {/* Core Info */}
                        <div className={styles.card}>
                            <h3 className={styles.cardTitle}>Core Information</h3>
                            <div className={styles.formGroup}>
                                <label>Brand Name *</label>
                                <input value={form.name} onChange={e => updateField('name', e.target.value)} disabled={!editing} placeholder="Your brand name" />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Tagline</label>
                                <input value={form.tagline} onChange={e => updateField('tagline', e.target.value)} disabled={!editing} placeholder="A catchy slogan" />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Industry</label>
                                <select value={form.industry} onChange={e => updateField('industry', e.target.value)} disabled={!editing}>
                                    <option value="">Select industry</option>
                                    {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Description</label>
                                <textarea value={form.description} onChange={e => updateField('description', e.target.value)} disabled={!editing} placeholder="What does your brand do?" rows={3} />
                            </div>
                        </div>

                        {/* Mission & Vision */}
                        <div className={styles.card}>
                            <h3 className={styles.cardTitle}>Mission & Vision</h3>
                            <div className={styles.formGroup}>
                                <label>Mission Statement</label>
                                <textarea value={form.mission} onChange={e => updateField('mission', e.target.value)} disabled={!editing} placeholder="Why does your brand exist?" rows={3} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Vision Statement</label>
                                <textarea value={form.vision} onChange={e => updateField('vision', e.target.value)} disabled={!editing} placeholder="Where are you heading?" rows={3} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Target Audience</label>
                                <textarea value={form.audience} onChange={e => updateField('audience', e.target.value)} disabled={!editing} placeholder="Who are your ideal customers?" rows={2} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Visual Identity Tab */}
                {tab === 'visual' && (
                    <div className={styles.grid}>
                        <div className={styles.card}>
                            <h3 className={styles.cardTitle}>Color Palette</h3>
                            <p className={styles.cardDesc}>Choose colors that represent your brand</p>
                            <div className={styles.palettes}>
                                {PALETTES.map((palette, pi) => (
                                    <div key={pi} className={styles.paletteRow}>
                                        {palette.map((color) => (
                                            <button
                                                key={color}
                                                className={`${styles.colorSwatch} ${form.colors.includes(color) ? styles.selected : ''}`}
                                                style={{ background: color }}
                                                onClick={() => editing && toggleColor(color)}
                                                disabled={!editing}
                                            />
                                        ))}
                                    </div>
                                ))}
                            </div>
                            {form.colors.length > 0 && (
                                <div className={styles.selectedColors}>
                                    <p>Selected: </p>
                                    {form.colors.map(c => (
                                        <span key={c} className={styles.colorTag} style={{ background: c }}>{c}</span>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className={styles.card}>
                            <h3 className={styles.cardTitle}>Typography</h3>
                            <p className={styles.cardDesc}>Select your brand&apos;s primary font</p>
                            <div className={styles.fontsGrid}>
                                {FONTS.map(f => (
                                    <button
                                        key={f}
                                        className={`${styles.fontCard} ${form.fonts === f ? styles.selectedFont : ''}`}
                                        onClick={() => editing && updateField('fonts', f)}
                                        disabled={!editing}
                                    >
                                        <span style={{ fontFamily: f }} className={styles.fontPreview}>{f}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Voice & Tone Tab */}
                {tab === 'voice' && (
                    <div className={styles.grid}>
                        <div className={styles.card}>
                            <h3 className={styles.cardTitle}>Tone of Voice</h3>
                            <p className={styles.cardDesc}>How should your brand communicate?</p>
                            <div className={styles.tonesGrid}>
                                {TONES.map(t => (
                                    <button
                                        key={t}
                                        className={`${styles.toneCard} ${form.tone === t ? styles.selectedTone : ''}`}
                                        onClick={() => editing && updateField('tone', t)}
                                        disabled={!editing}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppShell>
    );
}
