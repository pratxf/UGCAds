import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const total = await prisma.photoshootTemplate.count({ where: { active: true } });
const withImage = await prisma.photoshootTemplate.count({ where: { active: true, imageUrl: { not: "" } } });
const withWebp = await prisma.photoshootTemplate.count({ where: { active: true, imageUrl: { endsWith: ".webp" } } });
console.log("Total:", total, "| With image:", withImage, "| WebP:", withWebp);
await prisma.$disconnect();
