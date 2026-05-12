import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { submitPoyoTask, pollPoyoTask, PHOTOSHOOT_MODELS } from "@/lib/poyo";
import { uploadToR2, mirrorToR2FromUrl } from "@/lib/r2";
import { COSTS_UNITS } from "@/lib/credits";
import { rateLimitOrResponse } from "@/lib/rate-limit";

export const maxDuration = 120;

const MODEL_IDS = PHOTOSHOOT_MODELS.map((m) => m.id) as [string, ...string[]];

const Schema = z
  .object({
    templateId:   z.string().optional(),
    customPrompt: z.string().max(2000).optional(),
    imageModel:   z.enum(MODEL_IDS).default(MODEL_IDS[0]),
    aspectRatio:  z.enum(["1:1", "4:5", "9:16", "16:9"]).default("1:1"),
  })
  .refine(
    (d) => Boolean(d.templateId) !== Boolean(d.customPrompt?.trim()),
    { message: "Provide either templateId or customPrompt, not both" },
  );

const aspectDb: Record<string, "ONE_ONE" | "PORTRAIT_45" | "NINE_SIXTEEN" | "SIXTEEN_NINE"> = {
  "1:1": "ONE_ONE", "4:5": "PORTRAIT_45", "9:16": "NINE_SIXTEEN", "16:9": "SIXTEEN_NINE",
};

function buildPrompt(base: string): string {
  return (
    `Keep this exact product completely unchanged — every label, text, logo, color, shape, and packaging detail must remain pixel-perfect identical to the input image. ` +
    `Only replace the background and surrounding environment with: ${base}. ` +
    `Do not modify, recreate, or alter the product in any way. Professional product photography lighting, sharp focus on the product.`
  );
}

const CREDIT_COST = COSTS_UNITS.MOCKUP;
const POLL_INTERVAL_MS = 4000;
const POLL_TIMEOUT_MS = 110_000;

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const blocked = await rateLimitOrResponse(`gen-mockup:${user.id}`, { windowSec: 60, max: 10 });
    if (blocked) return blocked;

    const formData = await request.formData();
    const parsed = Schema.parse({
      templateId:   (formData.get("templateId")   as string) || undefined,
      customPrompt: (formData.get("customPrompt") as string) || undefined,
      imageModel:   (formData.get("imageModel")   as string) || MODEL_IDS[0],
      aspectRatio:  (formData.get("aspectRatio")  as string) || "1:1",
    });

    const productFile = formData.get("productImage") as File | null;
    if (!productFile || productFile.size === 0)
      return NextResponse.json({ error: "Image upload failed. Please try again." }, { status: 400 });
    if (productFile.size > 10 * 1024 * 1024)
      return NextResponse.json({ error: "Product image too large (max 10MB)" }, { status: 413 });

    let templatePrompt: string | null = null;
    let templateName:   string | null = null;
    if (parsed.templateId) {
      const template = await prisma.photoshootTemplate.findUnique({ where: { id: parsed.templateId } });
      if (!template) return NextResponse.json({ error: "Invalid template" }, { status: 400 });
      templatePrompt = template.prompt;
      templateName   = template.name;
    }

    if (user.credits < CREDIT_COST)
      return NextResponse.json({ error: "Insufficient credits" }, { status: 402 });

    const buffer = Buffer.from(await productFile.arrayBuffer());
    const ext = productFile.type.split("/")[1] || "jpg";
    const productImageUrl = await uploadToR2(buffer, `photoshoot-input/${user.id}/${Date.now()}.${ext}`, productFile.type);

    const generation = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id, credits: { gte: CREDIT_COST } },
        data: { credits: { decrement: CREDIT_COST } },
      });
      const gen = await tx.generation.create({
        data: {
          userId:       user.id,
          type:         "MOCKUP",
          status:       "GENERATING_SCENE",
          productImage: productImageUrl,
          customPrompt: parsed.customPrompt ?? null,
          aiModel:      parsed.imageModel,
          aspectRatio:  aspectDb[parsed.aspectRatio],
          quality:      "HD",
          creditsUsed:  CREDIT_COST,
          creditCost:   CREDIT_COST,
          provider:     "POYO",
          metadata:     parsed.templateId ? { templateId: parsed.templateId, templateName } : {},
        },
      });
      await tx.transaction.create({
        data: {
          userId:      user.id,
          type:        "USAGE",
          status:      "COMPLETED",
          credits:     -CREDIT_COST,
          description: templateName ? `AI Photoshoot - ${templateName}` : "AI Photoshoot - Custom",
          metadata:    { generationId: gen.id },
        },
      });
      return gen;
    });

    // Replace [product] in template prompt with a generic descriptor, then build final prompt
    const basePrompt = templatePrompt
      ? templatePrompt.replace("[product]", "the product in the reference image")
      : parsed.customPrompt!;
    const finalPrompt = buildPrompt(basePrompt);

    const taskId = await submitPoyoTask(parsed.imageModel, finalPrompt, productImageUrl, parsed.aspectRatio);

    const deadline = Date.now() + POLL_TIMEOUT_MS;
    let finalUrl: string | null = null;

    while (Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
      const result = await pollPoyoTask(taskId);
      if (result.state === "success" && result.url) {
        finalUrl = await mirrorToR2FromUrl(result.url, `generations/${generation.id}/photoshoot.jpg`, "image/jpeg");
        break;
      }
      if (result.state === "fail") throw new Error(result.error || "Poyo generation failed");
    }

    if (!finalUrl) throw new Error("Generation timed out");

    await prisma.generation.update({
      where: { id: generation.id },
      data: { status: "COMPLETED", finalVideoUrl: finalUrl, thumbnailUrl: finalUrl, completedAt: new Date() },
    });

    return NextResponse.json({ id: generation.id, status: "COMPLETED", finalVideoUrl: finalUrl });
  } catch (err: unknown) {
    const e = err as { message?: string; name?: string; code?: string; errors?: unknown };
    if (e?.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (e?.name  === "ZodError")       return NextResponse.json({ error: "Invalid input", details: e.errors }, { status: 400 });
    if (e?.code  === "P2025")          return NextResponse.json({ error: "Insufficient credits" }, { status: 402 });
    const msg = e?.message || "Internal server error";
    console.error("[mockup]", msg, err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
