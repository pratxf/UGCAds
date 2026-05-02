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

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const blocked = rateLimitOrResponse(`gen-product:${user.id}`, { windowSec: 60, max: 5 });
    if (blocked) return blocked;

    const formData = await request.formData();
    const prompt = (formData.get("prompt") as string || "").trim();
    const videoModel = (formData.get("videoModel") as VideoModel) || "kling-3.0/video";
    const aspectRatio = (formData.get("aspectRatio") as string) || "NINE_SIXTEEN";
    const duration = (formData.get("duration") as string) || "5";

    if (!prompt) return NextResponse.json({ error: "Prompt is required" }, { status: 400 });

    const Schema = z.object({
      videoModel: z.enum(["kling-3.0/video", "sora-2-image-to-video"]),
      aspectRatio: z.enum(["NINE_SIXTEEN", "SIXTEEN_NINE", "ONE_ONE"]),
      duration: z.enum(["5", "10", "15"]),
    });
    const parsed = Schema.parse({ videoModel, aspectRatio, duration });

    const productFile = formData.get("productImage") as File | null;
    if (!productFile || productFile.size === 0) {
      return NextResponse.json({ error: "Product image is required" }, { status: 400 });
    }
    if (productFile.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Product image too large (max 10MB)" }, { status: 413 });
    }

    const CREDIT_COST = COSTS_UNITS.PRODUCT_AD_5S;
    if (user.credits < CREDIT_COST) {
      return NextResponse.json({ error: "Insufficient credits" }, { status: 402 });
    }

    const buffer = Buffer.from(await productFile.arrayBuffer());
    const ext = productFile.type.split("/")[1] || "jpg";
    const key = `product-ad-input/${user.id}/${Date.now()}.${ext}`;
    const productImageUrl = await uploadToR2(buffer, key, productFile.type);

    const generation = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id, credits: { gte: CREDIT_COST } },
        data: { credits: { decrement: CREDIT_COST } },
      });
      const gen = await tx.generation.create({
        data: {
          userId: user.id,
          type: "PRODUCT_AD",
          status: "GENERATING_VIDEO",
          productImage: productImageUrl,
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
          description: `Product Ad (${parsed.videoModel})`,
          metadata: { generationId: gen.id },
        },
      });
      return gen;
    });

    const kieTaskId = await generateKieVideo({
      model: parsed.videoModel,
      imageUrl: productImageUrl,
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
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
