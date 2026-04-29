import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { inngest } from "@/lib/inngest";
import { COSTS_UNITS } from "@/lib/credits";
import { rateLimitOrResponse } from "@/lib/rate-limit";

const Body = z.object({
  characterId: z.string().optional(),         // Avatar.id from library
  isCustomAvatar: z.boolean().default(false),
  customAvatarUrl: z.string().url().optional(),
  script: z.string().min(1).max(2000),
  voiceId: z.string().min(1),                 // ElevenLabs voice ID
  aspectRatio: z.enum(["NINE_SIXTEEN", "SIXTEEN_NINE", "ONE_ONE"]).default("NINE_SIXTEEN"),
  quality: z.enum(["SD", "HD"]).default("HD"),
});

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const blocked = rateLimitOrResponse(`gen-ugc:${user.id}`, { windowSec: 60, max: 5 });
    if (blocked) return blocked;
    const body = Body.parse(await request.json());

    if (!body.isCustomAvatar && !body.characterId) {
      return NextResponse.json({ error: "characterId or customAvatarUrl required" }, { status: 400 });
    }
    if (body.isCustomAvatar && !body.customAvatarUrl) {
      return NextResponse.json({ error: "customAvatarUrl required when isCustomAvatar" }, { status: 400 });
    }

    let characterImageUrl: string;
    if (body.isCustomAvatar) {
      characterImageUrl = body.customAvatarUrl!;
    } else {
      const character = await prisma.avatar.findUnique({ where: { id: body.characterId! } });
      if (!character) {
        return NextResponse.json({ error: "Invalid character" }, { status: 400 });
      }
      characterImageUrl = character.imageUrl;
    }

    // Validate voice (DB)
    const voice = await prisma.voice.findUnique({ where: { voiceId: body.voiceId } });
    if (!voice) {
      return NextResponse.json({ error: "Invalid voice" }, { status: 400 });
    }

    const CREDIT_COST = body.quality === "HD" ? COSTS_UNITS.UGC_AD_HD : COSTS_UNITS.UGC_AD_SD;

    if (user.credits < CREDIT_COST) {
      return NextResponse.json(
        { error: "Insufficient credits", needed: CREDIT_COST, have: user.credits },
        { status: 402 }
      );
    }

    const generation = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id, credits: { gte: CREDIT_COST } },
        data: { credits: { decrement: CREDIT_COST } },
      });

      const gen = await tx.generation.create({
        data: {
          userId: user.id,
          type: "UGC_AD",
          status: "PENDING",
          characterId: body.isCustomAvatar ? null : body.characterId,
          characterImage: characterImageUrl,
          isCustomAvatar: body.isCustomAvatar,
          customAvatarUrl: body.customAvatarUrl ?? null,
          script: body.script,
          voiceId: body.voiceId,
          aspectRatio: body.aspectRatio,
          quality: body.quality,
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
          description: `UGC Ad generation`,
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
