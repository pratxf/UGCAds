"use client";

import { useEffect, useState } from "react";
import { Search, Download, ChevronLeft, ChevronRight, X, Coins } from "lucide-react";

type Row = {
  id: string; email: string; name: string | null;
  credits: number; plan: string; status: string;
  totalAds: number; joined: string;
};

type Stats = {
  totalUsers: number; freeUsers: number; paidUsers: number; creatorUsers: number;
};

const PLAN_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  FREE:    { bg: "rgba(255,255,255,0.06)", color: "#9CA3AF", border: "rgba(255,255,255,0.1)" },
  BASIC:   { bg: "rgba(59,130,246,0.15)",  color: "#60A5FA", border: "rgba(59,130,246,0.3)" },
  CREATOR: { bg: "rgba(139,92,246,0.15)",  color: "#A78BFA", border: "rgba(139,92,246,0.3)" },
  AGENCY:  { bg: "rgba(245,158,11,0.15)",  color: "#FCD34D", border: "rgba(245,158,11,0.3)" },
};

const AVATAR_COLORS = ["#6366F1","#8B5CF6","#EC4899","#F59E0B","#10B981","#3B82F6","#14B8A6","#F97316","#EF4444","#06B6D4"];

function avatarColor(s: string) {
  let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[h];
}

function initials(s: string) {
  return s.split(/[ @]/).map((p) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}

function role(plan: string) {
  if (plan === "AGENCY") return "Agency";
  if (plan === "CREATOR") return "Creator";
  return "User";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

function GiveCreditsModal({ user, onClose, onDone }: { user: Row; onClose: () => void; onDone: (n: number) => void }) {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const parsed = parseInt(amount, 10);
  const valid = !isNaN(parsed) && parsed !== 0;

  async function submit() {
    if (!valid) return;
    setSaving(true); setError("");
    try {
      const res = await fetch(`/api/admin/users/${user.id}/credits`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credits: parsed, reason: reason.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      onDone(data.newBalance);
    } catch (e) { setError(e instanceof Error ? e.message : "Failed"); setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.8)" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-2xl overflow-hidden" style={{ background: "#0F1629", border: "1px solid rgba(255,255,255,0.1)" }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div>
            <h3 className="text-[14px] font-bold text-white">Grant Credits</h3>
            <p className="text-[11px] mt-0.5" style={{ color: "#475569" }}>{user.name || user.email.split("@")[0]}</p>
          </div>
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-white/[0.05] transition" style={{ color: "#475569" }}>
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)" }}>
            <Coins className="h-4 w-4 shrink-0" style={{ color: "#818CF8" }} />
            <div>
              <p className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: "#475569" }}>Current Balance</p>
              <p className="text-sm font-bold text-white tabular-nums">{user.credits} credits</p>
            </div>
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: "#475569" }}>Amount</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 50 or -10"
              className="w-full h-10 rounded-xl px-3 text-sm text-white outline-none transition-all"
              style={{ background: "#080C18", border: "1px solid rgba(255,255,255,0.08)" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(99,102,241,0.5)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
            />
            {amount && !isNaN(parsed) && (
              <p className="text-[11px] mt-1.5" style={{ color: "#475569" }}>
                New balance: <span style={{ color: parsed > 0 ? "#10B981" : "#EF4444", fontWeight: 700 }}>{user.credits + parsed}</span>
              </p>
            )}
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: "#475569" }}>Reason (optional)</label>
            <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Compensation"
              className="w-full h-10 rounded-xl px-3 text-sm text-white outline-none transition-all"
              style={{ background: "#080C18", border: "1px solid rgba(255,255,255,0.08)" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(99,102,241,0.5)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
            />
          </div>
          {error && <p className="text-xs" style={{ color: "#EF4444" }}>{error}</p>}
          <button onClick={submit} disabled={!valid || saving}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white disabled:opacity-40 transition-all"
            style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}>
            {saving ? "Saving..." : `${parsed > 0 ? "Add" : "Deduct"} ${Math.abs(parsed) || 0} Credits`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Row[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [givingCredits, setGivingCredits] = useState<Row | null>(null);
  const pageSize = 50;

  function exportCsv() {
    const headers = ["Name", "Email", "Plan", "Credits", "Ads Generated", "Joined", "Status"];
    const rows = users.map((u) => [
      u.name || "", u.email, u.plan, String(u.credits), String(u.totalAds), formatDate(u.joined), u.status,
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "users.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  useEffect(() => {
    let alive = true;
    setLoading(true);
    const t = setTimeout(() => {
      fetch(`/api/admin/users?${new URLSearchParams({ search, plan: planFilter, page: String(page) })}`)
        .then((r) => r.json())
        .then((d) => {
          if (!alive) return;
          setUsers(d.users || []);
          setTotal(d.total || 0);
          if (d.totalUsers !== undefined) {
            setStats({ totalUsers: d.totalUsers, freeUsers: d.freeUsers, paidUsers: d.paidUsers, creatorUsers: d.creatorUsers });
          }
        })
        .finally(() => alive && setLoading(false));
    }, 200);
    return () => { alive = false; clearTimeout(t); };
  }, [search, planFilter, page]);

  const totalPages = Math.ceil(total / pageSize);

  const statCards = stats ? [
    { label: "Total Users",  value: stats.totalUsers,   color: "#818CF8", icon: "👥", change: "+12.5%" },
    { label: "Free Users",   value: stats.freeUsers,    color: "#60A5FA", icon: "👑", change: "+8.2%"  },
    { label: "Paid Users",   value: stats.paidUsers,    color: "#34D399", icon: "⭐", change: "+18.7%" },
    { label: "Creators",     value: stats.creatorUsers, color: "#FCD34D", icon: "🎨", change: "+5.3%"  },
  ] : [];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-end">
        <button onClick={exportCsv} className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold transition hover:text-white" style={{ background: "#0F1629", border: "1px solid rgba(255,255,255,0.08)", color: "#94A3B8" }}>
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      {/* Stat Cards */}
      {stats && (
        <div className="grid grid-cols-4 gap-4">
          {statCards.map((c) => (
            <div key={c.label} className="rounded-2xl p-5" style={{ background: "#0F1629", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[13px]" style={{ color: "#64748B" }}>{c.label}</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl text-lg" style={{ background: "rgba(99,102,241,0.1)" }}>{c.icon}</div>
              </div>
              <p className="text-[28px] font-bold text-white tabular-nums">{c.value.toLocaleString()}</p>
              <p className="text-[12px] mt-1 font-semibold" style={{ color: "#10B981" }}>↑ {c.change} vs last 30 days</p>
            </div>
          ))}
        </div>
      )}

      {/* Table Card */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "#0F1629", border: "1px solid rgba(255,255,255,0.07)" }}>

        {/* Filters */}
        <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: "#475569" }} />
            <input placeholder="Search by name or email..."
              value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full h-9 rounded-xl pl-9 pr-3 text-[13px] text-white outline-none transition-all"
              style={{ background: "#080C18", border: "1px solid rgba(255,255,255,0.08)" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(99,102,241,0.4)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
            />
          </div>
          {["all","free","basic","creator","agency"].map((p) => (
            <button key={p} onClick={() => { setPlanFilter(p); setPage(1); }}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold capitalize transition-all"
              style={{
                background: planFilter === p ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.04)",
                color: planFilter === p ? "#818CF8" : "#475569",
                border: `1px solid ${planFilter === p ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.06)"}`,
              }}>
              {p === "all" ? "Plan ▾" : p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-6 w-6 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16 text-[13px]" style={{ color: "#475569" }}>No users found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  {["USER", "PLAN", "ROLE", "CREDITS", "ADS GENERATED", "JOINED", "STATUS", "ACTIONS"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-[10px] font-bold tracking-widest" style={{ color: "#334155" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => {
                  const planStyle = PLAN_COLORS[u.plan] || PLAN_COLORS.FREE;
                  const isActive = u.status === "Active";
                  return (
                    <tr key={u.id} className="group transition-colors" style={{ borderTop: i === 0 ? "none" : "1px solid rgba(255,255,255,0.04)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ background: avatarColor(u.email) }}>
                            {initials(u.name || u.email)}
                          </div>
                          <div>
                            <p className="text-[13px] font-semibold text-white">{u.name || u.email.split("@")[0]}</p>
                            <p className="text-[11px]" style={{ color: "#475569" }}>{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ background: planStyle.bg, color: planStyle.color, border: `1px solid ${planStyle.border}` }}>
                          {u.plan}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-[13px]" style={{ color: "#94A3B8" }}>{role(u.plan)}</td>
                      <td className="px-5 py-3.5 text-[13px] font-bold text-white tabular-nums">{u.credits.toLocaleString()}</td>
                      <td className="px-5 py-3.5 text-[13px] tabular-nums" style={{ color: "#94A3B8" }}>{u.totalAds.toLocaleString()}</td>
                      <td className="px-5 py-3.5 text-[12px]" style={{ color: "#64748B" }}>{formatDate(u.joined)}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <div className="h-1.5 w-1.5 rounded-full" style={{ background: isActive ? "#10B981" : "#EF4444" }} />
                          <span className="text-[12px] font-semibold" style={{ color: isActive ? "#10B981" : "#EF4444" }}>{u.status}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <button onClick={() => setGivingCredits(u)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                          style={{ background: "rgba(255,255,255,0.06)", color: "#94A3B8" }}>
                          <span className="text-[14px]">···</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {total > 0 && (
          <div className="flex items-center justify-between px-5 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-[12px]" style={{ color: "#475569" }}>
              Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, total)} of {total.toLocaleString()} users
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg disabled:opacity-30 transition"
                style={{ background: "rgba(255,255,255,0.04)", color: "#94A3B8", border: "1px solid rgba(255,255,255,0.06)" }}>
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = i + 1;
                return (
                  <button key={p} onClick={() => setPage(p)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-[12px] font-semibold transition"
                    style={{
                      background: page === p ? "linear-gradient(135deg, #6366F1, #8B5CF6)" : "rgba(255,255,255,0.04)",
                      color: page === p ? "#fff" : "#475569",
                      border: `1px solid ${page === p ? "transparent" : "rgba(255,255,255,0.06)"}`,
                    }}>
                    {p}
                  </button>
                );
              })}
              {totalPages > 5 && <span className="text-[12px] px-1" style={{ color: "#334155" }}>...</span>}
              {totalPages > 5 && (
                <button onClick={() => setPage(totalPages)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[12px] font-semibold transition"
                  style={{ background: page === totalPages ? "linear-gradient(135deg,#6366F1,#8B5CF6)" : "rgba(255,255,255,0.04)", color: page === totalPages ? "#fff" : "#475569", border: "1px solid rgba(255,255,255,0.06)" }}>
                  {totalPages}
                </button>
              )}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-lg disabled:opacity-30 transition"
                style={{ background: "rgba(255,255,255,0.04)", color: "#94A3B8", border: "1px solid rgba(255,255,255,0.06)" }}>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {givingCredits && (
        <GiveCreditsModal user={givingCredits} onClose={() => setGivingCredits(null)}
          onDone={(n) => { setUsers((p) => p.map((u) => u.id === givingCredits.id ? { ...u, credits: n } : u)); setGivingCredits(null); }} />
      )}
    </div>
  );
}
