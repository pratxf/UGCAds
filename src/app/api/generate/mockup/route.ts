import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadToR2, uploadToR2FromUrl } from "@/lib/r2";
import { generatePhotoshootFlux, generatePhotoshootSeedream } from "@/lib/fal";
import { COSTS_UNITS } from "@/lib/credits";
import { rateLimitOrResponse } from "@/lib/rate-limit";

// Photoshoot is a single fal.ai call (~10–30s) so we run it inline instead
// of dispatching to Inngest. This dodges the cloud delivery delay and gives
// the user the result directly.
export const maxDuration = 90;

const ASPECT_TO_SIZE: Record<string, { width: number; height: number }> = {
  ONE_ONE: { width: 1024, height: 1024 },
  PORTRAIT_45: { width: 1024, height: 1280 },
  NINE_SIXTEEN: { width: 768, height: 1344 },
  SIXTEEN_NINE: { width: 1344, height: 768 },
};

function buildCustomPhotoshootPrompt(custom: string): string {
  return (
    `Place the product shown in the reference image into this scene: ${custom}. ` +
    "The product must remain exactly as it appears — preserve all text, logos, colors, " +
    "shape and packaging details with perfect accuracy. Only the background and environment " +
    "should change. Professional product photography style, sharp focus on product."
  );
}

const CREDIT_COST = COSTS_UNITS.MOCKUP;

const Schema = z
  .object({
    templateId: z.string().optional(),
    customPrompt: z.string().max(2000).optional(),
    modelChoice: z.enum(["flux", "seedream"]).default("flux"),
    aspectRatio: z.enum(["1:1", "4:5", "9:16", "16:9"]).default("1:1"),
  })
  .refine(
    (d) => Boolean(d.templateId) !== Boolean(d.customPrompt && d.customPrompt.trim()),
    { message: "Provide either templateId or customPrompt, not both" },
  );

const aspectMap = {
  "1:1": "ONE_ONE",
  "4:5": "PORTRAIT_45",
  "9:16": "NINE_SIXTEEN",
  "16:9": "SIXTEEN_NINE",
} as const;

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const blocked = rateLimitOrResponse(`gen-mockup:${user.id}`, { windowSec: 60, max: 10 });
    if (blocked) return blocked;
    const formData = await request.formData();

    const parsed = Schema.parse({
      templateId: (formData.get("templateId") as string) || undefined,
      customPrompt: (formData.get("customPrompt") as string) || undefined,
      modelChoice: (formData.get("modelChoice") as string) || "flux",
      aspectRatio: (formData.get("aspectRatio") as string) || "1:1",
    });

    const productFile = formData.get("productImage") as File | null;
    if (!productFile || productFile.size === 0) {
      return NextResponse.json({ error: "Image upload failed. Please try again." }, { status: 400 });
    }
    if (productFile.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Product image too large (max 10MB)" }, { status: 413 });
    }
    if (!productFile.type.startsWith("image/")) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    let templatePromptHidden: string | null = null;
    let templateName: string | null = null;
    if (parsed.templateId) {
      const template = await prisma.photoshootTemplate.findUnique({
        where: { id: parsed.templateId },
      });
      if (!template) {
        return NextResponse.json({ error: "Invalid template" }, { status: 400 });
      }
      templatePromptHidden = template.prompt;
      templateName = template.name;
    }

    if (user.credits < CREDIT_COST) {
      return NextResponse.json(
        { error: "Insufficient credits", needed: CREDIT_COST, have: user.credits },
        { status: 402 },
      );
    }

    let productImageUrl: string;
    try {
      const buffer = Buffer.from(await productFile.arrayBuffer());
      const ext = productFile.type.split("/")[1] || "jpg";
      const key = `photoshoot-input/${user.id}/${Date.now()}.${ext}`;
      productImageUrl = await uploadToR2(buffer, key, productFile.type);
    } catch (e) {
      console.error("R2 upload failed", e);
      return NextResponse.json({ error: "Image upload failed. Please try again." }, { status: 500 });
    }

    const aiModel = parsed.modelChoice === "seedream" ? "seedream" : "flux-kontext";

    const generation = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id, credits: { gte: CREDIT_COST } },
        data: { credits: { decrement: CREDIT_COST } },
      });

      const gen = await tx.generation.create({
        data: {
          userId: user.id,
          type: "MOCKUP",
          status: "PENDING",
          productImage: productImageUrl,
          script: templatePromptHidden, // server-side prompt for templates
          customPrompt: parsed.customPrompt ?? null,
          aiModel,
          aspectRatio: aspectMap[parsed.aspectRatio],
          quality: "HD",
          creditsUsed: CREDIT_COST,
          creditCost: CREDIT_COST,
          provider: "FAL",
          metadata: parsed.templateId
            ? { templateId: parsed.templateId, templateName }
            : { customPrompt: parsed.customPrompt },
        },
      });

      await tx.transaction.create({
        data: {
          userId: user.id,
          type: "USAGE",
          status: "COMPLETED",
          credits: -CREDIT_COST,
          description: parsed.templateId
            ? `AI Photoshoot - ${templateName}`
            : "AI Photoshoot - Custom",
          metadata: { generationId: gen.id },
        },
      });

      return gen;
    });

    // ─── Inline generation (bypasses Inngest) ───────────────
    // Mark in-progress so polling sees status updates if it kicks in fast
    await prisma.generation.update({
      where: { id: generation.id },
      data: { status: "GENERATING_SCENE" },
    });

    try {
      const size = ASPECT_TO_SIZE[generation.aspectRatio] || ASPECT_TO_SIZE.ONE_ONE;
      const finalPrompt = templatePromptHidden
        ? templatePromptHidden
        : buildCustomPhotoshootPrompt(parsed.customPrompt!);

      const { imageUrl: rawUrl } =
        aiModel === "seedream"
          ? await generatePhotoshootSeedream({
              productImage: productImageUrl,
              prompt: finalPrompt,
              size,
            })
          : await generatePhotoshootFlux({
              productImage: productImageUrl,
              prompt: finalPrompt,
              size,
            });

      const finalUrl = await uploadToR2FromUrl(
        rawUrl,
        `generations/${generation.id}/photoshoot.jpg`,
        "image/jpeg",
      );

      await prisma.generation.update({
        where: { id: generation.id },
        data: {
          status: "COMPLETED",
          finalVideoUrl: finalUrl,
          thumbnailUrl: finalUrl,
          completedAt: new Date(),
        },
      });

      return NextResponse.json({
        id: generation.id,
        status: "COMPLETED",
        finalVideoUrl: finalUrl,
      });
    } catch (genErr) {
      const message = genErr instanceof Error ? genErr.message : "Generation failed";
      console.error("[mockup] generation failed:", message);

      // Refund + mark failed
      await prisma.$transaction([
        prisma.generation.update({
          where: { id: generation.id },
          data: { status: "FAILED", errorMessage: message },
        }),
        prisma.user.update({
          where: { id: user.id },
          data: { credits: { increment: CREDIT_COST } },
        }),
        prisma.transaction.create({
          data: {
            userId: user.id,
            type: "REFUND",
            status: "COMPLETED",
            credits: CREDIT_COST,
            description: `Refund for failed photoshoot ${generation.id}`,
          },
        }),
      ]);

      return NextResponse.json(
        {
          id: generation.id,
          status: "FAILED",
          error: "Generation failed. Your credit has been refunded.",
        },
        { status: 502 },
      );
    }
  } catch (err: unknown) {
    const e = err as { message?: string; name?: string; code?: string; errors?: unknown };
    if (e?.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (e?.name === "ZodError") return NextResponse.json({ error: "Invalid input", details: e.errors }, { status: 400 });
    if (e?.code === "P2025") return NextResponse.json({ error: "Insufficient credits" }, { status: 402 });
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
