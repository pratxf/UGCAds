"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Loader2, MessageCircle, X, Send, CheckCircle2, Clock, WifiOff, Wifi, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

type Message = { id: string; fromAdmin: boolean; body: string; createdAt: string };
type Ticket = {
  id: string; subject: string; status: "OPEN" | "REPLIED" | "CLOSED";
  createdAt: string; updatedAt: string;
  user: { email: string; name: string | null; avatar: string | null };
  messages: Message[];
};
type Data = { tickets: Ticket[]; online: boolean; counts: { open: number; replied: number; closed: number } };

function relTime(iso: string) {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  return h < 24 ? `${h}h ago` : `${Math.round(h / 24)}d ago`;
}

function statusStyle(s: string) {
  if (s === "OPEN") return "bg-emerald-500/10 text-emerald-300 border-emerald-500/20";
  if (s === "REPLIED") return "bg-sky-500/10 text-sky-300 border-sky-500/20";
  return "bg-white/[0.04] text-slate-600 border-white/[0.08]";
}

const initials = (s: string) => s.split(/[ @]/).map((p) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const up = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22,1,0.36,1] as any } } };

export default function AdminSupportPage() {
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [togglingOnline, setTogglingOnline] = useState(false);
  const [filter, setFilter] = useState<"all" | "OPEN" | "REPLIED" | "CLOSED">("all");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  async function load() {
    try {
      const r = await fetch("/api/admin/support").then((r) => r.json());
      setData(r);
      if (selected) {
        const updated = r.tickets.find((t: Ticket) => t.id === selected.id);
        if (updated) setSelected(updated);
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);
  useEffect(() => { const t = setInterval(load, 15000); return () => clearInterval(t); }, [selected]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [selected?.messages.length]);

  async function sendReply() {
    if (!selected || !reply.trim()) return;
    setSending(true);
    try {
      await fetch(`/api/admin/support/${selected.id}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: reply.trim() }),
      });
      setReply("");
      await load();
    } catch { /* silent */ }
    finally { setSending(false); }
  }

  async function closeTicket(id: string) {
    await fetch(`/api/admin/support/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "CLOSED" }) });
    await load();
  }

  async function reopenTicket(id: string) {
    await fetch(`/api/admin/support/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "OPEN" }) });
    await load();
  }

  async function toggleOnline() {
    if (!data) return;
    setTogglingOnline(true);
    try {
      await fetch("/api/admin/support/status", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ online: !data.online }) });
      await load();
    } finally { setTogglingOnline(false); }
  }

  const filteredTickets = data?.tickets.filter((t) => filter === "all" || t.status === filter) ?? [];

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="h-4 w-4 animate-spin text-sky-400" />
    </div>
  );

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="max-w-7xl mx-auto flex flex-col gap-5" style={{ height: "calc(100vh - 8rem)" }}>
      {/* Header */}
      <motion.div variants={up} className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[22px] font-bold text-slate-100" style={{ fontFamily: "Satoshi, sans-serif" }}>Support</h1>
          <p className="text-sm text-slate-600 mt-0.5">
            {data?.counts.open ?? 0} open · {data?.counts.replied ?? 0} replied · {data?.counts.closed ?? 0} closed
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="flex size-9 items-center justify-center rounded-xl text-slate-600 hover:text-slate-300 transition-colors" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={toggleOnline}
            disabled={togglingOnline}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[12px] font-bold transition-all",
              data?.online
                ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/25 hover:bg-emerald-500/15"
                : "text-slate-600 hover:text-slate-400"
            )}
            style={{ border: data?.online ? "1px solid rgba(52,211,153,0.25)" : "1px solid rgba(255,255,255,0.07)" }}
          >
            {togglingOnline ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : data?.online ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
            {data?.online ? "Online" : "Offline"}
          </button>
        </div>
      </motion.div>

      {/* Filter pills */}
      <motion.div variants={up} className="flex gap-1.5">
        {(["all", "OPEN", "REPLIED", "CLOSED"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={cn(
            "rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize transition-all",
            filter === f ? "bg-sky-500/15 text-sky-300 border border-sky-500/30" : "text-slate-600 border border-white/[0.07] hover:text-slate-400"
          )}>
            {f === "all" ? `All (${data?.tickets.length ?? 0})` : `${f.charAt(0) + f.slice(1).toLowerCase()} (${data?.counts[f.toLowerCase() as keyof typeof data.counts] ?? 0})`}
          </button>
        ))}
      </motion.div>

      {/* Main two-pane layout */}
      <motion.div variants={up} className="flex-1 flex gap-4 min-h-0">
        {/* Ticket list */}
        <div className="w-[300px] shrink-0 flex flex-col rounded-2xl overflow-hidden" style={{ background: "#0B0F1A", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="px-4 py-3 shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-700">Tickets</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredTickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-slate-700">
                <MessageCircle className="h-8 w-8 mb-3 opacity-40" />
                <p className="text-sm">No tickets</p>
              </div>
            ) : (
              filteredTickets.map((t, i) => (
                <button
                  key={t.id}
                  onClick={() => setSelected(t)}
                  className={cn(
                    "w-full text-left px-4 py-3.5 transition-colors hover:bg-white/[0.02]",
                    selected?.id === t.id && "bg-sky-500/[0.06] border-l-2 border-sky-400/50"
                  )}
                  style={{ borderTop: i === 0 ? "none" : "1px solid rgba(255,255,255,0.04)" }}
                >
                  <p className="text-[13px] font-semibold text-slate-200 truncate">{t.subject}</p>
                  <p className="text-[11px] text-slate-600 mt-0.5 truncate">{t.user.name || t.user.email.split("@")[0]}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full border", statusStyle(t.status))}>{t.status}</span>
                    <span className="text-[10px] text-slate-700">{relTime(t.updatedAt)}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Conversation pane */}
        <div className="flex-1 flex flex-col rounded-2xl overflow-hidden min-w-0" style={{ background: "#0B0F1A", border: "1px solid rgba(255,255,255,0.07)" }}>
          {!selected ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-700">
              <MessageCircle className="h-12 w-12 mb-4 opacity-20" />
              <p className="text-sm">Select a ticket to view the conversation</p>
            </div>
          ) : (
            <>
              {/* Ticket header */}
              <div className="flex items-center justify-between px-5 py-4 shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ background: "linear-gradient(135deg, #0EA5E9, #2563EB)" }}>
                      {initials(selected.user.name || selected.user.email)}
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-[14px] font-bold text-slate-100 truncate">{selected.subject}</h2>
                      <p className="text-[11px] text-slate-600">{selected.user.name || selected.user.email.split("@")[0]} · {selected.user.email}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4 shrink-0">
                  <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", statusStyle(selected.status))}>{selected.status}</span>
                  {selected.status !== "CLOSED" ? (
                    <button onClick={() => closeTicket(selected.id)} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold text-slate-500 hover:text-emerald-300 transition-colors" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                      <CheckCircle2 className="h-3.5 w-3.5" /> Resolve
                    </button>
                  ) : (
                    <button onClick={() => reopenTicket(selected.id)} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold text-slate-500 hover:text-sky-300 transition-colors" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                      <Clock className="h-3.5 w-3.5" /> Reopen
                    </button>
                  )}
                  <button onClick={() => setSelected(null)} className="flex size-8 items-center justify-center rounded-lg text-slate-600 hover:text-slate-300 hover:bg-white/[0.05] transition">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                {selected.messages.map((msg) => (
                  <div key={msg.id} className={cn("flex", msg.fromAdmin ? "justify-end" : "justify-start")}>
                    {!msg.fromAdmin && (
                      <div className="flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white mr-2.5 mt-0.5" style={{ background: "rgba(255,255,255,0.08)" }}>
                        {initials(selected.user.name || selected.user.email)}
                      </div>
                    )}
                    <div className={cn("max-w-[72%] rounded-2xl px-4 py-2.5", msg.fromAdmin ? "rounded-br-sm" : "rounded-bl-sm")}
                      style={msg.fromAdmin
                        ? { background: "linear-gradient(135deg, #0EA5E9, #2563EB)", boxShadow: "0 0 16px rgba(14,165,233,0.2)" }
                        : { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.06)" }
                      }
                    >
                      <p className={cn("text-sm leading-relaxed whitespace-pre-wrap", msg.fromAdmin ? "text-white" : "text-slate-300")}>{msg.body}</p>
                      <p className={cn("text-[10px] mt-1", msg.fromAdmin ? "text-white/50" : "text-slate-700")}>{relTime(msg.createdAt)}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply */}
              {selected.status !== "CLOSED" ? (
                <div className="px-5 py-4 shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                  <div className="flex gap-3 items-end">
                    <textarea
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) sendReply(); }}
                      placeholder="Type your reply... (Ctrl+Enter to send)"
                      rows={3}
                      className="flex-1 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 placeholder:text-slate-700 focus:outline-none transition-all resize-none"
                      style={{ background: "#080C15", border: "1px solid rgba(255,255,255,0.08)" }}
                      onFocus={(e) => e.currentTarget.style.borderColor = "rgba(14,165,233,0.35)"}
                      onBlur={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"}
                    />
                    <button
                      onClick={sendReply}
                      disabled={!reply.trim() || sending}
                      className="flex size-10 shrink-0 items-center justify-center rounded-xl text-white disabled:opacity-40 transition-all hover:scale-[1.04]"
                      style={{ background: "linear-gradient(135deg, #0EA5E9, #2563EB)", boxShadow: reply.trim() ? "0 0 16px rgba(14,165,233,0.3)" : "none" }}
                    >
                      {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="px-5 py-4 shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                  <p className="text-xs text-slate-700 text-center">Ticket is closed. Reopen to reply.</p>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
