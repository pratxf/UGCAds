"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSetTopbarRight } from "@/app/(admin)/_components/AdminTopbarContext";
import {
  Loader2, AlertTriangle, Clock, CheckCircle2, Copy, RotateCcw,
  ChevronLeft, ChevronRight, Download, XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type FailedRow = {
  id: string;
  type: string;
  creditsUsed: number;
  errorMessage?: string | null;
  createdAt: string;
  userEmail: string;
  userName: string | null;
  refunded: boolean;
};

type StuckRow = {
  id: string;
  type: string;
  status: string;
  creditsUsed: number;
  createdAt: string;
  userEmail: string;
  userName: string | null;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const AVATAR_COLORS = ["#6366F1", "#8B5CF6", "#EC4899", "#F59E0B", "#10B981", "#3B82F6"];

function avatarColor(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

function initials(name: string | null, email: string) {
  const src = name || email;
  return src
    .split(/[\s@.]/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function genId(id: string) {
  const short = id.replace(/-/g, "").slice(-10).toUpperCase();
  return `#GEN-${short}`;
}

function relativeTime(iso: string) {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

function absDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function dateRange() {
  const end = new Date();
  const start = new Date(end);
  start.setDate(end.getDate() - 7);
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return `${fmt(start)} — ${fmt(end)}`;
}

// ---------------------------------------------------------------------------
// Type badge config
// ---------------------------------------------------------------------------
const TYPE_BADGE: Record<string, { label: string; style: string }> = {
  UGC_AD:             { label: "UGC_AD",    style: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20" },
  PRODUCT_PHOTOSHOOT: { label: "PHOTOSHOOT",style: "bg-amber-500/10 text-amber-300 border-amber-500/20" },
  MOCKUP:             { label: "PHOTOSHOOT",style: "bg-amber-500/10 text-amber-300 border-amber-500/20" },
  TRYON:              { label: "TRYON",     style: "bg-teal-500/10 text-teal-300 border-teal-500/20" },
};

function TypeBadge({ type }: { type: string }) {
  const cfg = TYPE_BADGE[type] ?? { label: type, style: "bg-white/[0.06] text-slate-400 border-white/[0.08]" };
  return (
    <span className={cn("inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border tracking-wide", cfg.style)}>
      {cfg.label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Stat Card
// ---------------------------------------------------------------------------
type StatColor = "red" | "amber" | "blue";
const STAT_STYLES: Record<StatColor, { gradient: string; glow: string; iconText: string; pctText: string }> = {
  red:   { gradient: "from-red-500 to-rose-600",    glow: "rgba(239,68,68,0.15)",  iconText: "text-red-400",   pctText: "text-red-400" },
  amber: { gradient: "from-amber-500 to-orange-500",glow: "rgba(245,158,11,0.15)", iconText: "text-amber-400", pctText: "text-amber-400" },
  blue:  { gradient: "from-blue-500 to-indigo-600", glow: "rgba(96,165,250,0.15)", iconText: "text-blue-400",  pctText: "text-blue-400" },
};

function StatCard({
  label, subtitle, value, icon: Icon, color, pctBadge, pctLabel,
}: {
  label: string;
  subtitle: string;
  value: number;
  icon: typeof AlertTriangle;
  color: StatColor;
  pctBadge?: string;
  pctLabel?: string;
}) {
  const s = STAT_STYLES[color];
  return (
    <div className="rounded-2xl overflow-hidden relative" style={{ background: "#0F1629", border: "1px solid rgba(255,255,255,0.07)" }}>
      <div className={cn("h-[2px] bg-gradient-to-r", s.gradient)} />
      <div className="p-5">
        {/* top row */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-xl" style={{ background: s.glow }}>
              <Icon className={cn("h-4 w-4", s.iconText)} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</span>
          </div>
          {pctBadge && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(239,68,68,0.12)", color: "#EF4444" }}>
              {pctBadge}
            </span>
          )}
        </div>
        {/* value */}
        <p className="text-[36px] font-bold text-slate-100 tabular-nums leading-none mb-1" style={{ fontFamily: "Satoshi, sans-serif" }}>
          {value}
        </p>
        <p className="text-[11px] text-slate-600 mb-4">{subtitle}</p>
        {/* bottom */}
        {pctLabel && (
          <p className="text-[11px]" style={{ color: color === "amber" ? "#F59E0B" : color === "blue" ? "#60A5FA" : "#EF4444" }}>
            {pctLabel}
          </p>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Copy button
// ---------------------------------------------------------------------------
function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function handle() {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  return (
    <button
      onClick={handle}
      title="Copy ID"
      className="ml-1.5 inline-flex items-center justify-center rounded-md p-0.5 transition hover:bg-white/[0.08]"
      style={{ color: copied ? "#10B981" : "#4B5563" }}
    >
      {copied ? <CheckCircle2 className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Avatar circle
// ---------------------------------------------------------------------------
function Avatar({ name, email }: { name: string | null; email: string }) {
  return (
    <div
      className="flex size-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
      style={{ background: avatarColor(email) }}
    >
      {initials(name, email)}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Confirm Modal (no framer-motion)
// ---------------------------------------------------------------------------
type ConfirmTarget = { id: string; creditsUsed: number; userEmail: string; isStuck?: boolean };

function ConfirmModal({
  row, loading, onConfirm, onClose,
}: {
  row: ConfirmTarget;
  loading: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const isStuck = row.isStuck;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl overflow-hidden"
        style={{ background: "#0F1629", border: "1px solid rgba(255,255,255,0.09)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-[2px] w-full" style={{ background: isStuck ? "linear-gradient(135deg, #F59E0B, #EF4444)" : "linear-gradient(135deg, #6366F1, #8B5CF6)" }} />
        <div className="p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl" style={{ background: isStuck ? "rgba(239,68,68,0.12)" : "rgba(99,102,241,0.12)" }}>
              {isStuck ? <XCircle className="h-5 w-5 text-red-400" /> : <RotateCcw className="h-5 w-5 text-indigo-400" />}
            </div>
            <div>
              <h3 className="text-[14px] font-bold text-slate-100">{isStuck ? "Cancel & Refund Generation" : "Issue Credit Refund"}</h3>
              <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
                {isStuck ? "This will mark the generation as failed and refund " : "Refund "}
                <span className="font-semibold text-slate-300">{row.creditsUsed} credits</span> to{" "}
                <span className="font-semibold text-slate-300">{row.userEmail}</span>. This cannot be undone.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-300 transition"
              style={{ border: "1px solid rgba(255,255,255,0.08)" }}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white disabled:opacity-40 transition"
              style={{
                background: isStuck ? "linear-gradient(135deg, #F59E0B, #EF4444)" : "linear-gradient(135deg, #6366F1, #8B5CF6)",
                boxShadow: isStuck ? "0 0 20px rgba(239,68,68,0.3)" : "0 0 20px rgba(99,102,241,0.3)",
              }}
            >
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {isStuck ? "Cancel & Refund" : "Refund Credits"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stuck Generations section
// ---------------------------------------------------------------------------
function StuckSection({
  rows, onCancel, cancelling,
}: {
  rows: StuckRow[];
  onCancel: (r: StuckRow) => void;
  cancelling: string | null;
}) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "#0F1629", border: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div>
          <h2 className="text-[14px] font-bold text-slate-100">Stuck Generations</h2>
          <p className="text-[11px] text-slate-600 mt-0.5">Generations that have been processing for too long.</p>
        </div>
        {rows.length > 0 && (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full"
            style={{ background: "rgba(245,158,11,0.1)", color: "#F59E0B", border: "1px solid rgba(245,158,11,0.2)" }}>
            {rows.length} stuck
          </span>
        )}
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl" style={{ background: "rgba(16,185,129,0.1)" }}>
            <CheckCircle2 className="h-6 w-6 text-emerald-400" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-300">No stuck generations right now</p>
            <p className="text-[11px] text-slate-600 mt-1">All generations are running smoothly.</p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                {["USER", "GENERATION ID", "TYPE", "CREDITS", "AGE", "STATUS", "ACTIONS"].map((h, i) => (
                  <th key={i} className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-600">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr
                  key={r.id}
                  className="hover:bg-white/[0.02] transition-colors"
                  style={{ borderTop: i === 0 ? "none" : "1px solid rgba(255,255,255,0.04)" }}
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar name={r.userName} email={r.userEmail} />
                      <div>
                        <p className="text-[13px] font-semibold text-slate-200">{r.userName || r.userEmail.split("@")[0]}</p>
                        <p className="text-[11px] text-slate-600 truncate max-w-[160px]">{r.userEmail}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center">
                      <span className="text-[12px] font-mono text-slate-400">{genId(r.id)}</span>
                      <CopyBtn text={r.id} />
                    </div>
                  </td>
                  <td className="px-5 py-3.5"><TypeBadge type={r.type} /></td>
                  <td className="px-5 py-3.5 text-sm font-bold text-slate-300 tabular-nums">{r.creditsUsed}</td>
                  <td className="px-5 py-3.5">
                    <p className="text-[12px] font-semibold text-slate-400">{relativeTime(r.createdAt)}</p>
                    <p className="text-[10px] text-slate-600 mt-0.5">{absDate(r.createdAt)}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-[11px] font-semibold text-amber-400">{r.status}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => onCancel(r)}
                      disabled={cancelling === r.id}
                      className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-bold text-white disabled:opacity-40 transition hover:opacity-90"
                      style={{ background: "linear-gradient(135deg, #F59E0B, #EF4444)" }}
                    >
                      {cancelling === r.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <XCircle className="h-3 w-3" />
                      )}
                      Cancel & Refund
                    </button>
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

// ---------------------------------------------------------------------------
// Failed Generations section
// ---------------------------------------------------------------------------
const PAGE_SIZE = 10;

function FailedSection({
  rows, onRefund, refunding,
}: {
  rows: FailedRow[];
  onRefund: (r: FailedRow) => void;
  refunding: string | null;
}) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const slice = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // reset to page 1 when rows change
  useEffect(() => setPage(1), [rows.length]);

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "#0F1629", border: "1px solid rgba(255,255,255,0.07)" }}>
      {/* header */}
      <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div>
          <h2 className="text-[14px] font-bold text-slate-100">Failed Generations</h2>
          <p className="text-[11px] text-slate-600 mt-0.5">Pipeline errors requiring manual review and refund.</p>
        </div>
        <span
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full"
          style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.2)" }}
        >
          Status: Failed
        </span>
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl" style={{ background: "rgba(16,185,129,0.1)" }}>
            <CheckCircle2 className="h-6 w-6 text-emerald-400" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-300">No failed generations</p>
            <p className="text-[11px] text-slate-600 mt-1">Everything is running without errors.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  {["USER", "GENERATION ID", "TYPE", "CREDITS", "AGE", "ERROR", "STATUS", "ACTIONS"].map((h, i) => (
                    <th key={i} className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-600">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {slice.map((r, i) => (
                  <tr
                    key={r.id}
                    className="hover:bg-white/[0.02] transition-colors"
                    style={{ borderTop: i === 0 ? "none" : "1px solid rgba(255,255,255,0.04)" }}
                  >
                    {/* USER */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={r.userName} email={r.userEmail} />
                        <div>
                          <p className="text-[13px] font-semibold text-slate-200">{r.userName || r.userEmail.split("@")[0]}</p>
                          <p className="text-[11px] text-slate-600 truncate max-w-[140px]">{r.userEmail}</p>
                        </div>
                      </div>
                    </td>

                    {/* GENERATION ID */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center">
                        <span className="text-[12px] font-mono text-slate-400">{genId(r.id)}</span>
                        <CopyBtn text={r.id} />
                      </div>
                    </td>

                    {/* TYPE */}
                    <td className="px-5 py-3.5"><TypeBadge type={r.type} /></td>

                    {/* CREDITS */}
                    <td className="px-5 py-3.5 text-sm font-bold text-slate-300 tabular-nums">{r.creditsUsed}</td>

                    {/* AGE */}
                    <td className="px-5 py-3.5">
                      <p className="text-[12px] font-semibold text-slate-400">{relativeTime(r.createdAt)}</p>
                      <p className="text-[10px] text-slate-600 mt-0.5">{absDate(r.createdAt)}</p>
                    </td>

                    {/* ERROR */}
                    <td className="px-5 py-3.5 max-w-[200px]">
                      {r.errorMessage ? (
                        <>
                          <p className="text-[12px] font-semibold text-red-400 truncate">{r.errorMessage}</p>
                          <p className="text-[10px] text-slate-600 mt-0.5">Generation pipeline error</p>
                        </>
                      ) : (
                        <span className="text-[11px] text-slate-700">No error details</span>
                      )}
                    </td>

                    {/* STATUS */}
                    <td className="px-5 py-3.5">
                      {r.refunded ? (
                        <span
                          className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full"
                          style={{ background: "rgba(16,185,129,0.1)", color: "#10B981", border: "1px solid rgba(16,185,129,0.2)" }}
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          Refunded
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full"
                          style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.2)" }}
                        >
                          Needs Refund
                        </span>
                      )}
                    </td>

                    {/* ACTIONS */}
                    <td className="px-5 py-3.5">
                      {!r.refunded && (
                        <button
                          onClick={() => onRefund(r)}
                          disabled={refunding === r.id}
                          className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-bold text-white disabled:opacity-40 transition hover:opacity-90"
                          style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
                        >
                          {refunding === r.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <RotateCcw className="h-3 w-3" />
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div
              className="flex items-center justify-between px-5 py-3"
              style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
            >
              <p className="text-[11px] text-slate-600">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, rows.length)} of {rows.length}
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex size-7 items-center justify-center rounded-lg text-slate-500 disabled:opacity-30 hover:text-slate-300 transition"
                  style={{ border: "1px solid rgba(255,255,255,0.07)" }}
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={cn(
                      "flex size-7 items-center justify-center rounded-lg text-[11px] font-semibold transition",
                      n === page
                        ? "text-white"
                        : "text-slate-600 hover:text-slate-300"
                    )}
                    style={
                      n === page
                        ? { background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }
                        : { border: "1px solid rgba(255,255,255,0.07)" }
                    }
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex size-7 items-center justify-center rounded-lg text-slate-500 disabled:opacity-30 hover:text-slate-300 transition"
                  style={{ border: "1px solid rgba(255,255,255,0.07)" }}
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function AdminRefundsPage() {
  const [failed, setFailed] = useState<FailedRow[]>([]);
  const [stuck, setStuck] = useState<StuckRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refunding, setRefunding] = useState<string | null>(null);
  const [confirmRow, setConfirmRow] = useState<ConfirmTarget | null>(null);
  const setTopbarRight = useSetTopbarRight();
  const exportCsvRef = useRef<() => void>(() => {});
  useEffect(() => {
    setTopbarRight(
      <button
        onClick={() => exportCsvRef.current()}
        className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition"
        style={{ background: "#0F1629", border: "1px solid rgba(255,255,255,0.08)", color: "#94A3B8" }}
      >
        <Download className="h-4 w-4" /> Export CSV
      </button>
    );
    return () => setTopbarRight(null);
  }, [setTopbarRight]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetch("/api/admin/refunds").then((r) => r.json());
      setFailed(data.failed || []);
      setStuck(data.stuck || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function doRefund(id: string) {
    setRefunding(id);
    setConfirmRow(null);
    try {
      const res = await fetch("/api/admin/refunds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ generationId: id }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Refund failed");
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Refund failed");
    } finally {
      setRefunding(null);
    }
  }

  const pendingRefund = [...failed, ...(stuck as unknown as FailedRow[])].filter((r) => !r.refunded).length;

  function exportCsv() {
    const headers = ["Type", "Generation ID", "User Email", "User Name", "Credits", "Age", "Error", "Status"];
    const failedRows = failed.map((r) => [
      "Failed", genId(r.id), r.userEmail, r.userName || "",
      String(r.creditsUsed), absDate(r.createdAt), r.errorMessage || "", r.refunded ? "Refunded" : "Needs Refund",
    ]);
    const stuckRows = stuck.map((r) => [
      "Stuck", genId(r.id), r.userEmail, r.userName || "",
      String(r.creditsUsed), absDate(r.createdAt), "", r.status,
    ]);
    const csv = [headers, ...failedRows, ...stuckRows].map((row) => row.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "refunds.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  exportCsvRef.current = exportCsv;

  return (
    <div className="max-w-6xl mx-auto space-y-8">

      {/* ---- Stat Cards ---- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Failed Generations"
          subtitle="Require manual refund"
          value={failed.length}
          icon={AlertTriangle}
          color="red"
          pctBadge={failed.length > 0 ? `+${failed.length}` : undefined}
          pctLabel={`${failed.length > 0 ? "+" + failed.length : "0%"} vs last 7 days`}
        />
        <StatCard
          label="Stuck Over 30 Min"
          subtitle="Needs attention"
          value={stuck.length}
          icon={Clock}
          color="amber"
          pctLabel="0% vs last 7 days"
        />
        <StatCard
          label="Pending Refund"
          subtitle="In review"
          value={pendingRefund}
          icon={Clock}
          color="blue"
          pctLabel={`${pendingRefund > 0 ? "+" + pendingRefund : "0%"} vs last 7 days`}
        />
      </div>

      {/* ---- Body ---- */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-5 w-5 animate-spin text-indigo-400" />
        </div>
      ) : (
        <div className="space-y-6">
          <StuckSection rows={stuck} onCancel={(r) => setConfirmRow({ ...r, isStuck: true })} cancelling={refunding} />
          <FailedSection rows={failed} onRefund={(r) => setConfirmRow(r)} refunding={refunding} />
        </div>
      )}

      {/* ---- Confirm Modal ---- */}
      {confirmRow && (
        <ConfirmModal
          row={confirmRow}
          loading={refunding === confirmRow.id}
          onConfirm={() => doRefund(confirmRow.id)}
          onClose={() => setConfirmRow(null)}
        />
      )}
    </div>
  );
}
