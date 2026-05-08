import { prisma } from "@/lib/prisma";

async function main() {
  console.log("Migrating credits from tenths to display units...");

  // Update user credits
  const users = await prisma.user.findMany({ select: { id: true, credits: true } });
  for (const user of users) {
    await prisma.user.update({ where: { id: user.id }, data: { credits: Math.round(user.credits / 10) } });
  }
  console.log(`Updated ${users.length} users`);

  // Update transactions
  const txns = await prisma.transaction.findMany({ select: { id: true, credits: true } });
  for (const t of txns) {
    await prisma.transaction.update({ where: { id: t.id }, data: { credits: Math.round(t.credits / 10) } });
  }
  console.log(`Updated ${txns.length} transactions`);

  // Update generations
  const gens = await prisma.generation.findMany({ select: { id: true, creditsUsed: true, creditCost: true } });
  for (const g of gens) {
    await prisma.generation.update({ where: { id: g.id }, data: { creditsUsed: Math.round(g.creditsUsed / 10), creditCost: Math.round(g.creditCost / 10) } });
  }
  console.log(`Updated ${gens.length} generations`);

  // Update subscription monthlyCredits (if stored as tenths)
  const subs = await prisma.subscription.findMany({ select: { id: true, monthlyCredits: true } });
  for (const s of subs) {
    if (s.monthlyCredits > 1000) { // likely stored as tenths
      await prisma.subscription.update({ where: { id: s.id }, data: { monthlyCredits: Math.round(s.monthlyCredits / 10) } });
    }
  }
  console.log(`Updated ${subs.length} subscriptions`);

  console.log("Migration complete!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
