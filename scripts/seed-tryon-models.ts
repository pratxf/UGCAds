/* eslint-disable */
// Run: npx tsx scripts/seed-tryon-models.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const FEMALE = [
  { name: "Sofia", bodyType: "slim", ethnicity: "latina" },
  { name: "Zoe", bodyType: "athletic", ethnicity: "white" },
  { name: "Aisha", bodyType: "curvy", ethnicity: "black" },
  { name: "Mei", bodyType: "slim", ethnicity: "asian" },
  { name: "Priya", bodyType: "athletic", ethnicity: "south-asian" },
  { name: "Emma", bodyType: "average", ethnicity: "white" },
  { name: "Layla", bodyType: "curvy", ethnicity: "middle-eastern" },
  { name: "Aria", bodyType: "slim", ethnicity: "asian" },
  { name: "Maya", bodyType: "plus", ethnicity: "black" },
  { name: "Luna", bodyType: "average", ethnicity: "latina" },
];

const MALE = [
  { name: "Marcus", bodyType: "athletic", ethnicity: "black" },
  { name: "Liam", bodyType: "slim", ethnicity: "white" },
  { name: "Diego", bodyType: "average", ethnicity: "latino" },
  { name: "Kai", bodyType: "slim", ethnicity: "asian" },
  { name: "Jordan", bodyType: "muscular", ethnicity: "black" },
  { name: "Ethan", bodyType: "athletic", ethnicity: "white" },
  { name: "Aryan", bodyType: "average", ethnicity: "south-asian" },
  { name: "Omar", bodyType: "average", ethnicity: "middle-eastern" },
  { name: "Noah", bodyType: "athletic", ethnicity: "white" },
  { name: "Chen", bodyType: "slim", ethnicity: "asian" },
];

async function main() {
  let i = 0;
  for (const m of FEMALE) {
    const exists = await prisma.tryonModel.findFirst({ where: { name: m.name, gender: "female" } });
    if (!exists) {
      await prisma.tryonModel.create({
        data: { ...m, gender: "female", imageUrl: "", sortOrder: i },
      });
    }
    i++;
  }
  i = 0;
  for (const m of MALE) {
    const exists = await prisma.tryonModel.findFirst({ where: { name: m.name, gender: "male" } });
    if (!exists) {
      await prisma.tryonModel.create({
        data: { ...m, gender: "male", imageUrl: "", sortOrder: i },
      });
    }
    i++;
  }
  const counts = await prisma.tryonModel.groupBy({ by: ["gender"], _count: true });
  console.log("Final counts:", counts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
