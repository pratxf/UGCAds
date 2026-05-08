"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

type Row = {
  id: string;
  type: string;
  status: string;
  creditCost: number;
  creditsUsed: number;
  aiModel: string | null;
  userEmail: string;
  userName: string | null;
  createdAt: string;
};

const STATUS_FILTERS = ["all", "complete", "pending", "failed"];
const TYPE_FILTERS = ["all", "ugc", "product", "photoshoot", "tryon"];

const TYPE_LABEL: Record<string, string> = {
  UGC_AD: "UGC",
  PRODUCT_AD: "Product",
  PRODUCT_PHOTOSHOOT: "Photoshoot",
  MOCKUP: "Photoshoot",
  TRYON: "Try-On",
};

const TYPE_TONE: Record<string, string> = {
  UGC_AD: "bg-primary/10 text-primary",
  PRODUCT_AD: "bg-violet/10 text-violet",
  PRODUCT_PHOTOSHOOT: "bg-amber/10 text-amber",
  MOCKUP: "bg-amber/10 text-amber",
  TRYON: "bg-emerald-400/10 text-emerald-400",
};

function statusTone(s: string) {
  if (s === "COMPLETED") return "bg-emerald-400/10 text-emerald-400";
  if (s === "FAILED") return "bg-destructive/10 text-destructive";
  return "bg-amber-400/10 text-amber-400";
}

const formatTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const formatCredits = (units: number) => {
  return String(units);
};

const initials = (s: string) =>
  s
    .split(/[ @]/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

export default function AdminGenerationsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");

  useEffect(() => {
    let alive = true;
    setLoading(true);
    const params = new URLSearchParams({ status, type });
    fetch(`/api/admin/generations?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        setRows(d.generations || []);
        setTotal(d.total || 0);
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [status, type]);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Generations</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {total.toLocaleString()} total · all generations across the platform
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <FilterRow label="Status" options={STATUS_FILTERS} value={status} onChange={setStatus} />
        <FilterRow label="Type" options={TYPE_FILTERS} value={type} onChange={setType} />
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : rows.length === 0 ? (
          <div className="text-center py-16 text-sm text-muted-foreground">No generations match this filter</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/[0.02] text-[11px] uppercase tracking-wider text-white/40">
                <tr>
                  <th className="text-left px-5 py-3 font-medium">User</th>
                  <th className="text-left px-5 py-3 font-medium">Type</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                  <th className="text-left px-5 py-3 font-medium hidden md:table-cell">Model</th>
                  <th className="text-left px-5 py-3 font-medium">Credits</th>
                  <th className="text-left px-5 py-3 font-medium hidden lg:table-cell">Created</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-border hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8">
                          <AvatarFallback className="text-[10px]">
                            {initials(r.userName || r.userEmail)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-[13px] font-medium text-foreground">
                            {r.userName || r.userEmail.split("@")[0]}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate max-w-[200px]">{r.userEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <Badge className={cn("text-[10px]", TYPE_TONE[r.type] || "bg-muted text-muted-foreground")}>
                        {TYPE_LABEL[r.type] || r.type}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      <Badge className={cn("text-[10px]", statusTone(r.status))}>{r.status}</Badge>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground hidden md:table-cell font-mono text-[11px]">
                      {r.aiModel || "—"}
                    </td>
                    <td className="px-5 py-3 font-mono text-foreground">
                      {formatCredits(r.creditCost ?? r.creditsUsed)}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground hidden lg:table-cell">{formatTime(r.createdAt)}</td>
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

function FilterRow({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-white/40">{label}:</span>
      <div className="flex gap-1.5 flex-wrap">
        {options.map((o) => (
          <button
            key={o}
            onClick={() => onChange(o)}
            className={cn(
              "rounded-full px-3 py-1 text-[11px] font-medium capitalize transition-all",
              value === o
                ? "bg-foreground text-background"
                : "text-muted-foreground border border-border hover:text-foreground"
            )}
          >
            {o === "all" ? "All" : o}
          </button>
        ))}
      </div>
    </div>
  );
}
