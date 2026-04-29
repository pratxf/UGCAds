import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { inngest } from "@/lib/inngest";
import { uploadToR2 } from "@/lib/r2";
import { COSTS_UNITS } from "@/lib/credits";
import { rateLimitOrResponse } from "@/lib/rate-limit";

const Schema = z.object({
  characterId: z.string().optional(),
  isCustomAvatar: z.coerce.boolean().default(false),
  customAvatarUrl: z.string().url().optional(),
  script: z.string().min(1).max(2000),
  voiceId: z.string().min(1),
  aspectRatio: z.enum(["NINE_SIXTEEN", "SIXTEEN_NINE", "ONE_ONE"]).default("NINE_SIXTEEN"),
  quality: z.enum(["SD", "HD"]).default("HD"),
});

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const blocked = rateLimitOrResponse(`gen-product:${user.id}`, { windowSec: 60, max: 5 });
    if (blocked) return blocked;
    const formData = await request.formData();

    const parsed = Schema.parse({
      characterId: formData.get("characterId") || undefined,
      isCustomAvatar: formData.get("isCustomAvatar") === "true",
      customAvatarUrl: formData.get("customAvatarUrl") || undefined,
      script: formData.get("script"),
      voiceId: formData.get("voiceId"),
      aspectRatio: formData.get("aspectRatio") || "NINE_SIXTEEN",
      quality: formData.get("quality") || "HD",
    });

    const productFile = formData.get("productImage") as File | null;
    if (!productFile || productFile.size === 0) {
      return NextResponse.json({ error: "Missing product image" }, { status: 400 });
    }
    if (productFile.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Product image too large (max 10MB)" }, { status: 413 });
    }
    if (!productFile.type.startsWith("image/")) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    let characterImageUrl: string;
    if (parsed.isCustomAvatar) {
      if (!parsed.customAvatarUrl) {
        return NextResponse.json({ error: "customAvatarUrl required" }, { status: 400 });
      }
      characterImageUrl = parsed.customAvatarUrl;
    } else {
      if (!parsed.characterId) {
        return NextResponse.json({ error: "characterId required" }, { status: 400 });
      }
      const character = await prisma.productAdAvatar.findUnique({
        where: { id: parsed.characterId },
      });
      if (!character || !character.isActive || !character.imageUrl) {
        return NextResponse.json({ error: "Invalid character" }, { status: 400 });
      }
      characterImageUrl = character.imageUrl;
    }

    const voice = await prisma.voice.findUnique({ where: { voiceId: parsed.voiceId } });
    if (!voice) {
      return NextResponse.json({ error: "Invalid voice" }, { status: 400 });
    }

    const CREDIT_COST = parsed.quality === "HD" ? COSTS_UNITS.PRODUCT_AD_HD : COSTS_UNITS.PRODUCT_AD_SD;

    if (user.credits < CREDIT_COST) {
      return NextResponse.json(
        { error: "Insufficient credits", needed: CREDIT_COST, have: user.credits },
        { status: 402 }
      );
    }

    const buffer = Buffer.from(await productFile.arrayBuffer());
    const ext = productFile.type.split("/")[1] || "jpg";
    const productKey = `product/${user.id}/${Date.now()}.${ext}`;
    const productImageUrl = await uploadToR2(buffer, productKey, productFile.type);

    const generation = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id, credits: { gte: CREDIT_COST } },
        data: { credits: { decrement: CREDIT_COST } },
      });

      const gen = await tx.generation.create({
        data: {
          userId: user.id,
          type: "PRODUCT_AD",
          status: "PENDING",
          characterId: parsed.isCustomAvatar ? null : parsed.characterId,
          characterImage: characterImageUrl,
          isCustomAvatar: parsed.isCustomAvatar,
          customAvatarUrl: parsed.customAvatarUrl ?? null,
          productImage: productImageUrl,
          script: parsed.script,
          voiceId: parsed.voiceId,
          aspectRatio: parsed.aspectRatio,
          quality: parsed.quality,
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
          description: `Product Ad generation`,
          metadata: { generationId: gen.id },
        },
      });

      return gen;
    });

    await inngest.send({
      name: "video.generate",
      data: { generationId: generation.id },
    });

    return NextResponse.json({ id: generation.id, status: generation.status });
  } catch (err: unknown) {
    const e = err as { message?: string; name?: string; code?: string; errors?: unknown };
    if (e?.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (e?.name === "ZodError") return NextResponse.json({ error: "Invalid input", details: e.errors }, { status: 400 });
    if (e?.code === "P2025") return NextResponse.json({ error: "Insufficient credits" }, { status: 402 });
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
