import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET() {
  try {
    await requireAdmin();

    const tickets = await prisma.supportTicket.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        user: { select: { email: true, name: true, avatar: true } },
        messages: { orderBy: { createdAt: "asc" } },
      },
    });

    const setting = await prisma.appSetting.findUnique({ where: { key: "support_online" } });
    const online = (setting?.value as { online: boolean } | null)?.online ?? false;

    const counts = {
      open: tickets.filter((t) => t.status === "OPEN").length,
      replied: tickets.filter((t) => t.status === "REPLIED").length,
      closed: tickets.filter((t) => t.status === "CLOSED").length,
    };

    return NextResponse.json({ tickets, online, counts });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: msg }, { status: msg === "Forbidden" ? 403 : 500 });
  }
}
