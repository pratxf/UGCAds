"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  MessageCircle, X, Plus, Send, Loader2, ChevronLeft,
  CheckCircle2, Clock, Wifi, WifiOff,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Message = { id: string; fromAdmin: boolean; body: string; createdAt: string };
type Ticket = {
  id: string;
  subject: string;
  status: "OPEN" | "REPLIED" | "CLOSED";
  updatedAt: string;
  messages: Message[];
};

function relTime(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.round(ms / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

function statusBadge(s: string) {
  if (s === "OPEN") return "bg-amber-100 text-amber-700";
  if (s === "REPLIED") return "bg-blue-100 text-[#2563EB]";
  return "bg-gray-100 text-gray-500";
}

export default function SupportWidget() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"list" | "conversation" | "new">("list");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [adminOnline, setAdminOnline] = useState(false);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [newBody, setNewBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const hasUnread = tickets.some((t) => t.status === "REPLIED");

  const loadTickets = useCallback(async () => {
    setLoadingTickets(true);
    try {
      const [ticketsRes, statusRes] = await Promise.all([
        fetch("/api/support/tickets").then((r) => r.json()),
        fetch("/api/admin/support/status").then((r) => r.json()),
      ]);
      setTickets(ticketsRes.tickets || []);
      setAdminOnline(statusRes.online ?? false);
      if (selectedTicket) {
        const updated = (ticketsRes.tickets || []).find((t: Ticket) => t.id === selectedTicket.id);
        if (updated) setSelectedTicket(updated);
      }
    } catch {
      // silent
    } finally {
      setLoadingTickets(false);
    }
  }, [selectedTicket]);

  useEffect(() => {
    if (open) { loadTickets(); }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const t = setInterval(loadTickets, 12000);
    return () => clearInterval(t);
  }, [open, loadTickets]);

  useEffect(() => {
    if (view === "conversation") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedTicket?.messages.length, view]);

  async function createTicket() {
    if (!newSubject.trim() || !newBody.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: newSubject.trim(), body: newBody.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setNewSubject("");
      setNewBody("");
      setView("list");
      await loadTickets();
    } catch {
      // silent
    } finally {
      setSubmitting(false);
    }
  }

  async function sendReply() {
    if (!selectedTicket || !reply.trim()) return;
    setSending(true);
    try {
      await fetch(`/api/support/tickets/${selectedTicket.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: reply.trim() }),
      });
      setReply("");
      await loadTickets();
    } catch {
      // silent
    } finally {
      setSending(false);
    }
  }

  function openTicket(t: Ticket) {
    fetch(`/api/support/tickets/${t.id}/messages`)
      .then((r) => r.json())
      .then((data) => {
        if (data.ticket) setSelectedTicket(data.ticket);
        else setSelectedTicket(t);
      });
    setView("conversation");
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "fixed bottom-6 right-6 z-[200] flex size-14 items-center justify-center rounded-full shadow-lg transition-all duration-200",
          "bg-[#2563EB] text-white hover:bg-blue-700 hover:scale-105 active:scale-95",
        )}
        aria-label="Support"
      >
        {open ? (
          <X className="h-5 w-5" />
        ) : (
          <>
            <MessageCircle className="h-5 w-5" />
            {hasUnread && (
              <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                {tickets.filter((t) => t.status === "REPLIED").length}
              </span>
            )}
          </>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div
          className={cn(
            "fixed bottom-24 right-6 z-[199] w-[380px] max-w-[calc(100vw-1.5rem)] rounded-2xl",
            "bg-white border border-[#E5E7EB] shadow-2xl shadow-black/10 overflow-hidden",
            "flex flex-col",
          )}
          style={{ maxHeight: "min(580px, calc(100vh - 120px))" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 bg-[#2563EB]">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-full bg-white/20">
                <MessageCircle className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Support</p>
                <div className="flex items-center gap-1.5">
                  <span className={cn("size-1.5 rounded-full", adminOnline ? "bg-green-400" : "bg-white/40")} />
                  <p className="text-[11px] text-white/80">{adminOnline ? "Online now" : "We'll reply soon"}</p>
                </div>
              </div>
            </div>
            {view !== "list" && (
              <button
                onClick={() => { setView("list"); setSelectedTicket(null); }}
                className="flex size-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Body */}
          <div className="flex-1 overflow-hidden flex flex-col min-h-0">

            {/* List view */}
            {view === "list" && (
              <div className="flex-1 overflow-y-auto flex flex-col">
                <div className="px-5 pt-4 pb-2">
                  <button
                    onClick={() => setView("new")}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
                  >
                    <Plus className="h-4 w-4" />
                    New conversation
                  </button>
                </div>

                {loadingTickets && tickets.length === 0 ? (
                  <div className="flex items-center justify-center py-10 text-[#9CA3AF]">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : tickets.length === 0 ? (
                  <div className="flex flex-col items-center justify-center flex-1 px-5 py-10 text-center">
                    <MessageCircle className="h-8 w-8 text-[#E5E7EB] mb-3" />
                    <p className="text-sm font-medium text-[#374151]">No conversations yet</p>
                    <p className="text-xs text-[#9CA3AF] mt-1">Start a new conversation above</p>
                  </div>
                ) : (
                  <div className="flex-1">
                    <p className="px-5 py-2 text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wide">
                      Your conversations
                    </p>
                    {tickets.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => openTicket(t)}
                        className="w-full text-left px-5 py-3.5 hover:bg-[#F9FAFB] transition border-b border-[#F3F4F6] last:border-0"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold text-[#111111] truncate flex-1">{t.subject}</p>
                          {t.status === "REPLIED" && (
                            <span className="shrink-0 size-2 rounded-full bg-[#2563EB] mt-1.5" />
                          )}
                        </div>
                        {t.messages[0] && (
                          <p className="text-xs text-[#6B7280] mt-0.5 truncate">{t.messages[0].body}</p>
                        )}
                        <div className="flex items-center justify-between mt-1.5">
                          <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-full", statusBadge(t.status))}>
                            {t.status === "REPLIED" ? "Reply received" : t.status === "OPEN" ? "Awaiting reply" : "Closed"}
                          </span>
                          <span className="text-[10px] text-[#9CA3AF]">{relTime(t.updatedAt)}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* New ticket view */}
            {view === "new" && (
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                <div>
                  <p className="text-sm font-bold text-[#111111] mb-0.5">New conversation</p>
                  <p className="text-xs text-[#6B7280]">We typically reply within a few hours</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-[#374151] mb-1 block">Subject</label>
                  <input
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    placeholder="What is this about?"
                    className="w-full h-10 rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#111111] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]/50 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[#374151] mb-1 block">Message</label>
                  <textarea
                    value={newBody}
                    onChange={(e) => setNewBody(e.target.value)}
                    placeholder="Describe your issue..."
                    rows={5}
                    className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm text-[#111111] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB]/50 transition-all resize-none"
                  />
                </div>
                <button
                  onClick={createTicket}
                  disabled={!newSubject.trim() || !newBody.trim() || submitting}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50 hover:bg-blue-700 transition"
                >
                  {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {submitting ? "Sending..." : "Send message"}
                </button>
              </div>
            )}

            {/* Conversation view */}
            {view === "conversation" && selectedTicket && (
              <div className="flex-1 flex flex-col min-h-0">
                <div className="px-4 py-2.5 border-b border-[#F3F4F6] bg-[#F9FAFB] shrink-0">
                  <p className="text-xs font-semibold text-[#374151] truncate">{selectedTicket.subject}</p>
                  <p className="text-[10px] text-[#9CA3AF] mt-0.5">
                    {selectedTicket.status === "CLOSED" ? "Closed" : selectedTicket.status === "REPLIED" ? "Admin replied" : "Awaiting reply"}
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                  {selectedTicket.messages.map((msg) => (
                    <div key={msg.id} className={cn("flex", msg.fromAdmin ? "justify-start" : "justify-end")}>
                      {msg.fromAdmin && (
                        <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#2563EB] text-[9px] font-bold text-white mr-2 mt-0.5">
                          S
                        </div>
                      )}
                      <div className={cn(
                        "max-w-[80%] rounded-2xl px-3.5 py-2.5",
                        msg.fromAdmin
                          ? "bg-[#F3F4F6] text-[#111111] rounded-tl-sm"
                          : "bg-[#2563EB] text-white rounded-tr-sm"
                      )}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.body}</p>
                        <p className={cn("text-[10px] mt-1", msg.fromAdmin ? "text-[#9CA3AF]" : "text-white/60")}>
                          {relTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {selectedTicket.status !== "CLOSED" ? (
                  <div className="px-4 py-3 border-t border-[#F3F4F6] shrink-0 flex gap-2">
                    <input
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendReply())}
                      placeholder="Type a message..."
                      className="flex-1 h-9 rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#111111] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 transition-all"
                    />
                    <button
                      onClick={sendReply}
                      disabled={!reply.trim() || sending}
                      className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#2563EB] text-white disabled:opacity-50 hover:bg-blue-700 transition"
                    >
                      {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                ) : (
                  <div className="px-4 py-3 border-t border-[#F3F4F6] text-center shrink-0">
                    <p className="text-xs text-[#9CA3AF]">This conversation is closed.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
