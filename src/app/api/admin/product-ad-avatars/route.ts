import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET() {
  try {
    await requireAdmin();
    const avatars = await prisma.productAdAvatar.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
    return NextResponse.json({ avatars });
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const name = String(body.name || "").trim();
    const gender = String(body.gender || "female");
    const nationality = String(body.nationality || "american");
    if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });
    const avatar = await prisma.productAdAvatar.create({
      data: { name, gender, nationality, imageUrl: "" },
    });
    return NextResponse.json({ avatar });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: msg }, { status: msg === "Forbidden" ? 403 : 500 });
  }
}
