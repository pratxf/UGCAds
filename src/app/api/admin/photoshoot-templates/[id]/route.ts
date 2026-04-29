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
    if (typeof body.prompt === "string") data.prompt = body.prompt;
    if (typeof body.categoryId === "string" || body.categoryId === null) data.categoryId = body.categoryId;
    if (typeof body.active === "boolean") data.active = body.active;
    if (typeof body.sortOrder === "number") data.sortOrder = body.sortOrder;
    const template = await prisma.photoshootTemplate.update({ where: { id }, data });
    return NextResponse.json({ template });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: msg }, { status: msg === "Forbidden" ? 403 : 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    await prisma.photoshootTemplate.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: msg }, { status: msg === "Forbidden" ? 403 : 500 });
  }
}
