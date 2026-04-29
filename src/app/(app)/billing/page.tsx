import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import BillingClient from "./BillingClient";

export default async function BillingPage() {
  const user = await requireUser();

  const [subscription, transactions, paymentMethods] = await Promise.all([
    prisma.subscription.findUnique({ where: { userId: user.id } }),
    prisma.transaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    Promise.resolve([] as { id: string; brand: string; last4: string; exp: string }[]),
  ]);

  return (
    <BillingClient
      email={user.email}
      planName={subscription?.plan ?? null}
      monthlyCredits={subscription?.monthlyCredits ?? 0}
      renewal={subscription?.currentPeriodEnd ? formatDate(subscription.currentPeriodEnd) : null}
      paymentMethods={paymentMethods}
      invoices={transactions.map((t) => ({
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
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}
