"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBolt,
  faCreditCard,
  faCalendar,
  faArrowTrendUp,
  faCheck,
  faXmark,
  faChevronRight,
  faDownload,
} from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
    credits: 100,
    features: ["100 credits/month", "5 video generations", "Standard speed rendering", "Basic templates", "Email support", "Watermark on videos"],
    cta: "Get Started",
  },
  {
    id: "creator",
    name: "Creator",
    description: "For creators and small businesses scaling ads",
    monthlyPrice: "$79",
    yearlyPrice: "$63",
    credits: 300,
    popular: true,
    features: ["300 credits/month", "15 video generations", "Faster rendering", "Premium templates", "No watermark", "Priority email support"],
    cta: "Start Creating",
  },
  {
    id: "agency",
    name: "Agency",
    description: "For agencies and teams producing ads at scale",
    monthlyPrice: "$129",
    yearlyPrice: "$103",
    credits: 500,
    features: ["500 credits/month", "25 video generations", "Priority rendering", "All templates", "No watermark", "API access (coming soon)", "Team seats (3 users)", "Priority+ support"],
    cta: "Go Pro",
  },
];

const creditPacks = [
  { credits: 50, price: "$30", perCredit: "$0.60", popular: false },
  { credits: 100, price: "$55", perCredit: "$0.55", popular: false },
  { credits: 250, price: "$125", perCredit: "$0.50", popular: true },
];


interface Transaction {
  id: string;
  date: string;
  description: string;
  credits: number;
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

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" as const } } };

/* ------------------------------------------------------------------ */
/*  Component                                                          */
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

export default function CreditsClient({ currentPlanId, credits, monthlyCredits, monthUsed, weeklyData, weeklyLabels, renewal, transactions }: CreditsClientProps) {
  const [showPlansModal, setShowPlansModal] = useState(false);
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  const currentPlan = plans.find((p) => p.id === currentPlanId);
  const creditsTotal = monthlyCredits || 300;
  // monthUsed is raw DB units (×10), creditsTotal is display units — multiply creditsTotal by 10 to match
  const pct = creditsTotal > 0 ? Math.min(Math.round((monthUsed / (creditsTotal * 10)) * 100), 100) : 0;
  const remainingPct = 100 - pct;
  const displayRemaining = fmt(credits);
  const displayTotal = fmt(creditsTotal);
  const displayUsed = fmt(monthUsed);

  // Ring geometry
  const ringSize = 128;
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

  return (
    <>
      <Suspense fallback={null}>
        <UpgradeParamWatcher onOpen={() => setShowPlansModal(true)} />
      </Suspense>

      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 pb-10">
        {/* ── Row 1: Hero + This month ── */}
        <div className="grid gap-5 lg:grid-cols-3">
          {/* Hero card */}
          <motion.div
            variants={fadeUp}
            className="lg:col-span-2 relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8"
          >
            {/* Blurred gradient circles */}
            <div className="pointer-events-none absolute -top-32 -left-20 size-80 rounded-full bg-primary/30 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-40 -right-20 size-96 rounded-full bg-violet/30 blur-3xl" />

            <div className="relative flex flex-col gap-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-4">
                  <span className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">
                    <span className="size-1.5 rounded-full bg-primary" />
                    Active {"\u00B7"} {currentPlan?.name || "Creator"} plan
                  </span>
                  <div>
                    <h1 className="text-4xl font-bold text-foreground leading-none">
                      {displayRemaining}
                      <span className="text-white/30 text-2xl font-semibold ml-2">credits</span>
                    </h1>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {renewal ? `Renews ${renewal}` : "Upgrade to start creating"}
                    </p>
                  </div>
                </div>

                {/* Ring */}
                <div className="relative shrink-0" style={{ width: ringSize, height: ringSize }}>
                  <svg
                    width={ringSize}
                    height={ringSize}
                    className="-rotate-90"
                    viewBox={`0 0 ${ringSize} ${ringSize}`}
                  >
                    <defs>
                      <linearGradient id="ring" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#7D39EB" />
                        <stop offset="60%" stopColor="#C6FF33" />
                        <stop offset="100%" stopColor="#C6FF33" />
                      </linearGradient>
                    </defs>
                    <circle
                      cx={ringSize / 2}
                      cy={ringSize / 2}
                      r={ringRadius}
                      stroke="rgba(255,255,255,0.08)"
                      strokeWidth={ringStroke}
                      fill="none"
                    />
                    <motion.circle
                      cx={ringSize / 2}
                      cy={ringSize / 2}
                      r={ringRadius}
                      stroke="url(#ring)"
                      strokeWidth={ringStroke}
                      strokeLinecap="round"
                      fill="none"
                      strokeDasharray={ringCircum}
                      initial={{ strokeDashoffset: ringCircum }}
                      animate={{ strokeDashoffset: ringOffset }}
                      transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" as const }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-foreground">{remainingPct}%</span>
                    <span className="text-[9px] uppercase tracking-widest text-muted-foreground mt-0.5">Remaining</span>
                  </div>
                </div>
              </div>

              {/* Horizontal progress bar */}
              <div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${remainingPct}%` }}
                    transition={{ duration: 1, delay: 0.3, ease: "easeOut" as const }}
                    className="h-full rounded-full bg-gradient-to-r from-violet to-primary"
                  />
                </div>
              </div>

              {/* CTA row */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => setShowPlansModal(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet to-primary px-4 py-2.5 text-xs font-semibold text-black shadow-lg shadow-primary/20 hover:brightness-110 transition"
                >
                  <FontAwesomeIcon icon={faBolt} style={{ fontSize: 14 }} />
                  Upgrade plan
                </button>
                <button
                  onClick={() => setShowPlansModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-white/10 transition"
                >
                  Change plan
                  <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: 12 }} />
                </button>
              </div>
            </div>
          </motion.div>

          {/* This month card */}
          <motion.div
            variants={fadeUp}
            className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 flex flex-col"
          >
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">This month</p>
            <div className="mt-3 flex items-end gap-2">
              <span className="text-4xl font-bold text-foreground leading-none">{displayUsed}</span>
              <span className="text-xs text-muted-foreground mb-1">used</span>
            </div>

            <div className="mt-6 flex-1 flex flex-col justify-end">
              <div className="grid grid-cols-7 items-end gap-1.5 h-24">
                {weeklyData.map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: "0%" }}
                    animate={{ height: `${h}%` }}
                    transition={{ duration: 0.6, delay: 0.3 + i * 0.05, ease: "easeOut" as const }}
                    className="w-full rounded-md bg-gradient-to-t from-primary to-violet"
                  />
                ))}
              </div>
              <div className="mt-2 grid grid-cols-7 gap-1.5">
                {weeklyLabels.map((d, i) => (
                  <span key={i} className="text-center text-[10px] font-semibold text-muted-foreground">
                    {d}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-5 flex items-center gap-2 text-[11px] text-muted-foreground">
              <FontAwesomeIcon icon={faArrowTrendUp} className="text-primary" style={{ fontSize: 12 }} />
              Usage trending steady
            </div>
          </motion.div>
        </div>

        {/* ── Row 2: Top up ── */}
        <motion.div variants={fadeUp}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">Top up</h2>
            <span className="text-[11px] text-muted-foreground">One time credit packs, never expire</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {creditPacks.map((pack) => (
              <div
                key={pack.credits}
                className={cn(
                  "relative rounded-3xl border p-6 transition-all hover:-translate-y-0.5",
                  pack.popular
                    ? "border-primary/40 bg-gradient-to-br from-primary/10 via-violet/5 to-transparent"
                    : "border-white/10 bg-white/5 backdrop-blur-xl"
                )}
              >
                {pack.popular && (
                  <div className="absolute top-4 right-4 z-10">
                    <span className="rounded-full bg-primary px-2.5 py-1 text-[9px] font-bold text-black tracking-wide">
                      BEST VALUE
                    </span>
                  </div>
                )}

                <div className="flex flex-col gap-5">
                  <div>
                    <p className="text-5xl font-bold text-foreground leading-none">{pack.credits}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                      Credits
                    </p>
                  </div>

                  <div className="flex items-end gap-1">
                    <span className="text-2xl font-bold text-foreground">{pack.price}</span>
                    <span className="text-[11px] text-muted-foreground mb-1">/credit {pack.perCredit}</span>
                  </div>

                  <button
                    className={cn(
                      "w-full rounded-xl h-10 text-xs font-semibold transition",
                      pack.popular
                        ? "bg-gradient-to-r from-violet to-primary text-black shadow-lg shadow-primary/20 hover:brightness-110"
                        : "bg-white/5 border border-white/10 text-foreground hover:bg-white/10"
                    )}
                  >
                    Purchase
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Row 3: Transaction history ── */}
        <motion.div
          variants={fadeUp}
          className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-foreground">Transaction history</h2>
          </div>

          {transactions.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-muted-foreground">No transactions yet</p>
              <p className="text-[11px] text-muted-foreground/60 mt-1">Your purchases and usage will appear here</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {transactions.map((t) => (
                <div key={t.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/5">
                    <FontAwesomeIcon icon={faCreditCard} className="text-muted-foreground" style={{ fontSize: 16 }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-foreground truncate">{t.description}</p>
                    <p className="text-[11px] text-muted-foreground">{t.date}</p>
                  </div>
                  <span
                    className={cn(
                      "text-sm font-semibold tabular-nums",
                      t.credits > 0 ? "text-primary" : "text-destructive"
                    )}
                  >
                    {t.credits > 0 ? `+${fmt(t.credits)}` : `-${fmt(Math.abs(t.credits))}`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* ── Plans Modal ── */}
      {showPlansModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center lg:pl-[252px]">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowPlansModal(false)} />

          {/* Modal */}
          <div className="relative w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-[#050505] shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#050505]/95 backdrop-blur-sm rounded-t-3xl">
              <h2 className="text-base font-bold text-foreground">Change Plan</h2>
              <button
                onClick={() => setShowPlansModal(false)}
                className="size-8 rounded-xl bg-white/5 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
              >
                <FontAwesomeIcon icon={faXmark} style={{ fontSize: 14 }} />
              </button>
            </div>

            <div className="p-6">
              {/* Billing toggle */}
              <div className="flex justify-center mb-6">
                <div className="inline-flex items-center rounded-full bg-white/[0.04] border border-white/[0.07] p-1">
                  <button
                    onClick={() => setBilling("monthly")}
                    className={cn(
                      "rounded-full px-5 py-2 text-xs font-semibold transition-all",
                      billing === "monthly" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setBilling("yearly")}
                    className={cn(
                      "rounded-full px-5 py-2 text-xs font-semibold transition-all flex items-center gap-2",
                      billing === "yearly" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Yearly
                    <span className="rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-bold text-primary-foreground">20% OFF</span>
                  </button>
                </div>
              </div>

              {/* Plans grid */}
              <div className="grid gap-3 sm:grid-cols-3">
                {plans.map((p) => {
                  const action = getPlanAction(p.id);
                  const isCurrent = action === "current";
                  const price = billing === "monthly" ? p.monthlyPrice : p.yearlyPrice;
                  return (
                    <div
                      key={p.id}
                      className={cn(
                        "relative rounded-3xl border flex flex-col transition-all",
                        isCurrent ? "border-primary/30 bg-primary/[0.03]" : "border-white/10 bg-white/5"
                      )}
                    >
                      {p.popular && (
                        <div className="absolute -top-3 right-4 z-10">
                          <span className="rounded-full bg-foreground px-3 py-1 text-[10px] font-bold text-background">Popular</span>
                        </div>
                      )}

                      <div className="p-5 flex-1 flex flex-col">
                        <div className="flex items-center gap-2">
                          <p className="text-base font-bold text-foreground">{p.name}</p>
                          {isCurrent && <Badge className="bg-primary/10 text-primary text-[9px] border-0">Current</Badge>}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{p.description}</p>

                        <div className="mt-4">
                          <div className="flex items-end gap-1.5">
                            <span className="text-3xl font-bold text-foreground">{price}</span>
                            <span className="text-xs text-muted-foreground mb-1">/mo</span>
                            {billing === "yearly" && (
                              <span className="text-sm text-muted-foreground/50 line-through mb-1">{p.monthlyPrice}</span>
                            )}
                          </div>
                          {billing === "yearly" && (
                            <p className="text-[10px] text-primary mt-1">Billed annually, save 20%</p>
                          )}
                        </div>

                        <div className="my-4 h-px bg-white/10" />

                        <ul className="space-y-2 flex-1">
                          {p.features.map((f) => (
                            <li key={f} className="flex items-start gap-2 text-[11px] text-muted-foreground">
                              <FontAwesomeIcon icon={faCheck} className={cn("shrink-0 mt-0.5", isCurrent || p.popular ? "text-primary" : "text-muted-foreground/40")} style={{ fontSize: 12 }} />
                              {f}
                            </li>
                          ))}
                        </ul>

                        <div className="mt-5">
                          {isCurrent ? (
                            <div className="w-full h-10 rounded-xl bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center">
                              Current Plan
                            </div>
                          ) : action === "upgrade" ? (
                            <Button className="w-full rounded-xl h-10 shadow-lg shadow-primary/20 text-xs font-semibold">
                              Upgrade to {p.name}
                            </Button>
                          ) : (
                            <Button variant="outline" className="w-full rounded-xl h-10 text-xs font-semibold">
                              Downgrade
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
