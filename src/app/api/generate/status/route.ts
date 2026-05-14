import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pollKieTask } from "@/lib/kie";
import { pollFalTask } from "@/lib/fal-generation";
import { mirrorToR2FromUrl } from "@/lib/r2";
export const maxDuration = 60;

export async function GET(req: Request) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const gen = await prisma.generation.findUnique({ where: { id, userId: user.id } });
    if (!gen) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (gen.status === "COMPLETED") {
      return NextResponse.json({ status: "Complete", finalUrl: gen.finalVideoUrl });
    }
    if (gen.status === "FAILED") {
      return NextResponse.json({ status: "Failed", errorMessage: gen.errorMessage });
    }

    const meta = (gen.metadata as Record<string, string> | null) ?? {};

    // ── fal provider ──────────────────────────────────────────────
    if (meta.falRequestId && meta.falModelId) {
      const result = await pollFalTask(meta.falModelId, meta.falRequestId);

      if (result.state === "success" && result.url) {
        const isVideo = gen.type === "UGC_AD" || gen.type === "PRODUCT_AD";
        const ext = isVideo ? "mp4" : "jpg";
        const r2Key = `generations/${gen.id}/final.${ext}`;
        const finalUrl = await mirrorToR2FromUrl(result.url, r2Key, isVideo ? "video/mp4" : "image/jpeg");
        await prisma.generation.update({
          where: { id: gen.id },
          data: { status: "COMPLETED", finalVideoUrl: finalUrl, completedAt: new Date() },
        });
        return NextResponse.json({ status: "Complete", finalUrl });
      }

      if (result.state === "fail") {
        await prisma.generation.update({
          where: { id: gen.id },
          data: { status: "FAILED", errorMessage: result.error || "Generation failed" },
        });
        await prisma.$transaction([
          prisma.user.update({ where: { id: gen.userId }, data: { credits: { increment: gen.creditsUsed } } }),
          prisma.transaction.create({
            data: { userId: gen.userId, type: "REFUND", status: "COMPLETED", credits: gen.creditsUsed, description: `Refund: failed generation ${gen.id}` },
          }),
        ]);
        return NextResponse.json({ status: "Failed", errorMessage: result.error });
      }

      return NextResponse.json({ status: "Processing", progress: 0 });
    }

    // ── KIE provider (legacy) ─────────────────────────────────────
    const kieTaskId = meta.kieTaskId;
    if (!kieTaskId) {
      return NextResponse.json({ status: "Processing", progress: 0 });
    }

    const result = await pollKieTask(kieTaskId);

    if (result.state === "success" && result.resultUrls[0]) {
      const srcUrl = result.resultUrls[0];
      const isVideo = gen.type === "UGC_AD" || gen.type === "PRODUCT_AD";
      const ext = isVideo ? "mp4" : "jpg";
      const r2Key = `generations/${gen.id}/final.${ext}`;
      const finalUrl = await mirrorToR2FromUrl(srcUrl, r2Key, isVideo ? "video/mp4" : "image/jpeg");

      await prisma.generation.update({
        where: { id: gen.id },
        data: { status: "COMPLETED", finalVideoUrl: finalUrl, completedAt: new Date() },
      });
      return NextResponse.json({ status: "Complete", finalUrl });
    }

    if (result.state === "fail") {
      await prisma.generation.update({
        where: { id: gen.id },
        data: { status: "FAILED", errorMessage: result.failMsg || "Generation failed" },
      });
      await prisma.$transaction([
        prisma.user.update({ where: { id: gen.userId }, data: { credits: { increment: gen.creditsUsed } } }),
        prisma.transaction.create({
          data: { userId: gen.userId, type: "REFUND", status: "COMPLETED", credits: gen.creditsUsed, description: `Refund: failed generation ${gen.id}` },
        }),
      ]);
      return NextResponse.json({ status: "Failed", errorMessage: result.failMsg });
    }

    return NextResponse.json({ status: "Processing", progress: result.progress });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 });
  }
}
