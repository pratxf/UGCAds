"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, TrendingUp, Users, Zap, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Breakdown = { plan: string; subs: number; mrrCents: number };
type RevenueData = {
  mrrCents: number;
  activeSubs: number;
  breakdown: Breakdown[];
  totalRevenueCents: number;
  topupRevenueCents: number;
  subscriptionRevenueCents: number;
};

const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };
const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

const dollars = (cents: number) =>
  `$${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

function planTone(plan: string) {
  switch (plan) {
    case "AGENCY": return { color: "text-violet-400", bg: "bg-violet-400/10", bar: "bg-violet-400" };
    case "CREATOR": return { color: "text-primary", bg: "bg-primary/10", bar: "bg-primary" };
    case "BASIC": return { color: "text-amber-400", bg: "bg-amber-400/10", bar: "bg-amber-400" };
    default: return { color: "text-muted-foreground", bg: "bg-muted", bar: "bg-white/20" };
  }
}

export default function AdminRevenuePage() {
  const [data, setData] = useState<RevenueData | null>(null);

  useEffect(() => {
    fetch("/api/admin/revenue")
      .then((r) => (r.ok ? r.json() : null))
      .then(setData)
      .catch(() => setData(null));
  }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  const totalMrr = data.mrrCents;
  const maxBreakdown = Math.max(...data.breakdown.map((b) => b.mrrCents), 1);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="max-w-7xl mx-auto space-y-8">
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold text-foreground">Revenue</h1>
        <p className="text-sm text-muted-foreground mt-1">Subscriptions, top-ups, and monthly recurring revenue</p>
      </motion.div>

      {/* Top stats */}
      <motion.div variants={container} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: "Monthly Recurring",
            value: dollars(data.mrrCents),
            sub: "from active subscriptions",
            icon: TrendingUp,
            tone: "text-primary bg-primary/10",
          },
          {
            label: "Active Subscriptions",
            value: data.activeSubs.toLocaleString(),
            sub: "currently paying users",
            icon: Users,
            tone: "text-violet-400 bg-violet-400/10",
          },
          {
            label: "Subscription Revenue",
            value: dollars(data.subscriptionRevenueCents ?? data.mrrCents),
            sub: "all-time from plans",
            icon: DollarSign,
            tone: "text-emerald-400 bg-emerald-400/10",
          },
          {
            label: "Top-up Revenue",
            value: dollars(data.topupRevenueCents ?? 0),
            sub: "from credit pack sales",
            icon: Zap,
            tone: "text-amber-400 bg-amber-400/10",
          },
        ].map((c) => {
          const Icon = c.icon;
          return (
            <motion.div
              key={c.label}
              variants={fadeUp}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground">{c.label}</span>
                <div className={cn("flex size-8 items-center justify-center rounded-xl", c.tone)}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">{c.value}</p>
              <p className="text-[11px] text-muted-foreground mt-1">{c.sub}</p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Plan breakdown */}
      <motion.div variants={fadeUp} className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-sm font-bold text-foreground mb-1">Plan Breakdown</h2>
        <p className="text-[11px] text-muted-foreground mb-5">MRR contribution by plan tier</p>

        {data.breakdown.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            No active subscriptions yet
          </div>
        ) : (
          <div className="space-y-4">
            {data.breakdown
              .sort((a, b) => b.mrrCents - a.mrrCents)
              .map((p) => {
                const tone = planTone(p.plan);
                const pct = Math.round((p.mrrCents / maxBreakdown) * 100);
                return (
                  <div key={p.plan} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={cn("text-xs font-bold uppercase tracking-wider", tone.color)}>
                          {p.plan}
                        </span>
                        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", tone.bg, tone.color)}>
                          {p.subs} {p.subs === 1 ? "sub" : "subs"}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-foreground">{dollars(p.mrrCents)}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-white/[0.06]">
                      <div
                        className={cn("h-full rounded-full transition-all duration-700", tone.bar)}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </motion.div>

      {/* Summary cards */}
      {data.breakdown.length > 0 && (
        <motion.div variants={container} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {data.breakdown.map((p) => {
            const tone = planTone(p.plan);
            const mrrShare = totalMrr > 0 ? Math.round((p.mrrCents / totalMrr) * 100) : 0;
            return (
              <motion.div key={p.plan} variants={fadeUp} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className={cn("text-xs font-bold uppercase tracking-wider", tone.color)}>{p.plan}</span>
                  <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold", tone.bg, tone.color)}>
                    {mrrShare}% of MRR
                  </span>
                </div>
                <p className="text-2xl font-bold text-foreground">{dollars(p.mrrCents)}</p>
                <p className="text-[11px] text-muted-foreground mt-1">{p.subs} active {p.subs === 1 ? "subscriber" : "subscribers"}</p>
                <p className="text-[11px] text-muted-foreground">
                  {p.subs > 0 ? `${dollars(Math.round(p.mrrCents / p.subs))}/user avg` : "—"}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
}
