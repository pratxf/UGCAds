import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const { name, avatar } = await req.json();

    const data: { name?: string; avatar?: string } = {};
    if (typeof name === "string" && name.trim()) data.name = name.trim();
    if (typeof avatar === "string") data.avatar = avatar;

    await prisma.user.update({ where: { id: user.id }, data });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 500 });
  }
}
