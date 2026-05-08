import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const PLAN_CONFIG = {
  basic:   { plan: "BASIC"   as const, monthlyCredits: 100 },
  creator: { plan: "CREATOR" as const, monthlyCredits: 300 },
  agency:  { plan: "AGENCY"  as const, monthlyCredits: 500 },
};

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      type,
      amountPaise,
      planId,
      billingCycle,
      creditsTenths,
      creditsDisplay,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing payment fields" }, { status: 400 });
    }

    // Verify HMAC signature
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expected !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    // Idempotency: if already processed, just return success
    const existing = await prisma.transaction.findFirst({
      where: { providerTxnId: razorpay_payment_id },
    });
    if (existing) {
      return NextResponse.json({ success: true, payment_id: razorpay_payment_id });
    }

    if (type === "SUBSCRIPTION") {
      const config = PLAN_CONFIG[planId as keyof typeof PLAN_CONFIG];
      if (!config) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

      const now = new Date();
      const periodEnd = billingCycle === "yearly"
        ? new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)
        : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const planLabel = config.plan.charAt(0) + config.plan.slice(1).toLowerCase();

      await prisma.$transaction([
        prisma.subscription.upsert({
          where: { userId: user.id },
          create: {
            userId: user.id,
            plan: config.plan,
            status: "ACTIVE",
            billingCycle: billingCycle === "yearly" ? "YEARLY" : "MONTHLY",
            monthlyCredits: config.monthlyCredits,
            currentPeriodStart: now,
            currentPeriodEnd: periodEnd,
            provider: "RAZORPAY",
            providerSubId: razorpay_payment_id,
          },
          update: {
            plan: config.plan,
            status: "ACTIVE",
            billingCycle: billingCycle === "yearly" ? "YEARLY" : "MONTHLY",
            monthlyCredits: config.monthlyCredits,
            currentPeriodStart: now,
            currentPeriodEnd: periodEnd,
            provider: "RAZORPAY",
            providerSubId: razorpay_payment_id,
            cancelAtPeriodEnd: false,
          },
        }),
        prisma.user.update({
          where: { id: user.id },
          data: { credits: config.monthlyCredits },
        }),
        prisma.transaction.create({
          data: {
            userId: user.id,
            type: "SUBSCRIPTION",
            status: "COMPLETED",
            credits: config.monthlyCredits,
            amountCents: amountPaise ?? 0,
            currency: "USD",
            provider: "RAZORPAY",
            providerTxnId: razorpay_payment_id,
            description: `${planLabel} Plan (${billingCycle})`,
          },
        }),
      ]);
    } else if (type === "TOPUP") {
      const creditsToAdd = creditsTenths as number;
      await prisma.$transaction([
        prisma.user.update({
          where: { id: user.id },
          data: { credits: { increment: creditsToAdd } },
        }),
        prisma.transaction.create({
          data: {
            userId: user.id,
            type: "TOPUP",
            status: "COMPLETED",
            credits: creditsToAdd,
            amountCents: amountPaise ?? 0,
            currency: "USD",
            provider: "RAZORPAY",
            providerTxnId: razorpay_payment_id,
            description: `${creditsDisplay} Credit Pack`,
          },
        }),
      ]);
    } else {
      return NextResponse.json({ error: "Invalid transaction type" }, { status: 400 });
    }

    return NextResponse.json({ success: true, payment_id: razorpay_payment_id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Verification failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
