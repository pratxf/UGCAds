import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const url = new URL(req.url);
    const status = url.searchParams.get("status") || "all";
    const type = url.searchParams.get("type") || "all";
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
    const pageSize = 50;

    const TYPE_MAP: Record<string, "UGC_AD" | "PRODUCT_AD" | "PRODUCT_PHOTOSHOOT" | "TRYON" | "MOCKUP"> = {
      ugc: "UGC_AD",
      product: "PRODUCT_AD",
      photoshoot: "PRODUCT_PHOTOSHOOT",
      tryon: "TRYON",
    };

    const where = {
      ...(status === "pending" && { status: { notIn: ["COMPLETED" as const, "FAILED" as const] } }),
      ...(status === "complete" && { status: "COMPLETED" as const }),
      ...(status === "failed" && { status: "FAILED" as const }),
      ...(TYPE_MAP[type] && { type: TYPE_MAP[type] }),
    };

    const [total, gens] = await Promise.all([
      prisma.generation.count({ where }),
      prisma.generation.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { user: { select: { email: true, name: true } } },
      }),
    ]);

    return NextResponse.json({
      generations: gens.map((g) => ({
        id: g.id,
        type: g.type,
        status: g.status,
        creditCost: g.creditCost,
        creditsUsed: g.creditsUsed,
        aiModel: g.aiModel,
        userEmail: g.user.email,
        userName: g.user.name,
        createdAt: g.createdAt,
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
