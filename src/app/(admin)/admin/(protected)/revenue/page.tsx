"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Breakdown = { plan: string; subs: number; mrrCents: number };
type RevenueData = { mrrCents: number; activeSubs: number; breakdown: Breakdown[] };

const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };
const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

const dollars = (cents: number) => `$${(cents / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

function planTone(plan: string) {
  switch (plan) {
    case "AGENCY": return { color: "text-violet", bg: "bg-violet/10" };
    case "CREATOR": return { color: "text-primary", bg: "bg-primary/10" };
    case "BASIC": return { color: "text-amber", bg: "bg-amber/10" };
    default: return { color: "text-muted-foreground", bg: "bg-muted" };
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

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="max-w-7xl mx-auto space-y-8">
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold text-foreground">Revenue</h1>
        <p className="text-sm text-muted-foreground mt-1">MRR and active subscriptions</p>
      </motion.div>

      <motion.div variants={container} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <motion.div variants={fadeUp} className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-muted-foreground">MRR</span>
            <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10">
              <DollarSign className="h-3.5 w-3.5 text-primary" />
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground">{dollars(data.mrrCents)}</p>
          <p className="text-[11px] text-muted-foreground mt-1">monthly recurring</p>
        </motion.div>

        <motion.div variants={fadeUp} className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-muted-foreground">Active Subscriptions</span>
            <div className="flex size-8 items-center justify-center rounded-xl bg-violet/10">
              <DollarSign className="h-3.5 w-3.5 text-violet" />
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground">{data.activeSubs.toLocaleString()}</p>
          <p className="text-[11px] text-muted-foreground mt-1">currently paying</p>
        </motion.div>
      </motion.div>

      <motion.div variants={fadeUp}>
        <h2 className="text-sm font-bold text-foreground mb-3">Plan Breakdown</h2>
        {data.breakdown.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
            No active subscriptions yet
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {data.breakdown.map((p) => {
              const tone = planTone(p.plan);
              return (
                <div key={p.plan} className="rounded-2xl border border-border bg-card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className={cn("text-xs font-semibold uppercase tracking-wider", tone.color)}>
                      {p.plan}
                    </span>
                    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", tone.bg, tone.color)}>
                      {p.subs} subs
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{dollars(p.mrrCents)}</p>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
