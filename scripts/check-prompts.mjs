import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const total = await prisma.photoshootTemplate.count({ where: { active: true } });
const withPrompt = await prisma.photoshootTemplate.count({ where: { active: true, prompt: { not: "" } } });
const withPlaceholder = await prisma.photoshootTemplate.count({ where: { active: true, prompt: { contains: "[product]" } } });
const sample = await prisma.photoshootTemplate.findFirst({ where: { active: true }, select: { name: true, prompt: true } });
console.log("Total:", total, "| With prompt:", withPrompt, "| Has [product]:", withPlaceholder);
console.log("Sample prompt:", sample?.name, "->", sample?.prompt?.slice(0, 120));
await prisma.$disconnect();
