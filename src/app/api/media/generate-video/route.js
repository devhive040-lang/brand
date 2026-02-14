import { NextResponse } from 'next/server';

/**
 * ComfyUI video generation bridge.
 * This endpoint queues a video job and returns queue metadata.
 */
export async function POST(req) {
  try {
    const { prompt, imageUrl = '', seconds = 5, comfyBaseUrl = 'http://127.0.0.1:8188' } = await req.json();

    if (!prompt?.trim()) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Placeholder workflow for video models (Wan/CogVideoX/LTXV). Node ids must match installed graph.
    const workflow = {
      prompt: {
        '1': {
          class_type: 'CLIPTextEncode',
          inputs: { text: prompt, clip: ['2', 1] },
        },
        '2': {
          class_type: 'CheckpointLoaderSimple',
          inputs: { ckpt_name: 'video-model.safetensors' },
        },
        '3': {
          class_type: 'VHS_VideoCombine',
          inputs: {
            frame_rate: 24,
            loop_count: 0,
            filename_prefix: 'brand_ai_video',
            format: 'video/h264-mp4',
            pix_fmt: 'yuv420p',
            crf: 19,
            save_output: true,
            images: ['4', 0],
          },
        },
        '4': {
          class_type: 'EmptyImage',
          inputs: {
            width: 1024,
            height: 576,
            batch_size: Math.max(24, Math.floor(Number(seconds) * 24)),
          },
        },
      },
      meta: { imageUrl },
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
      message: 'Video generation queued in ComfyUI. Use history endpoint to fetch MP4 artifact when done.',
    });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
}
