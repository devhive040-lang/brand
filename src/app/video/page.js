'use client';
import { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useBrand } from '@/components/providers/BrandProvider';
import { generateImage, generateVideo } from '@/lib/ai/media';
import styles from './video.module.css';

export default function VideoPage() {
  const { brand } = useBrand();
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [mode, setMode] = useState('image');
  const [imageProvider, setImageProvider] = useState('pollinations');
  const [videoSeconds, setVideoSeconds] = useState(5);
  const [comfyBaseUrl, setComfyBaseUrl] = useState('http://127.0.0.1:8188');
  const [width, setWidth] = useState(1024);
  const [height, setHeight] = useState(1024);

  const [loading, setLoading] = useState(false);
  const [resultImage, setResultImage] = useState('');
  const [resultNote, setResultNote] = useState('');
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setError('');
    setResultNote('');

    try {
      if (mode === 'image') {
        const data = await generateImage({
          prompt: `${prompt}\nBrand context: ${brand?.name || ''} ${brand?.tagline || ''}`.trim(),
          negativePrompt,
          provider: imageProvider,
          width,
          height,
          comfyBaseUrl,
        });

        if (data.imageUrl) {
          setResultImage(data.imageUrl);
          setResultNote('✅ تم إنشاء صورة جديدة بالذكاء الاصطناعي.');
        } else {
          setResultNote(data.message || 'تم إرسال مهمة التوليد إلى ComfyUI.');
        }
      } else {
        const data = await generateVideo({
          prompt: `${prompt}\nBrand style: ${brand?.tone || ''}`.trim(),
          imageUrl: resultImage,
          provider: 'comfyui',
          seconds: videoSeconds,
          comfyBaseUrl,
        });
        setResultNote(data.message || 'تم إرسال مهمة الفيديو إلى ComfyUI.');
      }
    } catch (e) {
      setError(e.message || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  if (!brand) {
    return (
      <AppShell pageTitle="AI Media Studio">
        <div className={styles.empty}><div className={styles.emptyIcon}>🎬</div><h2>Setup your brand first</h2></div>
      </AppShell>
    );
  }

  return (
    <AppShell pageTitle="AI Media Studio">
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>AI Media Studio</h2>
            <p className={styles.subtitle}>No templates — generate professional image/video from scratch using AI</p>
          </div>
        </div>

        <div className={styles.layout}>
          <div className={styles.formPanel}>
            <div className={styles.modeRow}>
              <button className={`${styles.modeBtn} ${mode === 'image' ? styles.active : ''}`} onClick={() => setMode('image')}>🖼️ Image</button>
              <button className={`${styles.modeBtn} ${mode === 'video' ? styles.active : ''}`} onClick={() => setMode('video')}>🎥 Video</button>
            </div>

            <div className={styles.formGroup}>
              <label>Prompt</label>
              <textarea
                rows={6}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="اكتب وصف دقيق جداً: المنتج، الإضاءة، العدسة، الحركة، المود، الأسلوب السينمائي..."
              />
            </div>

            <div className={styles.formGroup}>
              <label>Negative Prompt</label>
              <textarea
                rows={3}
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                placeholder="blurry, low quality, artifacts, bad anatomy, watermark ..."
              />
            </div>

            {mode === 'image' && (
              <>
                <div className={styles.formGroup}>
                  <label>Image Provider</label>
                  <select value={imageProvider} onChange={(e) => setImageProvider(e.target.value)}>
                    <option value="pollinations">Pollinations (Free Hosted)</option>
                    <option value="comfyui">ComfyUI (Local Pro)</option>
                  </select>
                </div>

                <div className={styles.inline2}>
                  <div className={styles.formGroup}>
                    <label>Width</label>
                    <input type="number" value={width} onChange={(e) => setWidth(Number(e.target.value) || 1024)} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Height</label>
                    <input type="number" value={height} onChange={(e) => setHeight(Number(e.target.value) || 1024)} />
                  </div>
                </div>
              </>
            )}

            {mode === 'video' && (
              <div className={styles.formGroup}>
                <label>Duration (seconds)</label>
                <input type="number" min={3} max={12} value={videoSeconds} onChange={(e) => setVideoSeconds(Number(e.target.value) || 5)} />
              </div>
            )}

            <div className={styles.formGroup}>
              <label>ComfyUI Base URL (for Pro local generation)</label>
              <input value={comfyBaseUrl} onChange={(e) => setComfyBaseUrl(e.target.value)} placeholder="http://127.0.0.1:8188" />
            </div>

            <button className={styles.btnPrimary} onClick={handleGenerate} disabled={loading || !prompt.trim()}>
              {loading ? '⏳ Generating...' : mode === 'image' ? '✨ Generate AI Image' : '🚀 Queue AI Video Generation'}
            </button>

            {!!error && <div className={styles.error}>⚠️ {error}</div>}
            {!!resultNote && <div className={styles.note}>{resultNote}</div>}
          </div>

          <div className={styles.previewPanel}>
            <h3>Preview</h3>
            {resultImage ? (
              <img src={resultImage} alt="AI generated" className={styles.previewImage} />
            ) : (
              <div className={styles.placeholder}>
                <span>Generated result will appear here</span>
                <p>Tip: اكتب prompt احترافي يحتوي (subject + style + camera + lighting + mood + composition)</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
