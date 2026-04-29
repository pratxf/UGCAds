import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [templates, categories] = await Promise.all([
    prisma.photoshootTemplate.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      // CRITICAL: do NOT select `prompt` — server-only.
      select: { id: true, name: true, imageUrl: true, categoryId: true },
    }),
    prisma.photoshootCategory.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true, slug: true },
    }),
  ]);
  return NextResponse.json({ templates, categories });
}
