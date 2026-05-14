"use client";

import { useState } from "react";
import Script from "next/script";
import { Check, Zap, Sparkles, Users, Rocket } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";
import { STARTER_PLAN, SUBSCRIPTION_PLANS } from "@/lib/pricing";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: new (options: Record<string, unknown>) => { open(): void };
  }
}

const planMeta = {
  starter: { icon: Rocket,   color: "#06B6D4", bg: "rgba(6,182,212,0.1)",  border: "#06B6D4" },
  basic:   { icon: Zap,      color: "#10B981", bg: "rgba(16,185,129,0.1)", border: "#E5E7EB" },
  creator: { icon: Sparkles, color: "#2563EB", bg: "rgba(37,99,235,0.1)",  border: "#2563EB" },
  agency:  { icon: Users,    color: "#F59E0B", bg: "rgba(245,158,11,0.1)", border: "#E5E7EB" },
} as const;

export function OnboardingModal() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("yearly");
  const [checkingOut, setCheckingOut] = useState<string | null>(null);

  async function handleCheckout(
    amountCents: number,
    description: string,
    key: string,
    meta: Record<string, unknown>
  ) {
    if (checkingOut) return;
    if (!window.Razorpay) {
      alert("Payment script not loaded yet. Please wait a moment and try again.");
      return;
    }
    setCheckingOut(key);
    try {
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amountCents, currency: "USD" }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "Failed to create order");
      }
      const { order_id, amount } = await res.json();
      const rzp = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount,
        currency: "USD",
        name: "ugcads",
        description,
        order_id,
        handler: async (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
          const verify = await fetch("/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...response, amountPaise: amountCents, ...meta }),
          });
          if (verify.ok) {
            window.location.reload();
          } else {
            const { error } = await verify.json().catch(() => ({ error: null }));
            alert(error ?? "Payment verification failed. Please contact support.");
            setCheckingOut(null);
          }
        },
        modal: { ondismiss: () => setCheckingOut(null) },
        theme: { color: "#2563EB" },
      });
      rzp.open();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setCheckingOut(null);
    }
  }

  const starterMeta = planMeta.starter;

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />

      <div className="fixed inset-0 z-[200] bg-[#F7F9FC] overflow-y-auto">
        <div className="absolute top-4 right-4">
          <form action="/auth/signout" method="POST">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-white px-4 py-2 text-xs font-medium text-[#6B7280] hover:text-[#111111] hover:border-[#D1D5DB] transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
        <div className="min-h-full flex flex-col items-center px-4 py-10">

          {/* Logo */}
          <div className="mb-8">
            <Logo />
          </div>

          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#111111] tracking-tight">Choose your plan</h1>
            <p className="mt-2 text-[15px] text-[#6B7280]">Start free or go straight to monthly — cancel anytime</p>
          </div>

          {/* Billing toggle */}
          <div className="mb-8">
            <div className="inline-flex items-center rounded-full p-1 gap-1"
              style={{ background: "#fff", border: "1px solid #E5E7EB", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <button
                onClick={() => setBilling("monthly")}
                className={cn(
                  "rounded-full px-6 py-2 text-[13px] font-semibold transition-all",
                  billing === "monthly" ? "bg-[#2563EB] text-white shadow-sm" : "text-[#6B7280] hover:text-[#374151]"
                )}
              >
                Monthly
              </button>
              <button
                onClick={() => setBilling("yearly")}
                className={cn(
                  "rounded-full px-6 py-2 text-[13px] font-semibold transition-all flex items-center gap-2",
                  billing === "yearly" ? "bg-[#2563EB] text-white shadow-sm" : "text-[#6B7280] hover:text-[#374151]"
                )}
              >
                Yearly
                <span className="rounded-full px-2 py-0.5 text-[11px] font-bold"
                  style={billing === "yearly"
                    ? { background: "rgba(255,255,255,0.25)", color: "#fff" }
                    : { background: "#FEF3C7", color: "#92400E" }}>
                  20% off
                </span>
              </button>
            </div>
          </div>

          {/* 4 Plan cards */}
          <div className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* Starter */}
            <div className="relative rounded-2xl bg-white flex flex-col overflow-hidden"
              style={{ border: `2px solid ${starterMeta.border}`, boxShadow: "0 2px 12px rgba(6,182,212,0.10)" }}>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: starterMeta.bg }}>
                    <starterMeta.icon className="h-4 w-4" style={{ color: starterMeta.color }} />
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-[#111111]">{STARTER_PLAN.name}</p>
                    <p className="text-[11px] text-[#9CA3AF]">One-time purchase</p>
                  </div>
                </div>

                <div className="mb-1">
                  <span className="text-[36px] font-bold text-[#111111] leading-none">${STARTER_PLAN.priceUsd}</span>
                  <span className="text-[13px] text-[#9CA3AF] ml-1">one-time</span>
                </div>
                <p className="text-[12px] text-[#6B7280] mb-4">No commitment, try it out</p>

                <div className="h-px bg-[#F3F4F6] mb-4" />

                <ul className="space-y-2 flex-1 mb-5">
                  {STARTER_PLAN.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-[12px] text-[#374151]">
                      <Check className="h-3.5 w-3.5 shrink-0" style={{ color: starterMeta.color }} />
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  disabled={!!checkingOut}
                  onClick={() => handleCheckout(STARTER_PLAN.amountCents, "Starter Pack (one-time)", "starter", { type: "STARTER" })}
                  className="w-full h-10 rounded-xl text-[13px] font-bold text-white transition hover:brightness-110 disabled:opacity-60"
                  style={{ background: starterMeta.color }}
                >
                  {checkingOut === "starter" ? "Processing..." : "Get Started — $5"}
                </button>
              </div>
            </div>

            {/* Subscription plans */}
            {SUBSCRIPTION_PLANS.map((p) => {
              const price = billing === "monthly" ? p.monthlyPriceUsd : p.yearlyMonthlyPriceUsd;
              const amountCents = billing === "monthly" ? p.monthlyAmountCents : p.yearlyAmountCents;
              const meta = planMeta[p.id as keyof typeof planMeta];
              const Icon = meta.icon;

              return (
                <div key={p.id}
                  className="relative rounded-2xl bg-white flex flex-col overflow-hidden"
                  style={p.highlighted
                    ? { border: `2px solid ${meta.border}`, boxShadow: "0 4px 24px rgba(37,99,235,0.13)" }
                    : { border: "1.5px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>

                  {p.highlighted && (
                    <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: meta.color }} />
                  )}

                  {p.highlighted && (
                    <div className="absolute top-3 right-3">
                      <span className="rounded-full px-2.5 py-1 text-[10px] font-bold text-white"
                        style={{ background: meta.color }}>
                        Popular
                      </span>
                    </div>
                  )}

                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center gap-2.5 mb-4">
                      <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: meta.bg }}>
                        <Icon className="h-4 w-4" style={{ color: meta.color }} />
                      </div>
                      <div>
                        <p className="text-[14px] font-bold text-[#111111]">{p.name}</p>
                        <p className="text-[11px] text-[#9CA3AF] leading-snug">{p.description}</p>
                      </div>
                    </div>

                    <div className="mb-1">
                      <span className="text-[36px] font-bold text-[#111111] leading-none">${price}</span>
                      <span className="text-[13px] text-[#9CA3AF] ml-1">/mo</span>
                    </div>
                    <p className="text-[12px] text-[#6B7280] mb-4">
                      {billing === "yearly" ? "Billed annually" : "Billed monthly"}
                    </p>

                    <div className="h-px bg-[#F3F4F6] mb-4" />

                    <ul className="space-y-2 flex-1 mb-5">
                      {p.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-[12px] text-[#374151]">
                          <Check className="h-3.5 w-3.5 shrink-0" style={{ color: meta.color }} />
                          {f}
                        </li>
                      ))}
                    </ul>

                    <button
                      disabled={!!checkingOut}
                      onClick={() => handleCheckout(amountCents, `${p.name} Plan (${billing})`, `plan-${p.id}`, { type: "SUBSCRIPTION", planId: p.id, billingCycle: billing })}
                      className={cn(
                        "w-full h-10 rounded-xl text-[13px] font-bold transition hover:brightness-110 disabled:opacity-60",
                        p.highlighted ? "text-white" : "text-white"
                      )}
                      style={{ background: meta.color }}
                    >
                      {checkingOut === `plan-${p.id}` ? "Processing..." : `Get ${p.name}`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer note */}
          <p className="mt-8 text-[12px] text-[#9CA3AF] text-center">
            All plans include full commercial rights. No watermarks. Cancel anytime.
          </p>

        </div>
      </div>
    </>
  );
}
