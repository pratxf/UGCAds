import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function GET() {
  try {
    await requireAdmin();
    const categories = await prisma.photoshootCategory.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: { _count: { select: { templates: true } } },
    });
    return NextResponse.json({ categories });
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const { name } = await req.json();
    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "name required" }, { status: 400 });
    }
    const category = await prisma.photoshootCategory.create({
      data: { name: name.trim(), slug: slugify(name) },
    });
    return NextResponse.json({ category });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: msg }, { status: msg === "Forbidden" ? 403 : 500 });
  }
}
