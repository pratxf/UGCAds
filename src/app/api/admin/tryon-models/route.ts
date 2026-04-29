import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET() {
  try {
    await requireAdmin();
    const models = await prisma.tryonModel.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
    return NextResponse.json({ models });
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const name = String(body.name || "").trim();
    const gender = String(body.gender || "").trim();
    const bodyType = String(body.bodyType || "").trim();
    const ethnicity = String(body.ethnicity || "").trim();
    if (!name || !gender || !bodyType) {
      return NextResponse.json({ error: "name, gender, bodyType required" }, { status: 400 });
    }
    const model = await prisma.tryonModel.create({
      data: { name, gender, bodyType, ethnicity, imageUrl: "" },
    });
    return NextResponse.json({ model });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: msg }, { status: msg === "Forbidden" ? 403 : 500 });
  }
}
