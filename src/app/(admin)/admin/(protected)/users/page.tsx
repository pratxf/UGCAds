"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Loader2, X, Coins, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Row = { id: string; email: string; name: string | null; credits: number; plan: string; totalAds: number; joined: string };

const PLANS = ["all", "free", "basic", "creator", "agency"];

const formatDate = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const initials = (s: string) =>
  s.split(/[ @]/).map((p) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();

function planStyle(plan: string) {
  switch (plan) {
    case "AGENCY":  return { badge: "bg-violet-500/10 text-violet-300 border-violet-500/20", dot: "bg-violet-400" };
    case "CREATOR": return { badge: "bg-sky-500/10 text-sky-300 border-sky-500/20",         dot: "bg-sky-400"    };
    case "BASIC":   return { badge: "bg-amber-500/10 text-amber-300 border-amber-500/20",   dot: "bg-amber-400"  };
    default:        return { badge: "bg-white/[0.04] text-slate-500 border-white/[0.08]",   dot: "bg-slate-600"  };
  }
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
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credits: parsed, reason: reason.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      onDone(data.newBalance);
    } catch (e) { setError(e instanceof Error ? e.message : "Failed"); setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }} onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2, ease: [0.22,1,0.36,1] }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl overflow-hidden"
        style={{ background: "#0D1120", border: "1px solid rgba(255,255,255,0.09)" }}
      >
        <div className="h-[2px] w-full bg-gradient-to-r from-sky-500 to-blue-600" />
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div>
            <h3 className="text-[14px] font-bold text-slate-100">Grant Credits</h3>
            <p className="text-[11px] text-slate-600 mt-0.5">{user.name || user.email.split("@")[0]}</p>
          </div>
          <button onClick={onClose} className="flex size-7 items-center justify-center rounded-lg text-slate-600 hover:text-slate-300 hover:bg-white/[0.05] transition">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: "rgba(14,165,233,0.06)", border: "1px solid rgba(14,165,233,0.12)" }}>
            <Coins className="h-4 w-4 text-sky-400 shrink-0" />
            <div>
              <p className="text-[10px] text-slate-600 uppercase tracking-wider font-semibold">Current Balance</p>
              <p className="text-sm font-bold text-slate-200 tabular-nums">{user.credits} credits</p>
            </div>
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1.5 block">Amount</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 50 or -10" className="w-full h-10 rounded-xl border px-3 text-sm text-slate-200 placeholder:text-slate-700 focus:outline-none transition-all" style={{ background: "#080C15", borderColor: "rgba(255,255,255,0.08)" }} onFocus={(e) => e.currentTarget.style.borderColor = "rgba(14,165,233,0.4)"} onBlur={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"} />
            {amount && !isNaN(parsed) && (
              <p className="text-[11px] mt-1.5 text-slate-600">
                New balance: <span className={cn("font-bold", parsed > 0 ? "text-emerald-400" : "text-red-400")}>{user.credits + parsed}</span>
              </p>
            )}
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1.5 block">Reason (optional)</label>
            <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Compensation for failed generation" className="w-full h-10 rounded-xl border px-3 text-sm text-slate-200 placeholder:text-slate-700 focus:outline-none transition-all" style={{ background: "#080C15", borderColor: "rgba(255,255,255,0.08)" }} onFocus={(e) => e.currentTarget.style.borderColor = "rgba(14,165,233,0.4)"} onBlur={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"} />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button onClick={submit} disabled={!valid || saving} className="w-full inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white disabled:opacity-40 transition-all" style={{ background: "linear-gradient(135deg, #0EA5E9, #2563EB)", boxShadow: valid ? "0 0 20px rgba(14,165,233,0.25)" : "none" }}>
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {saving ? "Saving..." : `${parsed > 0 ? "Add" : "Deduct"} ${Math.abs(parsed) || 0} Credits`}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [givingCredits, setGivingCredits] = useState<Row | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    const t = setTimeout(() => {
      fetch(`/api/admin/users?${new URLSearchParams({ search, plan: planFilter })}`)
        .then((r) => r.json())
        .then((d) => { if (!alive) return; setUsers(d.users || []); setTotal(d.total || 0); })
        .finally(() => alive && setLoading(false));
    }, 200);
    return () => { alive = false; clearTimeout(t); };
  }, [search, planFilter]);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.22,1,0.36,1] }} className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-slate-100" style={{ fontFamily: "Satoshi, sans-serif" }}>Users</h1>
          <p className="text-sm text-slate-600 mt-0.5">{total.toLocaleString()} total registered accounts</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-600" />
          <input
            placeholder="Search by email or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 rounded-xl pl-9 pr-3 text-sm text-slate-200 placeholder:text-slate-700 focus:outline-none transition-all"
            style={{ background: "#0B0F1A", border: "1px solid rgba(255,255,255,0.08)" }}
            onFocus={(e) => e.currentTarget.style.borderColor = "rgba(14,165,233,0.35)"}
            onBlur={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"}
          />
        </div>
        <div className="flex gap-1.5">
          {PLANS.map((p) => (
            <button key={p} onClick={() => setPlanFilter(p)} className={cn(
              "rounded-full px-3 py-1 text-[11px] font-semibold capitalize transition-all",
              planFilter === p
                ? "bg-sky-500/15 text-sky-300 border border-sky-500/30"
                : "text-slate-600 border border-white/[0.07] hover:text-slate-400 hover:border-white/[0.12]"
            )}>
              {p === "all" ? "All" : p}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "#0B0F1A", border: "1px solid rgba(255,255,255,0.07)" }}>
        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="h-4 w-4 animate-spin text-sky-400" /></div>
        ) : users.length === 0 ? (
          <div className="text-center py-16 text-sm text-slate-700">No users match this filter</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  {["User", "Plan", "Credits", "Ads Generated", "Joined", ""].map((h, i) => (
                    <th key={i} className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-700">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => {
                  const ps = planStyle(u.plan);
                  return (
                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors group" style={{ borderTop: i === 0 ? "none" : "1px solid rgba(255,255,255,0.04)" }}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ background: "linear-gradient(135deg, #0EA5E9, #2563EB)" }}>
                            {initials(u.name || u.email)}
                          </div>
                          <div>
                            <p className="text-[13px] font-semibold text-slate-200">{u.name || u.email.split("@")[0]}</p>
                            <p className="text-[11px] text-slate-600">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", ps.badge)}>
                          {u.plan}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-sm font-bold text-slate-300 tabular-nums">{u.credits}</td>
                      <td className="px-5 py-3.5 text-sm text-slate-500 tabular-nums">{u.totalAds}</td>
                      <td className="px-5 py-3.5 text-[12px] text-slate-600">{formatDate(u.joined)}</td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => setGivingCredits(u)}
                          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 hover:text-sky-300 transition-colors opacity-0 group-hover:opacity-100"
                          style={{ border: "1px solid rgba(255,255,255,0.07)" }}
                        >
                          <Coins className="h-3 w-3" /> Credits
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {givingCredits && (
        <GiveCreditsModal
          user={givingCredits}
          onClose={() => setGivingCredits(null)}
          onDone={(n) => { setUsers((p) => p.map((u) => u.id === givingCredits.id ? { ...u, credits: n } : u)); setGivingCredits(null); }}
        />
      )}
    </motion.div>
  );
}
