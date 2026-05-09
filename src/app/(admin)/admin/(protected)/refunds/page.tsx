"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, RotateCcw, AlertTriangle, CheckCircle2, X, AlertCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

type Row = {
  id: string; type: string; status?: string; creditCost: number; creditsUsed: number;
  errorMessage?: string | null; createdAt: string; userEmail: string; userName: string | null; refunded: boolean;
};

function fmtTime(iso: string) {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  return h < 24 ? `${h}h ago` : `${Math.round(h / 24)}d ago`;
}

function ConfirmModal({ title, description, loading, onConfirm, onClose }: { title: string; description: string; loading: boolean; onConfirm: () => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }} onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.2, ease: [0.22,1,0.36,1] as any }} onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-2xl overflow-hidden" style={{ background: "#0D1120", border: "1px solid rgba(255,255,255,0.09)" }}>
        <div className="h-[2px] w-full bg-gradient-to-r from-sky-500 to-blue-600" />
        <div className="p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl" style={{ background: "rgba(14,165,233,0.1)" }}>
              <RotateCcw className="h-5 w-5 text-sky-400" />
            </div>
            <div>
              <h3 className="text-[14px] font-bold text-slate-100">{title}</h3>
              <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">{description}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-300 transition" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>Cancel</button>
            <button onClick={onConfirm} disabled={loading} className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white disabled:opacity-40 transition" style={{ background: "linear-gradient(135deg, #0EA5E9, #2563EB)", boxShadow: "0 0 20px rgba(14,165,233,0.25)" }}>
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Refund Credits
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: typeof RotateCcw; color: "red" | "amber" | "sky" }) {
  const styles = {
    red:   { gradient: "from-red-500 to-rose-600",    glow: "rgba(248,113,113,0.15)",  text: "text-red-400"   },
    amber: { gradient: "from-amber-500 to-orange-600",glow: "rgba(245,158,11,0.15)",   text: "text-amber-400" },
    sky:   { gradient: "from-sky-500 to-blue-600",    glow: "rgba(14,165,233,0.15)",   text: "text-sky-400"   },
  }[color];
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "#0B0F1A", border: "1px solid rgba(255,255,255,0.07)" }}>
      <div className={cn("h-[2px] bg-gradient-to-r", styles.gradient)} />
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">{label}</span>
          <div className="flex size-8 items-center justify-center rounded-xl" style={{ background: styles.glow }}>
            <Icon className={cn("h-3.5 w-3.5", styles.text)} />
          </div>
        </div>
        <p className="text-[30px] font-bold text-slate-100 tabular-nums" style={{ fontFamily: "Satoshi, sans-serif" }}>{value}</p>
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
    setFailed(r.failed || []); setStuck(r.stuck || []); setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function doRefund(id: string) {
    setRefunding(id); setConfirmRow(null);
    try {
      const res = await fetch("/api/admin/refunds", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ generationId: id }) });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      await load();
    } catch (e) { alert(e instanceof Error ? e.message : "Refund failed"); }
    finally { setRefunding(null); }
  }

  const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
  const up = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22,1,0.36,1] as any } } };

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="max-w-6xl mx-auto space-y-8">
      <motion.div variants={up}>
        <h1 className="text-[22px] font-bold text-slate-100" style={{ fontFamily: "Satoshi, sans-serif" }}>Refunds</h1>
        <p className="text-sm text-slate-600 mt-0.5">Failed and stuck generations requiring manual credit refunds</p>
      </motion.div>

      <motion.div variants={up} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Failed Generations"  value={failed.length}                                                        icon={AlertTriangle} color="red"   />
        <StatCard label="Stuck Over 30 min"   value={stuck.length}                                                         icon={Clock}         color="amber" />
        <StatCard label="Pending Refund"      value={[...failed,...stuck].filter((r)=>!r.refunded).length}                 icon={RotateCcw}     color="sky"   />
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="h-4 w-4 animate-spin text-sky-400" /></div>
      ) : (
        <motion.div variants={up} className="space-y-8">
          <RefundSection title="Stuck Generations" subtitle="Older than 30 minutes, never completed" rows={stuck} onRefund={setConfirmRow} refunding={refunding} emptyText="No stuck generations right now" />
          <RefundSection title="Failed Generations" subtitle="Pipeline errors requiring manual review" rows={failed} onRefund={setConfirmRow} refunding={refunding} emptyText="No failed generations" />
        </motion.div>
      )}

      {confirmRow && (
        <ConfirmModal
          title="Issue Credit Refund"
          description={`Refund ${confirmRow.creditCost ?? confirmRow.creditsUsed} credits to ${confirmRow.userEmail}? This cannot be undone.`}
          loading={refunding === confirmRow.id}
          onConfirm={() => doRefund(confirmRow.id)}
          onClose={() => setConfirmRow(null)}
        />
      )}
    </motion.div>
  );
}

function RefundSection({ title, subtitle, rows, onRefund, refunding, emptyText }: {
  title: string; subtitle: string; rows: Row[];
  onRefund: (r: Row) => void; refunding: string | null; emptyText: string;
}) {
  return (
    <div>
      <div className="mb-3">
        <h2 className="text-[13px] font-bold text-slate-200">{title}</h2>
        <p className="text-[11px] text-slate-600 mt-0.5">{subtitle}</p>
      </div>
      {rows.length === 0 ? (
        <div className="rounded-2xl flex items-center justify-center py-12 text-sm text-slate-700" style={{ border: "1px dashed rgba(255,255,255,0.07)" }}>
          {emptyText}
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: "#0B0F1A", border: "1px solid rgba(255,255,255,0.07)" }}>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                {["User", "Type", "Credits", "Age", "Status", ""].map((h, i) => (
                  <th key={i} className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-700">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.id} className="hover:bg-white/[0.02] transition-colors" style={{ borderTop: i === 0 ? "none" : "1px solid rgba(255,255,255,0.04)" }}>
                  <td className="px-5 py-3.5">
                    <p className="text-[13px] font-semibold text-slate-200">{r.userName || "—"}</p>
                    <p className="text-[11px] text-slate-600 truncate max-w-[180px]">{r.userEmail}</p>
                  </td>
                  <td className="px-5 py-3.5 text-[12px] text-slate-500">{r.type}</td>
                  <td className="px-5 py-3.5 text-sm font-bold text-slate-300 tabular-nums">{r.creditCost ?? r.creditsUsed}</td>
                  <td className="px-5 py-3.5 text-[12px] text-slate-600">{fmtTime(r.createdAt)}</td>
                  <td className="px-5 py-3.5">
                    {r.refunded ? (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Refunded
                      </span>
                    ) : r.status ? (
                      <span className="text-[11px] font-semibold text-amber-400">{r.status}</span>
                    ) : (
                      <span className="text-[11px] font-semibold text-red-400">FAILED</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {!r.refunded && (
                      <button onClick={() => onRefund(r)} disabled={refunding === r.id} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold text-sky-300 disabled:opacity-40 transition-all hover:text-sky-200" style={{ background: "rgba(14,165,233,0.08)", border: "1px solid rgba(14,165,233,0.2)" }}>
                        {refunding === r.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <RotateCcw className="h-3 w-3" />}
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
    </div>
  );
}
