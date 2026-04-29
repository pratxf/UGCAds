"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Users, CreditCard, Film, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type Stats = {
  totalUsers: number;
  activeSubscriptions: number;
  generationsToday: number;
  totalGenerations: number;
  failedToday: number;
  recentSignups: {
    id: string;
    email: string;
    name: string | null;
    plan: string;
    createdAt: string;
  }[];
};

const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };
const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

function planColor(plan: string) {
  switch (plan) {
    case "AGENCY": return "bg-violet/10 text-violet";
    case "CREATOR": return "bg-primary/10 text-primary";
    case "BASIC": return "bg-amber/10 text-amber";
    default: return "bg-muted text-muted-foreground";
  }
}

function relativeTime(iso: string) {
  const d = new Date(iso);
  const m = Math.round((Date.now() - d.getTime()) / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => setStats(null));
  }, []);

  if (!stats) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  const cards: { label: string; value: string; sub: string; icon: typeof Users; tone: string }[] = [
    {
      label: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      sub: "all-time signups",
      icon: Users,
      tone: "text-primary bg-primary/10",
    },
    {
      label: "Active Subscriptions",
      value: stats.activeSubscriptions.toLocaleString(),
      sub: "currently paying",
      icon: CreditCard,
      tone: "text-violet bg-violet/10",
    },
    {
      label: "Generations Today",
      value: stats.generationsToday.toLocaleString(),
      sub: `${stats.totalGenerations.toLocaleString()} total`,
      icon: Film,
      tone: "text-amber bg-amber/10",
    },
    {
      label: "Failed Today",
      value: stats.failedToday.toLocaleString(),
      sub: stats.failedToday === 0 ? "all clear" : "needs attention",
      icon: AlertCircle,
      tone:
        stats.failedToday === 0
          ? "text-emerald-400 bg-emerald-400/10"
          : "text-destructive bg-destructive/10",
    },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="max-w-7xl mx-auto space-y-8">
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold text-foreground">Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">Real-time platform health.</p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={container} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <motion.div
              key={c.label}
              variants={fadeUp}
              className="rounded-2xl border border-border bg-card p-5 hover:border-white/15 transition-colors"
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

      {/* Recent signups */}
      <motion.div variants={fadeUp} className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-foreground">Recent Signups</h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">Latest users to join</p>
          </div>
          <Link
            href="/admin/users"
            className="text-[11px] font-semibold text-primary hover:underline"
          >
            View all →
          </Link>
        </div>
        {stats.recentSignups.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No signups yet</p>
        ) : (
          <div className="space-y-1">
            {stats.recentSignups.map((u) => {
              const initials = (u.name || u.email)
                .split(/[ @]/)
                .map((s) => s[0])
                .filter(Boolean)
                .slice(0, 2)
                .join("")
                .toUpperCase();
              return (
                <div
                  key={u.id}
                  className="flex items-center gap-3 rounded-xl px-2.5 py-2.5 hover:bg-white/[0.02] transition-colors"
                >
                  <Avatar className="size-8">
                    <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-foreground truncate">
                      {u.name || u.email.split("@")[0]}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">{u.email}</p>
                  </div>
                  <Badge className={cn("text-[10px]", planColor(u.plan))}>{u.plan}</Badge>
                  <span className="text-[11px] text-white/40 w-16 text-right">
                    {relativeTime(u.createdAt)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
