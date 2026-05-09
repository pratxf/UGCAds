"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Row = { id: string; type: string; status: string; creditCost: number; creditsUsed: number; aiModel: string | null; userEmail: string; userName: string | null; createdAt: string };

const TYPE_LABEL: Record<string, string> = { UGC_AD: "UGC",  PRODUCT_AD: "Product", PRODUCT_PHOTOSHOOT: "Photoshoot", MOCKUP: "Photoshoot", TRYON: "Try-On" };
const TYPE_TONE: Record<string, string> = {
  UGC_AD:             "bg-sky-500/10 text-sky-300 border-sky-500/20",
  PRODUCT_AD:         "bg-violet-500/10 text-violet-300 border-violet-500/20",
  PRODUCT_PHOTOSHOOT: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  MOCKUP:             "bg-amber-500/10 text-amber-300 border-amber-500/20",
  TRYON:              "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
};

function statusStyle(s: string) {
  if (s === "COMPLETED") return "bg-emerald-500/10 text-emerald-300 border-emerald-500/20";
  if (s === "FAILED")    return "bg-red-500/10 text-red-300 border-red-500/20";
  return "bg-amber-500/10 text-amber-300 border-amber-500/20";
}

const fmtTime = (iso: string) => new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
const initials = (s: string) => s.split(/[ @]/).map((p) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();

const STATUS_FILTERS = ["all", "complete", "pending", "failed"];
const TYPE_FILTERS   = ["all", "ugc", "product", "photoshoot", "tryon"];

export default function AdminGenerationsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetch(`/api/admin/generations?${new URLSearchParams({ status, type })}`)
      .then((r) => r.json())
      .then((d) => { if (!alive) return; setRows(d.generations || []); setTotal(d.total || 0); })
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [status, type]);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.22,1,0.36,1] }} className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-[22px] font-bold text-slate-100" style={{ fontFamily: "Satoshi, sans-serif" }}>Generations</h1>
        <p className="text-sm text-slate-600 mt-0.5">{total.toLocaleString()} total generations across the platform</p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <FilterRow label="Status" options={STATUS_FILTERS} value={status} onChange={setStatus} />
        <FilterRow label="Type"   options={TYPE_FILTERS}   value={type}   onChange={setType}   />
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: "#0B0F1A", border: "1px solid rgba(255,255,255,0.07)" }}>
        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="h-4 w-4 animate-spin text-sky-400" /></div>
        ) : rows.length === 0 ? (
          <div className="text-center py-16 text-sm text-slate-700">No generations match this filter</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  {["User", "Type", "Status", "Model", "Credits", "Created"].map((h, i) => (
                    <th key={i} className={cn("text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-700", i > 3 && "hidden md:table-cell", i === 5 && "hidden lg:table-cell")}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.id} className="hover:bg-white/[0.02] transition-colors" style={{ borderTop: i === 0 ? "none" : "1px solid rgba(255,255,255,0.04)" }}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ background: "linear-gradient(135deg, #0EA5E9, #2563EB)" }}>
                          {initials(r.userName || r.userEmail)}
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold text-slate-200">{r.userName || r.userEmail.split("@")[0]}</p>
                          <p className="text-[11px] text-slate-600 truncate max-w-[160px]">{r.userEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", TYPE_TONE[r.type] || "bg-white/[0.04] text-slate-500 border-white/[0.08]")}>
                        {TYPE_LABEL[r.type] || r.type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", statusStyle(r.status))}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[11px] text-slate-600 font-mono hidden md:table-cell">{r.aiModel || "—"}</td>
                    <td className="px-5 py-3.5 text-sm font-bold text-slate-300 tabular-nums hidden md:table-cell">{r.creditCost ?? r.creditsUsed}</td>
                    <td className="px-5 py-3.5 text-[12px] text-slate-600 hidden lg:table-cell">{fmtTime(r.createdAt)}</td>
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

function FilterRow({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600 shrink-0">{label}</span>
      <div className="flex gap-1.5">
        {options.map((o) => (
          <button key={o} onClick={() => onChange(o)} className={cn(
            "rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize transition-all",
            value === o
              ? "bg-sky-500/15 text-sky-300 border border-sky-500/30"
              : "text-slate-600 border border-white/[0.07] hover:text-slate-400"
          )}>
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}
