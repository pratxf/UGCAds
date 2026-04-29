import { inngest } from "@/lib/inngest";
import { prisma } from "@/lib/prisma";
import {
  generateScene,
  generateVoiceover,
  generateVideo,
  lipSync,
  generatePhotoshootFlux,
  generatePhotoshootSeedream,
  generateTryon,
  upscaleVideo,
} from "@/lib/fal";
import { uploadToR2FromUrl } from "@/lib/r2";

export const generateVideoFn = inngest.createFunction(
  {
    id: "generate-video",
    name: "Generate Video Ad",
    retries: 0,
    concurrency: { limit: 5 },
    triggers: [{ event: "video.generate" }],
  },
  async ({ event, step }) => {
    const { generationId } = event.data;

    const gen = await step.run("load-generation", async () => {
      const g = await prisma.generation.findUniqueOrThrow({ where: { id: generationId } });
      if (g.type === "TRYON") {
        if (!g.characterImage) throw new Error("Missing model image");
        if (!g.garmentImageUrl) throw new Error("Missing garment image");
      } else if (g.type === "MOCKUP" || g.type === "PRODUCT_PHOTOSHOOT") {
        if (!g.productImage) throw new Error("Missing product image");
        if (!g.script && !g.customPrompt) throw new Error("Missing template prompt or custom prompt");
      } else {
        if (!g.script || !g.characterImage) throw new Error("Missing script or character");
        if (!g.voiceId) throw new Error("Missing voice");
        if (g.type === "PRODUCT_AD" && !g.productImage) throw new Error("Missing product image");
      }
      return g;
    });

    const isProductAd = gen.type === "PRODUCT_AD";
    const isMockup = gen.type === "MOCKUP" || gen.type === "PRODUCT_PHOTOSHOOT";
    const isTryon = gen.type === "TRYON";
    const isHD = gen.quality === "HD";

    try {
      // ─── TRY-ON (single step, virtual try-on composite) ───
      if (isTryon) {
        await step.run("status-generating-tryon", async () => {
          await prisma.generation.update({
            where: { id: generationId },
            data: { status: "GENERATING_TRYON" },
          });
        });

        const finalUrl = await step.run("generate-tryon", async () => {
          const { imageUrl } = await generateTryon({
            personImage: gen.characterImage!,
            garmentImage: gen.garmentImageUrl!,
            category: (gen.garmentCategory as "tops" | "bottoms" | "full-body" | "outerwear") || "tops",
          });
          return await uploadToR2FromUrl(
            imageUrl,
            `generations/${generationId}/tryon-result.jpg`,
            "image/jpeg",
          );
        });

        await step.run("complete-tryon", async () => {
          await prisma.generation.update({
            where: { id: generationId },
            data: {
              status: "COMPLETED",
              finalVideoUrl: finalUrl,
              thumbnailUrl: finalUrl,
              completedAt: new Date(),
            },
          });
        });

        return { success: true, finalVideoUrl: finalUrl };
      }

      // ─── PRODUCT PHOTOSHOOT (single step) ───
      if (isMockup) {
        await step.run("status-generating-scene", async () => {
          await prisma.generation.update({
            where: { id: generationId },
            data: { status: "GENERATING_SCENE" },
          });
        });

        const finalImageUrl = await step.run("generate-photoshoot", async () => {
          const size = aspectToSize(gen.aspectRatio);
          const finalPrompt = gen.script
            ? gen.script
            : buildCustomPhotoshootPrompt(gen.customPrompt!);

          const { imageUrl } =
            gen.aiModel === "seedream"
              ? await generatePhotoshootSeedream({
                  productImage: gen.productImage!,
                  prompt: finalPrompt,
                  size,
                })
              : await generatePhotoshootFlux({
                  productImage: gen.productImage!,
                  prompt: finalPrompt,
                  size,
                });

          return await uploadToR2FromUrl(
            imageUrl,
            `generations/${generationId}/photoshoot.jpg`,
            "image/jpeg",
          );
        });

        await step.run("complete-mockup", async () => {
          await prisma.generation.update({
            where: { id: generationId },
            data: {
              status: "COMPLETED",
              finalVideoUrl: finalImageUrl,
              thumbnailUrl: finalImageUrl,
              completedAt: new Date(),
            },
          });
        });

        return { success: true, finalVideoUrl: finalImageUrl };
      }

      // ─── STEP 1: Generate voiceover (always first) ───
      await step.run("status-generating-audio", async () => {
        await prisma.generation.update({
          where: { id: generationId },
          data: { status: "GENERATING_AUDIO" },
        });
      });

      const audioUrl = await step.run("generate-voiceover", async () => {
        const { audioUrl } = await generateVoiceover({
          script: gen.script!,
          voiceId: gen.voiceId!,
        });
        const r2Url = await uploadToR2FromUrl(
          audioUrl,
          `generations/${generationId}/audio.mp3`,
          "audio/mpeg",
        );
        await prisma.generation.update({
          where: { id: generationId },
          data: { audioUrl: r2Url },
        });
        return r2Url;
      });

      // ─── STEP 2 (Product Ad only): Composite character + product ───
      let sourceImage = gen.characterImage!;
      if (isProductAd) {
        await step.run("status-generating-scene", async () => {
          await prisma.generation.update({
            where: { id: generationId },
            data: { status: "GENERATING_SCENE" },
          });
        });

        sourceImage = await step.run("generate-scene", async () => {
          const { imageUrl } = await generateScene({
            characterImage: gen.characterImage!,
            productImage: gen.productImage!,
            prompt: buildCompositePrompt(),
          });
          const r2Url = await uploadToR2FromUrl(
            imageUrl,
            `generations/${generationId}/composite.jpg`,
            "image/jpeg",
          );
          await prisma.generation.update({
            where: { id: generationId },
            data: { compositeImageUrl: r2Url },
          });
          return r2Url;
        });
      }

      // ─── STEP 3: Generate silent video ───
      await step.run("status-generating-video", async () => {
        await prisma.generation.update({
          where: { id: generationId },
          data: { status: "GENERATING_VIDEO" },
        });
      });

      const rawVideoUrl = await step.run("generate-video", async () => {
        const motionPrompt = isProductAd
          ? "A person naturally holding a product and talking to the camera, expressive face, subtle movements, professional lighting, UGC style"
          : "A person speaking naturally to the camera, subtle head movements, expressive face, professional lighting, talking style";
        const { videoUrl } = await generateVideo({
          imageUrl: sourceImage,
          prompt: motionPrompt,
          duration: 10,
        });
        const r2Url = await uploadToR2FromUrl(
          videoUrl,
          `generations/${generationId}/raw-video.mp4`,
          "video/mp4",
        );
        await prisma.generation.update({
          where: { id: generationId },
          data: { rawVideoUrl: r2Url },
        });
        return r2Url;
      });

      // ─── STEP 4: Lip sync ───
      await step.run("status-syncing-lips", async () => {
        await prisma.generation.update({
          where: { id: generationId },
          data: { status: "SYNCING_LIPS" },
        });
      });

      const syncedVideoUrl = await step.run("lip-sync", async () => {
        const { videoUrl } = await lipSync({
          videoUrl: rawVideoUrl,
          audioUrl: audioUrl,
        });
        return await uploadToR2FromUrl(
          videoUrl,
          `generations/${generationId}/synced.mp4`,
          "video/mp4",
        );
      });

      // ─── STEP 5 (HD only): Upscale to 1080p ───
      let finalVideoUrl = syncedVideoUrl;
      if (isHD) {
        await step.run("status-upscaling", async () => {
          await prisma.generation.update({
            where: { id: generationId },
            data: { status: "UPSCALING" },
          });
        });

        finalVideoUrl = await step.run("upscale-video", async () => {
          const { videoUrl } = await upscaleVideo({ videoUrl: syncedVideoUrl });
          return await uploadToR2FromUrl(
            videoUrl,
            `generations/${generationId}/final-1080p.mp4`,
            "video/mp4",
          );
        });
      }

      // ─── DONE ───
      await step.run("complete", async () => {
        await prisma.generation.update({
          where: { id: generationId },
          data: {
            status: "COMPLETED",
            finalVideoUrl,
            completedAt: new Date(),
          },
        });
      });

      return { success: true, finalVideoUrl };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      // ─── FAIL: refund credits ───
      await step.run("refund-on-failure", async () => {
        const failedGen = await prisma.generation.findUnique({
          where: { id: generationId },
        });
        if (!failedGen) return;

        await prisma.$transaction([
          prisma.generation.update({
            where: { id: generationId },
            data: { status: "FAILED", errorMessage: message },
          }),
          prisma.user.update({
            where: { id: failedGen.userId },
            data: { credits: { increment: failedGen.creditCost ?? failedGen.creditsUsed } },
          }),
          prisma.transaction.create({
            data: {
              userId: failedGen.userId,
              type: "REFUND",
              status: "COMPLETED",
              credits: failedGen.creditCost ?? failedGen.creditsUsed,
              description: `Refund for failed generation ${generationId}`,
            },
          }),
        ]);
      });
      throw err;
    }
  },
);

function buildCompositePrompt(): string {
  return [
    "Person naturally holding [product], lifestyle UGC style,",
    "front facing, looking at camera, soft natural lighting,",
    "authentic feel, preserve all product details exactly.",
  ].join(" ");
}

function buildCustomPhotoshootPrompt(custom: string): string {
  return (
    `Place the product shown in the reference image into this scene: ${custom}. ` +
    "The product must remain exactly as it appears — preserve all text, logos, colors, " +
    "shape and packaging details with perfect accuracy. Only the background and environment " +
    "should change. Professional product photography style, sharp focus on product."
  );
}

function aspectToSize(ar: string): { width: number; height: number } {
  switch (ar) {
    case "ONE_ONE":
      return { width: 1024, height: 1024 };
    case "PORTRAIT_45":
      return { width: 1024, height: 1280 };
    case "NINE_SIXTEEN":
      return { width: 768, height: 1344 };
    case "SIXTEEN_NINE":
      return { width: 1344, height: 768 };
    default:
      return { width: 1024, height: 1024 };
  }
}
