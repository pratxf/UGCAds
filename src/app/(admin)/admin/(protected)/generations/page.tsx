"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSetTopbarRight } from "@/app/(admin)/_components/AdminTopbarContext";
import {
  Clapperboard,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  ChevronDown,
  Download,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Generation = {
  id: string;
  type: string;
  status: string;
  creditsUsed: number;
  aiModel: string | null;
  userEmail: string;
  userName: string | null;
  createdAt: string;
};

type ApiResponse = {
  generations: Generation[];
  total: number;
  page: number;
  pageSize: number;
};

type StatCounts = {
  total: number;
  completed: number;
  pending: number;
  failed: number;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  "#6366F1",
  "#8B5CF6",
  "#EC4899",
  "#F59E0B",
  "#10B981",
  "#3B82F6",
];

const TYPE_LABEL: Record<string, string> = {
  UGC_AD: "UGC",
  PRODUCT_AD: "Photoshoot",
  PRODUCT_PHOTOSHOOT: "Photoshoot",
  MOCKUP: "Photoshoot",
  TRYON: "Try-On",
};

const TYPE_STYLE: Record<string, { bg: string; text: string; border: string }> = {
  UGC_AD: {
    bg: "rgba(99,102,241,0.12)",
    text: "#A5B4FC",
    border: "rgba(99,102,241,0.25)",
  },
  PRODUCT_AD: {
    bg: "rgba(245,158,11,0.12)",
    text: "#FCD34D",
    border: "rgba(245,158,11,0.25)",
  },
  PRODUCT_PHOTOSHOOT: {
    bg: "rgba(245,158,11,0.12)",
    text: "#FCD34D",
    border: "rgba(245,158,11,0.25)",
  },
  MOCKUP: {
    bg: "rgba(245,158,11,0.12)",
    text: "#FCD34D",
    border: "rgba(245,158,11,0.25)",
  },
  TRYON: {
    bg: "rgba(20,184,166,0.12)",
    text: "#5EEAD4",
    border: "rgba(20,184,166,0.25)",
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function modelLabel(raw: string | null): string {
  if (!raw) return "—";
  const r = raw.toLowerCase();
  if (r.includes("seedance-2")) return "Seedance 2 Fast";
  if (r.includes("sora-2")) return "Sora 2";
  if (r.includes("kling")) return "Kling 3.0";
  if (r.includes("seedream/v4.5") || r.includes("seedream-4") || r.includes("seedream/v4") || r.includes("seedream-4.5")) return "Seedream V4.5";
  if (r.includes("seedream/v5") || r.includes("seedream-5") || r.includes("seedream-5-lite")) return "Seedream V5 Lite";
  if (r.includes("nano-banana")) return "Nano Banana 2";
  if (r.includes("gpt-image-2")) return "GPT Image 2";
  if (r.includes("flux-2-pro") || r.includes("flux-2")) return "Flux 2 Pro";
  if (r.includes("veo")) return "Veo 3.1";
  return raw;
}

function genNumber(id: string): string {
  const last6 = id.replace(/-/g, "").slice(-6);
  const num = parseInt(last6, 36) % 1000000;
  return "#GEN-" + String(num).padStart(6, "0");
}

function avatarColor(email: string): string {
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = (hash * 31 + email.charCodeAt(i)) >>> 0;
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function initials(name: string | null, email: string): string {
  const src = name || email;
  return src
    .split(/[\s@._-]/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function fmtDate(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  return { date, time };
}

function statusStyle(s: string): { bg: string; text: string; border: string; dot: string } {
  if (s === "COMPLETED")
    return { bg: "rgba(16,185,129,0.12)", text: "#6EE7B7", border: "rgba(16,185,129,0.25)", dot: "#10B981" };
  if (s === "FAILED")
    return { bg: "rgba(239,68,68,0.12)", text: "#FCA5A5", border: "rgba(239,68,68,0.25)", dot: "#EF4444" };
  return { bg: "rgba(245,158,11,0.12)", text: "#FCD34D", border: "rgba(245,158,11,0.25)", dot: "#F59E0B" };
}

function statusLabel(s: string): string {
  if (s === "COMPLETED") return "Completed";
  if (s === "FAILED") return "Failed";
  return "Pending";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  subtitle,
  barColor,
  barPct,
  iconBg,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  subtitle: string;
  barColor: string;
  barPct: number;
  iconBg: string;
}) {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-3"
      style={{
        background: "#0F1629",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div className="flex items-start justify-between">
        <div
          className="flex size-10 items-center justify-center rounded-xl"
          style={{ background: iconBg }}
        >
          {icon}
        </div>
        <span className="text-[11px] font-semibold" style={{ color: barColor }}>
          {barPct.toFixed(0)}%
        </span>
      </div>
      <div>
        <p className="text-2xl font-bold text-white tabular-nums">
          {value.toLocaleString()}
        </p>
        <p className="text-[13px] font-medium mt-0.5" style={{ color: "#94A3B8" }}>
          {label}
        </p>
      </div>
      <div>
        <div
          className="h-1.5 rounded-full overflow-hidden"
          style={{ background: "rgba(255,255,255,0.06)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${barPct}%`, background: barColor }}
          />
        </div>
        <p className="text-[11px] mt-1.5" style={{ color: "#64748B" }}>
          {subtitle}
        </p>
      </div>
    </div>
  );
}

function SelectDropdown({
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-xl pl-3 pr-2.5 py-2 text-[13px] font-medium"
        style={{
          background: "#0F1629",
          border: open ? "1px solid rgba(99,102,241,0.4)" : "1px solid rgba(255,255,255,0.1)",
          color: "#CBD5E1",
        }}
      >
        {selected?.label}
        <ChevronDown size={12} style={{ color: "#64748B", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
      </button>
      {open && (
        <div
          className="absolute left-0 top-10 z-30 min-w-[140px] rounded-xl overflow-hidden"
          style={{
            background: "#0F1629",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
          }}
        >
          {options.map((o) => (
            <button
              key={o.value}
              onClick={() => { onChange(o.value); setOpen(false); }}
              className="flex w-full items-center px-3 py-2.5 text-[12px] font-medium transition-colors"
              style={{
                color: value === o.value ? "#A5B4FC" : "#94A3B8",
                background: value === o.value ? "rgba(99,102,241,0.1)" : "transparent",
              }}
              onMouseEnter={(e) => { if (value !== o.value) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)"; }}
              onMouseLeave={(e) => { if (value !== o.value) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminGenerationsPage() {
  const [rows, setRows] = useState<Generation[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [stats, setStats] = useState<StatCounts>({
    total: 0,
    completed: 0,
    pending: 0,
    failed: 0,
  });

  const setTopbarRight = useSetTopbarRight();
  const exportCsvRef = useRef<() => void>(() => {});
  useEffect(() => {
    setTopbarRight(
      <button
        onClick={() => exportCsvRef.current()}
        className="flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-semibold transition-colors"
        style={{ background: "#0F1629", border: "1px solid rgba(255,255,255,0.1)", color: "#94A3B8" }}
      >
        <Download size={14} /> Export CSV
      </button>
    );
    return () => setTopbarRight(null);
  }, [setTopbarRight]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [statusFilter, typeFilter, debouncedSearch]);

  // Fetch main data
  useEffect(() => {
    let alive = true;
    setLoading(true);
    const params = new URLSearchParams({
      status: statusFilter,
      type: typeFilter,
      page: String(page),
    });
    if (debouncedSearch) params.set("search", debouncedSearch);

    fetch(`/api/admin/generations?${params}`)
      .then((r) => r.json())
      .then((d: ApiResponse) => {
        if (!alive) return;
        setRows(d.generations || []);
        setTotal(d.total || 0);
        setPageSize(d.pageSize || 20);
      })
      .catch(() => {
        if (!alive) return;
        setRows([]);
        setTotal(0);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [statusFilter, typeFilter, page, debouncedSearch]);

  // Fetch stat counts
  const fetchStats = useCallback(() => {
    setStatsLoading(true);
    const base = "/api/admin/generations";
    Promise.all([
      fetch(`${base}?status=all&page=1`).then((r) => r.json()),
      fetch(`${base}?status=complete&page=1`).then((r) => r.json()),
      fetch(`${base}?status=pending&page=1`).then((r) => r.json()),
      fetch(`${base}?status=failed&page=1`).then((r) => r.json()),
    ])
      .then(([all, completed, pending, failed]: [ApiResponse, ApiResponse, ApiResponse, ApiResponse]) => {
        setStats({
          total: all.total || 0,
          completed: completed.total || 0,
          pending: pending.total || 0,
          failed: failed.total || 0,
        });
      })
      .catch(() => {})
      .finally(() => setStatsLoading(false));
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function exportCsv() {
    const headers = ["Generation ID", "User Email", "User Name", "Type", "Model", "Status", "Credits", "Created"];
    const csvRows = rows.map((r) => [
      genNumber(r.id), r.userEmail, r.userName || "", TYPE_LABEL[r.type] || r.type,
      modelLabel(r.aiModel), statusLabel(r.status), String(r.creditsUsed ?? 0),
      new Date(r.createdAt).toLocaleDateString("en-US"),
    ]);
    const csv = [headers, ...csvRows].map((row) => row.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "generations.csv"; a.click();
    URL.revokeObjectURL(url);
  }
  const completedPct = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
  const pendingPct = stats.total > 0 ? (stats.pending / stats.total) * 100 : 0;
  const failedPct = stats.total > 0 ? (stats.failed / stats.total) * 100 : 0;

  exportCsvRef.current = exportCsv;

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            icon={<Clapperboard size={18} color="#A5B4FC" />}
            iconBg="rgba(99,102,241,0.15)"
            label="Total Generations"
            value={statsLoading ? 0 : stats.total}
            subtitle="All time across all types"
            barColor="#6366F1"
            barPct={statsLoading ? 0 : 100}
          />
          <StatCard
            icon={<CheckCircle2 size={18} color="#6EE7B7" />}
            iconBg="rgba(16,185,129,0.15)"
            label="Completed"
            value={statsLoading ? 0 : stats.completed}
            subtitle={`${completedPct.toFixed(1)}% success rate`}
            barColor="#10B981"
            barPct={statsLoading ? 0 : completedPct}
          />
          <StatCard
            icon={<Clock size={18} color="#FCD34D" />}
            iconBg="rgba(245,158,11,0.15)"
            label="Pending"
            value={statsLoading ? 0 : stats.pending}
            subtitle="Awaiting processing"
            barColor="#F59E0B"
            barPct={statsLoading ? 0 : pendingPct}
          />
          <StatCard
            icon={<XCircle size={18} color="#FCA5A5" />}
            iconBg="rgba(239,68,68,0.15)"
            label="Failed"
            value={statsLoading ? 0 : stats.failed}
            subtitle="Require attention"
            barColor="#EF4444"
            barPct={statsLoading ? 0 : failedPct}
          />
        </div>

        {/* Table Card */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "#0F1629",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          {/* Filters */}
          <div
            className="flex flex-wrap items-center gap-3 px-5 py-4"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-[320px]">
              <Search
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: "#64748B" }}
              />
              <input
                type="text"
                placeholder="Search generations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl pl-8 pr-3 py-2 text-[13px] outline-none placeholder:text-[#475569]"
                style={{
                  background: "#080C18",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#CBD5E1",
                }}
              />
            </div>

            {/* Status dropdown */}
            <SelectDropdown
              label="Status"
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: "all", label: "All Status" },
                { value: "complete", label: "Completed" },
                { value: "pending", label: "Pending" },
                { value: "failed", label: "Failed" },
              ]}
            />

            {/* Type dropdown */}
            <SelectDropdown
              label="Type"
              value={typeFilter}
              onChange={setTypeFilter}
              options={[
                { value: "all", label: "All Types" },
                { value: "ugc", label: "UGC" },
                { value: "photoshoot", label: "Photoshoot" },
                { value: "tryon", label: "Try-On" },
              ]}
            />

            <div className="ml-auto text-[12px]" style={{ color: "#475569" }}>
              {total.toLocaleString()} result{total !== 1 ? "s" : ""}
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div
                className="h-5 w-5 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: "rgba(99,102,241,0.3)", borderTopColor: "#6366F1" }}
              />
            </div>
          ) : rows.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-20 gap-3"
            >
              <Clapperboard size={32} style={{ color: "#1E293B" }} />
              <p className="text-sm" style={{ color: "#475569" }}>
                No generations match this filter
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    {[
                      "Generation",
                      "User",
                      "Type",
                      "Model",
                      "Status",
                      "Credits",
                      "Created",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left px-5 py-3"
                        style={{
                          fontSize: "10px",
                          fontWeight: 700,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          color: "#475569",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => {
                    const ss = statusStyle(row.status);
                    const ts = TYPE_STYLE[row.type] || {
                      bg: "rgba(255,255,255,0.04)",
                      text: "#94A3B8",
                      border: "rgba(255,255,255,0.08)",
                    };
                    const ac = avatarColor(row.userEmail);
                    const { date, time } = fmtDate(row.createdAt);
                    const isHovered = hoveredRow === row.id;

                    return (
                      <tr
                        key={row.id}
                        onMouseEnter={() => setHoveredRow(row.id)}
                        onMouseLeave={() => setHoveredRow(null)}
                        style={{
                          borderTop: i === 0 ? "none" : "1px solid rgba(255,255,255,0.04)",
                          background: isHovered ? "rgba(255,255,255,0.02)" : "transparent",
                          transition: "background 0.15s",
                        }}
                      >
                        {/* GENERATION */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div
                              className="flex size-9 shrink-0 items-center justify-center rounded-xl"
                              style={{
                                background: "rgba(99,102,241,0.12)",
                                border: "1px solid rgba(99,102,241,0.2)",
                              }}
                            >
                              <Clapperboard size={15} style={{ color: "#A5B4FC" }} />
                            </div>
                            <div>
                              <p
                                className="text-[12px] font-mono font-semibold"
                                style={{ color: "#CBD5E1" }}
                              >
                                {genNumber(row.id)}
                              </p>
                              <p
                                className="text-[11px] mt-0.5 truncate max-w-[120px]"
                                style={{ color: "#475569" }}
                              >
                                {modelLabel(row.aiModel)}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* USER */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="flex size-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                              style={{ background: ac }}
                            >
                              {initials(row.userName, row.userEmail)}
                            </div>
                            <div>
                              <p
                                className="text-[13px] font-semibold"
                                style={{ color: "#E2E8F0" }}
                              >
                                {row.userName || row.userEmail.split("@")[0]}
                              </p>
                              <p
                                className="text-[11px] truncate max-w-[160px]"
                                style={{ color: "#475569" }}
                              >
                                {row.userEmail}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* TYPE */}
                        <td className="px-5 py-3.5">
                          <span
                            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                            style={{
                              background: ts.bg,
                              color: ts.text,
                              border: `1px solid ${ts.border}`,
                            }}
                          >
                            {TYPE_LABEL[row.type] || row.type}
                          </span>
                        </td>

                        {/* MODEL */}
                        <td className="px-5 py-3.5">
                          <span
                            className="text-[12px] font-medium"
                            style={{ color: "#94A3B8" }}
                          >
                            {modelLabel(row.aiModel)}
                          </span>
                        </td>

                        {/* STATUS */}
                        <td className="px-5 py-3.5">
                          <span
                            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                            style={{
                              background: ss.bg,
                              color: ss.text,
                              border: `1px solid ${ss.border}`,
                            }}
                          >
                            <span
                              className="inline-block size-1.5 rounded-full"
                              style={{ background: ss.dot }}
                            />
                            {statusLabel(row.status)}
                          </span>
                        </td>

                        {/* CREDITS */}
                        <td className="px-5 py-3.5">
                          <span
                            className="text-[13px] font-bold tabular-nums"
                            style={{ color: "#CBD5E1" }}
                          >
                            {row.creditsUsed ?? 0}
                          </span>
                        </td>

                        {/* CREATED */}
                        <td className="px-5 py-3.5">
                          <p className="text-[12px]" style={{ color: "#94A3B8" }}>
                            {date}
                          </p>
                          <p className="text-[11px] mt-0.5" style={{ color: "#475569" }}>
                            {time}
                          </p>
                        </td>

                        {/* ACTIONS */}
                        <td className="px-5 py-3.5">
                          <button
                            className="flex size-7 items-center justify-center rounded-lg transition-colors"
                            style={{
                              background: isHovered
                                ? "rgba(255,255,255,0.06)"
                                : "transparent",
                              color: isHovered ? "#94A3B8" : "transparent",
                              border: isHovered
                                ? "1px solid rgba(255,255,255,0.1)"
                                : "1px solid transparent",
                            }}
                          >
                            <MoreHorizontal size={14} />
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
          {!loading && total > 0 && (
            <div
              className="flex items-center justify-between px-5 py-3.5"
              style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
            >
              <p className="text-[12px]" style={{ color: "#475569" }}>
                Showing{" "}
                <span style={{ color: "#94A3B8" }}>
                  {(page - 1) * pageSize + 1}
                </span>{" "}
                to{" "}
                <span style={{ color: "#94A3B8" }}>
                  {Math.min(page * pageSize, total)}
                </span>{" "}
                of{" "}
                <span style={{ color: "#94A3B8" }}>{total.toLocaleString()}</span>{" "}
                results
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="flex size-7 items-center justify-center rounded-lg transition-colors disabled:opacity-30"
                  style={{
                    background: "#080C18",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#64748B",
                  }}
                >
                  <ChevronLeft size={13} />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let p: number;
                  if (totalPages <= 5) {
                    p = i + 1;
                  } else if (page <= 3) {
                    p = i + 1;
                  } else if (page >= totalPages - 2) {
                    p = totalPages - 4 + i;
                  } else {
                    p = page - 2 + i;
                  }
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className="flex size-7 items-center justify-center rounded-lg text-[12px] font-semibold transition-colors"
                      style={{
                        background:
                          page === p
                            ? "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)"
                            : "#080C18",
                        border:
                          page === p
                            ? "1px solid rgba(99,102,241,0.5)"
                            : "1px solid rgba(255,255,255,0.08)",
                        color: page === p ? "#FFFFFF" : "#64748B",
                      }}
                    >
                      {p}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="flex size-7 items-center justify-center rounded-lg transition-colors disabled:opacity-30"
                  style={{
                    background: "#080C18",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#64748B",
                  }}
                >
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          )}
        </div>
    </div>
  );
}
