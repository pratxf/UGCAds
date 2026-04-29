import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET() {
  try {
    await requireAdmin();
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [totalUsers, activeSubscriptions, generationsToday, recentSignups] = await Promise.all([
      prisma.user.count(),
      prisma.subscription.count({ where: { status: "ACTIVE" } }),
      prisma.generation.count({ where: { createdAt: { gte: startOfDay } } }),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          subscription: { select: { plan: true } },
        },
      }),
    ]);

    const totalGenerations = await prisma.generation.count();
    const failedToday = await prisma.generation.count({
      where: { status: "FAILED", createdAt: { gte: startOfDay } },
    });

    return NextResponse.json({
      totalUsers,
      activeSubscriptions,
      generationsToday,
      totalGenerations,
      failedToday,
      recentSignups: recentSignups.map((u) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        plan: u.subscription?.plan ?? "FREE",
        createdAt: u.createdAt,
      })),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: msg }, { status: msg === "Forbidden" ? 403 : 500 });
  }
}
