import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const gender = url.searchParams.get("gender");
  const where: { isActive: boolean; gender?: string } = { isActive: true };
  if (gender === "female" || gender === "male") where.gender = gender;

  const models = await prisma.tryonModel.findMany({
    where,
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      gender: true,
      bodyType: true,
      ethnicity: true,
      imageUrl: true,
    },
  });
  const female = models.filter((m) => m.gender === "female");
  const male = models.filter((m) => m.gender === "male");
  return NextResponse.json({ models, female, male });
}
