"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Script from "next/script";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: new (options: Record<string, unknown>) => { open(): void };
  }
}
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBolt,
  faCreditCard,
  faCalendarCheck,
  faArrowTrendUp,
  faCheck,
  faXmark,
  faChevronRight,
  faChevronDown,
  faPlus,
  faRotateRight,
  faInfoCircle,
  faCrown,
  faShieldHalved,
  faUser,
  faStar,
  faBriefcase,
} from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const plans = [
  {
    id: "basic",
    name: "Basic",
    description: "For individuals getting started with AI ads",
    monthlyPrice: "$39",
    yearlyPrice: "$31",
    monthlyAmountCents: 3900,
    yearlyAmountCents: 37400,
    credits: 100,
    features: ["100 credits/month", "5 video generations", "Standard speed rendering", "Basic templates", "Email support", "Watermark on videos"],
    cta: "Get Started",
    iconBg: "rgba(16,185,129,0.12)",
    iconColor: "#10B981",
    checkColor: "#10B981",
  },
  {
    id: "creator",
    name: "Creator",
    description: "For creators and small businesses scaling ads",
    monthlyPrice: "$79",
    yearlyPrice: "$63",
    monthlyAmountCents: 7900,
    yearlyAmountCents: 75800,
    credits: 300,
    popular: true,
    features: ["300 credits/month", "15 video generations", "Faster rendering", "Premium templates", "No watermark", "Priority email support"],
    cta: "Start Creating",
    iconBg: "rgba(37,99,235,0.12)",
    iconColor: "#2563EB",
    checkColor: "#2563EB",
  },
  {
    id: "agency",
    name: "Agency",
    description: "For agencies and teams producing ads at scale",
    monthlyPrice: "$129",
    yearlyPrice: "$103",
    monthlyAmountCents: 12900,
    yearlyAmountCents: 123800,
    credits: 500,
    features: ["500 credits/month", "25 video generations", "Priority rendering", "All templates", "No watermark", "API access (coming soon)", "Team seats (3 users)", "Priority+ support"],
    cta: "Go Pro",
    iconBg: "rgba(245,158,11,0.12)",
    iconColor: "#F59E0B",
    checkColor: "#F59E0B",
  },
];

const planIcons = { basic: faUser, creator: faStar, agency: faBriefcase } as const;

const creditPacks = [
  { credits: 50, price: "$30", perCredit: "$0.60", popular: false, amountCents: 3000 },
  { credits: 100, price: "$55", perCredit: "$0.55", popular: false, amountCents: 5500 },
  { credits: 250, price: "$125", perCredit: "$0.50", popular: true, amountCents: 12500 },
];

interface Transaction {
  id: string;
  date: string;
  time: string;
  description: string;
  subDescription: string;
  credits: number;
  amountCents: number;
  type: string;
  status: string;
}

interface CreditsClientProps {
  currentPlanId: string | null;
  credits: number;
  monthlyCredits: number;
  monthUsed: number;
  weeklyData: number[];
  weeklyLabels: string[];
  renewal: string;
  transactions: Transaction[];
}

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } } };
const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function UpgradeParamWatcher({ onOpen }: { onOpen: () => void }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    if (searchParams.get("upgrade") === "true") {
      onOpen();
      router.replace(pathname, { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);
  return null;
}

function fmt(units: number) {
  return units % 10 === 0 ? String(units / 10) : (units / 10).toFixed(1);
}

function fmtAmount(cents: number) {
  if (!cents) return null;
  return `$${(cents / 100).toFixed(2)}`;
}

function txIcon(type: string) {
  if (type === "TOPUP") {
    return (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
        style={{ background: "rgba(16,185,129,0.12)" }}>
        <FontAwesomeIcon icon={faPlus} style={{ fontSize: 13, color: "#10B981" }} />
      </div>
    );
  }
  if (type === "RENEWAL") {
    return (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
        style={{ background: "rgba(37,99,235,0.12)" }}>
        <FontAwesomeIcon icon={faRotateRight} style={{ fontSize: 13, color: "#2563EB" }} />
      </div>
    );
  }
  if (type === "REFUND") {
    return (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
        style={{ background: "rgba(249,115,22,0.12)" }}>
        <FontAwesomeIcon icon={faRotateRight} style={{ fontSize: 13, color: "#F97316" }} />
      </div>
    );
  }
  // SUBSCRIPTION
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
      style={{ background: "rgba(99,102,241,0.12)" }}>
      <FontAwesomeIcon icon={faCalendarCheck} style={{ fontSize: 13, color: "#6366F1" }} />
    </div>
  );
}

function statusBadge(status: string) {
  if (status === "COMPLETED") {
    return (
      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
        style={{ background: "rgba(16,185,129,0.12)", color: "#059669" }}>
        Completed
      </span>
    );
  }
  if (status === "PENDING") {
    return (
      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
        style={{ background: "rgba(245,158,11,0.12)", color: "#D97706" }}>
        Pending
      </span>
    );
  }
  if (status === "FAILED") {
    return (
      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
        style={{ background: "rgba(239,68,68,0.12)", color: "#DC2626" }}>
        Failed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
      style={{ background: "#F3F4F6", color: "#6B7280" }}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function CreditsClient({ currentPlanId, credits, monthlyCredits, monthUsed, weeklyData, weeklyLabels, renewal, transactions }: CreditsClientProps) {
  const [showPlansModal, setShowPlansModal] = useState(false);
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [checkingOut, setCheckingOut] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const router = useRouter();

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
            setShowPlansModal(false);
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

  const currentPlan = plans.find((p) => p.id === currentPlanId);
  const creditsTotal = monthlyCredits || 300;
  const pct = creditsTotal > 0 ? Math.min(Math.round((monthUsed / (creditsTotal * 10)) * 100), 100) : 0;
  const remainingPct = 100 - pct;
  const displayRemaining = fmt(credits);
  const displayUsed = fmt(monthUsed);

  // Ring geometry
  const ringSize = 120;
  const ringStroke = 10;
  const ringRadius = (ringSize - ringStroke) / 2;
  const ringCircum = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircum - (remainingPct / 100) * ringCircum;

  function getPlanAction(planId: string) {
    if (!currentPlanId) return "upgrade";
    const planOrder = ["basic", "creator", "agency"];
    const currentIdx = planOrder.indexOf(currentPlanId);
    const targetIdx = planOrder.indexOf(planId);
    if (targetIdx === currentIdx) return "current";
    if (targetIdx > currentIdx) return "upgrade";
    return "downgrade";
  }

  const visibleTx = showAll ? transactions : transactions.slice(0, 5);

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      <Suspense fallback={null}>
        <UpgradeParamWatcher onOpen={() => setShowPlansModal(true)} />
      </Suspense>

      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 pb-10">

        {/* Page header */}
        <motion.div variants={fadeUp}>
          <h1 className="text-[26px] font-bold text-[#111111]">Credits</h1>
          <p className="text-[13px] text-[#6B7280] mt-0.5">Manage your credits and subscription.</p>
        </motion.div>

        {/* ── Row 1: Available credits + Usage ── */}
        <div className="grid gap-4 lg:grid-cols-3">

          {/* Available credits card */}
          <motion.div variants={fadeUp} className="lg:col-span-2 rounded-2xl p-6"
            style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>

            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-4">
                  <span className="text-[13px] font-semibold text-[#374151]">Available credits</span>
                  <FontAwesomeIcon icon={faInfoCircle} style={{ fontSize: 13, color: "#9CA3AF" }} />
                </div>

                <div className="flex items-end gap-2">
                  <span className="text-[44px] font-bold text-[#111111] leading-none">{displayRemaining}</span>
                  <span className="text-[18px] font-semibold text-[#9CA3AF] mb-1">credits</span>
                </div>

                {renewal && (
                  <p className="text-[12px] text-[#9CA3AF] mt-2">Renews {renewal}</p>
                )}
                {currentPlan && (
                  <p className="text-[12px] text-[#2563EB] mt-1 font-medium">{currentPlan.name} plan</p>
                )}
              </div>

              {/* Ring chart */}
              <div className="relative shrink-0" style={{ width: ringSize, height: ringSize }}>
                <svg width={ringSize} height={ringSize} className="-rotate-90" viewBox={`0 0 ${ringSize} ${ringSize}`}>
                  <defs>
                    <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#2563EB" />
                      <stop offset="100%" stopColor="#06B6D4" />
                    </linearGradient>
                  </defs>
                  <circle cx={ringSize / 2} cy={ringSize / 2} r={ringRadius}
                    stroke="#E5E7EB" strokeWidth={ringStroke} fill="none" />
                  <motion.circle
                    cx={ringSize / 2} cy={ringSize / 2} r={ringRadius}
                    stroke="url(#ring-grad)" strokeWidth={ringStroke} strokeLinecap="round" fill="none"
                    strokeDasharray={ringCircum}
                    initial={{ strokeDashoffset: ringCircum }}
                    animate={{ strokeDashoffset: ringOffset }}
                    transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" as const }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[20px] font-bold text-[#111111]">{remainingPct}%</span>
                  <span className="text-[9px] uppercase tracking-widest text-[#9CA3AF]">remaining</span>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-5">
              <div className="h-2.5 w-full overflow-hidden rounded-full" style={{ background: "#E5E7EB" }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${remainingPct}%` }}
                  transition={{ duration: 1, delay: 0.3, ease: "easeOut" as const }}
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg, #2563EB, #06B6D4)" }}
                />
              </div>
            </div>

            {/* CTA buttons */}
            <div className="mt-5 flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => setShowPlansModal(true)}
                className="inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-[13px] font-bold text-white transition hover:brightness-110"
                style={{ background: "#2563EB" }}
              >
                <FontAwesomeIcon icon={faBolt} style={{ fontSize: 13 }} />
                Upgrade plan
              </button>
              <button
                onClick={() => setShowPlansModal(true)}
                className="inline-flex items-center gap-1.5 rounded-2xl border border-[#E5E7EB] px-5 py-2.5 text-[13px] font-semibold text-[#374151] transition hover:bg-[#F3F4F6]"
              >
                Change plan
                <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: 11 }} />
              </button>
            </div>
          </motion.div>

          {/* Usage this month card */}
          <motion.div variants={fadeUp} className="rounded-2xl p-6 flex flex-col"
            style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>

            <p className="text-[13px] font-semibold text-[#374151]">Usage this month</p>

            <div className="mt-3 flex items-end gap-2">
              <span className="text-[36px] font-bold text-[#111111] leading-none">{displayUsed}</span>
              <span className="text-[13px] text-[#9CA3AF] mb-1">credits used</span>
            </div>

            <div className="mt-5 flex-1 flex flex-col justify-end">
              <div className="grid grid-cols-7 items-end gap-1.5 h-20">
                {weeklyData.map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: "0%" }}
                    animate={{ height: `${Math.max(h, 4)}%` }}
                    transition={{ duration: 0.5, delay: 0.3 + i * 0.05, ease: "easeOut" as const }}
                    className="w-full rounded-sm"
                    style={{ background: h > 5 ? "linear-gradient(to top, #2563EB, #06B6D4)" : "#E5E7EB" }}
                  />
                ))}
              </div>
              <div className="mt-2 grid grid-cols-7 gap-1.5">
                {weeklyLabels.map((d, i) => (
                  <span key={i} className="text-center text-[10px] font-semibold text-[#9CA3AF]">{d}</span>
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-center gap-1.5 text-[12px] text-[#9CA3AF]">
              <FontAwesomeIcon icon={faArrowTrendUp} style={{ fontSize: 12, color: "#2563EB" }} />
              Usage trending steady
            </div>
          </motion.div>
        </div>

        {/* ── Row 2: Top up credits ── */}
        <motion.div variants={fadeUp}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[18px] font-bold text-[#111111]">Top up credits</h2>
            <span className="text-[12px] text-[#9CA3AF]">One-time credit packs, never expire</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {creditPacks.map((pack) => (
              <div
                key={pack.credits}
                className="relative rounded-2xl p-6 transition-all hover:-translate-y-0.5"
                style={pack.popular ? {
                  background: "#FFFFFF",
                  border: "1.5px solid #2563EB",
                  boxShadow: "0 4px 20px rgba(37,99,235,0.12)",
                } : {
                  background: "#FFFFFF",
                  border: "1px solid #E5E7EB",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                }}
              >
                {pack.popular && (
                  <div className="absolute top-4 right-4">
                    <span className="rounded-full px-2.5 py-1 text-[10px] font-bold text-white"
                      style={{ background: "#2563EB" }}>
                      BEST VALUE
                    </span>
                  </div>
                )}
                <div className="flex flex-col gap-5">
                  <div>
                    <p className="text-[48px] font-bold text-[#111111] leading-none">{pack.credits}</p>
                    <p className="mt-1 text-[12px] font-semibold text-[#9CA3AF] uppercase tracking-wider">credits</p>
                  </div>
                  <div>
                    <p className="text-[26px] font-bold text-[#111111]">{pack.price}</p>
                    <p className="text-[12px] text-[#9CA3AF]">{pack.perCredit} / credit</p>
                  </div>
                  <button
                    onClick={() => handleCheckout(pack.amountCents, `${pack.credits} Credit Pack`, `topup-${pack.credits}`, { type: "TOPUP", creditsTenths: pack.credits * 10, creditsDisplay: pack.credits })}
                    disabled={!!checkingOut}
                    className={cn(
                      "w-full rounded-2xl h-10 text-[13px] font-semibold transition",
                      pack.popular ? "text-white hover:brightness-110" : "hover:bg-[#E5E7EB]",
                      checkingOut === `topup-${pack.credits}` && "opacity-70 cursor-wait"
                    )}
                    style={pack.popular ? {
                      background: "#2563EB",
                    } : {
                      background: "#F3F4F6",
                      color: "#374151",
                    }}
                  >
                    {checkingOut === `topup-${pack.credits}` ? "Processing..." : "Purchase"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Row 3: Transaction history ── */}
        <motion.div variants={fadeUp} className="rounded-2xl overflow-hidden"
          style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>

          <div className="px-6 py-4 border-b border-[#F3F4F6]">
            <h2 className="text-[16px] font-bold text-[#111111]">Transaction history</h2>
          </div>

          {transactions.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-[13px] text-[#6B7280]">No transactions yet</p>
              <p className="text-[11px] text-[#9CA3AF] mt-1">Your purchases will appear here</p>
            </div>
          ) : (
            <>
              {/* Table header */}
              <div className="hidden sm:grid grid-cols-[1fr_140px_90px_100px_100px] gap-3 px-6 py-2.5 border-b border-[#F3F4F6]">
                {["DESCRIPTION", "DATE", "CREDITS", "AMOUNT", "STATUS"].map((h) => (
                  <span key={h} className="text-[10px] font-bold text-[#9CA3AF] tracking-wider">{h}</span>
                ))}
              </div>

              <div className="divide-y divide-[#F3F4F6]">
                {visibleTx.map((t) => (
                  <div key={t.id} className="sm:grid sm:grid-cols-[1fr_140px_90px_100px_100px] sm:gap-3 flex flex-col gap-2 px-6 py-4 items-start sm:items-center">
                    {/* Description */}
                    <div className="flex items-center gap-3 min-w-0">
                      {txIcon(t.type)}
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-[#111111] truncate">{t.description}</p>
                        <p className="text-[11px] text-[#9CA3AF] truncate">{t.subDescription}</p>
                      </div>
                    </div>
                    {/* Date */}
                    <div>
                      <p className="text-[12px] text-[#374151]">{t.date}</p>
                      <p className="text-[11px] text-[#9CA3AF]">{t.time}</p>
                    </div>
                    {/* Credits */}
                    <span className={cn(
                      "text-[13px] font-bold tabular-nums",
                      t.credits > 0 ? "text-[#10B981]" : "text-[#EF4444]"
                    )}>
                      {t.credits > 0 ? `+${fmt(t.credits)}` : fmt(t.credits)}
                    </span>
                    {/* Amount */}
                    <span className="text-[13px] font-semibold text-[#374151]">
                      {fmtAmount(t.amountCents) ?? <span className="text-[#D1D5DB]">&mdash;</span>}
                    </span>
                    {/* Status */}
                    <div>{statusBadge(t.status)}</div>
                  </div>
                ))}
              </div>

              {transactions.length > 5 && (
                <div className="border-t border-[#F3F4F6] px-6 py-3 flex justify-center">
                  <button
                    onClick={() => setShowAll((v) => !v)}
                    className="flex items-center gap-1.5 text-[12px] font-semibold text-[#6B7280] hover:text-[#111111] transition"
                  >
                    {showAll ? "Show less" : "View all transactions"}
                    <FontAwesomeIcon icon={faChevronDown}
                      className={cn("transition-transform", showAll && "rotate-180")}
                      style={{ fontSize: 10 }} />
                  </button>
                </div>
              )}
            </>
          )}
        </motion.div>
      </motion.div>

      {/* ── Plans Modal ── */}
      {showPlansModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center lg:pl-[252px]">
          {/* No blur — just dark overlay */}
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowPlansModal(false)} />

          <div className="relative w-full max-w-3xl mx-4 max-h-[92vh] overflow-y-auto rounded-3xl bg-white shadow-2xl">
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
                onClick={() => setShowPlansModal(false)}
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
                      billing === "monthly"
                        ? "bg-white text-[#2563EB] shadow-sm"
                        : "text-[#6B7280] hover:text-[#374151]"
                    )}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setBilling("yearly")}
                    className={cn(
                      "rounded-full px-5 py-2 text-[13px] font-semibold transition-all flex items-center gap-2",
                      billing === "yearly"
                        ? "bg-white text-[#374151] shadow-sm"
                        : "text-[#6B7280] hover:text-[#374151]"
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
                {plans.map((p) => {
                  const action = getPlanAction(p.id);
                  const isCurrent = action === "current";
                  const price = billing === "monthly" ? p.monthlyPrice : p.yearlyPrice;
                  const PlanIcon = planIcons[p.id as keyof typeof planIcons];
                  return (
                    <div
                      key={p.id}
                      className="relative rounded-2xl flex flex-col transition-all"
                      style={isCurrent
                        ? { border: "2px solid #2563EB", background: "#FFFFFF", boxShadow: "0 4px 20px rgba(37,99,235,0.10)" }
                        : { border: "1px solid #E5E7EB", background: "#FFFFFF" }}
                    >
                      {p.popular && (
                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                          <span className="rounded-full px-3 py-1 text-[11px] font-bold text-white"
                            style={{ background: "#2563EB" }}>Popular</span>
                        </div>
                      )}
                      <div className="p-5 flex-1 flex flex-col">
                        {/* Plan icon + name */}
                        <div className="flex items-start gap-3 mb-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                            style={{ background: p.iconBg }}>
                            <FontAwesomeIcon icon={PlanIcon} style={{ fontSize: 16, color: p.iconColor }} />
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

                        {/* Price */}
                        <div className="flex items-end gap-1 mb-1">
                          <span className="text-[38px] font-bold text-[#111111] leading-none">{price}</span>
                          <span className="text-[13px] text-[#9CA3AF] mb-1">/mo</span>
                        </div>
                        {billing === "yearly" && (
                          <p className="text-[11px] mb-3" style={{ color: "#2563EB" }}>Billed annually</p>
                        )}

                        <div className="my-4 h-px" style={{ background: "#F3F4F6" }} />

                        {/* Features */}
                        <ul className="space-y-2.5 flex-1 mb-5">
                          {p.features.map((f) => (
                            <li key={f} className="flex items-center gap-2.5 text-[12px] text-[#374151]">
                              <FontAwesomeIcon icon={faCheck}
                                style={{ fontSize: 11, color: p.checkColor, flexShrink: 0 }} />
                              {f}
                            </li>
                          ))}
                        </ul>

                        {/* CTA */}
                        {isCurrent ? (
                          <button
                            className="w-full h-11 rounded-2xl text-[13px] font-bold text-white transition hover:brightness-110"
                            style={{ background: "#2563EB" }}
                          >
                            Current Plan
                          </button>
                        ) : action === "upgrade" ? (
                          <button
                            disabled={!!checkingOut}
                            onClick={() => handleCheckout(
                              billing === "monthly" ? p.monthlyAmountCents : p.yearlyAmountCents,
                              `${p.name} Plan (${billing})`,
                              `plan-${p.id}`,
                              { type: "SUBSCRIPTION", planId: p.id, billingCycle: billing }
                            )}
                            className="w-full h-11 rounded-2xl text-[13px] font-bold text-white transition hover:brightness-110 disabled:opacity-60"
                            style={{ background: "#2563EB" }}
                          >
                            {checkingOut === `plan-${p.id}` ? "Processing..." : `Upgrade to ${p.name}`}
                          </button>
                        ) : (
                          <button
                            disabled={!!checkingOut}
                            onClick={() => handleCheckout(
                              billing === "monthly" ? p.monthlyAmountCents : p.yearlyAmountCents,
                              `${p.name} Plan (${billing})`,
                              `plan-${p.id}`,
                              { type: "SUBSCRIPTION", planId: p.id, billingCycle: billing }
                            )}
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

              {/* Footer */}
              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl"
                    style={{ background: "rgba(37,99,235,0.08)" }}>
                    <FontAwesomeIcon icon={faShieldHalved} style={{ fontSize: 15, color: "#2563EB" }} />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-[#111111]">Secure &amp; flexible</p>
                    <p className="text-[11px] text-[#6B7280]">You can change or cancel your plan anytime.</p>
                  </div>
                </div>
                <div className="text-[13px] text-[#6B7280]">
                  Need help?{" "}
                  <a href="/support" className="font-semibold text-[#2563EB] hover:underline">
                    Contact support →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
