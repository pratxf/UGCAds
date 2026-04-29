import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const gender = url.searchParams.get("gender");
  const where: { isActive: boolean; gender?: string } = { isActive: true };
  if (gender === "female" || gender === "male") where.gender = gender;

  const avatars = await prisma.productAdAvatar.findMany({
    where,
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      gender: true,
      nationality: true,
      imageUrl: true,
    },
  });
  const female = avatars.filter((a) => a.gender === "female");
  const male = avatars.filter((a) => a.gender === "male");
  return NextResponse.json({ avatars, female, male });
}
