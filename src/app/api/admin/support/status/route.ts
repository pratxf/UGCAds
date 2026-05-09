import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET() {
  const setting = await prisma.appSetting.findUnique({ where: { key: "support_online" } });
  const online = (setting?.value as { online: boolean } | null)?.online ?? false;
  return NextResponse.json({ online });
}

export async function PATCH(req: Request) {
  try {
    await requireAdmin();
    const { online } = await req.json();

    await prisma.appSetting.upsert({
      where: { key: "support_online" },
      update: { value: { online: Boolean(online) } },
      create: { key: "support_online", value: { online: Boolean(online) } },
    });

    return NextResponse.json({ ok: true, online: Boolean(online) });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: msg }, { status: msg === "Forbidden" ? 403 : 500 });
  }
}
