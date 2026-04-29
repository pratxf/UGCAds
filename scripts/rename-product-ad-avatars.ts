/* eslint-disable */
// Renames the 20 women + 20 men in ProductAdAvatar from "Avatar W/M N"
// to friendly first names, in sortOrder order.
//
// Run: npx tsx scripts/rename-product-ad-avatars.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const FEMALE_NAMES = [
  "Madison", "Brianna", "Hailey", "Nia", "Lily",
  "Camila", "Aubrey", "Zoe", "Aaliyah", "Charlotte",
  "Olivia", "Priya", "Maya", "Freya", "Amelia",
  "Anika", "Imani", "Jade", "Hannah", "Sienna",
];

const MALE_NAMES = [
  "Jake", "Marcus", "Diego", "Tyler", "Ethan",
  "Kai", "Andre", "Mateo", "Cole", "Jamal",
  "Oliver", "Harry", "Arjun", "Liam", "Aiden",
  "Rohan", "Theo", "Reuben", "Finn", "Noah",
];

async function main() {
  const women = await prisma.productAdAvatar.findMany({
    where: { gender: "female" },
    orderBy: { sortOrder: "asc" },
  });
  for (let i = 0; i < women.length; i++) {
    const name = FEMALE_NAMES[i] ?? women[i].name;
    await prisma.productAdAvatar.update({
      where: { id: women[i].id },
      data: { name },
    });
    console.log(`  W ${i + 1}: ${women[i].name} → ${name}`);
  }

  const men = await prisma.productAdAvatar.findMany({
    where: { gender: "male" },
    orderBy: { sortOrder: "asc" },
  });
  for (let i = 0; i < men.length; i++) {
    const name = MALE_NAMES[i] ?? men[i].name;
    await prisma.productAdAvatar.update({
      where: { id: men[i].id },
      data: { name },
    });
    console.log(`  M ${i + 1}: ${men[i].name} → ${name}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
