import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import BillingClient from "./BillingClient";

export default async function BillingPage() {
  const user = await requireUser();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const [subscription, invoices, usageThisMonth, recentUsage] = await Promise.all([
    prisma.subscription.findUnique({ where: { userId: user.id } }),
    prisma.transaction.findMany({
      where: { userId: user.id, type: { in: ["SUBSCRIPTION", "TOPUP"] } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.transaction.aggregate({
      where: { userId: user.id, type: "USAGE", createdAt: { gte: monthStart } },
      _sum: { credits: true },
    }),
    prisma.transaction.findMany({
      where: { userId: user.id, type: "USAGE", createdAt: { gte: sevenDaysAgo } },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  // Build daily usage for last 7 days
  const days: { key: string; label: string }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    days.push({
      key: d.toDateString(),
      label: ["S", "M", "T", "W", "T", "F", "S"][d.getDay()],
    });
  }
  const dailyMap: Record<string, number> = {};
  for (const day of days) dailyMap[day.key] = 0;
  for (const t of recentUsage) {
    const key = new Date(t.createdAt).toDateString();
    if (key in dailyMap) dailyMap[key] += Math.abs(t.credits);
  }

  const planMap: Record<string, string> = { BASIC: "basic", CREATOR: "creator", AGENCY: "agency" };

  return (
    <BillingClient
      email={user.email}
      planName={subscription?.plan ?? null}
      currentPlanId={subscription ? (planMap[subscription.plan] ?? null) : null}
      monthlyCredits={subscription?.monthlyCredits ?? 0}
      billingCycle={subscription?.billingCycle ?? "MONTHLY"}
      renewal={subscription?.currentPeriodEnd ? formatDate(subscription.currentPeriodEnd) : null}
      totalUsedThisMonth={Math.round(Math.abs(usageThisMonth._sum.credits ?? 0) / 10)}
      dailyUsage={days.map((d) => dailyMap[d.key])}
      dayLabels={days.map((d) => d.label)}
      invoices={invoices.map((t) => ({
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
    default: return type;
  }
}

function formatDate(d: Date) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}
