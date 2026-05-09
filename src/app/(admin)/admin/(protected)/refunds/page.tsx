"use client";

import { useEffect, useState } from "react";
import { Loader2, RotateCcw, AlertTriangle, CheckCircle2, X, AlertCircle } from "lucide-react";
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

function formatTime(iso: string) {
  const d = new Date(iso);
  const ms = Date.now() - d.getTime();
  const m = Math.round(ms / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

function ConfirmModal({
  title,
  description,
  confirmLabel = "Confirm",
  danger = false,
  loading = false,
  onConfirm,
  onClose,
}: {
  title: string;
  description: string;
  confirmLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0f0f14] shadow-2xl overflow-hidden">
        <div className="flex items-start gap-4 p-6">
          <div className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl mt-0.5",
            danger ? "bg-destructive/10" : "bg-primary/10"
          )}>
            {danger ? (
              <AlertCircle className="h-5 w-5 text-destructive" />
            ) : (
              <RotateCcw className="h-5 w-5 text-primary" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[15px] font-bold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{description}</p>
          </div>
          <button onClick={onClose} className="shrink-0 flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-white/5">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex gap-2 px-6 pb-6">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              "flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50",
              danger
                ? "bg-destructive text-white hover:bg-destructive/90"
                : "bg-primary text-black hover:brightness-105"
            )}
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminRefundsPage() {
  const [failed, setFailed] = useState<Row[]>([]);
  const [stuck, setStuck] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [refunding, setRefunding] = useState<string | null>(null);
  const [confirmRow, setConfirmRow] = useState<Row | null>(null);

  async function load() {
    setLoading(true);
    const r = await fetch("/api/admin/refunds").then((r) => r.json());
    setFailed(r.failed || []);
    setStuck(r.stuck || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function doRefund(id: string) {
    setRefunding(id);
    setConfirmRow(null);
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
          Failed and stuck generations. Issue manual credit refunds where needed.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <StatCard label="Failed Generations" value={failed.length} icon={AlertTriangle} tone="destructive" />
        <StatCard label="Stuck (over 30 min)" value={stuck.length} icon={Loader2} tone="warning" />
        <StatCard label="Pending Refund" value={failedNotRefunded + stuckNotRefunded} icon={RotateCcw} tone="primary" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : (
        <>
          <Section
            title="Stuck generations"
            subtitle="Older than 30 minutes and never finished. Likely pipeline delivery issues."
            rows={stuck}
            onRefund={setConfirmRow}
            refunding={refunding}
            emptyText="No stuck generations right now"
          />
          <Section
            title="Failed generations"
            subtitle="Pipeline errors. Refund users whose credits were not auto-returned."
            rows={failed}
            onRefund={setConfirmRow}
            refunding={refunding}
            emptyText="No failed generations"
          />
        </>
      )}

      {confirmRow && (
        <ConfirmModal
          title="Issue Credit Refund"
          description={`Refund ${confirmRow.creditCost ?? confirmRow.creditsUsed} credits to ${confirmRow.userEmail}? This cannot be undone.`}
          confirmLabel="Refund Credits"
          loading={refunding === confirmRow.id}
          onConfirm={() => doRefund(confirmRow.id)}
          onClose={() => setConfirmRow(null)}
        />
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
  onRefund: (row: Row) => void;
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
                    <div className="text-[13px] font-medium text-foreground">{r.userName || "—"}</div>
                    <div className="text-[11px] text-muted-foreground truncate max-w-[200px]">{r.userEmail}</div>
                  </td>
                  <td className="px-4 py-3 text-white/70 text-xs">{r.type}</td>
                  <td className="px-4 py-3 font-mono text-white/70 text-xs">
                    {r.creditCost ?? r.creditsUsed}
                  </td>
                  <td className="px-4 py-3 text-white/55 text-xs">{formatTime(r.createdAt)}</td>
                  <td className="px-4 py-3">
                    {r.refunded ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Refunded
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
                        onClick={() => onRefund(r)}
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
