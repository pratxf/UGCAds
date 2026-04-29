import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CreditsClient from "./CreditsClient";

export default async function CreditsPage() {
  const user = await requireUser();

  const [subscription, transactions] = await Promise.all([
    prisma.subscription.findUnique({ where: { userId: user.id } }),
    prisma.transaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  const planMap: Record<string, string> = { BASIC: "basic", CREATOR: "creator", AGENCY: "agency" };
  const currentPlanId = subscription ? planMap[subscription.plan] : null;
  const monthlyCredits = subscription?.monthlyCredits ?? 0;
  const renewal = subscription?.currentPeriodEnd
    ? formatRenewal(subscription.currentPeriodEnd)
    : "";

  return (
    <CreditsClient
      currentPlanId={currentPlanId}
      credits={user.credits}
      monthlyCredits={monthlyCredits}
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
