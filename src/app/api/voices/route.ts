import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const voices = await prisma.voice.findMany({
    where: { isActive: true },
    orderBy: [{ gender: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      gender: true,
      voiceId: true,
      previewUrl: true,
      descriptor: true,
    },
  });
  const female = voices.filter((v) => v.gender === "female");
  const male = voices.filter((v) => v.gender === "male");
  return NextResponse.json({ voices, female, male });
}
