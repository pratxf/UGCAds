/* eslint-disable */
import { PrismaClient } from "@prisma/client";
import { inngest } from "@/lib/inngest";

const p = new PrismaClient();
(async () => {
  const stuck = await p.generation.findMany({
    where: { status: "PENDING" },
  });
  console.log(`Re-firing ${stuck.length} stuck generation(s)…`);
  for (const g of stuck) {
    await inngest.send({ name: "video.generate", data: { generationId: g.id } });
    console.log(`  ✓ ${g.id} (${g.type})`);
  }
  await p.$disconnect();
})();
