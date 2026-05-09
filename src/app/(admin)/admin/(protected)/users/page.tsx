"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Loader2, X, Coins } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type Row = {
  id: string;
  email: string;
  name: string | null;
  credits: number;
  plan: string;
  totalAds: number;
  joined: string;
};

const PLANS = ["all", "free", "basic", "creator", "agency"];

function planColor(plan: string) {
  switch (plan) {
    case "AGENCY": return "bg-violet-400/10 text-violet-400";
    case "CREATOR": return "bg-primary/10 text-primary";
    case "BASIC": return "bg-amber-400/10 text-amber-400";
    default: return "bg-white/5 text-white/50";
  }
}

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const initials = (s: string) =>
  s.split(/[ @]/).map((p) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();

function GiveCreditsModal({
  user,
  onClose,
  onDone,
}: {
  user: Row;
  onClose: () => void;
  onDone: (newBalance: number) => void;
}) {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const parsed = parseInt(amount, 10);
  const valid = !isNaN(parsed) && parsed !== 0;

  async function submit() {
    if (!valid) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/users/${user.id}/credits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credits: parsed, reason: reason.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      onDone(data.newBalance);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0f0f14] shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <div>
            <h3 className="text-[15px] font-bold text-foreground">Give Credits</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">{user.name || user.email.split("@")[0]}</p>
          </div>
          <button onClick={onClose} className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-white/5">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3 rounded-xl bg-white/[0.03] border border-white/[0.06] px-4 py-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
              <Coins className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">Current balance</p>
              <p className="text-sm font-bold text-foreground">{user.credits} credits</p>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-medium text-muted-foreground mb-1.5 block">
              Amount <span className="text-white/30">(use negative to deduct)</span>
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 50 or -10"
              className="w-full h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
            {amount && !isNaN(parsed) && (
              <p className="text-[11px] mt-1.5 text-muted-foreground">
                New balance: <span className={cn("font-semibold", parsed > 0 ? "text-emerald-400" : "text-destructive")}>
                  {user.credits + parsed} credits
                </span>
              </p>
            )}
          </div>

          <div>
            <label className="text-[11px] font-medium text-muted-foreground mb-1.5 block">Reason (optional)</label>
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Compensation for failed generation"
              className="w-full h-10 rounded-xl border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <button
            onClick={submit}
            disabled={!valid || saving}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-black disabled:opacity-50 hover:brightness-105 transition"
          >
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {saving ? "Saving..." : `${parsed > 0 ? "Add" : "Deduct"} ${Math.abs(parsed) || 0} Credits`}
          </button>
        </div>
      </div>
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
    const params = new URLSearchParams({ search, plan: planFilter });
    const t = setTimeout(() => {
      fetch(`/api/admin/users?${params.toString()}`)
        .then((r) => r.json())
        .then((d) => {
          if (!alive) return;
          setUsers(d.users || []);
          setTotal(d.total || 0);
        })
        .finally(() => alive && setLoading(false));
    }, 200);
    return () => { alive = false; clearTimeout(t); };
  }, [search, planFilter]);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Users</h1>
        <p className="text-sm text-muted-foreground mt-1">{total.toLocaleString()} total users</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 rounded-xl border border-border bg-card pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {PLANS.map((p) => (
            <button
              key={p}
              onClick={() => setPlanFilter(p)}
              className={cn(
                "rounded-full px-3 py-1 text-[11px] font-medium capitalize transition-all",
                planFilter === p
                  ? "bg-foreground text-background"
                  : "text-muted-foreground border border-border hover:text-foreground"
              )}
            >
              {p === "all" ? "All" : p}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16 text-sm text-muted-foreground">No users match this filter</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/[0.02] text-[11px] uppercase tracking-wider text-white/40">
                <tr>
                  <th className="text-left px-5 py-3 font-medium">User</th>
                  <th className="text-left px-5 py-3 font-medium">Plan</th>
                  <th className="text-left px-5 py-3 font-medium hidden md:table-cell">Credits</th>
                  <th className="text-left px-5 py-3 font-medium hidden md:table-cell">Ads</th>
                  <th className="text-left px-5 py-3 font-medium hidden lg:table-cell">Joined</th>
                  <th className="text-right px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-border hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8">
                          <AvatarFallback className="text-[10px]">{initials(u.name || u.email)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-[13px] font-medium text-foreground">{u.name || u.email.split("@")[0]}</p>
                          <p className="text-[11px] text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <Badge className={cn("text-[10px]", planColor(u.plan))}>{u.plan}</Badge>
                    </td>
                    <td className="px-5 py-3 text-foreground hidden md:table-cell font-mono text-sm">{u.credits}</td>
                    <td className="px-5 py-3 text-foreground hidden md:table-cell">{u.totalAds}</td>
                    <td className="px-5 py-3 text-muted-foreground hidden lg:table-cell">{formatDate(u.joined)}</td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => setGivingCredits(u)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] px-2.5 py-1.5 text-[11px] font-medium text-white/70 hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition"
                      >
                        <Coins className="h-3.5 w-3.5" />
                        Credits
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {givingCredits && (
        <GiveCreditsModal
          user={givingCredits}
          onClose={() => setGivingCredits(null)}
          onDone={(newBalance) => {
            setUsers((prev) => prev.map((u) => u.id === givingCredits.id ? { ...u, credits: newBalance } : u));
            setGivingCredits(null);
          }}
        />
      )}
    </motion.div>
  );
}
