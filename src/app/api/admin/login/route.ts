import { NextResponse } from "next/server";
import { loginAdmin, logoutAdmin } from "@/lib/admin-auth";
import { rateLimitOrResponse } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  const blocked = await rateLimitOrResponse(`admin-login:${ip}`, { windowSec: 60, max: 5 });
  if (blocked) return blocked;

  const { password } = await req.json();
  if (typeof password !== "string") {
    return NextResponse.json({ error: "password required" }, { status: 400 });
  }
  const ok = await loginAdmin(password);
  if (!ok) return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  await logoutAdmin();
  return NextResponse.json({ ok: true });
}
