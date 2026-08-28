import { NextResponse } from 'next/server';

/**
 * ComfyUI image generation bridge.
 * Expects a running ComfyUI instance with an API-compatible prompt workflow.
 */
export async function POST(req) {
  try {
    const { prompt, negativePrompt = '', width = 1024, height = 1024, seed, comfyBaseUrl = 'http://127.0.0.1:8188' } = await req.json();

    if (!prompt?.trim()) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Minimal generic workflow payload (user may need to adapt node ids for their ComfyUI graph)
    const workflow = {
      prompt: {
        '1': {
          class_type: 'KSampler',
          inputs: {
            seed: Number.isFinite(seed) ? seed : Math.floor(Math.random() * 1000000000),
            steps: 28,
            cfg: 6.5,
            sampler_name: 'euler',
            scheduler: 'normal',
            denoise: 1,
            model: ['4', 0],
            positive: ['2', 0],
            negative: ['3', 0],
            latent_image: ['5', 0],
          },
        },
        '2': {
          class_type: 'CLIPTextEncode',
          inputs: { text: prompt, clip: ['4', 1] },
        },
        '3': {
          class_type: 'CLIPTextEncode',
          inputs: { text: negativePrompt || 'low quality, blurry, distorted', clip: ['4', 1] },
        },
        '4': {
          class_type: 'CheckpointLoaderSimple',
          inputs: { ckpt_name: 'v1-5-pruned-emaonly.safetensors' },
        },
        '5': {
          class_type: 'EmptyLatentImage',
          inputs: { width, height, batch_size: 1 },
        },
        '6': {
          class_type: 'VAEDecode',
          inputs: { samples: ['1', 0], vae: ['4', 2] },
        },
        '7': {
          class_type: 'SaveImage',
          inputs: { images: ['6', 0], filename_prefix: 'brand_ai' },
        },
      },
    };

    const queueRes = await fetch(`${comfyBaseUrl}/prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(workflow),
    });

    if (!queueRes.ok) {
      const txt = await queueRes.text();
      return NextResponse.json({ error: `ComfyUI queue failed: ${txt}` }, { status: 502 });
    }

    const queued = await queueRes.json();

    return NextResponse.json({
      provider: 'comfyui',
      queued,
      message: 'Image generation queued in ComfyUI. Connect websocket/history polling for final file retrieval.',
    });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
}
