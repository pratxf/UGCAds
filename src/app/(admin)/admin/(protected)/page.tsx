"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  AreaChart, Area, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import { Users, Crown, Zap, ShieldCheck, Download, TrendingUp, TrendingDown, ChevronDown } from "lucide-react";

type Stats = {
  totalUsers: number;
  usersPct: number;
  activeSubscriptions: number;
  generationsToday: number;
  generationsPct: number;
  failedToday: number;
  failedPct: number;
  totalGenerations: number;
  successRate: number;
  thisMonthRevenue: number;
  revenueChange: number;
  activityChart: { date: string; label: string; generations: number }[];
  revenueChart: { date: string; label: string; revenue: number }[];
  breakdown: { plan: string; count: number; pct: number }[];
  recentSignups: { id: string; email: string; name: string | null; plan: string; createdAt: string }[];
};

function relTime(iso: string) {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

function initials(s: string) {
  return s.split(/[ @]/).map((p) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}

function avatarColor(s: string) {
  const colors = ["#6366F1","#8B5CF6","#EC4899","#F59E0B","#10B981","#3B82F6","#14B8A6","#F97316"];
  let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % colors.length;
  return colors[h];
}

function planBadge(plan: string) {
  switch (plan) {
    case "AGENCY":  return { bg: "rgba(139,92,246,0.15)", color: "#A78BFA", text: "AGENCY" };
    case "CREATOR": return { bg: "rgba(59,130,246,0.15)", color: "#60A5FA", text: "CREATOR" };
    case "BASIC":   return { bg: "rgba(245,158,11,0.15)", color: "#FCD34D", text: "BASIC" };
    default:        return { bg: "rgba(255,255,255,0.06)", color: "#6B7280", text: "FREE" };
  }
}

const PIE_COLORS: Record<string, string> = {
  BASIC: "#6366F1", CREATOR: "#8B5CF6", AGENCY: "#A78BFA", FREE: "#374151",
};

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3 py-2 text-[12px] font-semibold" style={{ background: "#1E2A45", border: "1px solid rgba(255,255,255,0.1)", color: "#E2E8F0" }}>
      <div style={{ color: "#94A3B8" }}>{label}</div>
      <div style={{ color: "#818CF8" }}>{payload[0].value.toLocaleString()}</div>
    </div>
  );
};

const DATE_RANGE_OPTIONS = [
  { value: "7D",  label: "Last 7 Days" },
  { value: "30D", label: "Last 30 Days" },
  { value: "90D", label: "Last 90 Days" },
  { value: "1Y",  label: "Last Year" },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [activeTab, setActiveTab] = useState("30D");
  const [dateOpen, setDateOpen] = useState(false);
  const dateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/admin/stats").then((r) => r.json()).then(setStats).catch(() => {});
  }, []);

  useEffect(() => {
    if (!dateOpen) return;
    function handler(e: MouseEvent) {
      if (dateRef.current && !dateRef.current.contains(e.target as Node)) setDateOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dateOpen]);

  function exportReport(s: Stats) {
    const rows = [
      ["Metric", "Value"],
      ["Total Users", String(s.totalUsers)],
      ["Active Subscriptions", String(s.activeSubscriptions)],
      ["Total Generations", String(s.totalGenerations)],
      ["Generations Today", String(s.generationsToday)],
      ["Failed Today", String(s.failedToday)],
      ["Success Rate", `${s.successRate}%`],
      ["This Month Revenue", `$${s.thisMonthRevenue.toLocaleString()}`],
      ["Revenue Change", `${s.revenueChange >= 0 ? "+" : ""}${s.revenueChange}%`],
      [],
      ["Plan", "Count", "Percentage"],
      ...s.breakdown.map((b) => [b.plan, String(b.count), `${b.pct}%`]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "admin-report.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-8 w-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const statCards = [
    {
      label: "TOTAL USERS",
      value: stats.totalUsers.toLocaleString(),
      pct: stats.usersPct,
      sub: "vs last 30 days",
      icon: Users,
      iconBg: "rgba(99,102,241,0.2)",
      iconColor: "#818CF8",
      sparkColor: "#818CF8",
      sparkData: stats.activityChart.slice(-14).map((d) => ({ v: d.generations })),
    },
    {
      label: "ACTIVE SUBSCRIPTIONS",
      value: stats.activeSubscriptions.toLocaleString(),
      pct: null,
      sub: "currently paying",
      icon: Crown,
      iconBg: "rgba(168,85,247,0.2)",
      iconColor: "#C084FC",
      sparkColor: "#C084FC",
      sparkData: stats.activityChart.slice(-14).map((d) => ({ v: Math.max(0, d.generations - 2) })),
    },
    {
      label: "GENERATIONS TODAY",
      value: stats.generationsToday.toLocaleString(),
      pct: stats.generationsPct,
      sub: "vs yesterday",
      icon: Zap,
      iconBg: "rgba(245,158,11,0.2)",
      iconColor: "#FCD34D",
      sparkColor: "#F59E0B",
      sparkData: stats.activityChart.slice(-14).map((d) => ({ v: d.generations })),
    },
    {
      label: "FAILED TODAY",
      value: stats.failedToday.toLocaleString(),
      pct: stats.failedPct,
      sub: "vs yesterday",
      icon: ShieldCheck,
      iconBg: "rgba(16,185,129,0.2)",
      iconColor: "#34D399",
      sparkColor: "#10B981",
      sparkData: stats.activityChart.slice(-14).map((d) => ({ v: d.generations })),
    },
  ];

  const chartData = activeTab === "7D"
    ? stats.activityChart.slice(-7)
    : activeTab === "90D"
      ? stats.activityChart
      : stats.activityChart;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-3">
          <div ref={dateRef} className="relative">
            <button
              onClick={() => setDateOpen((v) => !v)}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-medium"
              style={{ background: "#0F1629", border: dateOpen ? "1px solid rgba(99,102,241,0.4)" : "1px solid rgba(255,255,255,0.08)", color: "#94A3B8" }}
            >
              <span>📅</span>
              <span>{DATE_RANGE_OPTIONS.find((o) => o.value === activeTab)?.label ?? "Last 30 Days"}</span>
              <ChevronDown className="h-3.5 w-3.5" style={{ transform: dateOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
            </button>
            {dateOpen && (
              <div
                className="absolute right-0 top-11 z-30 min-w-[160px] rounded-xl overflow-hidden"
                style={{ background: "#0F1629", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 8px 24px rgba(0,0,0,0.6)" }}
              >
                {DATE_RANGE_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    onClick={() => { setActiveTab(o.value); setDateOpen(false); }}
                    className="flex w-full items-center px-4 py-2.5 text-[13px] font-medium transition-colors"
                    style={{ color: activeTab === o.value ? "#A5B4FC" : "#94A3B8", background: activeTab === o.value ? "rgba(99,102,241,0.1)" : "transparent" }}
                    onMouseEnter={(e) => { if (activeTab !== o.value) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)"; }}
                    onMouseLeave={(e) => { if (activeTab !== o.value) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => stats && exportReport(stats)}
            disabled={!stats}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold text-white disabled:opacity-40 transition-opacity"
            style={{ background: "linear-gradient(135deg, #4F46E5, #7C3AED)" }}
          >
            <Download className="h-3.5 w-3.5" />
            Export Report
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          const isPos = (card.pct ?? 0) >= 0;
          return (
            <div key={card.label} className="rounded-2xl p-5" style={{ background: "#0F1629", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-semibold tracking-widest" style={{ color: "#475569" }}>{card.label}</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: card.iconBg }}>
                  <Icon className="h-4 w-4" style={{ color: card.iconColor }} />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[32px] font-bold text-white leading-none tabular-nums">{card.value}</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    {card.pct !== null && (
                      <>
                        {isPos ? <TrendingUp className="h-3 w-3" style={{ color: "#10B981" }} /> : <TrendingDown className="h-3 w-3" style={{ color: "#EF4444" }} />}
                        <span className="text-[11px] font-semibold" style={{ color: isPos ? "#10B981" : "#EF4444" }}>
                          {isPos ? "+" : ""}{card.pct}%
                        </span>
                      </>
                    )}
                    <span className="text-[11px]" style={{ color: "#475569" }}>{card.sub}</span>
                  </div>
                </div>
                <div style={{ width: 72, height: 36 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={card.sparkData}>
                      <Line type="monotone" dataKey="v" stroke={card.sparkColor} strokeWidth={1.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Platform Activity + Recent Signups */}
      <div className="grid grid-cols-3 gap-4">

        {/* Platform Activity Chart */}
        <div className="col-span-2 rounded-2xl p-6" style={{ background: "#0F1629", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-[15px] font-bold text-white">Platform Activity</h2>
              <div className="flex items-center gap-1 rounded-lg px-3 py-1 text-[12px] text-[#94A3B8] cursor-pointer" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                Overview ▾
              </div>
            </div>
            <div className="flex items-center gap-1 rounded-lg p-1" style={{ background: "rgba(255,255,255,0.04)" }}>
              {["7D", "30D", "90D", "1Y"].map((t) => (
                <button key={t} onClick={() => setActiveTab(t)}
                  className="rounded-md px-3 py-1 text-[12px] font-semibold transition-all"
                  style={{
                    background: activeTab === t ? "#1E2A45" : "transparent",
                    color: activeTab === t ? "#E2E8F0" : "#475569",
                    border: activeTab === t ? "1px solid rgba(255,255,255,0.1)" : "1px solid transparent",
                  }}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="actGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" tick={{ fill: "#475569", fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fill: "#475569", fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(99,102,241,0.3)", strokeWidth: 1 }} />
              <Area type="monotone" dataKey="generations" stroke="#6366F1" strokeWidth={2} fill="url(#actGrad)" dot={false} activeDot={{ r: 4, fill: "#6366F1", strokeWidth: 2, stroke: "#1E2A45" }} />
            </AreaChart>
          </ResponsiveContainer>

          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-4 mt-4 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            {[
              { label: "Users", value: stats.totalUsers.toLocaleString(), pct: `+${stats.usersPct}%`, color: "#818CF8" },
              { label: "Subscriptions", value: stats.activeSubscriptions.toLocaleString(), pct: null, color: "#C084FC" },
              { label: "Generations", value: stats.totalGenerations.toLocaleString(), pct: `+${stats.generationsPct}%`, color: "#818CF8" },
              { label: "Success Rate", value: `${stats.successRate}%`, pct: null, color: "#34D399" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-[11px]" style={{ color: "#475569" }}>{s.label}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[15px] font-bold text-white tabular-nums">{s.value}</span>
                  {s.pct && <span className="text-[11px] font-semibold" style={{ color: s.color }}>↑ {s.pct}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Signups */}
        <div className="rounded-2xl" style={{ background: "#0F1629", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <h2 className="text-[15px] font-bold text-white">Recent Signups</h2>
            <Link href="/admin/users" className="text-[12px] font-semibold" style={{ color: "#6366F1" }}>View all</Link>
          </div>
          <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
            {stats.recentSignups.map((u) => {
              const badge = planBadge(u.plan);
              const name = u.name || u.email.split("@")[0];
              return (
                <div key={u.id} className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02] transition-colors">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ background: avatarColor(u.email) }}>
                    {initials(name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-white truncate">{name}</p>
                    <p className="text-[11px] truncate" style={{ color: "#475569" }}>{u.email}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: badge.bg, color: badge.color }}>{badge.text}</span>
                    <span className="text-[10px]" style={{ color: "#334155" }}>{relTime(u.createdAt as unknown as string)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-3 gap-4">

        {/* Subscription Breakdown */}
        <div className="rounded-2xl p-6" style={{ background: "#0F1629", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-bold text-white">Subscription Breakdown</h2>
            <span className="text-[11px] rounded-lg px-2.5 py-1 cursor-pointer" style={{ background: "rgba(255,255,255,0.05)", color: "#94A3B8", border: "1px solid rgba(255,255,255,0.08)" }}>This Month ▾</span>
          </div>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={120} height={120}>
              <PieChart>
                <Pie data={stats.breakdown.length ? stats.breakdown : [{ plan: "FREE", count: 1, pct: 100 }]} dataKey="count" innerRadius={35} outerRadius={55} paddingAngle={3}>
                  {(stats.breakdown.length ? stats.breakdown : [{ plan: "FREE", count: 1, pct: 100 }]).map((entry) => (
                    <Cell key={entry.plan} fill={PIE_COLORS[entry.plan] ?? "#374151"} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 flex-1">
              {stats.breakdown.length === 0 ? (
                <p className="text-[12px]" style={{ color: "#475569" }}>No active subscriptions</p>
              ) : (
                stats.breakdown.map((b) => (
                  <div key={b.plan} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full" style={{ background: PIE_COLORS[b.plan] ?? "#374151" }} />
                      <span className="text-[12px]" style={{ color: "#94A3B8" }}>{b.plan} Plan</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-semibold text-white">{b.pct}%</span>
                      <span className="text-[11px]" style={{ color: "#475569" }}>{b.count}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Revenue Overview */}
        <div className="rounded-2xl p-6" style={{ background: "#0F1629", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[15px] font-bold text-white">Revenue Overview</h2>
            <span className="text-[11px] rounded-lg px-2.5 py-1 cursor-pointer" style={{ background: "rgba(255,255,255,0.05)", color: "#94A3B8", border: "1px solid rgba(255,255,255,0.08)" }}>This Month ▾</span>
          </div>
          <p className="text-[32px] font-bold text-white tabular-nums">${stats.thisMonthRevenue.toLocaleString()}</p>
          <div className="flex items-center gap-1 mb-4">
            {stats.revenueChange >= 0
              ? <TrendingUp className="h-3 w-3" style={{ color: "#10B981" }} />
              : <TrendingDown className="h-3 w-3" style={{ color: "#EF4444" }} />}
            <span className="text-[12px] font-semibold" style={{ color: stats.revenueChange >= 0 ? "#10B981" : "#EF4444" }}>
              {stats.revenueChange >= 0 ? "+" : ""}{stats.revenueChange}% vs last month
            </span>
          </div>
          <ResponsiveContainer width="100%" height={70}>
            <AreaChart data={stats.revenueChart} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={1.5} fill="url(#revGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* System Health */}
        <div className="rounded-2xl p-6" style={{ background: "#0F1629", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[15px] font-bold text-white">System Health</h2>
            <span style={{ color: "#10B981" }}>⚡</span>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[13px]" style={{ color: "#94A3B8" }}>All Systems Operational</span>
                <span className="text-[13px] font-bold" style={{ color: "#10B981" }}>100%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div className="h-full rounded-full" style={{ width: "100%", background: "linear-gradient(90deg, #10B981, #34D399)" }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[13px]" style={{ color: "#94A3B8" }}>Generation Success Rate</span>
                <span className="text-[13px] font-bold" style={{ color: "#10B981" }}>{stats.successRate}%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div className="h-full rounded-full" style={{ width: `${stats.successRate}%`, background: "linear-gradient(90deg, #6366F1, #8B5CF6)" }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[13px]" style={{ color: "#94A3B8" }}>Active Users Today</span>
                <span className="text-[13px] font-bold text-white">{stats.generationsToday}</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div className="h-full rounded-full" style={{ width: `${Math.min(100, (stats.generationsToday / Math.max(stats.totalUsers, 1)) * 100 * 10)}%`, background: "linear-gradient(90deg, #F59E0B, #FBBF24)" }} />
              </div>
            </div>
            <div className="pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[12px]" style={{ color: "#10B981" }}>All services running normally</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
