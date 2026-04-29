"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Loader2 } from "lucide-react";
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
    case "AGENCY": return "bg-violet/10 text-violet";
    case "CREATOR": return "bg-primary/10 text-primary";
    case "BASIC": return "bg-amber/10 text-amber";
    default: return "bg-muted text-muted-foreground";
  }
}

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const formatCredits = (units: number) => {
  const n = units / 10;
  return n % 1 === 0 ? String(n) : n.toFixed(1);
};

const initials = (s: string) =>
  s
    .split(/[ @]/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("all");

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
    return () => {
      alive = false;
      clearTimeout(t);
    };
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
            className="w-full h-9 rounded-xl border border-border bg-card pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
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
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-border hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8">
                          <AvatarFallback className="text-[10px]">
                            {initials(u.name || u.email)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-[13px] font-medium text-foreground">
                            {u.name || u.email.split("@")[0]}
                          </p>
                          <p className="text-[11px] text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <Badge className={cn("text-[10px]", planColor(u.plan))}>{u.plan}</Badge>
                    </td>
                    <td className="px-5 py-3 text-foreground hidden md:table-cell font-mono">{formatCredits(u.credits)}</td>
                    <td className="px-5 py-3 text-foreground hidden md:table-cell">{u.totalAds}</td>
                    <td className="px-5 py-3 text-muted-foreground hidden lg:table-cell">{formatDate(u.joined)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
}
