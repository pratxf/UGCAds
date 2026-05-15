"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  Loader2, RefreshCw, Search, SlidersHorizontal, CheckCircle2,
  MoreHorizontal, Paperclip, Smile, Send, ChevronDown, User, Tag,
  AlertCircle, Calendar, Clock
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type MsgStatus = "OPEN" | "REPLIED" | "CLOSED";
type Priority = "LOW" | "MEDIUM" | "HIGH";
type Category = "GENERAL" | "BUG" | "FEATURE" | "BILLING";

type Message = {
  id: string;
  isAdmin: boolean;
  content: string;
  createdAt: string;
  senderName?: string;
};

type Ticket = {
  id: string;
  subject: string;
  status: MsgStatus;
  priority?: Priority;
  category?: Category;
  userId: string;
  user: { email: string; name: string | null; avatar: string | null };
  messages: Message[];
  createdAt: string;
  updatedAt: string;
};

type ApiData = {
  tickets: Ticket[];
  online: boolean;
  counts: { open: number; replied: number; closed: number };
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const AVATAR_COLORS = ["#6366F1", "#8B5CF6", "#EC4899", "#F59E0B", "#10B981", "#3B82F6"];

function avatarColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) | 0;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function initials(name: string | null, email: string): string {
  const src = name || email;
  return src
    .split(/[\s@.]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");
}

function relTime(iso: string): string {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

type BadgeProps = { status: MsgStatus };
function StatusBadge({ status }: BadgeProps) {
  const styles: Record<MsgStatus, { bg: string; color: string; border: string }> = {
    OPEN:    { bg: "rgba(16,185,129,0.15)",  color: "#10B981", border: "rgba(16,185,129,0.3)" },
    REPLIED: { bg: "rgba(59,130,246,0.15)",  color: "#60A5FA", border: "rgba(59,130,246,0.3)" },
    CLOSED:  { bg: "rgba(100,116,139,0.15)", color: "#64748B", border: "rgba(100,116,139,0.3)" },
  };
  const s = styles[status];
  return (
    <span
      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
    >
      {status}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Avatar component
// ---------------------------------------------------------------------------
function Avatar({ name, email, size = 32 }: { name: string | null; email: string; size?: number }) {
  const bg = avatarColor(email);
  const text = initials(name, email);
  return (
    <div
      className="shrink-0 flex items-center justify-center rounded-full font-bold text-white"
      style={{ width: size, height: size, fontSize: size * 0.35, background: bg }}
    >
      {text}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stat card
// ---------------------------------------------------------------------------
function StatCard({
  label, value, sub, linkLabel,
}: { label: string; value: number; sub: string; linkLabel?: string }) {
  return (
    <div
      className="flex-1 rounded-2xl p-5 flex flex-col gap-2"
      style={{ background: "#0F1629", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
      <p className="text-3xl font-bold text-white">{value}</p>
      <div className="flex items-center justify-between mt-auto">
        <p className="text-[11px] text-slate-500">{sub}</p>
        {linkLabel && (
          <span className="text-[11px] text-indigo-400 hover:text-indigo-300 cursor-pointer transition-colors">
            {linkLabel}
          </span>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sidebar dropdown helper
// ---------------------------------------------------------------------------
function DetailDropdown<T extends string>({
  label, icon: Icon, value, options, onChange,
}: {
  label: string;
  icon: React.ElementType;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value)?.label ?? value;
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">{label}</p>
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center gap-2 rounded-xl px-3 py-2.5 text-[12px] text-slate-300 hover:bg-white/[0.04] transition-colors"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <Icon className="h-3.5 w-3.5 text-slate-500 shrink-0" />
          <span className="flex-1 text-left">{current}</span>
          <ChevronDown className="h-3 w-3 text-slate-600 shrink-0" />
        </button>
        {open && (
          <div
            className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-10"
            style={{ background: "#1A1F35", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className="w-full text-left px-3 py-2 text-[12px] text-slate-300 hover:bg-white/[0.06] transition-colors"
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function AdminSupportPage() {
  const [data, setData] = useState<ApiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [filter, setFilter] = useState<"all" | MsgStatus>("all");
  const [search, setSearch] = useState("");
  const [replyText, setReplyText] = useState("");
  const [replyTab, setReplyTab] = useState<"reply" | "note">("reply");
  const [sending, setSending] = useState(false);
  const [togglingOnline, setTogglingOnline] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const prevMsgCountsRef = useRef<Record<string, number>>({});
  const prevTicketCountRef = useRef<number | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("/chat.mp3");
    audioRef.current.volume = 0.6;
  }, []);

  function playNotification() {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {});
  }

  // page size
  const PAGE = 20;
  const [page] = useState(1);

  // ---------------------------------------------------------------------------
  const load = useCallback(async () => {
    try {
      const r: ApiData = await fetch("/api/admin/support").then((res) => res.json());
      const isFirstLoad = prevTicketCountRef.current === null;

      if (!isFirstLoad) {
        // New ticket arrived
        if (r.tickets.length > (prevTicketCountRef.current ?? 0)) playNotification();
        // New customer message in any ticket
        r.tickets.forEach((ticket) => {
          const prev = prevMsgCountsRef.current[ticket.id];
          if (prev !== undefined && ticket.messages.length > prev) {
            if (ticket.messages.slice(prev).some((m) => !m.isAdmin)) playNotification();
          }
        });
      }

      prevTicketCountRef.current = r.tickets.length;
      r.tickets.forEach((t) => { prevMsgCountsRef.current[t.id] = t.messages.length; });

      setData(r);
      if (selected) {
        const updated = r.tickets.find((t) => t.id === selected.id);
        if (updated) setSelected(updated);
      }
    } catch { /* silent */ } finally { setLoading(false); }
  }, [selected]);

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [load]);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selected?.messages.length]);

  // ---------------------------------------------------------------------------
  async function sendReply() {
    if (!selected || !replyText.trim()) return;
    setSending(true);
    try {
      await fetch(`/api/admin/support/${selected.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: replyText.trim() }),
      });
      setReplyText("");
      await load();
    } catch { /* silent */ } finally { setSending(false); }
  }

  async function updateStatus(ticketId: string, status: MsgStatus) {
    await fetch(`/api/admin/support/${ticketId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setMenuOpen(false);
    await load();
  }

  async function toggleOnline() {
    if (!data) return;
    setTogglingOnline(true);
    try {
      await fetch("/api/admin/support/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ online: !data.online }),
      });
      await load();
    } finally { setTogglingOnline(false); }
  }

  // ---------------------------------------------------------------------------
  const allTickets = data?.tickets ?? [];
  const filtered = allTickets
    .filter((t) => filter === "all" || t.status === filter)
    .filter((t) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        t.subject.toLowerCase().includes(q) ||
        t.user.email.toLowerCase().includes(q) ||
        (t.user.name || "").toLowerCase().includes(q)
      );
    });

  const total = filtered.length;
  const start = (page - 1) * PAGE;
  const end = Math.min(start + PAGE, total);
  const visibleTickets = filtered.slice(start, end);

  const counts = data?.counts ?? { open: 0, replied: 0, closed: 0 };

  // ---------------------------------------------------------------------------
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#080C18" }}
      >
        <Loader2 className="h-5 w-5 animate-spin text-indigo-400" />
      </div>
    );
  }

  return (
    <div
      className="flex flex-col gap-5 min-h-screen p-6"
      style={{ background: "#080C18" }}
    >
      {/* ------------------------------------------------------------------ */}
      {/* Header */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex items-center justify-end flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="flex size-9 items-center justify-center rounded-xl text-slate-500 hover:text-slate-300 transition-colors"
            style={{ background: "#0F1629", border: "1px solid rgba(255,255,255,0.07)" }}
            title="Refresh"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={toggleOnline}
            disabled={togglingOnline}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[12px] font-semibold transition-all"
            style={
              data?.online
                ? {
                    background: "rgba(16,185,129,0.12)",
                    color: "#10B981",
                    border: "1px solid rgba(16,185,129,0.3)",
                  }
                : {
                    background: "#0F1629",
                    color: "#64748B",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }
            }
          >
            {togglingOnline ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: data?.online ? "#10B981" : "#64748B" }}
              />
            )}
            {data?.online ? "Online" : "Offline"}
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Stat cards */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="All Tickets"
          value={allTickets.length}
          sub="Total tickets"
          linkLabel="View all"
        />
        <StatCard label="Open" value={counts.open} sub="Needs reply" />
        <StatCard label="Replied" value={counts.replied} sub="Awaiting response" />
        <StatCard label="Closed" value={counts.closed} sub="Resolved" />
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 3-column layout */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex gap-4" style={{ minHeight: 0, height: "calc(100vh - 240px)" }}>
        {/* ---------------------------------------------------------------- */}
        {/* LEFT — ticket list */}
        {/* ---------------------------------------------------------------- */}
        <div
          className="flex flex-col rounded-2xl overflow-hidden"
          style={{
            width: 280,
            flexShrink: 0,
            background: "#0F1629",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          {/* Search */}
          <div
            className="px-3 py-3 shrink-0"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
          >
            <div className="flex items-center gap-2">
              <div
                className="flex-1 flex items-center gap-2 rounded-xl px-3 py-2"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <Search className="h-3.5 w-3.5 text-slate-600 shrink-0" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search tickets..."
                  className="flex-1 bg-transparent text-[12px] text-slate-300 placeholder:text-slate-600 focus:outline-none"
                />
              </div>
              <button
                className="flex size-8 items-center justify-center rounded-xl text-slate-600 hover:text-slate-300 transition-colors shrink-0"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Tab pills */}
          <div
            className="px-3 py-2.5 flex gap-1 shrink-0 flex-wrap"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
          >
            {(["all", "OPEN", "REPLIED", "CLOSED"] as const).map((f) => {
              const count =
                f === "all"
                  ? allTickets.length
                  : counts[f.toLowerCase() as keyof typeof counts];
              const active = filter === f;
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className="rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all"
                  style={
                    active
                      ? {
                          background: "rgba(99,102,241,0.2)",
                          color: "#A5B4FC",
                          border: "1px solid rgba(99,102,241,0.35)",
                        }
                      : {
                          background: "transparent",
                          color: "#64748B",
                          border: "1px solid rgba(255,255,255,0.06)",
                        }
                  }
                >
                  {f === "all" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()} ({count})
                </button>
              );
            })}
          </div>

          {/* Ticket cards */}
          <div className="flex-1 overflow-y-auto">
            {visibleTickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-slate-600">
                <AlertCircle className="h-8 w-8 mb-3 opacity-30" />
                <p className="text-sm">No tickets found</p>
              </div>
            ) : (
              visibleTickets.map((t, i) => {
                const isActive = selected?.id === t.id;
                const preview = t.messages.at(-1)?.content ?? "";
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelected(t)}
                    className="w-full text-left px-3 py-3 transition-colors hover:bg-white/[0.03]"
                    style={{
                      borderTop: i === 0 ? "none" : "1px solid rgba(255,255,255,0.04)",
                      borderLeft: isActive ? "2px solid #6366F1" : "2px solid transparent",
                      background: isActive ? "rgba(99,102,241,0.07)" : undefined,
                    }}
                  >
                    <div className="flex items-start gap-2.5">
                      <Avatar name={t.user.name} email={t.user.email} size={32} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold text-slate-200 truncate">{t.subject}</p>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {preview || "No messages yet"}
                        </p>
                        <div className="flex items-center justify-between mt-1.5">
                          <StatusBadge status={t.status} />
                          <span className="text-[10px] text-slate-600">{relTime(t.updatedAt)}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Pagination info */}
          {total > 0 && (
            <div
              className="px-3 py-2.5 shrink-0"
              style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
            >
              <p className="text-[10px] text-slate-600 text-center">
                Showing {start + 1} to {end} of {total} tickets
              </p>
            </div>
          )}
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* MIDDLE — conversation */}
        {/* ---------------------------------------------------------------- */}
        <div
          className="flex-1 flex flex-col rounded-2xl overflow-hidden min-w-0"
          style={{ background: "#0F1629", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          {!selected ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-600 gap-3">
              <div
                className="flex size-14 items-center justify-center rounded-2xl"
                style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}
              >
                <AlertCircle className="h-6 w-6 text-indigo-400 opacity-60" />
              </div>
              <p className="text-sm text-slate-500">Select a ticket to view the conversation</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div
                className="flex items-center justify-between px-5 py-4 shrink-0"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
              >
                <div className="min-w-0 flex-1">
                  <h2 className="text-[15px] font-bold text-white truncate">{selected.subject}</h2>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-[11px] text-slate-500">
                      #{selected.id.slice(-6).toUpperCase()}
                    </span>
                    <span className="text-slate-700">·</span>
                    <span className="text-[11px] text-slate-500">
                      {fmtDate(selected.createdAt)}
                    </span>
                    <span className="text-slate-700">·</span>
                    <span className="text-[11px] text-slate-500">{selected.user.email}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4 shrink-0">
                  <StatusBadge status={selected.status} />
                  {selected.status !== "CLOSED" ? (
                    <button
                      onClick={() => updateStatus(selected.id, "CLOSED")}
                      className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-semibold text-slate-400 hover:text-white transition-all"
                      style={{
                        background: "rgba(16,185,129,0.1)",
                        border: "1px solid rgba(16,185,129,0.2)",
                      }}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      Resolve
                    </button>
                  ) : (
                    <button
                      onClick={() => updateStatus(selected.id, "OPEN")}
                      className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-semibold text-slate-400 hover:text-indigo-300 transition-all"
                      style={{
                        background: "rgba(99,102,241,0.1)",
                        border: "1px solid rgba(99,102,241,0.2)",
                      }}
                    >
                      <Clock className="h-3.5 w-3.5" />
                      Reopen
                    </button>
                  )}
                  <div className="relative">
                    <button
                      onClick={() => setMenuOpen(!menuOpen)}
                      className="flex size-8 items-center justify-center rounded-xl text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] transition"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                    {menuOpen && (
                      <div
                        className="absolute top-full right-0 mt-1 rounded-xl overflow-hidden z-20 w-40"
                        style={{
                          background: "#1A1F35",
                          border: "1px solid rgba(255,255,255,0.1)",
                          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                        }}
                      >
                        {(["OPEN", "REPLIED", "CLOSED"] as MsgStatus[]).map((s) => (
                          <button
                            key={s}
                            onClick={() => updateStatus(selected.id, s)}
                            className="w-full text-left px-4 py-2.5 text-[12px] text-slate-300 hover:bg-white/[0.06] transition-colors flex items-center gap-2"
                          >
                            <StatusBadge status={s} />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
                {selected.messages.length === 0 && (
                  <p className="text-center text-sm text-slate-600 py-8">No messages yet.</p>
                )}
                {selected.messages.map((msg) => {
                  const isAdmin = msg.isAdmin;
                  const displayName = isAdmin
                    ? (msg.senderName ?? "Admin")
                    : (selected.user.name ?? selected.user.email.split("@")[0]);
                  return (
                    <div key={msg.id} className={`flex gap-3 ${isAdmin ? "flex-row-reverse" : ""}`}>
                      {isAdmin ? (
                        <div
                          className="shrink-0 flex size-8 items-center justify-center rounded-full font-bold text-white text-[11px]"
                          style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
                        >
                          A
                        </div>
                      ) : (
                        <Avatar name={selected.user.name} email={selected.user.email} size={32} />
                      )}
                      <div className={`flex flex-col max-w-[68%] ${isAdmin ? "items-end" : "items-start"}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[11px] font-semibold text-slate-400">{displayName}</span>
                          {!isAdmin && (
                            <span className="text-[10px] text-slate-600">{selected.user.email}</span>
                          )}
                          <span className="text-[10px] text-slate-600">{relTime(msg.createdAt)}</span>
                        </div>
                        <div
                          className="rounded-2xl px-4 py-3"
                          style={
                            isAdmin
                              ? {
                                  background: "#1A1F35",
                                  border: "1px solid rgba(99,102,241,0.2)",
                                  borderBottomRightRadius: 4,
                                }
                              : {
                                  background: "rgba(255,255,255,0.05)",
                                  border: "1px solid rgba(255,255,255,0.07)",
                                  borderBottomLeftRadius: 4,
                                }
                          }
                        >
                          <p className="text-[13px] leading-relaxed text-slate-200 whitespace-pre-wrap">
                            {msg.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply area */}
              <div
                className="shrink-0 px-5 pt-3 pb-4"
                style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
              >
                {selected.status === "CLOSED" ? (
                  <p className="text-xs text-slate-600 text-center py-2">
                    This ticket is closed. Reopen it to send a reply.
                  </p>
                ) : (
                  <>
                    {/* Tabs */}
                    <div className="flex gap-1 mb-3">
                      {(["reply", "note"] as const).map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setReplyTab(tab)}
                          className="px-3 py-1 rounded-lg text-[11px] font-semibold transition-all capitalize"
                          style={
                            replyTab === tab
                              ? {
                                  background: "rgba(99,102,241,0.18)",
                                  color: "#A5B4FC",
                                  border: "1px solid rgba(99,102,241,0.3)",
                                }
                              : {
                                  background: "transparent",
                                  color: "#64748B",
                                  border: "1px solid rgba(255,255,255,0.06)",
                                }
                          }
                        >
                          {tab === "reply" ? "Reply" : "Internal Note"}
                        </button>
                      ))}
                    </div>
                    {/* Textarea + actions */}
                    <div
                      className="rounded-xl overflow-hidden"
                      style={{ border: "1px solid rgba(255,255,255,0.08)" }}
                    >
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) sendReply();
                        }}
                        placeholder={
                          replyTab === "reply"
                            ? "Type your reply... (Ctrl+Enter to send)"
                            : "Add an internal note (not visible to customer)..."
                        }
                        rows={3}
                        className="w-full bg-transparent px-4 pt-3 pb-2 text-[13px] text-slate-200 placeholder:text-slate-600 focus:outline-none resize-none"
                      />
                      <div
                        className="flex items-center justify-between px-3 py-2"
                        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
                      >
                        <div className="flex items-center gap-2">
                          <button className="flex size-7 items-center justify-center rounded-lg text-slate-600 hover:text-slate-400 transition-colors hover:bg-white/[0.06]">
                            <Paperclip className="h-3.5 w-3.5" />
                          </button>
                          <button className="flex size-7 items-center justify-center rounded-lg text-slate-600 hover:text-slate-400 transition-colors hover:bg-white/[0.06]">
                            <Smile className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <button
                          onClick={sendReply}
                          disabled={!replyText.trim() || sending}
                          className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-[12px] font-semibold text-white transition-all disabled:opacity-40"
                          style={{
                            background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
                            boxShadow: replyText.trim()
                              ? "0 0 16px rgba(99,102,241,0.35)"
                              : "none",
                          }}
                        >
                          {sending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Send className="h-3.5 w-3.5" />
                          )}
                          Send
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* RIGHT — ticket details sidebar */}
        {/* ---------------------------------------------------------------- */}
        <div
          className="flex flex-col rounded-2xl overflow-hidden overflow-y-auto"
          style={{
            width: 280,
            flexShrink: 0,
            background: "#0F1629",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div
            className="px-4 py-4 shrink-0"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
          >
            <h3 className="text-[13px] font-bold text-white">Ticket Details</h3>
          </div>

          {!selected ? (
            <div className="flex-1 flex items-center justify-center text-slate-600 p-6">
              <p className="text-[12px] text-center">Select a ticket to view details</p>
            </div>
          ) : (
            <div className="flex flex-col gap-5 p-4">
              {/* Status */}
              <DetailDropdown<MsgStatus>
                label="Status"
                icon={AlertCircle}
                value={selected.status}
                options={[
                  { value: "OPEN", label: "Open" },
                  { value: "REPLIED", label: "Replied" },
                  { value: "CLOSED", label: "Closed" },
                ]}
                onChange={(v) => updateStatus(selected.id, v)}
              />

              {/* Priority */}
              <DetailDropdown<Priority>
                label="Priority"
                icon={Tag}
                value={(selected.priority as Priority) ?? "MEDIUM"}
                options={[
                  { value: "LOW", label: "Low" },
                  { value: "MEDIUM", label: "Medium" },
                  { value: "HIGH", label: "High" },
                ]}
                onChange={() => {}}
              />

              {/* Category */}
              <DetailDropdown<Category>
                label="Category"
                icon={Tag}
                value={(selected.category as Category) ?? "GENERAL"}
                options={[
                  { value: "GENERAL", label: "General Inquiry" },
                  { value: "BUG", label: "Bug Report" },
                  { value: "FEATURE", label: "Feature Request" },
                  { value: "BILLING", label: "Billing" },
                ]}
                onChange={() => {}}
              />

              {/* Dates */}
              <div
                className="rounded-xl p-3 flex flex-col gap-2"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-slate-600 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-600">Created</p>
                    <p className="text-[12px] font-medium text-slate-300">{fmtDate(selected.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-slate-600 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-600">Last Updated</p>
                    <p className="text-[12px] font-medium text-slate-300">{fmtDate(selected.updatedAt)}</p>
                  </div>
                </div>
              </div>

              {/* Customer */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Customer
                </p>
                <div
                  className="rounded-xl p-3 flex flex-col gap-2.5"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <div className="flex items-center gap-2.5">
                    <Avatar name={selected.user.name} email={selected.user.email} size={36} />
                    <div className="min-w-0">
                      <p className="text-[12px] font-semibold text-white truncate">
                        {selected.user.name || selected.user.email.split("@")[0]}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">{selected.user.email}</p>
                    </div>
                  </div>
                  <button className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors">
                    <User className="h-3 w-3" />
                    View Profile
                    <span className="text-slate-600">→</span>
                  </button>
                </div>
              </div>

              {/* Activity */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Activity
                </p>
                <div className="flex flex-col gap-0">
                  {/* Created */}
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className="size-6 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)" }}
                      >
                        <Calendar className="h-3 w-3 text-indigo-400" />
                      </div>
                      <div className="flex-1 w-px mt-1" style={{ background: "rgba(255,255,255,0.07)", minHeight: 20 }} />
                    </div>
                    <div className="pb-4 min-w-0">
                      <p className="text-[12px] font-medium text-slate-300">Ticket created</p>
                      <p className="text-[10px] text-slate-600">{relTime(selected.createdAt)}</p>
                    </div>
                  </div>
                  {/* Last status */}
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className="size-6 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)" }}
                      >
                        <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                      </div>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12px] font-medium text-slate-300">
                        Status changed to{" "}
                        <span className="text-slate-200 font-semibold">
                          {selected.status.charAt(0) + selected.status.slice(1).toLowerCase()}
                        </span>
                      </p>
                      <p className="text-[10px] text-slate-600">{relTime(selected.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
