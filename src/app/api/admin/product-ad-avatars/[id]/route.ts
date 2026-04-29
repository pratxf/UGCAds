import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const data: Record<string, unknown> = {};
    if (typeof body.name === "string") data.name = body.name;
    if (typeof body.gender === "string") data.gender = body.gender;
    if (typeof body.nationality === "string") data.nationality = body.nationality;
    if (typeof body.imageUrl === "string") data.imageUrl = body.imageUrl;
    if (typeof body.isActive === "boolean") data.isActive = body.isActive;
    if (typeof body.sortOrder === "number") data.sortOrder = body.sortOrder;
    const avatar = await prisma.productAdAvatar.update({ where: { id }, data });
    return NextResponse.json({ avatar });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: msg }, { status: msg === "Forbidden" ? 403 : 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    await prisma.productAdAvatar.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: msg }, { status: msg === "Forbidden" ? 403 : 500 });
  }
}
