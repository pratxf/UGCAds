import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const { credits, reason } = await req.json();
    if (typeof credits !== "number" || isNaN(credits) || credits === 0) {
      return NextResponse.json({ error: "credits must be a non-zero number" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id }, select: { id: true, credits: true } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    await prisma.$transaction([
      prisma.user.update({
        where: { id },
        data: { credits: { increment: credits } },
      }),
      prisma.transaction.create({
        data: {
          userId: id,
          type: "REFUND",
          status: "COMPLETED",
          credits,
          description: reason?.trim() || `Admin credit grant: ${credits > 0 ? "+" : ""}${credits} credits`,
        },
      }),
    ]);

    const updated = await prisma.user.findUnique({ where: { id }, select: { credits: true } });
    return NextResponse.json({ ok: true, newBalance: updated?.credits });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: msg }, { status: msg === "Forbidden" ? 403 : 500 });
  }
}
