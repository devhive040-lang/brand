/**
 * Media Router
 * - Free hosted image generation via Pollinations (no API key)
 * - Professional local generation via ComfyUI (image + video) for full control and privacy
 */

const MEDIA_PROVIDERS = {
  pollinations: {
    name: 'Pollinations (Free Hosted)',
    type: 'image',
    cost: 'free',
  },
  comfyui: {
    name: 'ComfyUI (Local Pro Pipeline)',
    type: 'image_video',
    cost: 'free_local_hardware',
  },
};

function encodePrompt(prompt = '') {
  return encodeURIComponent(prompt.trim());
}

export async function generateImage({
  prompt,
  negativePrompt = '',
  provider = 'pollinations',
  width = 1024,
  height = 1024,
  seed,
  comfyBaseUrl = 'http://127.0.0.1:8188',
}) {
  if (!prompt?.trim()) throw new Error('Prompt is required');

  if (provider === 'pollinations') {
    const composed = negativePrompt
      ? `${prompt}\nNegative prompt: ${negativePrompt}`
      : prompt;

    const url = `https://image.pollinations.ai/prompt/${encodePrompt(composed)}?width=${width}&height=${height}${
      Number.isFinite(seed) ? `&seed=${seed}` : ''
    }&nologo=true`;

    return {
      provider,
      imageUrl: url,
      meta: { width, height, seed: Number.isFinite(seed) ? seed : null },
    };
  }

  if (provider === 'comfyui') {
    const res = await fetch('/api/media/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, negativePrompt, width, height, seed, comfyBaseUrl }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || 'Image generation failed');
    return data;
  }

  throw new Error(`Unsupported provider: ${provider}`);
}

export async function generateVideo({
  prompt,
  imageUrl,
  provider = 'comfyui',
  seconds = 5,
  comfyBaseUrl = 'http://127.0.0.1:8188',
}) {
  if (!prompt?.trim()) throw new Error('Prompt is required');

  if (provider !== 'comfyui') {
    throw new Error('Video generation currently supports ComfyUI local pipeline only');
  }

  const res = await fetch('/api/media/generate-video', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, imageUrl, seconds, comfyBaseUrl }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Video generation failed');
  return data;
}

export { MEDIA_PROVIDERS };
