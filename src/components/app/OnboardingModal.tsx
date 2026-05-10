"use client";

import { useState } from "react";
import Script from "next/script";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faRocket,
  faUser,
  faStar,
  faBriefcase,
  faBolt,
} from "@fortawesome/free-solid-svg-icons";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";
import { STARTER_PLAN, SUBSCRIPTION_PLANS } from "@/lib/pricing";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: new (options: Record<string, unknown>) => { open(): void };
  }
}

const planIcons = { basic: faUser, creator: faStar, agency: faBriefcase } as const;


export function OnboardingModal() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
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

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      <div className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto py-8"
        style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
        <div className="relative w-full max-w-4xl mx-4 rounded-3xl bg-white shadow-2xl overflow-hidden">

          {/* Header */}
          <div className="px-8 pt-8 pb-6 text-center border-b border-[#F3F4F6]">
            <div className="flex justify-center mb-4">
              <Logo />
            </div>
            <h1 className="text-[22px] font-bold text-[#111111]">Choose a plan to get started</h1>
            <p className="mt-1.5 text-[14px] text-[#6B7280]">
              Pick any plan to unlock AI-powered ad generation
            </p>
          </div>

          <div className="px-8 py-6">
            {/* Starter pack */}
            <div className="mb-5 rounded-2xl p-5 flex items-center gap-5"
              style={{ background: "linear-gradient(135deg, rgba(6,182,212,0.06) 0%, rgba(37,99,235,0.06) 100%)", border: "2px solid #06B6D4" }}>
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl"
                style={{ background: "rgba(6,182,212,0.12)" }}>
                <FontAwesomeIcon icon={faRocket} style={{ fontSize: 22, color: "#06B6D4" }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[17px] font-bold text-[#111111]">{STARTER_PLAN.name}</span>
                  <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                    style={{ background: "rgba(6,182,212,0.12)", color: "#0891B2" }}>
                    One-time
                  </span>
                </div>
                <p className="text-[13px] text-[#6B7280] mb-2">Try it out — no commitment</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  {STARTER_PLAN.features.map((f) => (
                    <span key={f} className="flex items-center gap-1.5 text-[12px] text-[#374151]">
                      <FontAwesomeIcon icon={faCheck} style={{ fontSize: 10, color: "#06B6D4" }} />
                      {f}
                    </span>
                  ))}
                </div>
              </div>
              <div className="shrink-0 text-right flex flex-col items-end gap-2">
                <div>
                  <span className="text-[36px] font-bold text-[#111111] leading-none">${STARTER_PLAN.priceUsd}</span>
                  <span className="text-[13px] text-[#9CA3AF] ml-1">one-time</span>
                </div>
                <button
                  disabled={!!checkingOut}
                  onClick={() => handleCheckout(STARTER_PLAN.amountCents, "Starter Pack (one-time)", "starter", { type: "STARTER" })}
                  className="rounded-2xl px-6 py-2.5 text-[13px] font-bold text-white transition hover:brightness-110 disabled:opacity-60 flex items-center gap-2"
                  style={{ background: "#06B6D4" }}
                >
                  <FontAwesomeIcon icon={faBolt} style={{ fontSize: 11 }} />
                  {checkingOut === "starter" ? "Processing..." : `Get Started — $${STARTER_PLAN.priceUsd}`}
                </button>
              </div>
            </div>

            {/* Billing toggle */}
            <div className="flex justify-center mb-4">
              <div className="inline-flex items-center rounded-full p-1 gap-1"
                style={{ background: "#F3F4F6", border: "1px solid #E5E7EB" }}>
                <button
                  onClick={() => setBilling("monthly")}
                  className={cn(
                    "rounded-full px-5 py-1.5 text-[12px] font-semibold transition-all",
                    billing === "monthly" ? "bg-[#2563EB] text-white shadow-sm" : "text-[#6B7280] hover:text-[#374151]"
                  )}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBilling("yearly")}
                  className={cn(
                    "rounded-full px-5 py-1.5 text-[12px] font-semibold transition-all flex items-center gap-2",
                    billing === "yearly" ? "bg-[#2563EB] text-white shadow-sm" : "text-[#6B7280] hover:text-[#374151]"
                  )}
                >
                  Yearly
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                    style={{ background: "rgba(245,158,11,0.15)", color: "#D97706" }}>
                    20% OFF
                  </span>
                </button>
              </div>
            </div>

            {/* Plan cards */}
            <div className="grid gap-4 sm:grid-cols-3">
              {SUBSCRIPTION_PLANS.map((p) => {
                const price = billing === "monthly" ? `$${p.monthlyPriceUsd}` : `$${p.yearlyMonthlyPriceUsd}`;
                const amountCents = billing === "monthly" ? p.monthlyAmountCents : p.yearlyAmountCents;
                const PlanIcon = planIcons[p.id as keyof typeof planIcons];
                const iconStyles = {
                  basic:   { iconBg: "rgba(16,185,129,0.12)",  iconColor: "#10B981", checkColor: "#10B981" },
                  creator: { iconBg: "rgba(37,99,235,0.12)",   iconColor: "#2563EB", checkColor: "#2563EB" },
                  agency:  { iconBg: "rgba(245,158,11,0.12)",  iconColor: "#F59E0B", checkColor: "#F59E0B" },
                }[p.id] ?? { iconBg: "rgba(37,99,235,0.12)", iconColor: "#2563EB", checkColor: "#2563EB" };

                return (
                  <div key={p.id}
                    className="relative rounded-2xl flex flex-col"
                    style={p.highlighted
                      ? { border: "2px solid #2563EB", background: "#FFFFFF", boxShadow: "0 4px 20px rgba(37,99,235,0.10)" }
                      : { border: "1px solid #E5E7EB", background: "#FFFFFF" }}>
                    {p.highlighted && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                        <span className="rounded-full px-3 py-1 text-[11px] font-bold text-white"
                          style={{ background: "#2563EB" }}>Popular</span>
                      </div>
                    )}
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                          style={{ background: iconStyles.iconBg }}>
                          <FontAwesomeIcon icon={PlanIcon} style={{ fontSize: 15, color: iconStyles.iconColor }} />
                        </div>
                        <div>
                          <p className="text-[15px] font-bold text-[#111111]">{p.name}</p>
                          <p className="text-[11px] text-[#6B7280] leading-snug">{p.description}</p>
                        </div>
                      </div>

                      <div className="flex items-end gap-1 mb-1">
                        <span className="text-[32px] font-bold text-[#111111] leading-none">{price}</span>
                        <span className="text-[12px] text-[#9CA3AF] mb-0.5">/mo</span>
                      </div>
                      {billing === "yearly" && (
                        <p className="text-[11px] mb-2" style={{ color: "#2563EB" }}>Billed annually</p>
                      )}

                      <div className="my-3 h-px" style={{ background: "#F3F4F6" }} />

                      <ul className="space-y-2 flex-1 mb-4">
                        {p.features.map((f) => (
                          <li key={f} className="flex items-center gap-2 text-[12px] text-[#374151]">
                            <FontAwesomeIcon icon={faCheck} style={{ fontSize: 10, color: iconStyles.checkColor, flexShrink: 0 }} />
                            {f}
                          </li>
                        ))}
                      </ul>

                      <button
                        disabled={!!checkingOut}
                        onClick={() => handleCheckout(amountCents, `${p.name} Plan (${billing})`, `plan-${p.id}`, { type: "SUBSCRIPTION", planId: p.id, billingCycle: billing })}
                        className="w-full h-10 rounded-2xl text-[13px] font-bold text-white transition hover:brightness-110 disabled:opacity-60"
                        style={{ background: "#2563EB" }}
                      >
                        {checkingOut === `plan-${p.id}` ? "Processing..." : `Get ${p.name}`}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
