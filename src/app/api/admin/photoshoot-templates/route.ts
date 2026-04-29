import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { uploadToR2 } from "@/lib/r2";

export async function GET() {
  try {
    await requireAdmin();
    const templates = await prisma.photoshootTemplate.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      include: { category: true },
    });
    return NextResponse.json({ templates });
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const form = await req.formData();
    const name = String(form.get("name") || "").trim();
    const prompt = String(form.get("prompt") || "").trim();
    const categoryId = (form.get("categoryId") as string) || null;
    const file = form.get("image") as File | null;

    if (!name || !prompt || !file) {
      return NextResponse.json({ error: "name, prompt and image are required" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const key = `photoshoot-templates/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const imageUrl = await uploadToR2(buffer, key, file.type || "image/jpeg");

    const template = await prisma.photoshootTemplate.create({
      data: { name, imageUrl, prompt, categoryId: categoryId || null },
    });
    return NextResponse.json({ template });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: msg }, { status: msg === "Forbidden" ? 403 : 500 });
  }
}
