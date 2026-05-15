import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const url = new URL(req.url);
    const search = url.searchParams.get("search")?.trim() || "";
    const plan = url.searchParams.get("plan") || "all";
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
    const pageSize = 50;

    const where = {
      ...(search && {
        OR: [
          { email: { contains: search, mode: "insensitive" as const } },
          { name: { contains: search, mode: "insensitive" as const } },
        ],
      }),
      ...(plan !== "all" && plan !== "free"
        ? { subscription: { plan: plan.toUpperCase() as "BASIC" | "CREATOR" | "AGENCY" } }
        : {}),
      ...(plan === "free" ? { subscription: null } : {}),
    };

    const [total, users, freeUsers, paidUsers, creatorUsers] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          email: true,
          name: true,
          credits: true,
          createdAt: true,
          subscription: { select: { plan: true, status: true } },
          _count: { select: { generations: true } },
        },
      }),
      prisma.user.count({ where: { subscription: null } }),
      prisma.subscription.count({ where: { status: "ACTIVE" } }),
      prisma.subscription.count({ where: { status: "ACTIVE", plan: "CREATOR" } }),
    ]);

    return NextResponse.json({
      totalUsers: await prisma.user.count(),
      freeUsers,
      paidUsers,
      creatorUsers,
      users: users.map((u) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        credits: u.credits,
        plan: u.subscription?.plan ?? "FREE",
        status: u.subscription?.status && u.subscription.status !== "ACTIVE" ? "Inactive" : "Active",
        totalAds: u._count.generations,
        joined: u.createdAt,
      })),
      total,
      page,
      pageSize,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: msg }, { status: msg === "Forbidden" ? 403 : 500 });
  }
}
