import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

const PLAN_PRICE_CENTS: Record<string, number> = {
  BASIC: 3900,
  CREATOR: 7900,
  AGENCY: 12900,
};

export async function GET() {
  try {
    await requireAdmin();

    const [subs, subscriptionTxns, topupTxns] = await Promise.all([
      prisma.subscription.findMany({
        where: { status: "ACTIVE" },
        select: { plan: true, billingCycle: true },
      }),
      prisma.transaction.aggregate({
        where: { type: "SUBSCRIPTION", status: "COMPLETED" },
        _sum: { amountCents: true },
      }),
      prisma.transaction.aggregate({
        where: { type: "TOPUP", status: "COMPLETED" },
        _sum: { amountCents: true },
      }),
    ]);

    let mrrCents = 0;
    const tally: Record<string, { subs: number; mrrCents: number }> = {};

    for (const s of subs) {
      const monthly = PLAN_PRICE_CENTS[s.plan] ?? 0;
      const recur = s.billingCycle === "YEARLY" ? Math.round(monthly * 0.8) : monthly;
      mrrCents += recur;
      if (!tally[s.plan]) tally[s.plan] = { subs: 0, mrrCents: 0 };
      tally[s.plan].subs += 1;
      tally[s.plan].mrrCents += recur;
    }

    const breakdown = Object.entries(tally).map(([plan, v]) => ({
      plan,
      subs: v.subs,
      mrrCents: v.mrrCents,
    }));

    const subscriptionRevenueCents = subscriptionTxns._sum.amountCents ?? 0;
    const topupRevenueCents = topupTxns._sum.amountCents ?? 0;
    const totalRevenueCents = subscriptionRevenueCents + topupRevenueCents;

    return NextResponse.json({
      mrrCents,
      activeSubs: subs.length,
      breakdown,
      totalRevenueCents,
      subscriptionRevenueCents,
      topupRevenueCents,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: msg }, { status: msg === "Forbidden" ? 403 : 500 });
  }
}
