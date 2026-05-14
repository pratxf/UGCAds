import { fal } from "@fal-ai/client";

fal.config({ credentials: process.env.FAL_KEY });

export interface FalModel {
  id: string;
  name: string;
  tag: string;
  logo: string;
  credits: number;
}

export interface FalVideoModel extends FalModel {
  maxDuration: number;
}

export const PHOTOSHOOT_MODELS: FalModel[] = [
  { id: "fal-ai/bytedance/seedream/v4.5/edit",   name: "Seedream 4.5",   tag: "ByteDance · 4K",     logo: "/models/seedance-2.webp",    credits: 5 },
  { id: "fal-ai/bytedance/seedream/v5/lite/edit", name: "Seedream 5 Lite", tag: "ByteDance · 2K",    logo: "/models/seedance-2.webp",    credits: 5 },
  { id: "fal-ai/nano-banana-2/edit",              name: "Nano Banana 2",  tag: "Gemini · 1K",        logo: "/models/nano-banana-2.webp", credits: 5 },
  { id: "openai/gpt-image-2/edit",                name: "GPT Image 2",    tag: "OpenAI · Photoreal", logo: "/models/gpt-image-2.webp",   credits: 3 },
];

export const VIDEO_MODELS: FalVideoModel[] = [
  { id: "bytedance/seedance-2.0/fast/image-to-video",    name: "Seedance 2", tag: "ByteDance · 720p", logo: "/models/seedance-2.webp", credits: 15, maxDuration: 15 },
  { id: "fal-ai/sora-2/image-to-video",                  name: "Sora 2",     tag: "OpenAI · 720p",    logo: "/models/sora-2.webp",     credits: 20, maxDuration: 20 },
  { id: "fal-ai/kling-video/v3/standard/image-to-video", name: "Kling 3.0",  tag: "Kling · Standard", logo: "/models/kling-3.webp",    credits: 15, maxDuration: 10 },
];

const SEEDREAM_IMAGE_SIZE: Record<string, string> = {
  "1:1":  "square_1_1",
  "4:5":  "portrait_4_5",
  "9:16": "portrait_9_16",
  "16:9": "landscape_16_9",
};

const GPT_IMAGE_SIZE: Record<string, string> = {
  "1:1":  "square_1024",
  "4:5":  "portrait_4_5",
  "9:16": "portrait_16_9",
  "16:9": "landscape_16_9",
};

function buildImageInput(modelId: string, prompt: string, imageUrl: string, aspectRatio: string): Record<string, unknown> {
  switch (modelId) {
    case "fal-ai/bytedance/seedream/v4.5/edit":
      return { prompt, image_size: SEEDREAM_IMAGE_SIZE[aspectRatio] ?? "square_1_1", num_images: 1, max_images: 1, enable_safety_checker: true, image_urls: [imageUrl] };
    case "fal-ai/bytedance/seedream/v5/lite/edit":
      return { prompt, image_size: SEEDREAM_IMAGE_SIZE[aspectRatio] ?? "square_1_1", num_images: 1, max_images: 1, enable_safety_checker: true, image_urls: [imageUrl] };
    case "fal-ai/nano-banana-2/edit":
      return { prompt, num_images: 1, aspect_ratio: aspectRatio, resolution: "1K", limit_generations: true, image_urls: [imageUrl] };
    case "openai/gpt-image-2/edit":
      return { prompt, image_urls: [imageUrl], image_size: GPT_IMAGE_SIZE[aspectRatio] ?? "square_1024", quality: "medium", num_images: 1, output_format: "png" };
    default:
      return { prompt, image_urls: [imageUrl] };
  }
}

function buildVideoInput(modelId: string, prompt: string, imageUrl: string | undefined, aspectRatio: string, duration: number): Record<string, unknown> {
  switch (modelId) {
    case "bytedance/seedance-2.0/fast/image-to-video":
      return { prompt, ...(imageUrl ? { image_url: imageUrl } : {}), resolution: "720p", duration, aspect_ratio: aspectRatio, generate_audio: true };
    case "fal-ai/sora-2/image-to-video":
      return { prompt, ...(imageUrl ? { image_url: imageUrl } : {}), resolution: "720p", aspect_ratio: aspectRatio, duration };
    case "fal-ai/kling-video/v3/standard/image-to-video":
      return { prompt, ...(imageUrl ? { start_image_url: imageUrl } : {}), aspect_ratio: aspectRatio, duration: String(duration), generate_audio: true, negative_prompt: "blur, distort, and low quality", cfg_scale: 0.5 };
    default:
      return { prompt, ...(imageUrl ? { image_url: imageUrl } : {}), aspect_ratio: aspectRatio, duration };
  }
}

export async function submitFalVideoTask(
  modelId: string,
  prompt: string,
  imageUrl: string | undefined,
  aspectRatio: string,
  duration: number,
): Promise<string> {
  const { request_id } = await fal.queue.submit(modelId, {
    input: buildVideoInput(modelId, prompt, imageUrl, aspectRatio, duration),
  });
  return request_id;
}

export async function submitFalImageTask(
  modelId: string,
  prompt: string,
  imageUrl: string,
  aspectRatio: string,
): Promise<string> {
  const { request_id } = await fal.queue.submit(modelId, {
    input: buildImageInput(modelId, prompt, imageUrl, aspectRatio),
  });
  return request_id;
}

export async function submitFalTryonTask(
  personImage: string,
  garmentImage: string,
): Promise<string> {
  const { request_id } = await fal.queue.submit("fal-ai/image-apps-v2/virtual-try-on", {
    input: {
      person_image_url: personImage,
      clothing_image_url: garmentImage,
      preserve_pose: true,
    },
  });
  return request_id;
}

export const FAL_TRYON_MODEL = "fal-ai/image-apps-v2/virtual-try-on";

export async function pollFalTask(
  modelId: string,
  requestId: string,
): Promise<{ state: "pending" | "success" | "fail"; url?: string; error?: string }> {
  let status: { status: string };
  try {
    status = await fal.queue.status(modelId, { requestId, logs: false }) as { status: string };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    // Treat status fetch errors as failure only if they indicate the job is done/invalid
    if (msg.includes("not found") || msg.includes("404") || msg.includes("failed")) {
      return { state: "fail", error: msg };
    }
    throw e;
  }

  if (status.status === "COMPLETED") {
    const result = await fal.queue.result(modelId, { requestId });
    const data = result.data as { video?: { url: string }; images?: { url: string }[] };
    const url = data.video?.url || data.images?.[0]?.url;
    if (!url) throw new Error("fal returned no output URL");
    return { state: "success", url };
  }

  if (status.status === "FAILED") {
    return { state: "fail", error: "Generation failed" };
  }

  return { state: "pending" };
}
