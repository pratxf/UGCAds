import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [raw, categories] = await Promise.all([
    prisma.avatar.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      select: { id: true, name: true, imageUrl: true, categoryId: true },
    }),
    prisma.avatarCategory.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true, slug: true },
    }),
  ]);
  const avatars = raw.map((a) => ({
    ...a,
    thumbnailUrl: a.imageUrl.replace(/\.png$/i, ".webp"),
  }));
  return NextResponse.json({ avatars, categories });
}
