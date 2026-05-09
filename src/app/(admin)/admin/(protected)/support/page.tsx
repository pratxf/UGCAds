"use client";

import { useEffect, useState, useRef } from "react";
import {
  Loader2, MessageCircle, X, Send, CheckCircle2,
  Clock, ChevronRight, WifiOff, Wifi, RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Message = { id: string; fromAdmin: boolean; body: string; createdAt: string };
type Ticket = {
  id: string;
  subject: string;
  status: "OPEN" | "REPLIED" | "CLOSED";
  createdAt: string;
  updatedAt: string;
  user: { email: string; name: string | null; avatar: string | null };
  messages: Message[];
};

type Data = { tickets: Ticket[]; online: boolean; counts: { open: number; replied: number; closed: number } };

function relTime(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.round(ms / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

function statusStyle(s: string) {
  if (s === "OPEN") return "bg-emerald-400/10 text-emerald-400 border-emerald-400/20";
  if (s === "REPLIED") return "bg-primary/10 text-primary border-primary/20";
  return "bg-white/5 text-white/40 border-white/10";
}

const initials = (s: string) =>
  s.split(/[ @]/).map((p) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();

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
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [selected]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selected?.messages.length]);

  async function sendReply() {
    if (!selected || !reply.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/admin/support/${selected.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: reply.trim() }),
      });
      if (!res.ok) throw new Error("Failed");
      setReply("");
      await load();
    } catch {
      // silent
    } finally {
      setSending(false);
    }
  }

  async function closeTicket(id: string) {
    await fetch(`/api/admin/support/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "CLOSED" }),
    });
    await load();
  }

  async function reopenTicket(id: string) {
    await fetch(`/api/admin/support/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "OPEN" }),
    });
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
    } finally {
      setTogglingOnline(false);
    }
  }

  const filteredTickets = data?.tickets.filter((t) => filter === "all" || t.status === filter) ?? [];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-8rem)] flex flex-col gap-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Support</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {data?.counts.open ?? 0} open · {data?.counts.replied ?? 0} replied · {data?.counts.closed ?? 0} closed
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => load()}
            className="flex size-9 items-center justify-center rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-white/5 transition"
          >
            <RefreshCw className="h-4 w-4" />
          </button>

          {/* Online toggle */}
          <button
            onClick={toggleOnline}
            disabled={togglingOnline}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition",
              data?.online
                ? "bg-emerald-400/10 border-emerald-400/30 text-emerald-400 hover:bg-emerald-400/15"
                : "bg-white/[0.03] border-white/10 text-white/50 hover:text-foreground hover:bg-white/5"
            )}
          >
            {togglingOnline ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : data?.online ? (
              <Wifi className="h-3.5 w-3.5" />
            ) : (
              <WifiOff className="h-3.5 w-3.5" />
            )}
            {data?.online ? "Online" : "Offline"}
          </button>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex gap-1.5 mb-4">
        {(["all", "OPEN", "REPLIED", "CLOSED"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full px-3 py-1 text-[11px] font-medium capitalize transition-all",
              filter === f
                ? "bg-foreground text-background"
                : "text-muted-foreground border border-border hover:text-foreground"
            )}
          >
            {f === "all" ? `All (${data?.tickets.length ?? 0})` : `${f.toLowerCase()} (${data?.counts[f.toLowerCase() as keyof typeof data.counts] ?? 0})`}
          </button>
        ))}
      </div>

      {/* Main layout */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Ticket list */}
        <div className="w-[340px] shrink-0 flex flex-col rounded-2xl border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border shrink-0">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tickets</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredTickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm py-12">
                <MessageCircle className="h-8 w-8 mb-3 opacity-30" />
                No tickets
              </div>
            ) : (
              filteredTickets.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelected(t)}
                  className={cn(
                    "w-full text-left px-4 py-3.5 border-b border-border/50 hover:bg-white/[0.03] transition-colors",
                    selected?.id === t.id && "bg-primary/5 border-l-2 border-l-primary"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[13px] font-semibold text-foreground truncate flex-1">{t.subject}</p>
                    <ChevronRight className="h-3.5 w-3.5 text-white/30 shrink-0 mt-0.5" />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                    {t.user.name || t.user.email.split("@")[0]}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded-full border", statusStyle(t.status))}>
                      {t.status}
                    </span>
                    <span className="text-[10px] text-white/30">{relTime(t.updatedAt)}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Conversation */}
        <div className="flex-1 flex flex-col rounded-2xl border border-border bg-card overflow-hidden min-w-0">
          {!selected ? (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
              <MessageCircle className="h-12 w-12 mb-4 opacity-20" />
              <p className="text-sm">Select a ticket to view the conversation</p>
            </div>
          ) : (
            <>
              {/* Ticket header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
                <div className="min-w-0">
                  <h2 className="text-[15px] font-bold text-foreground truncate">{selected.subject}</h2>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {selected.user.name || selected.user.email.split("@")[0]} · {selected.user.email} · opened {relTime(selected.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4 shrink-0">
                  {selected.status !== "CLOSED" ? (
                    <button
                      onClick={() => closeTicket(selected.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] px-3 py-1.5 text-[11px] font-medium text-white/60 hover:text-foreground transition"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Resolve
                    </button>
                  ) : (
                    <button
                      onClick={() => reopenTicket(selected.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] px-3 py-1.5 text-[11px] font-medium text-white/60 hover:text-emerald-400 transition"
                    >
                      <Clock className="h-3.5 w-3.5" /> Reopen
                    </button>
                  )}
                  <button onClick={() => setSelected(null)} className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-white/5">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                {selected.messages.map((msg) => (
                  <div key={msg.id} className={cn("flex", msg.fromAdmin ? "justify-end" : "justify-start")}>
                    {!msg.fromAdmin && (
                      <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-[10px] font-bold text-foreground mr-2.5 mt-0.5">
                        {initials(selected.user.name || selected.user.email)}
                      </div>
                    )}
                    <div className={cn(
                      "max-w-[75%] rounded-2xl px-4 py-2.5",
                      msg.fromAdmin
                        ? "bg-primary text-black rounded-br-sm"
                        : "bg-white/[0.06] text-foreground rounded-bl-sm"
                    )}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.body}</p>
                      <p className={cn("text-[10px] mt-1", msg.fromAdmin ? "text-black/50" : "text-white/30")}>
                        {relTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply box */}
              {selected.status !== "CLOSED" ? (
                <div className="px-5 py-4 border-t border-border shrink-0">
                  <div className="flex gap-3 items-end">
                    <textarea
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) sendReply();
                      }}
                      placeholder="Type your reply... (Ctrl+Enter to send)"
                      rows={3}
                      className="flex-1 rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all resize-none"
                    />
                    <button
                      onClick={sendReply}
                      disabled={!reply.trim() || sending}
                      className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-black disabled:opacity-50 hover:brightness-105 transition"
                    >
                      {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="px-5 py-4 border-t border-border shrink-0">
                  <p className="text-xs text-muted-foreground text-center">This ticket is closed. Reopen it to reply.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
