/**
 * Generation orchestration logic
 * Coordinates between kie.ai, ElevenLabs, and the database
 */

import { selectModel, generateUGCAd, generateProductAd } from "./kie";

export interface CreateUGCRequest {
  userId: string;
  characterId: string;
  backgroundId: string;
  script: string;
  voice: string;
  captions: boolean;
  backgroundMusic: boolean;
}

export interface CreateProductAdRequest {
  userId: string;
  characterId: string;
  productImageUrl: string;
  script: string;
  voice: string;
}

export async function orchestrateUGCGeneration(
  request: CreateUGCRequest,
  userPlan: string
) {
  const model = selectModel(userPlan);

  // TODO: Look up character/background prompts from IDs
  const result = await generateUGCAd({
    characterPrompt: request.characterId,
    backgroundPrompt: request.backgroundId,
    script: request.script,
    voice: request.voice,
    model,
  });

  return result;
}

export async function orchestrateProductAdGeneration(
  request: CreateProductAdRequest,
  userPlan: string
) {
  const model = selectModel(userPlan);

  const result = await generateProductAd({
    characterPrompt: request.characterId,
    productImageUrl: request.productImageUrl,
    script: request.script,
    voice: request.voice,
    model,
  });

  return result;
}
