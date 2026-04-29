import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await params;

    const gen = await prisma.generation.findUnique({ where: { id } });
    if (!gen || gen.userId !== user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: gen.id,
      type: gen.type,
      status: gen.status,
      audioUrl: gen.audioUrl,
      rawVideoUrl: gen.rawVideoUrl,
      compositeImageUrl: gen.compositeImageUrl,
      finalVideoUrl: gen.finalVideoUrl,
      thumbnailUrl: gen.thumbnailUrl,
      aiModel: gen.aiModel,
      aspectRatio: gen.aspectRatio,
      quality: gen.quality,
      errorMessage: gen.errorMessage,
      createdAt: gen.createdAt,
      completedAt: gen.completedAt,
    });
  } catch (err: any) {
    if (err?.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
