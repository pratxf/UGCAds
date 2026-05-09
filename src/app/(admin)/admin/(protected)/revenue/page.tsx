"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, TrendingUp, Users, Zap, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Breakdown = { plan: string; subs: number; mrrCents: number };
type RevenueData = { mrrCents: number; activeSubs: number; breakdown: Breakdown[]; totalRevenueCents: number; subscriptionRevenueCents: number; topupRevenueCents: number };

const dollars = (c: number) => `$${(c / 100).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const up = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22,1,0.36,1] as any } } };

function planStyle(plan: string) {
  switch (plan) {
    case "AGENCY":  return { gradient: "from-violet-500 to-purple-600", bar: "bg-gradient-to-r from-violet-500 to-purple-600", text: "text-violet-300", badge: "bg-violet-500/10 text-violet-300 border-violet-500/20", glow: "rgba(139,92,246,0.2)" };
    case "CREATOR": return { gradient: "from-sky-500 to-blue-600",      bar: "bg-gradient-to-r from-sky-500 to-blue-600",      text: "text-sky-300",    badge: "bg-sky-500/10 text-sky-300 border-sky-500/20",         glow: "rgba(14,165,233,0.2)" };
    case "BASIC":   return { gradient: "from-amber-500 to-orange-600",  bar: "bg-gradient-to-r from-amber-500 to-orange-600",  text: "text-amber-300",  badge: "bg-amber-500/10 text-amber-300 border-amber-500/20",   glow: "rgba(245,158,11,0.2)" };
    default:        return { gradient: "from-slate-600 to-slate-700",   bar: "bg-slate-600",                                   text: "text-slate-500",  badge: "bg-white/[0.04] text-slate-500 border-white/[0.08]",    glow: "rgba(100,116,139,0.2)" };
  }
}

export default function AdminRevenuePage() {
  const [data, setData] = useState<RevenueData | null>(null);
  useEffect(() => { fetch("/api/admin/revenue").then((r) => r.ok ? r.json() : null).then(setData).catch(() => {}); }, []);

  if (!data) return <div className="flex items-center justify-center py-24"><Loader2 className="h-4 w-4 animate-spin text-sky-400" /></div>;

  const maxMrr = Math.max(...data.breakdown.map((b) => b.mrrCents), 1);

  const topCards = [
    { label: "Monthly Recurring", value: dollars(data.mrrCents), sub: "from active subscriptions", icon: TrendingUp, gradient: "from-sky-500 to-blue-600", glow: "rgba(14,165,233,0.2)" },
    { label: "Active Subscribers", value: data.activeSubs.toLocaleString(), sub: "currently paying", icon: Users, gradient: "from-violet-500 to-purple-600", glow: "rgba(139,92,246,0.2)" },
    { label: "Subscription Revenue", value: dollars(data.subscriptionRevenueCents ?? 0), sub: "all-time from plans", icon: DollarSign, gradient: "from-emerald-500 to-teal-600", glow: "rgba(52,211,153,0.2)" },
    { label: "Credit Pack Revenue", value: dollars(data.topupRevenueCents ?? 0), sub: "from top-up purchases", icon: Zap, gradient: "from-amber-500 to-orange-600", glow: "rgba(245,158,11,0.2)" },
  ];

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="max-w-6xl mx-auto space-y-8">
      <motion.div variants={up}>
        <h1 className="text-[22px] font-bold text-slate-100" style={{ fontFamily: "Satoshi, sans-serif" }}>Revenue</h1>
        <p className="text-sm text-slate-600 mt-0.5">Subscriptions, top-ups, and monthly recurring revenue</p>
      </motion.div>

      <motion.div variants={stagger} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {topCards.map((c) => {
          const Icon = c.icon;
          return (
            <motion.div key={c.label} variants={up} className="rounded-2xl overflow-hidden" style={{ background: "#0B0F1A", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className={cn("h-[2px] w-full bg-gradient-to-r", c.gradient)} />
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">{c.label}</span>
                  <div className="flex size-8 items-center justify-center rounded-xl" style={{ background: c.glow }}>
                    <Icon className="h-3.5 w-3.5 text-white" />
                  </div>
                </div>
                <p className="text-[26px] font-bold text-slate-100 tabular-nums leading-none" style={{ fontFamily: "Satoshi, sans-serif" }}>{c.value}</p>
                <p className="text-[11px] text-slate-600 mt-2">{c.sub}</p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Plan breakdown */}
      <motion.div variants={up} className="rounded-2xl overflow-hidden" style={{ background: "#0B0F1A", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <h2 className="text-[13px] font-bold text-slate-200">Plan Breakdown</h2>
          <p className="text-[11px] text-slate-600 mt-0.5">MRR contribution by plan tier</p>
        </div>
        <div className="p-6">
          {data.breakdown.length === 0 ? (
            <div className="rounded-xl flex items-center justify-center py-12 text-sm text-slate-700" style={{ border: "1px dashed rgba(255,255,255,0.07)" }}>
              No active subscriptions yet
            </div>
          ) : (
            <div className="space-y-5">
              {data.breakdown.sort((a, b) => b.mrrCents - a.mrrCents).map((p) => {
                const s = planStyle(p.plan);
                const pct = Math.round((p.mrrCents / maxMrr) * 100);
                const share = data.mrrCents > 0 ? Math.round((p.mrrCents / data.mrrCents) * 100) : 0;
                return (
                  <div key={p.plan}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className={cn("text-[11px] font-bold uppercase tracking-widest", s.text)}>{p.plan}</span>
                        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", s.badge)}>{p.subs} {p.subs === 1 ? "sub" : "subs"}</span>
                        <span className="text-[10px] text-slate-700">{share}% of MRR</span>
                      </div>
                      <span className="text-sm font-bold text-slate-200 tabular-nums">{dollars(p.mrrCents)}</span>
                    </div>
                    <div className="h-2 w-full rounded-full" style={{ background: "rgba(255,255,255,0.04)" }}>
                      <motion.div
                        initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: [0.22,1,0.36,1] as any, delay: 0.2 }}
                        className={cn("h-full rounded-full", s.bar)}
                        style={{ boxShadow: `0 0 8px ${s.glow}` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>

      {/* Plan cards */}
      {data.breakdown.length > 0 && (
        <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {data.breakdown.map((p) => {
            const s = planStyle(p.plan);
            const share = data.mrrCents > 0 ? Math.round((p.mrrCents / data.mrrCents) * 100) : 0;
            return (
              <motion.div key={p.plan} variants={up} className="rounded-2xl overflow-hidden" style={{ background: "#0B0F1A", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className={cn("h-[2px] w-full bg-gradient-to-r", s.gradient)} />
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <span className={cn("text-[11px] font-bold uppercase tracking-widest", s.text)}>{p.plan}</span>
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", s.badge)}>{share}% MRR</span>
                  </div>
                  <p className="text-[24px] font-bold text-slate-100 tabular-nums" style={{ fontFamily: "Satoshi, sans-serif" }}>{dollars(p.mrrCents)}</p>
                  <p className="text-[11px] text-slate-600 mt-2">{p.subs} active {p.subs === 1 ? "subscriber" : "subscribers"}</p>
                  {p.subs > 0 && <p className="text-[11px] text-slate-700">{dollars(Math.round(p.mrrCents / p.subs))}/user avg</p>}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
}
