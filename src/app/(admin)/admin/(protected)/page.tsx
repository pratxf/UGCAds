"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Users, CreditCard, Film, AlertCircle, Loader2, TrendingUp, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Stats = {
  totalUsers: number;
  activeSubscriptions: number;
  generationsToday: number;
  totalGenerations: number;
  failedToday: number;
  recentSignups: { id: string; email: string; name: string | null; plan: string; createdAt: string }[];
};

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const up = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22,1,0.36,1] as any } } };

function relTime(iso: string) {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

function planStyle(plan: string) {
  switch (plan) {
    case "AGENCY":  return "bg-violet-500/10 text-violet-300 border-violet-500/20";
    case "CREATOR": return "bg-sky-500/10 text-sky-300 border-sky-500/20";
    case "BASIC":   return "bg-amber-500/10 text-amber-300 border-amber-500/20";
    default:        return "bg-white/[0.04] text-slate-500 border-white/[0.08]";
  }
}

const initials = (s: string) =>
  s.split(/[ @]/).map((p) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats").then((r) => r.json()).then(setStats).catch(() => {});
  }, []);

  if (!stats) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-5 w-5 animate-spin text-sky-400" />
      </div>
    );
  }

  const cards = [
    {
      label: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      sub: "all-time signups",
      icon: Users,
      color: "sky",
      gradient: "from-sky-500 to-blue-600",
      glow: "rgba(14,165,233,0.2)",
    },
    {
      label: "Active Subscriptions",
      value: stats.activeSubscriptions.toLocaleString(),
      sub: "currently paying",
      icon: CreditCard,
      color: "violet",
      gradient: "from-violet-500 to-purple-600",
      glow: "rgba(139,92,246,0.2)",
    },
    {
      label: "Generations Today",
      value: stats.generationsToday.toLocaleString(),
      sub: `${stats.totalGenerations.toLocaleString()} total`,
      icon: Film,
      color: "amber",
      gradient: "from-amber-500 to-orange-600",
      glow: "rgba(245,158,11,0.2)",
    },
    {
      label: "Failed Today",
      value: stats.failedToday.toLocaleString(),
      sub: stats.failedToday === 0 ? "all systems clear" : "needs attention",
      icon: stats.failedToday === 0 ? TrendingUp : AlertCircle,
      color: stats.failedToday === 0 ? "emerald" : "red",
      gradient: stats.failedToday === 0 ? "from-emerald-500 to-teal-600" : "from-red-500 to-rose-600",
      glow: stats.failedToday === 0 ? "rgba(52,211,153,0.2)" : "rgba(248,113,113,0.2)",
    },
  ];

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="max-w-6xl mx-auto space-y-8">
      {/* Title */}
      <motion.div variants={up}>
        <h1 className="text-[22px] font-bold text-slate-100" style={{ fontFamily: "Satoshi, sans-serif" }}>
          Platform Overview
        </h1>
        <p className="text-sm text-slate-600 mt-0.5">Real-time health and activity metrics</p>
      </motion.div>

      {/* Stat cards */}
      <motion.div variants={stagger} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <motion.div
              key={c.label}
              variants={up}
              className="relative rounded-2xl overflow-hidden"
              style={{
                background: "#0B0F1A",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              {/* Top accent line */}
              <div className={cn("h-[2px] w-full bg-gradient-to-r", c.gradient)} />
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-600">{c.label}</span>
                  <div
                    className="flex size-8 items-center justify-center rounded-xl"
                    style={{ background: `linear-gradient(135deg, ${c.glow.replace("0.2", "0.6")}, ${c.glow.replace("0.2", "0.3")})` }}
                  >
                    <Icon className="h-3.5 w-3.5 text-white" />
                  </div>
                </div>
                <p
                  className="text-[30px] font-bold text-slate-100 leading-none tabular-nums"
                  style={{ fontFamily: "Satoshi, sans-serif" }}
                >
                  {c.value}
                </p>
                <p className="text-[11px] text-slate-600 mt-2">{c.sub}</p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Recent Signups */}
      <motion.div
        variants={up}
        className="rounded-2xl overflow-hidden"
        style={{ background: "#0B0F1A", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
        >
          <div>
            <h2 className="text-[13px] font-bold text-slate-200">Recent Signups</h2>
            <p className="text-[11px] text-slate-600 mt-0.5">Newest users on the platform</p>
          </div>
          <Link
            href="/admin/users"
            className="flex items-center gap-1 text-[11px] font-semibold text-sky-400 hover:text-sky-300 transition-colors"
          >
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {stats.recentSignups.length === 0 ? (
          <div className="flex items-center justify-center py-14 text-slate-700 text-sm">
            No signups yet
          </div>
        ) : (
          <div>
            {stats.recentSignups.map((u, i) => (
              <div
                key={u.id}
                className="flex items-center gap-4 px-6 py-3.5 hover:bg-white/[0.02] transition-colors"
                style={{ borderTop: i === 0 ? "none" : "1px solid rgba(255,255,255,0.04)" }}
              >
                {/* Avatar */}
                <div
                  className="flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                  style={{ background: "linear-gradient(135deg, #0EA5E9, #2563EB)" }}
                >
                  {initials(u.name || u.email)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-slate-200 truncate">
                    {u.name || u.email.split("@")[0]}
                  </p>
                  <p className="text-[11px] text-slate-600 truncate">{u.email}</p>
                </div>
                <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", planStyle(u.plan))}>
                  {u.plan}
                </span>
                <span className="text-[11px] text-slate-700 w-14 text-right shrink-0">{relTime(u.createdAt)}</span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
