import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateKieImage, pollKieTask, type ImageModel } from "@/lib/kie";
import { uploadToR2, mirrorToR2FromUrl } from "@/lib/r2";
import { COSTS_UNITS } from "@/lib/credits";
import { rateLimitOrResponse } from "@/lib/rate-limit";

export const maxDuration = 120;

const ASPECT_MAP: Record<string, string> = {
  "1:1": "1:1",
  "4:5": "4:5",
  "9:16": "9:16",
  "16:9": "16:9",
};

function buildPrompt(base: string): string {
  return (
    `Place the product shown in the reference image into this scene: ${base}. ` +
    "The product must remain exactly as it appears — preserve all text, logos, colors, " +
    "shape and packaging details with perfect accuracy. Only the background and environment " +
    "should change. Professional product photography style, sharp focus on product."
  );
}

const Schema = z
  .object({
    templateId: z.string().optional(),
    customPrompt: z.string().max(2000).optional(),
    imageModel: z.enum([
      "seedream/4.5-edit",
      "gpt-image-2-image-to-image",
      "qwen2/image-edit",
      "seedream/5-lite-image-to-image",
      "flux-2/pro-image-to-image",
    ]).default("seedream/4.5-edit"),
    aspectRatio: z.enum(["1:1", "4:5", "9:16", "16:9"]).default("1:1"),
  })
  .refine(
    (d) => Boolean(d.templateId) !== Boolean(d.customPrompt?.trim()),
    { message: "Provide either templateId or customPrompt, not both" },
  );

const aspectDb: Record<string, "ONE_ONE" | "PORTRAIT_45" | "NINE_SIXTEEN" | "SIXTEEN_NINE"> = {
  "1:1": "ONE_ONE",
  "4:5": "PORTRAIT_45",
  "9:16": "NINE_SIXTEEN",
  "16:9": "SIXTEEN_NINE",
};

const CREDIT_COST = COSTS_UNITS.MOCKUP;
const POLL_INTERVAL_MS = 4000;
const POLL_TIMEOUT_MS = 110_000;

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const blocked = rateLimitOrResponse(`gen-mockup:${user.id}`, { windowSec: 60, max: 10 });
    if (blocked) return blocked;

    const formData = await request.formData();
    const parsed = Schema.parse({
      templateId: (formData.get("templateId") as string) || undefined,
      customPrompt: (formData.get("customPrompt") as string) || undefined,
      imageModel: (formData.get("imageModel") as string) || "seedream/4.5-edit",
      aspectRatio: (formData.get("aspectRatio") as string) || "1:1",
    });

    const productFile = formData.get("productImage") as File | null;
    if (!productFile || productFile.size === 0) {
      return NextResponse.json({ error: "Image upload failed. Please try again." }, { status: 400 });
    }
    if (productFile.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Product image too large (max 10MB)" }, { status: 413 });
    }

    let templatePrompt: string | null = null;
    let templateName: string | null = null;
    if (parsed.templateId) {
      const template = await prisma.photoshootTemplate.findUnique({ where: { id: parsed.templateId } });
      if (!template) return NextResponse.json({ error: "Invalid template" }, { status: 400 });
      templatePrompt = template.prompt;
      templateName = template.name;
    }

    if (user.credits < CREDIT_COST) {
      return NextResponse.json({ error: "Insufficient credits" }, { status: 402 });
    }

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
          userId: user.id,
          type: "MOCKUP",
          status: "GENERATING_SCENE",
          productImage: productImageUrl,
          customPrompt: parsed.customPrompt ?? null,
          aiModel: parsed.imageModel,
          aspectRatio: aspectDb[parsed.aspectRatio],
          quality: "HD",
          creditsUsed: CREDIT_COST,
          creditCost: CREDIT_COST,
          provider: "KIE",
          metadata: parsed.templateId ? { templateId: parsed.templateId, templateName } : {},
        },
      });
      await tx.transaction.create({
        data: {
          userId: user.id,
          type: "USAGE",
          status: "COMPLETED",
          credits: -CREDIT_COST,
          description: templateName ? `AI Photoshoot - ${templateName}` : "AI Photoshoot - Custom",
          metadata: { generationId: gen.id },
        },
      });
      return gen;
    });

    // Start kie.ai task
    const finalPrompt = templatePrompt ? buildPrompt(templatePrompt) : buildPrompt(parsed.customPrompt!);
    const kieTaskId = await generateKieImage({
      model: parsed.imageModel as ImageModel,
      imageUrl: productImageUrl,
      prompt: finalPrompt,
      aspectRatio: ASPECT_MAP[parsed.aspectRatio] || "1:1",
    });

    // Poll inline (within maxDuration)
    const deadline = Date.now() + POLL_TIMEOUT_MS;
    let finalUrl: string | null = null;

    while (Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
      const result = await pollKieTask(kieTaskId);

      if (result.state === "success" && result.resultUrls[0]) {
        finalUrl = await mirrorToR2FromUrl(
          result.resultUrls[0],
          `generations/${generation.id}/photoshoot.jpg`,
          "image/jpeg",
        );
        break;
      }
      if (result.state === "fail") {
        throw new Error(result.failMsg || "KIE generation failed");
      }
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
    if (e?.name === "ZodError") return NextResponse.json({ error: "Invalid input", details: e.errors }, { status: 400 });
    if (e?.code === "P2025") return NextResponse.json({ error: "Insufficient credits" }, { status: 402 });
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
