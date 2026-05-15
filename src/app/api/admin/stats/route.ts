import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET() {
  try {
    await requireAdmin();
    const now = new Date();
    const startOfDay = new Date(now); startOfDay.setHours(0, 0, 0, 0);
    const start30 = new Date(now); start30.setDate(start30.getDate() - 30);
    const start60 = new Date(now); start60.setDate(start60.getDate() - 60);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const [
      totalUsers,
      usersLast30,
      usersPrev30,
      activeSubscriptions,
      generationsToday,
      generationsYesterday,
      failedToday,
      failedYesterday,
      totalGenerations,
      completedToday,
      recentSignups,
      subBreakdown,
      activityRaw,
      thisMonthTxns,
      lastMonthTxns,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: start30 } } }),
      prisma.user.count({ where: { createdAt: { gte: start60, lt: start30 } } }),
      prisma.subscription.count({ where: { status: "ACTIVE" } }),
      prisma.generation.count({ where: { createdAt: { gte: startOfDay } } }),
      prisma.generation.count({ where: { createdAt: { gte: new Date(startOfDay.getTime() - 86400000), lt: startOfDay } } }),
      prisma.generation.count({ where: { status: "FAILED", createdAt: { gte: startOfDay } } }),
      prisma.generation.count({ where: { status: "FAILED", createdAt: { gte: new Date(startOfDay.getTime() - 86400000), lt: startOfDay } } }),
      prisma.generation.count(),
      prisma.generation.count({ where: { status: "COMPLETED", createdAt: { gte: startOfDay } } }),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        select: { id: true, email: true, name: true, createdAt: true, subscription: { select: { plan: true } } },
      }),
      prisma.subscription.groupBy({ by: ["plan"], where: { status: "ACTIVE" }, _count: { plan: true } }),
      prisma.generation.findMany({
        where: { createdAt: { gte: start30 } },
        select: { createdAt: true, status: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.transaction.aggregate({
        where: { type: { in: ["SUBSCRIPTION", "TOPUP"] }, status: "COMPLETED", createdAt: { gte: startOfMonth } },
        _sum: { amountCents: true },
      }),
      prisma.transaction.aggregate({
        where: { type: { in: ["SUBSCRIPTION", "TOPUP"] }, status: "COMPLETED", createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
        _sum: { amountCents: true },
      }),
    ]);

    // Build daily activity chart (last 30 days)
    const dayMap: Record<string, { generations: number; failed: number }> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i); d.setHours(0,0,0,0);
      const key = d.toISOString().slice(0, 10);
      dayMap[key] = { generations: 0, failed: 0 };
    }
    for (const g of activityRaw) {
      const key = g.createdAt.toISOString().slice(0, 10);
      if (dayMap[key]) {
        dayMap[key].generations++;
        if (g.status === "FAILED") dayMap[key].failed++;
      }
    }
    const activityChart = Object.entries(dayMap).map(([date, v]) => ({
      date,
      label: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      generations: v.generations,
      failed: v.failed,
    }));

    // Subscription breakdown
    const totalSubs = subBreakdown.reduce((s, b) => s + b._count.plan, 0);
    const breakdown = subBreakdown.map((b) => ({
      plan: b.plan,
      count: b._count.plan,
      pct: totalSubs ? Math.round((b._count.plan / totalSubs) * 100) : 0,
    }));

    // Revenue sparkline (last 30 days per day)
    const revTxns = await prisma.transaction.findMany({
      where: { type: { in: ["SUBSCRIPTION", "TOPUP"] }, status: "COMPLETED", createdAt: { gte: start30 } },
      select: { createdAt: true, amountCents: true },
    });
    const revMap: Record<string, number> = {};
    for (const key of Object.keys(dayMap)) revMap[key] = 0;
    for (const t of revTxns) {
      const key = t.createdAt.toISOString().slice(0, 10);
      if (revMap[key] !== undefined) revMap[key] += t.amountCents ?? 0;
    }
    const revenueChart = Object.entries(revMap).map(([date, cents]) => ({
      date,
      label: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      revenue: Math.round(cents / 100),
    }));

    const thisMonthRevenue = Math.round(((thisMonthTxns._sum?.amountCents) ?? 0) / 100);
    const lastMonthRevenue = Math.round(((lastMonthTxns._sum?.amountCents) ?? 0) / 100);
    const revenueChange = lastMonthRevenue > 0
      ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
      : 0;

    const successRate = (generationsToday + failedToday) > 0
      ? Math.round((completedToday / (generationsToday)) * 100)
      : 100;

    const pct = (curr: number, prev: number) =>
      prev > 0 ? Math.round(((curr - prev) / prev) * 100) : 0;

    return NextResponse.json({
      totalUsers,
      usersPct: pct(usersLast30, usersPrev30),
      activeSubscriptions,
      generationsToday,
      generationsPct: pct(generationsToday, generationsYesterday),
      failedToday,
      failedPct: pct(failedToday, failedYesterday),
      totalGenerations,
      successRate,
      thisMonthRevenue,
      lastMonthRevenue,
      revenueChange,
      activityChart,
      revenueChart,
      breakdown,
      recentSignups: recentSignups.map((u) => ({
        id: u.id, email: u.email, name: u.name,
        plan: u.subscription?.plan ?? "FREE",
        createdAt: u.createdAt,
      })),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: msg }, { status: msg === "Forbidden" ? 403 : 500 });
  }
}
