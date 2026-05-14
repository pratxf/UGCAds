const POYO_BASE = "https://api.poyo.ai";
const POYO_KEY = process.env.POYO_API_KEY!;

export interface PoyoModel {
  id: string;
  name: string;
  tag: string;
  logo: string;
  credits: number;
}

export interface PoyoVideoModel extends PoyoModel {
  maxDuration: number; // seconds
}

export const PHOTOSHOOT_MODELS: PoyoModel[] = [
  { id: "seedream-4.5-edit",       name: "Seedream 4.5",   tag: "ByteDance · 4K",     logo: "/models/seedance-2.webp",      credits: 5 },
  { id: "nano-banana-2-new-edit",  name: "Nano Banana 2",  tag: "Gemini · Fast",      logo: "/models/nano-banana-2.webp",   credits: 5 },
  { id: "seedream-5.0-lite-edit",  name: "Seedream 5 Lite",tag: "ByteDance · Lite",   logo: "/models/seedance-2.webp",      credits: 5 },
  { id: "flux-2-pro-edit",         name: "Flux 2 Pro",     tag: "BFL · Pro",          logo: "/models/flux-2-pro.webp",      credits: 6 },
  { id: "gpt-image-2-edit",        name: "GPT Image 2",    tag: "OpenAI · Photoreal", logo: "/models/gpt-image-2.webp",     credits: 3 },
];

export const VIDEO_MODELS: PoyoVideoModel[] = [
  { id: "seedance-2-fast",    name: "Seedance 2",  tag: "ByteDance · 720p",  logo: "/models/seedance-2.webp",  credits: 15, maxDuration: 15 },
  { id: "sora-2-official",    name: "Sora 2",      tag: "OpenAI · 20s",      logo: "/models/sora-2.webp",      credits: 20, maxDuration: 20 },
  { id: "kling-3.0/standard", name: "Kling 3.0",   tag: "Kling · Standard",  logo: "/models/kling-3.webp",     credits: 15, maxDuration: 15 },
  { id: "veo3.1-quality",     name: "Veo 3.1",     tag: "Google · 1080p",    logo: "/models/veo-3.webp",       credits: 20, maxDuration: 8  },
];

// Per-model input builders — each model has different param names
function buildInput(model: string, prompt: string, imageUrl: string, aspectRatio: string) {
  const base = { prompt, image_urls: [imageUrl] };

  switch (model) {
    case "seedream-4.5-edit":
      return { ...base, size: "2K", aspect_ratio: aspectRatio, n: 1 };

    case "nano-banana-2-new-edit":
      return { ...base, resolution: "2K", size: aspectRatio };

    case "seedream-5.0-lite-edit":
      return { ...base, size: "2K", aspect_ratio: aspectRatio, n: 1 };

    case "flux-2-pro-edit":
      return { ...base, resolution: "1K", size: aspectRatio };

    case "gpt-image-2-edit":
      return { ...base, quality: "medium", resolution: "2K", size: aspectRatio };

    default:
      return { ...base, size: aspectRatio };
  }
}

function buildVideoInput(model: string, prompt: string, imageUrl: string | undefined, aspectRatio: string, duration: number) {
  switch (model) {
    case "seedance-2-fast":
      return { prompt, reference_image_urls: imageUrl ? [imageUrl] : [], resolution: "720p", aspect_ratio: aspectRatio, duration, generate_audio: true };
    case "sora-2-official":
      return { prompt, ...(imageUrl ? { image_urls: [imageUrl] } : {}), aspect_ratio: aspectRatio, duration };
    case "kling-3.0/standard":
      return { prompt, ...(imageUrl ? { image_url: imageUrl } : {}), aspect_ratio: aspectRatio, duration, multi_shots: false, sound: true };
    case "veo3.1-quality":
      return { prompt, ...(imageUrl ? { image_urls: [imageUrl] } : {}), resolution: "720p", aspect_ratio: aspectRatio, duration };
    default:
      return { prompt, ...(imageUrl ? { image_urls: [imageUrl] } : {}), aspect_ratio: aspectRatio, duration };
  }
}

export async function submitPoyoVideoTask(
  model: string,
  prompt: string,
  imageUrl: string | undefined,
  aspectRatio: string,
  duration: number,
): Promise<string> {
  const res = await fetch(`${POYO_BASE}/api/generate/submit`, {
    method: "POST",
    headers: { Authorization: `Bearer ${POYO_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, input: buildVideoInput(model, prompt, imageUrl, aspectRatio, duration) }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Poyo submit failed ${res.status}: ${text}`);
  }
  const json = await res.json() as { code: number; data: { task_id: string } };
  if (json.code !== 200) throw new Error(`Poyo error: ${JSON.stringify(json)}`);
  return json.data.task_id;
}

export async function submitPoyoTask(
  model: string,
  prompt: string,
  imageUrl: string,
  aspectRatio: string,
): Promise<string> {
  const res = await fetch(`${POYO_BASE}/api/generate/submit`, {
    method: "POST",
    headers: { Authorization: `Bearer ${POYO_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, input: buildInput(model, prompt, imageUrl, aspectRatio) }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Poyo submit failed ${res.status}: ${text}`);
  }
  const json = await res.json() as { code: number; data: { task_id: string } };
  if (json.code !== 200) throw new Error(`Poyo error: ${JSON.stringify(json)}`);
  return json.data.task_id;
}

export async function pollPoyoTask(taskId: string): Promise<{ state: "pending" | "success" | "fail"; url?: string; error?: string }> {
  const res = await fetch(`${POYO_BASE}/api/generate/status/${taskId}`, {
    headers: { Authorization: `Bearer ${POYO_KEY}` },
  });
  if (!res.ok) throw new Error(`Poyo poll failed ${res.status}`);
  const json = await res.json() as {
    code: number;
    data: { status: string; files?: { file_url: string }[]; error_message?: string };
  };
  const { status, files, error_message } = json.data;
  if (status === "finished") return { state: "success", url: files?.[0]?.file_url };
  if (status === "failed")   return { state: "fail", error: error_message };
  return { state: "pending" };
}
