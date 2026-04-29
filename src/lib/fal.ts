import { fal } from "@fal-ai/client";

fal.config({ credentials: process.env.FAL_KEY });

/**
 * Step 0 (Product Ad only): Composite character + product into one image
 * using Flux Kontext Pro multi-image editing.
 */
export async function generateScene({
  characterImage,
  productImage,
  prompt,
}: {
  characterImage: string;
  productImage: string;
  prompt: string;
}): Promise<{ imageUrl: string }> {
  const result = await fal.subscribe("fal-ai/flux-pro/kontext/multi", {
    input: {
      prompt,
      image_urls: [characterImage, productImage],
      aspect_ratio: "9:16",
      num_images: 1,
      output_format: "jpeg",
      safety_tolerance: "2",
    },
  });

  const data = result.data as { images?: { url?: string }[] };
  const imageUrl = data?.images?.[0]?.url;
  if (!imageUrl) throw new Error("No image URL returned from Flux Kontext");
  return { imageUrl };
}

/**
 * AI Photoshoot: Place a product image into a styled background scene.
 * Supports two models: Flux Kontext Pro (better product accuracy) and
 * Seedream V4.5 (better scene creativity).
 */
type PhotoshootSize = { width: number; height: number };

export async function generatePhotoshootFlux({
  productImage,
  prompt,
  size,
}: {
  productImage: string;
  prompt: string;
  size: PhotoshootSize;
}): Promise<{ imageUrl: string }> {
  // image_size + num_inference_steps + guidance_scale aren't in the fal-client
  // typings for this endpoint but are accepted by the underlying API.
  const input = {
    prompt,
    image_url: productImage,
    image_size: { width: size.width, height: size.height },
    num_inference_steps: 28,
    guidance_scale: 3.5,
    num_images: 1,
    output_format: "jpeg",
    safety_tolerance: "2",
  } as unknown as Parameters<typeof fal.subscribe<"fal-ai/flux-pro/kontext">>[1]["input"];
  const result = await fal.subscribe("fal-ai/flux-pro/kontext", { input });
  const data = result.data as { images?: { url?: string }[] };
  const imageUrl = data?.images?.[0]?.url;
  if (!imageUrl) throw new Error("No image URL returned from Flux Kontext");
  return { imageUrl };
}

export async function generatePhotoshootSeedream({
  productImage,
  prompt,
  size,
}: {
  productImage: string;
  prompt: string;
  size: PhotoshootSize;
}): Promise<{ imageUrl: string }> {
  const result = await fal.subscribe("fal-ai/bytedance/seedream/v4.5/edit", {
    input: {
      prompt,
      image_urls: [productImage],
      image_size: "auto_2k",
      num_images: 1,
    } as unknown as Parameters<typeof fal.subscribe>[1]["input"],
  });
  const data = result.data as { images?: { url?: string }[] };
  const imageUrl = data?.images?.[0]?.url;
  if (!imageUrl) throw new Error("No image URL returned from Seedream");
  return { imageUrl };
}

// Backwards-compat shim — defaults to Flux at 1024×1024.
export async function generatePhotoshoot({
  productImage,
  prompt,
}: {
  productImage: string;
  prompt: string;
}): Promise<{ imageUrl: string }> {
  return generatePhotoshootFlux({
    productImage,
    prompt,
    size: { width: 1024, height: 1024 },
  });
}

/**
 * Step 1: Generate voiceover with ElevenLabs (via fal.ai)
 * Returns a public audio URL hosted on fal.media (temporary - re-upload to R2)
 */
export async function generateVoiceover({
  script,
  voiceId,
}: {
  script: string;
  voiceId: string;
}): Promise<{ audioUrl: string }> {
  const result = await fal.subscribe("fal-ai/elevenlabs/tts/multilingual-v2", {
    input: {
      text: script,
      voice: voiceId,
      stability: 0.5,
      similarity_boost: 0.75,
    },
  });

  const data = result.data as { audio?: { url?: string }; audio_url?: string };
  const audioUrl = data?.audio?.url || data?.audio_url;
  if (!audioUrl) throw new Error("No audio URL returned from ElevenLabs");
  return { audioUrl };
}

/**
 * Step 2: Generate silent video with Kling 2.5 Turbo image-to-video
 */
export async function generateVideo({
  imageUrl,
  prompt,
  duration = 5,
}: {
  imageUrl: string;
  prompt: string;
  duration?: 5 | 10;
}): Promise<{ videoUrl: string }> {
  const result = await fal.subscribe("fal-ai/kling-video/v2.5-turbo/pro/image-to-video", {
    input: {
      image_url: imageUrl,
      prompt,
      duration: String(duration) as "5" | "10",
    },
  });

  const videoUrl = (result.data as { video?: { url?: string } })?.video?.url;
  if (!videoUrl) throw new Error("No video URL returned from Kling");
  return { videoUrl };
}

/**
 * Step 3: Lip-sync the video to the audio with LatentSync
 */
export async function lipSync({
  videoUrl,
  audioUrl,
}: {
  videoUrl: string;
  audioUrl: string;
}): Promise<{ videoUrl: string }> {
  const result = await fal.subscribe("fal-ai/latentsync", {
    input: {
      video_url: videoUrl,
      audio_url: audioUrl,
    },
  });

  const finalUrl = (result.data as { video?: { url?: string } })?.video?.url;
  if (!finalUrl) throw new Error("No video URL returned from LatentSync");
  return { videoUrl: finalUrl };
}

/**
 * AI Try-On: composite a garment onto a base model.
 * Uses fal-ai/image-apps-v2/virtual-try-on — $0.04/image, preserves pose.
 * Category is accepted for API compatibility but isn't sent (endpoint auto-detects).
 */
export async function generateTryon({
  personImage,
  garmentImage,
}: {
  personImage: string;
  garmentImage: string;
  category?: "tops" | "bottoms" | "full-body" | "outerwear";
}): Promise<{ imageUrl: string }> {
  const result = await fal.subscribe("fal-ai/image-apps-v2/virtual-try-on", {
    input: {
      person_image_url: personImage,
      clothing_image_url: garmentImage,
      preserve_pose: true,
    } as unknown as Parameters<typeof fal.subscribe>[1]["input"],
  });
  const data = result.data as {
    images?: { url?: string }[];
    image?: { url?: string };
  };
  const imageUrl = data?.images?.[0]?.url || data?.image?.url;
  if (!imageUrl) throw new Error("No image URL returned from virtual try-on");
  return { imageUrl };
}

/**
 * Step 4 (HD only): Upscale to 1080p
 */
export async function upscaleVideo({
  videoUrl,
}: {
  videoUrl: string;
}): Promise<{ videoUrl: string }> {
  const result = await fal.subscribe("fal-ai/topaz/upscale/video", {
    input: { video_url: videoUrl },
  });
  const upscaledUrl = (result.data as { video?: { url?: string } })?.video?.url;
  if (!upscaledUrl) throw new Error("No video URL returned from upscaler");
  return { videoUrl: upscaledUrl };
}
