/* eslint-disable */
import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
(async () => {
  const gens = await p.generation.findMany({
    where: { status: { notIn: ["COMPLETED", "FAILED"] } },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true, type: true, status: true, errorMessage: true, createdAt: true,
      voiceId: true, characterImage: true, audioUrl: true, rawVideoUrl: true,
    },
  });
  console.log(`Pending: ${gens.length}`);
  for (const g of gens) {
    const ageMin = Math.round((Date.now() - g.createdAt.getTime()) / 60000);
    console.log(`  ${g.id} | ${g.type} | ${g.status} | ${ageMin}m old`);
    console.log(`    voiceId=${g.voiceId} characterImage=${g.characterImage ? "✓" : "✗"} audio=${g.audioUrl ? "✓" : "✗"} video=${g.rawVideoUrl ? "✓" : "✗"}`);
    if (g.errorMessage) console.log(`    error: ${g.errorMessage}`);
  }
  await p.$disconnect();
})();
