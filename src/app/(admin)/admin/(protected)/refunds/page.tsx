"use client";

import { useEffect, useState } from "react";
import { Loader2, RotateCcw, AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Row = {
  id: string;
  type: string;
  status?: string;
  creditCost: number;
  creditsUsed: number;
  errorMessage?: string | null;
  createdAt: string;
  userEmail: string;
  userName: string | null;
  refunded: boolean;
};

const formatCredits = (units: number) => {
  const n = units / 10;
  return n % 1 === 0 ? String(n) : n.toFixed(1);
};

const formatTime = (iso: string) => {
  const date = new Date(iso);
  const ageMs = Date.now() - date.getTime();
  const ageMin = Math.round(ageMs / 60000);
  if (ageMin < 60) return `${ageMin}m ago`;
  const h = Math.round(ageMin / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return `${d}d ago`;
};

export default function AdminRefundsPage() {
  const [failed, setFailed] = useState<Row[]>([]);
  const [stuck, setStuck] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [refunding, setRefunding] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const r = await fetch("/api/admin/refunds").then((r) => r.json());
    setFailed(r.failed || []);
    setStuck(r.stuck || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function refund(id: string) {
    if (!confirm("Refund credits for this generation?")) return;
    setRefunding(id);
    try {
      const res = await fetch("/api/admin/refunds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ generationId: id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Refund failed");
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Refund failed");
    } finally {
      setRefunding(null);
    }
  }

  const failedNotRefunded = failed.filter((r) => !r.refunded).length;
  const stuckNotRefunded = stuck.filter((r) => !r.refunded).length;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Refunds</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Failed and stuck generations. Issue manual refunds where needed.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <StatCard label="Failed" value={failed.length} icon={AlertTriangle} tone="destructive" />
        <StatCard label="Stuck (>30 min)" value={stuck.length} icon={Loader2} tone="warning" />
        <StatCard label="Pending refund" value={failedNotRefunded + stuckNotRefunded} icon={RotateCcw} tone="primary" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : (
        <>
          <Section
            title="Stuck generations"
            subtitle="Older than 30 minutes and never finished. Likely Inngest delivery issues."
            rows={stuck}
            onRefund={refund}
            refunding={refunding}
            emptyText="No stuck generations 🎉"
          />
          <Section
            title="Failed generations"
            subtitle="Pipeline errors. Refund users whose credits weren't auto-refunded."
            rows={failed}
            onRefund={refund}
            refunding={refunding}
            emptyText="No failed generations"
          />
        </>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: typeof RotateCcw;
  tone: "destructive" | "warning" | "primary";
}) {
  const colors = {
    destructive: "text-destructive bg-destructive/10",
    warning: "text-amber-400 bg-amber-400/10",
    primary: "text-primary bg-primary/10",
  }[tone];
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-muted-foreground">{label}</span>
        <div className={cn("flex size-8 items-center justify-center rounded-xl", colors)}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="text-3xl font-bold text-foreground">{value}</p>
    </div>
  );
}

function Section({
  title,
  subtitle,
  rows,
  onRefund,
  refunding,
  emptyText,
}: {
  title: string;
  subtitle: string;
  rows: Row[];
  onRefund: (id: string) => void;
  refunding: string | null;
  emptyText: string;
}) {
  return (
    <section>
      <div className="mb-3">
        <h2 className="text-sm font-bold text-foreground">{title}</h2>
        <p className="text-[12px] text-muted-foreground mt-0.5">{subtitle}</p>
      </div>
      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          {emptyText}
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.02] text-[11px] uppercase tracking-wider text-white/40">
              <tr>
                <th className="text-left px-4 py-3 font-medium">User</th>
                <th className="text-left px-4 py-3 font-medium">Type</th>
                <th className="text-left px-4 py-3 font-medium">Credits</th>
                <th className="text-left px-4 py-3 font-medium">Age</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-right px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-border hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <div className="text-foreground">{r.userName || "—"}</div>
                    <div className="text-[11px] text-muted-foreground truncate max-w-[200px]">{r.userEmail}</div>
                  </td>
                  <td className="px-4 py-3 text-white/70">{r.type}</td>
                  <td className="px-4 py-3 font-mono text-white/70">
                    {formatCredits(r.creditCost ?? r.creditsUsed)}
                  </td>
                  <td className="px-4 py-3 text-white/55">{formatTime(r.createdAt)}</td>
                  <td className="px-4 py-3">
                    {r.refunded ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Refunded
                      </span>
                    ) : r.status ? (
                      <span className="text-[11px] text-amber-400">{r.status}</span>
                    ) : (
                      <span className="text-[11px] text-destructive">FAILED</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {r.refunded ? (
                      <span className="text-[11px] text-white/30">—</span>
                    ) : (
                      <button
                        onClick={() => onRefund(r.id)}
                        disabled={refunding === r.id}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 border border-primary/30 px-3 py-1.5 text-[11px] font-semibold text-primary hover:bg-primary/20 transition disabled:opacity-50"
                      >
                        {refunding === r.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <RotateCcw className="h-3.5 w-3.5" />
                        )}
                        Refund
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
