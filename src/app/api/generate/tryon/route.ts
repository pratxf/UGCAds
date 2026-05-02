import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { mirrorToR2FromUrl, uploadToR2 } from "@/lib/r2";
import { generateTryon } from "@/lib/fal";
import { COSTS_UNITS } from "@/lib/credits";
import { rateLimitOrResponse } from "@/lib/rate-limit";

// Try-On is one fal.ai call — run inline (like photoshoot) instead of via Inngest.
export const maxDuration = 90;

const CREDIT_COST = COSTS_UNITS.TRYON;

const Schema = z.object({
  tryonModelId: z.string().min(1),
  garmentCategory: z.enum(["tops", "bottoms", "full-body", "outerwear"]),
});

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const blocked = rateLimitOrResponse(`gen-tryon:${user.id}`, { windowSec: 60, max: 5 });
    if (blocked) return blocked;
    const formData = await request.formData();
    const parsed = Schema.parse({
      tryonModelId: formData.get("tryonModelId"),
      garmentCategory: formData.get("garmentCategory"),
    });
    const file = formData.get("garmentImage") as File | null;
    if (!file || file.size === 0) {
      return NextResponse.json({ error: "Missing garment image" }, { status: 400 });
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Image too large (max 10MB)" }, { status: 413 });
    }
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    const tryonModel = await prisma.tryonModel.findUnique({ where: { id: parsed.tryonModelId } });
    if (!tryonModel || !tryonModel.isActive) {
      return NextResponse.json({ error: "Invalid try-on model" }, { status: 400 });
    }
    if (!tryonModel.imageUrl) {
      return NextResponse.json({ error: "Model not yet ready" }, { status: 400 });
    }

    if (user.credits < CREDIT_COST) {
      return NextResponse.json(
        { error: "Insufficient credits", needed: CREDIT_COST, have: user.credits },
        { status: 402 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.type.split("/")[1] || "jpg";
    const garmentKey = `tryon-garments/${user.id}/${Date.now()}.${ext}`;
    const garmentImageUrl = await uploadToR2(buffer, garmentKey, file.type);

    const generation = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id, credits: { gte: CREDIT_COST } },
        data: { credits: { decrement: CREDIT_COST } },
      });
      const gen = await tx.generation.create({
        data: {
          userId: user.id,
          type: "TRYON",
          status: "GENERATING_TRYON",
          tryonModelId: parsed.tryonModelId,
          characterImage: tryonModel.imageUrl,
          garmentImageUrl,
          garmentCategory: parsed.garmentCategory,
          creditsUsed: CREDIT_COST,
          creditCost: CREDIT_COST,
          provider: "FAL",
        },
      });
      await tx.transaction.create({
        data: {
          userId: user.id,
          type: "USAGE",
          status: "COMPLETED",
          credits: -CREDIT_COST,
          description: `AI Try-On (${parsed.garmentCategory})`,
          metadata: { generationId: gen.id },
        },
      });
      return gen;
    });

    // ─── Inline generation (bypasses Inngest) ──────────────
    try {
      const { imageUrl: rawUrl } = await generateTryon({
        personImage: tryonModel.imageUrl,
        garmentImage: garmentImageUrl,
        category: parsed.garmentCategory,
      });

      const finalUrl = await mirrorToR2FromUrl(
        rawUrl,
        `generations/${generation.id}/tryon.jpg`,
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
      const message = genErr instanceof Error ? genErr.message : "Try-on failed";
      console.error("[tryon] generation failed:", message);

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
            description: `Refund for failed try-on ${generation.id}`,
          },
        }),
      ]);

      return NextResponse.json(
        {
          id: generation.id,
          status: "FAILED",
          error: "Try-on failed. Your credits have been refunded.",
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
