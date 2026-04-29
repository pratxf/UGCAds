import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { uploadToR2 } from "@/lib/r2";

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const form = await req.formData();
    const id = (form.get("id") as string) || "";
    const file = form.get("image") as File | null;
    if (!file) return NextResponse.json({ error: "Missing image" }, { status: 400 });
    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json({ error: "Image too large (max 20MB)" }, { status: 413 });
    }
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const key = `product-ad-avatars/${id || Date.now()}.${ext}`;
    const url = await uploadToR2(buffer, key, file.type);
    if (id) {
      await prisma.productAdAvatar.update({ where: { id }, data: { imageUrl: url } });
    }
    return NextResponse.json({ url });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: msg }, { status: msg === "Forbidden" ? 403 : 500 });
  }
}
