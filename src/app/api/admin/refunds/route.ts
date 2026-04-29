import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET() {
  try {
    await requireAdmin();
    const STUCK_AGE_MS = 30 * 60 * 1000;
    const cutoff = new Date(Date.now() - STUCK_AGE_MS);

    const [failed, stuck] = await Promise.all([
      prisma.generation.findMany({
        where: { status: "FAILED" },
        orderBy: { createdAt: "desc" },
        take: 100,
        include: { user: { select: { email: true, name: true } } },
      }),
      prisma.generation.findMany({
        where: {
          status: { notIn: ["COMPLETED", "FAILED"] },
          createdAt: { lt: cutoff },
        },
        orderBy: { createdAt: "desc" },
        take: 100,
        include: { user: { select: { email: true, name: true } } },
      }),
    ]);

    const refundedIds = new Set(
      (
        await prisma.transaction.findMany({
          where: { type: "REFUND", description: { startsWith: "Refund for" } },
          select: { description: true },
        })
      )
        .map((t) => t.description?.match(/[a-z0-9]{20,}/)?.[0])
        .filter(Boolean) as string[],
    );

    return NextResponse.json({
      failed: failed.map((g) => ({
        id: g.id,
        type: g.type,
        creditCost: g.creditCost,
        creditsUsed: g.creditsUsed,
        errorMessage: g.errorMessage,
        createdAt: g.createdAt,
        userEmail: g.user.email,
        userName: g.user.name,
        refunded: refundedIds.has(g.id),
      })),
      stuck: stuck.map((g) => ({
        id: g.id,
        type: g.type,
        status: g.status,
        creditCost: g.creditCost,
        creditsUsed: g.creditsUsed,
        createdAt: g.createdAt,
        userEmail: g.user.email,
        userName: g.user.name,
        refunded: refundedIds.has(g.id),
      })),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: msg }, { status: msg === "Forbidden" ? 403 : 500 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const { generationId } = await req.json();
    if (!generationId) {
      return NextResponse.json({ error: "generationId required" }, { status: 400 });
    }
    const gen = await prisma.generation.findUnique({ where: { id: generationId } });
    if (!gen) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const refund = gen.creditCost ?? gen.creditsUsed ?? 0;
    await prisma.$transaction([
      prisma.generation.update({
        where: { id: gen.id },
        data: gen.status === "FAILED" ? {} : { status: "FAILED", errorMessage: "Manually refunded by admin" },
      }),
      prisma.user.update({
        where: { id: gen.userId },
        data: { credits: { increment: refund } },
      }),
      prisma.transaction.create({
        data: {
          userId: gen.userId,
          type: "REFUND",
          status: "COMPLETED",
          credits: refund,
          description: `Refund for ${gen.id} (admin)`,
        },
      }),
    ]);
    return NextResponse.json({ ok: true, refunded: refund });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: msg }, { status: msg === "Forbidden" ? 403 : 500 });
  }
}
