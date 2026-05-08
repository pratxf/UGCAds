const POYO_BASE = "https://api.poyo.ai";
const POYO_KEY = process.env.POYO_API_KEY!;

export interface PoyoModel {
  id: string;
  name: string;
  tag: string;
  logo: string;
  credits: number;
}

export const PHOTOSHOOT_MODELS: PoyoModel[] = [
  { id: "seedream-4.5-edit",       name: "Seedream 4.5",   tag: "ByteDance · 4K",     logo: "/models/seedream-4-5.webp",    credits: 5 },
  { id: "nano-banana-2-new-edit",  name: "Nano Banana 2",  tag: "Gemini · Fast",      logo: "/models/nano-banana-2.webp",   credits: 5 },
  { id: "seedream-5.0-lite-edit",  name: "Seedream 5 Lite",tag: "ByteDance · Lite",   logo: "/models/seedream-5-lite.webp", credits: 5 },
  { id: "flux-2-pro-edit",         name: "Flux 2 Pro",     tag: "BFL · Pro",          logo: "/models/flux-2-pro.webp",      credits: 6 },
  { id: "gpt-image-2-edit",        name: "GPT Image 2",    tag: "OpenAI · Photoreal", logo: "/models/gpt-image-2.webp",     credits: 3 },
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
