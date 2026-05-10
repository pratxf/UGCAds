"use client";

import { useState } from "react";
import Script from "next/script";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faXmark,
  faCrown,
  faUser,
  faStar,
  faBriefcase,
} from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";
import { SUBSCRIPTION_PLANS } from "@/lib/pricing";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: new (options: Record<string, unknown>) => { open(): void };
  }
}

const planIcons = { basic: faUser, creator: faStar, agency: faBriefcase } as const;

interface Props {
  open: boolean;
  onClose: () => void;
  currentPlanId: string | null;
}

export function ChangePlanModal({ open, onClose, currentPlanId }: Props) {
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
            onClose();
            window.location.reload();
          } else {
            const { error } = await verify.json().catch(() => ({ error: null }));
            alert(error ?? "Payment verification failed. Please contact support.");
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

  function getPlanAction(planId: string) {
    if (!currentPlanId) return "upgrade";
    const order = ["starter", "basic", "creator", "agency"];
    const ci = order.indexOf(currentPlanId);
    const ti = order.indexOf(planId);
    if (ti === ci) return "current";
    return ti > ci ? "upgrade" : "downgrade";
  }

  if (!open) return null;

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      <div className="fixed inset-0 z-50 flex items-center justify-center lg:pl-[252px]">
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
        <div className="relative w-full max-w-5xl mx-4 max-h-[92vh] overflow-y-auto rounded-3xl bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-7 pt-7 pb-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
                style={{ background: "rgba(37,99,235,0.10)" }}>
                <FontAwesomeIcon icon={faCrown} style={{ fontSize: 18, color: "#2563EB" }} />
              </div>
              <div>
                <h2 className="text-[20px] font-bold text-[#111111]">Change Plan</h2>
                <p className="text-[13px] text-[#6B7280]">Choose the plan that&apos;s right for you.</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E5E7EB] text-[#6B7280] hover:text-[#111111] hover:bg-[#F3F4F6] transition"
            >
              <FontAwesomeIcon icon={faXmark} style={{ fontSize: 14 }} />
            </button>
          </div>

          <div className="px-7 pb-7">
            {/* Billing toggle */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center rounded-full p-1 gap-1"
                style={{ background: "#F3F4F6", border: "1px solid #E5E7EB" }}>
                <button
                  onClick={() => setBilling("monthly")}
                  className={cn(
                    "rounded-full px-5 py-2 text-[13px] font-semibold transition-all",
                    billing === "monthly" ? "bg-white text-[#2563EB] shadow-sm" : "text-[#6B7280] hover:text-[#374151]"
                  )}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBilling("yearly")}
                  className={cn(
                    "rounded-full px-5 py-2 text-[13px] font-semibold transition-all flex items-center gap-2",
                    billing === "yearly" ? "bg-white text-[#374151] shadow-sm" : "text-[#6B7280] hover:text-[#374151]"
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
                const action = getPlanAction(p.id);
                const isCurrent = action === "current";
                const price = billing === "monthly" ? `$${p.monthlyPriceUsd}` : `$${p.yearlyMonthlyPriceUsd}`;
                const amountCents = billing === "monthly" ? p.monthlyAmountCents : p.yearlyAmountCents;
                const PlanIcon = planIcons[p.id as keyof typeof planIcons];
                const iconStyles = {
                  basic:   { iconBg: "rgba(16,185,129,0.12)",  iconColor: "#10B981", checkColor: "#10B981" },
                  creator: { iconBg: "rgba(37,99,235,0.12)",   iconColor: "#2563EB", checkColor: "#2563EB" },
                  agency:  { iconBg: "rgba(245,158,11,0.12)",  iconColor: "#F59E0B", checkColor: "#F59E0B" },
                }[p.id] ?? { iconBg: "rgba(37,99,235,0.12)", iconColor: "#2563EB", checkColor: "#2563EB" };

                return (
                  <div
                    key={p.id}
                    className="relative rounded-2xl flex flex-col transition-all"
                    style={isCurrent
                      ? { border: "2px solid #2563EB", background: "#FFFFFF", boxShadow: "0 4px 20px rgba(37,99,235,0.10)" }
                      : { border: "1px solid #E5E7EB", background: "#FFFFFF" }}
                  >
                    {p.highlighted && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                        <span className="rounded-full px-3 py-1 text-[11px] font-bold text-white"
                          style={{ background: "#2563EB" }}>Popular</span>
                      </div>
                    )}
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                          style={{ background: iconStyles.iconBg }}>
                          <FontAwesomeIcon icon={PlanIcon} style={{ fontSize: 16, color: iconStyles.iconColor }} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-[16px] font-bold text-[#111111]">{p.name}</p>
                            {isCurrent && (
                              <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                                style={{ background: "rgba(37,99,235,0.1)", color: "#2563EB" }}>
                                Current
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#6B7280] mt-0.5 leading-snug">{p.description}</p>
                        </div>
                      </div>

                      <div className="flex items-end gap-1 mb-1">
                        <span className="text-[38px] font-bold text-[#111111] leading-none">{price}</span>
                        <span className="text-[13px] text-[#9CA3AF] mb-1">/mo</span>
                      </div>
                      {billing === "yearly" && (
                        <p className="text-[11px] mb-3" style={{ color: "#2563EB" }}>Billed annually</p>
                      )}

                      <div className="my-4 h-px" style={{ background: "#F3F4F6" }} />

                      <ul className="space-y-2.5 flex-1 mb-5">
                        {p.features.map((f) => (
                          <li key={f} className="flex items-center gap-2.5 text-[12px] text-[#374151]">
                            <FontAwesomeIcon icon={faCheck}
                              style={{ fontSize: 11, color: iconStyles.checkColor, flexShrink: 0 }} />
                            {f}
                          </li>
                        ))}
                      </ul>

                      {isCurrent ? (
                        <button
                          className="w-full h-11 rounded-2xl text-[13px] font-bold text-white"
                          style={{ background: "#2563EB" }}
                        >
                          Current Plan
                        </button>
                      ) : action === "upgrade" ? (
                        <button
                          disabled={!!checkingOut}
                          onClick={() => handleCheckout(amountCents, `${p.name} Plan (${billing})`, `plan-${p.id}`, { type: "SUBSCRIPTION", planId: p.id, billingCycle: billing })}
                          className="w-full h-11 rounded-2xl text-[13px] font-bold text-white transition hover:brightness-110 disabled:opacity-60"
                          style={{ background: "#2563EB" }}
                        >
                          {checkingOut === `plan-${p.id}` ? "Processing..." : `Upgrade to ${p.name}`}
                        </button>
                      ) : (
                        <button
                          disabled={!!checkingOut}
                          onClick={() => handleCheckout(amountCents, `${p.name} Plan (${billing})`, `plan-${p.id}`, { type: "SUBSCRIPTION", planId: p.id, billingCycle: billing })}
                          className="w-full h-11 rounded-2xl text-[13px] font-bold text-[#374151] border border-[#E5E7EB] transition hover:bg-[#F3F4F6] disabled:opacity-60"
                        >
                          {checkingOut === `plan-${p.id}` ? "Processing..." : "Downgrade"}
                        </button>
                      )}
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
