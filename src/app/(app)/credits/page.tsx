import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CreditsClient from "./CreditsClient";

export default async function CreditsPage() {
  const user = await requireUser();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  // Rolling last-7-days window (today + 6 days back)
  const rollingStart = new Date(now);
  rollingStart.setDate(now.getDate() - 6);
  rollingStart.setHours(0, 0, 0, 0);

  const [subscription, transactions, monthUsageAgg, weeklyRaw] = await Promise.all([
    prisma.subscription.findUnique({ where: { userId: user.id } }),
    prisma.transaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    // Sum of negative (usage) transactions this month
    prisma.transaction.aggregate({
      where: { userId: user.id, type: "USAGE", createdAt: { gte: startOfMonth } },
      _sum: { credits: true },
    }),
    // Per-day usage for last 7 days (rolling window)
    Promise.all(
      Array.from({ length: 7 }, (_, i) => {
        const day = new Date(rollingStart);
        day.setDate(rollingStart.getDate() + i);
        const next = new Date(day);
        next.setDate(day.getDate() + 1);
        return prisma.transaction.aggregate({
          where: { userId: user.id, type: "USAGE", createdAt: { gte: day, lt: next } },
          _sum: { credits: true },
        });
      })
    ),
  ]);

  const planMap: Record<string, string> = { BASIC: "basic", CREATOR: "creator", AGENCY: "agency" };
  const currentPlanId = subscription ? planMap[subscription.plan] : null;
  const monthlyCredits = subscription?.monthlyCredits ?? 0;
  const renewal = subscription?.currentPeriodEnd ? formatRenewal(subscription.currentPeriodEnd) : "";

  // Month used: sum of USAGE credits (negative in DB), convert to positive display units
  const monthUsed = Math.abs(monthUsageAgg._sum.credits ?? 0);

  // Weekly bar heights as percentages (max bar = 100%)
  const weeklyValues = weeklyRaw.map((r) => Math.abs(r._sum.credits ?? 0));
  const maxVal = Math.max(...weeklyValues, 1);
  const weeklyData = weeklyValues.map((v) => Math.round((v / maxVal) * 100));

  // Day labels for rolling window
  const dayLetters = ["S", "M", "T", "W", "T", "F", "S"];
  const weeklyLabels = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(rollingStart);
    d.setDate(rollingStart.getDate() + i);
    return dayLetters[d.getDay()];
  });

  return (
    <CreditsClient
      currentPlanId={currentPlanId}
      credits={user.credits}
      monthlyCredits={monthlyCredits}
      monthUsed={monthUsed}
      weeklyData={weeklyData}
      weeklyLabels={weeklyLabels}
      renewal={renewal}
      transactions={transactions.map((t) => ({
        id: t.id,
        description: t.description || labelForType(t.type),
        date: formatDate(t.createdAt),
        credits: t.credits,
      }))}
    />
  );
}

function labelForType(type: string) {
  switch (type) {
    case "SUBSCRIPTION": return "Subscription";
    case "TOPUP": return "Credit Pack";
    case "USAGE": return "Usage";
    case "REFUND": return "Refund";
    case "RENEWAL": return "Monthly Renewal";
    default: return type;
  }
}

function formatDate(d: Date) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[d.getMonth()]} ${d.getDate()}`;
}

function formatRenewal(d: Date) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}
