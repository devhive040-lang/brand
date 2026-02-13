'use client';
import { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useBrand } from '@/components/providers/BrandProvider';
import styles from './video.module.css';

const TEMPLATES = [
    { id: 'intro', icon: '🎬', name: 'Brand Intro', desc: 'Professional introduction video', duration: '15s' },
    { id: 'promo', icon: '📢', name: 'Promo Video', desc: 'Product/service promotion', duration: '30s' },
    { id: 'story', icon: '📖', name: 'Story/Reel', desc: 'Instagram/TikTok story', duration: '15s' },
    { id: 'testimonial', icon: '⭐', name: 'Testimonial', desc: 'Customer review showcase', duration: '20s' },
    { id: 'slideshow', icon: '🖼️', name: 'Slideshow', desc: 'Image slideshow with music', duration: '30s' },
    { id: 'announcement', icon: '📣', name: 'Announcement', desc: 'Event or launch announcement', duration: '15s' },
];

export default function VideoPage() {
    const { brand } = useBrand();
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [bgColor, setBgColor] = useState(brand?.colors?.[0] || '#6366f1');
    const [textColor, setTextColor] = useState('#ffffff');

    if (!brand) {
        return (
            <AppShell pageTitle="Video Studio">
                <div className={styles.empty}><div className={styles.emptyIcon}>🎬</div><h2>Setup your brand first</h2></div>
            </AppShell>
        );
    }

    return (
        <AppShell pageTitle="Video Studio">
            <div className={styles.page}>
                <div className={styles.header}>
                    <div><h2 className={styles.title}>Video Studio</h2><p className={styles.subtitle}>Create branded videos with templates</p></div>
                </div>

                {!selectedTemplate ? (
                    <>
                        <h3 className={styles.sectionTitle}>Choose a Template</h3>
                        <div className={styles.templateGrid}>
                            {TEMPLATES.map(t => (
                                <div key={t.id} className={styles.templateCard} onClick={() => setSelectedTemplate(t)}>
                                    <div className={styles.templateIcon}>{t.icon}</div>
                                    <h4>{t.name}</h4>
                                    <p>{t.desc}</p>
                                    <span className={styles.duration}>{t.duration}</span>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className={styles.editorLayout}>
                        <div className={styles.previewPanel}>
                            <div className={styles.videoPreview} style={{ background: bgColor, color: textColor }}>
                                {brand?.logo && <img src={brand.logo} alt="Logo" className={styles.previewLogo} />}
                                <h2 style={{ color: textColor }}>{title || 'Your Title'}</h2>
                                <p style={{ color: textColor, opacity: 0.8 }}>{subtitle || 'Subtitle text'}</p>
                                <span className={styles.brandWatermark}>{brand.name}</span>
                            </div>
                            <div className={styles.timeline}>
                                <div className={styles.timelineBar}>
                                    <div className={styles.playhead} style={{ left: '10%' }} />
                                </div>
                                <span className={styles.timeLabel}>00:00 / {selectedTemplate.duration}</span>
                            </div>
                        </div>

                        <div className={styles.settingsPanel}>
                            <button className={styles.backBtn} onClick={() => setSelectedTemplate(null)}>← Back to Templates</button>
                            <h3>{selectedTemplate.icon} {selectedTemplate.name}</h3>
                            <div className={styles.formGroup}>
                                <label>Title Text</label>
                                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Main title" />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Subtitle</label>
                                <input value={subtitle} onChange={e => setSubtitle(e.target.value)} placeholder="Subtitle" />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Background</label>
                                <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Text Color</label>
                                <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} />
                            </div>
                            <button className={styles.btnPrimary}>
                                🎬 Generate Video (FFmpeg)
                            </button>
                            <p className={styles.note}>FFmpeg.wasm will render the video client-side. No upload needed.</p>
                        </div>
                    </div>
                )}
            </div>
        </AppShell>
    );
}
