import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateKieVideo, type VideoModel } from "@/lib/kie";
import { uploadToR2 } from "@/lib/r2";
import { COSTS_UNITS } from "@/lib/credits";
import { rateLimitOrResponse } from "@/lib/rate-limit";

const ASPECT_MAP: Record<string, string> = {
  NINE_SIXTEEN: "9:16",
  SIXTEEN_NINE: "16:9",
  ONE_ONE: "1:1",
};

const Schema = z.object({
  videoModel: z.enum(["kling-3.0/video", "kling-2.6/image-to-video"]).default("kling-3.0/video"),
  aspectRatio: z.enum(["NINE_SIXTEEN", "SIXTEEN_NINE", "ONE_ONE"]).default("NINE_SIXTEEN"),
  duration: z.enum(["5", "10", "15"]).default("5"),
});

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const blocked = rateLimitOrResponse(`gen-studio:${user.id}`, { windowSec: 60, max: 5 });
    if (blocked) return blocked;

    const formData = await request.formData();
    const prompt = (formData.get("prompt") as string || "").trim();
    if (!prompt) return NextResponse.json({ error: "Prompt is required" }, { status: 400 });

    const videoModel = (formData.get("videoModel") as string) || "kling-3.0/video";
    const aspectRatio = (formData.get("aspectRatio") as string) || "NINE_SIXTEEN";
    const duration = (formData.get("duration") as string) || "5";
    const characterId = (formData.get("characterId") as string | null) || undefined;

    const parsed = Schema.parse({ videoModel, aspectRatio, duration });

    const CREDIT_COST = parsed.duration === "15"
      ? COSTS_UNITS.UGC_AD_15S
      : parsed.duration === "10"
        ? COSTS_UNITS.UGC_AD_10S
        : COSTS_UNITS.UGC_AD_5S;

    if (user.credits < CREDIT_COST) {
      return NextResponse.json({ error: "Insufficient credits" }, { status: 402 });
    }

    // Resolve library avatar if provided
    let libraryImageUrl: string | undefined;
    let resolvedCharacterId: string | undefined = characterId;
    if (characterId) {
      const character = await prisma.avatar.findUnique({ where: { id: characterId } });
      if (!character) return NextResponse.json({ error: "Invalid avatar" }, { status: 400 });
      libraryImageUrl = character.imageUrl;
    }

    // Upload files (max 2)
    const uploadFile = async (file: File | null): Promise<string | undefined> => {
      if (!file || file.size === 0) return undefined;
      if (file.size > 10 * 1024 * 1024) throw new Error("Image too large (max 10MB)");
      const buffer = Buffer.from(await file.arrayBuffer());
      const ext = file.type.split("/")[1] || "jpg";
      const key = `studio-input/${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      return uploadToR2(buffer, key, file.type);
    };

    const file1 = formData.get("image1") as File | null;
    const file2 = formData.get("image2") as File | null;

    const [uploadedUrl1, uploadedUrl2] = await Promise.all([
      uploadFile(file1),
      uploadFile(file2),
    ]);

    // Build image URL array: library avatar first, then uploads
    const allImageUrls = [libraryImageUrl, uploadedUrl1, uploadedUrl2].filter(Boolean) as string[];
    const imageUrl = allImageUrls[0];
    const imageUrl2 = allImageUrls[1];

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
          characterId: resolvedCharacterId ?? null,
          characterImage: imageUrl ?? null,
          isCustomAvatar: !characterId && !!imageUrl,
          customAvatarUrl: !characterId ? (imageUrl ?? null) : null,
          productImage: imageUrl2 ?? null,
          script: prompt,
          aspectRatio: parsed.aspectRatio,
          quality: "HD",
          creditsUsed: CREDIT_COST,
          creditCost: CREDIT_COST,
          provider: "KIE",
          aiModel: parsed.videoModel,
        },
      });
      await tx.transaction.create({
        data: {
          userId: user.id,
          type: "USAGE",
          status: "COMPLETED",
          credits: -CREDIT_COST,
          description: `Video Ad (${parsed.videoModel})`,
          metadata: { generationId: gen.id },
        },
      });
      return gen;
    });

    const kieTaskId = await generateKieVideo({
      model: parsed.videoModel as VideoModel,
      imageUrl,
      imageUrl2,
      prompt,
      aspectRatio: ASPECT_MAP[parsed.aspectRatio] || "9:16",
      duration: parsed.duration,
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
    if (e?.message?.includes("too large")) return NextResponse.json({ error: e.message }, { status: 413 });
    console.error("[generate/studio]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
