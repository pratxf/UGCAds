/**
 * kie.ai API wrapper
 * Handles video generation requests
 */

const KIE_API_KEY = process.env.KIE_AI_API_KEY;
const KIE_BASE_URL = "https://api.kie.ai/v1";

export type KieModel = "veo";

export function selectModel(_plan: string): KieModel {
  return "veo";
}

export interface GenerateUGCParams {
  characterPrompt: string;
  backgroundPrompt: string;
  script: string;
  voice: string;
  model: KieModel;
}

export interface GenerateProductAdParams {
  characterPrompt: string;
  productImageUrl: string;
  script: string;
  voice: string;
  model: KieModel;
}

export interface KieJobResult {
  jobId: string;
  status: "queued" | "processing" | "complete" | "failed";
  videoUrl?: string;
  thumbnailUrl?: string;
}

export async function generateUGCAd(
  params: GenerateUGCParams
): Promise<KieJobResult> {
  // TODO: Implement actual kie.ai API call
  const res = await fetch(`${KIE_BASE_URL}/generate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${KIE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "ugc_ad",
      model: params.model,
      character: params.characterPrompt,
      background: params.backgroundPrompt,
      script: params.script,
      voice: params.voice,
    }),
  });
  return res.json();
}

export async function generateProductAd(
  params: GenerateProductAdParams
): Promise<KieJobResult> {
  // TODO: Implement actual kie.ai API call
  const res = await fetch(`${KIE_BASE_URL}/generate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${KIE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "product_ad",
      model: params.model,
      character: params.characterPrompt,
      productImage: params.productImageUrl,
      script: params.script,
      voice: params.voice,
    }),
  });
  return res.json();
}

export async function pollStatus(jobId: string): Promise<KieJobResult> {
  const res = await fetch(`${KIE_BASE_URL}/jobs/${jobId}`, {
    headers: { Authorization: `Bearer ${KIE_API_KEY}` },
  });
  return res.json();
}
