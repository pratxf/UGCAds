import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateKieVideo, type VideoModel } from "@/lib/kie";
import { COSTS_UNITS } from "@/lib/credits";
import { rateLimitOrResponse } from "@/lib/rate-limit";

const Body = z.object({
  characterId: z.string().optional(),
  isCustomAvatar: z.boolean().default(false),
  customAvatarUrl: z.string().url().optional(),
  prompt: z.string().min(1).max(500),
  videoModel: z.enum(["kling-3.0/video", "sora-2-image-to-video"]).default("kling-3.0/video"),
  aspectRatio: z.enum(["NINE_SIXTEEN", "SIXTEEN_NINE", "ONE_ONE"]).default("NINE_SIXTEEN"),
  duration: z.enum(["5", "10", "15"]).default("5"),
});

const ASPECT_MAP: Record<string, string> = {
  NINE_SIXTEEN: "9:16",
  SIXTEEN_NINE: "16:9",
  ONE_ONE: "1:1",
};

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
      if (!character) return NextResponse.json({ error: "Invalid character" }, { status: 400 });
      characterImageUrl = character.imageUrl;
    }

    const CREDIT_COST = body.duration === "15" ? COSTS_UNITS.UGC_AD_15S : body.duration === "10" ? COSTS_UNITS.UGC_AD_10S : COSTS_UNITS.UGC_AD_5S;

    if (user.credits < CREDIT_COST) {
      return NextResponse.json({ error: "Insufficient credits" }, { status: 402 });
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
          status: "GENERATING_VIDEO",
          characterId: body.isCustomAvatar ? null : body.characterId,
          characterImage: characterImageUrl,
          isCustomAvatar: body.isCustomAvatar,
          customAvatarUrl: body.customAvatarUrl ?? null,
          script: body.prompt,
          aspectRatio: body.aspectRatio,
          quality: "HD",
          creditsUsed: CREDIT_COST,
          creditCost: CREDIT_COST,
          provider: "KIE",
          aiModel: body.videoModel,
        },
      });
      await tx.transaction.create({
        data: {
          userId: user.id,
          type: "USAGE",
          status: "COMPLETED",
          credits: -CREDIT_COST,
          description: `UGC Ad (${body.videoModel})`,
          metadata: { generationId: gen.id },
        },
      });
      return gen;
    });

    const kieTaskId = await generateKieVideo({
      model: body.videoModel as VideoModel,
      imageUrl: characterImageUrl,
      prompt: body.prompt,
      aspectRatio: ASPECT_MAP[body.aspectRatio] || "9:16",
      duration: body.duration,
    });

    await prisma.generation.update({
      where: { id: generation.id },
      data: { metadata: { kieTaskId } },
    });

    return NextResponse.json({ id: generation.id, status: "Processing" });
  } catch (err: unknown) {
    const e = err as { message?: string; name?: string; code?: string; errors?: unknown };
    if (e?.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (e?.name === "ZodError") return NextResponse.json({ error: "Invalid input", details: e.errors }, { status: 400 });
    if (e?.code === "P2025") return NextResponse.json({ error: "Insufficient credits" }, { status: 402 });
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
