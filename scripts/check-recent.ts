/* eslint-disable */
import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
(async () => {
  const recent = await p.generation.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true, type: true, status: true, errorMessage: true,
      createdAt: true, updatedAt: true,
      audioUrl: true, rawVideoUrl: true, finalVideoUrl: true, compositeImageUrl: true,
    },
  });
  for (const g of recent) {
    const ageMin = Math.round((Date.now() - g.createdAt.getTime()) / 60000);
    const updMin = Math.round((Date.now() - g.updatedAt.getTime()) / 60000);
    console.log(`${g.id} | ${g.type} | ${g.status} | created ${ageMin}m ago | updated ${updMin}m ago`);
    console.log(`  composite=${!!g.compositeImageUrl} audio=${!!g.audioUrl} rawVid=${!!g.rawVideoUrl} final=${!!g.finalVideoUrl}`);
    if (g.errorMessage) console.log(`  err: ${g.errorMessage}`);
  }
  await p.$disconnect();
})();
