/* eslint-disable */
import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();

(async () => {
  const stuck = await p.generation.findMany({
    where: {
      status: { notIn: ["COMPLETED", "FAILED"] },
      createdAt: { lt: new Date(Date.now() - 30 * 60 * 1000) }, // older than 30 min
    },
  });
  console.log(`Found ${stuck.length} stuck generations >30 min old`);

  for (const g of stuck) {
    const refund = g.creditCost ?? g.creditsUsed ?? 0;
    await p.$transaction([
      p.generation.update({
        where: { id: g.id },
        data: { status: "FAILED", errorMessage: "Stuck in pending — auto-refunded" },
      }),
      p.user.update({
        where: { id: g.userId },
        data: { credits: { increment: refund } },
      }),
      p.transaction.create({
        data: {
          userId: g.userId,
          type: "REFUND",
          status: "COMPLETED",
          credits: refund,
          description: `Refund for stuck generation ${g.id}`,
        },
      }),
    ]);
    console.log(`  ✓ ${g.id} (${g.type}) refunded ${refund} units`);
  }

  await p.$disconnect();
})();
