const KIE_API_KEY = (process.env.KIE_API_KEY || "").trim();
const BASE_URL = "https://api.kie.ai";

async function kiePost(path: string, body: unknown) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${KIE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const json = await res.json() as { code: number; msg: string; data: Record<string, unknown> };
  if (json.code !== 200) throw new Error(`KIE error ${json.code}: ${json.msg}`);
  return json.data;
}

async function kieGet(path: string) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${KIE_API_KEY}` },
  });
  const json = await res.json() as { code: number; msg: string; data: Record<string, unknown> };
  if (json.code !== 200) throw new Error(`KIE error ${json.code}: ${json.msg}`);
  return json.data;
}

// ─── Task creation ───────────────────────────────────────────────

export async function createKieTask(model: string, input: Record<string, unknown>): Promise<string> {
  const data = await kiePost("/api/v1/jobs/createTask", { model, input });
  return data.taskId as string;
}

// ─── Task polling ────────────────────────────────────────────────

export type KieTaskState = "waiting" | "queuing" | "generating" | "success" | "fail";

export interface KieTaskResult {
  state: KieTaskState;
  resultUrls: string[];
  progress: number;
  failMsg?: string;
}

export async function pollKieTask(taskId: string): Promise<KieTaskResult> {
  const data = await kieGet(`/api/v1/jobs/recordInfo?taskId=${taskId}`);
  const state = (data.state as KieTaskState) || "waiting";
  let resultUrls: string[] = [];
  if (data.resultJson) {
    try {
      const parsed = JSON.parse(data.resultJson as string) as { resultUrls?: string[] };
      resultUrls = parsed.resultUrls || [];
    } catch {}
  }
  return {
    state,
    resultUrls,
    progress: (data.progress as number) || 0,
    failMsg: data.failMsg as string | undefined,
  };
}

// ─── Image-to-Image ──────────────────────────────────────────────

export type ImageModel =
  | "seedream/4.5-edit"
  | "gpt-image-2-image-to-image"
  | "qwen2/image-edit"
  | "seedream/5-lite-image-to-image"
  | "flux-2/pro-image-to-image";

export async function generateKieImage({
  model,
  imageUrl,
  prompt,
  aspectRatio = "1:1",
}: {
  model: ImageModel;
  imageUrl: string;
  prompt: string;
  aspectRatio?: string;
}): Promise<string> {
  const input: Record<string, unknown> = {
    prompt,
    image_url: imageUrl,
    aspect_ratio: aspectRatio,
  };
  if (model === "gpt-image-2-image-to-image") {
    input.size = "1024x1024";
    delete input.aspect_ratio;
  }
  if (model === "flux-2/pro-image-to-image") {
    input.resolution = "1K";
  }
  const taskId = await createKieTask(model, input);
  return taskId;
}

// ─── Image-to-Video ──────────────────────────────────────────────

export type VideoModel = "kling-3.0/video" | "sora-2-image-to-video";

export async function generateKieVideo({
  model,
  imageUrl,
  prompt,
  aspectRatio = "9:16",
  duration = "5",
}: {
  model: VideoModel;
  imageUrl: string;
  prompt: string;
  aspectRatio?: string;
  duration?: string;
}): Promise<string> {
  if (model === "kling-3.0/video") {
    const taskId = await createKieTask("kling-3.0/video", {
      prompt,
      image_urls: [imageUrl],
      sound: true,
      duration,
      aspect_ratio: aspectRatio,
      mode: "pro",
    });
    return taskId;
  }

  // Sora 2
  const soraAspect = aspectRatio === "16:9" ? "landscape" : "portrait";
  const nFrames = duration === "15" ? "15" : "10";
  const taskId = await createKieTask("sora-2-image-to-video", {
    prompt,
    image_urls: [imageUrl],
    aspect_ratio: soraAspect,
    n_frames: nFrames,
    remove_watermark: true,
    upload_method: "s3",
  });
  return taskId;
}
