"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { X, Send, Loader2, ChevronLeft, Paperclip, Smile, Video, Image, User, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Message = { id: string; fromAdmin: boolean; body: string; createdAt: string };
type Ticket = {
  id: string;
  subject: string;
  status: "OPEN" | "REPLIED" | "CLOSED";
  updatedAt: string;
  messages: Message[];
};

const FEATURES = [
  { icon: Video,  color: "#6366F1", bg: "rgba(99,102,241,0.12)", label: "AI Video Generation",  sub: "Create UGC-style videos in minutes" },
  { icon: Image,  color: "#10B981", bg: "rgba(16,185,129,0.12)", label: "Product Photos",        sub: "Generate stunning product photos" },
  { icon: User,   color: "#EC4899", bg: "rgba(236,72,153,0.12)", label: "AI Try-On Models",      sub: "Realistic try-on model generation" },
];

const HEADER_BG = "linear-gradient(135deg, #4F46E5 0%, #2563EB 100%)";

function relTime(iso: string) {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  return h < 24 ? `${h}h ago` : `${Math.round(h / 24)}d ago`;
}

function isImageUrl(text: string) {
  return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(text.trim());
}

function AiAvatar() {
  return (
    <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-[#111] shadow-sm">
      <ArrowUpRight className="h-4 w-4 text-white" strokeWidth={2.5} />
    </div>
  );
}

function MessageBubble({ msg }: { msg: Message }) {
  const isImg = isImageUrl(msg.body);
  if (msg.fromAdmin) {
    return (
      <div className="flex items-end gap-2.5">
        <AiAvatar />
        <div className="max-w-[78%]">
          {isImg ? (
            <img src={msg.body} alt="attachment" className="rounded-2xl rounded-tl-sm max-w-full max-h-48 object-contain" />
          ) : (
            <div className="rounded-2xl rounded-tl-sm bg-[#F3F4F6] px-4 py-3">
              <p className="text-[14px] leading-relaxed text-[#111111] whitespace-pre-wrap">{msg.body}</p>
            </div>
          )}
          <p className="text-[11px] text-[#9CA3AF] mt-1.5 ml-1">{relTime(msg.createdAt)}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex justify-end">
      <div className="max-w-[78%]">
        {isImg ? (
          <img src={msg.body} alt="attachment" className="rounded-2xl rounded-tr-sm max-w-full max-h-48 object-contain" />
        ) : (
          <div className="rounded-2xl rounded-tr-sm px-4 py-3" style={{ background: HEADER_BG }}>
            <p className="text-[14px] leading-relaxed text-white whitespace-pre-wrap">{msg.body}</p>
          </div>
        )}
        <p className="text-[11px] text-[#9CA3AF] mt-1.5 text-right mr-1">{relTime(msg.createdAt)}</p>
      </div>
    </div>
  );
}

export default function SupportWidget() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"home" | "conversation">("home");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [adminOnline, setAdminOnline] = useState(false);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [starting, setStarting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasUnread = tickets.some((t) => t.status === "REPLIED");

  const loadTickets = useCallback(async () => {
    try {
      const [ticketsRes, statusRes] = await Promise.all([
        fetch("/api/support/tickets").then((r) => r.json()),
        fetch("/api/admin/support/status").then((r) => r.json()),
      ]);
      const list: Ticket[] = ticketsRes.tickets || [];
      setTickets(list);
      setAdminOnline(statusRes.online ?? false);
      if (selectedTicket) {
        const updated = list.find((t) => t.id === selectedTicket.id);
        if (updated) setSelectedTicket(updated);
      }
    } catch { /* silent */ }
  }, [selectedTicket]);

  useEffect(() => { if (open) { loadTickets(); } }, [open]);
  useEffect(() => {
    if (!open) return;
    const t = setInterval(loadTickets, 12000);
    return () => clearInterval(t);
  }, [open, loadTickets]);
  useEffect(() => {
    if (view === "conversation") messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedTicket?.messages.length, view]);

  async function startConversation(subject: string) {
    setStarting(true);
    try {
      const res = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, body: subject }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      await loadTickets();
      const ticket = data.ticket || { id: data.id, subject, status: "OPEN", updatedAt: new Date().toISOString(), messages: [] };
      setSelectedTicket(ticket);
      setView("conversation");
    } catch { /* silent */ }
    finally { setStarting(false); }
  }

  function openTicket(t: Ticket) {
    fetch(`/api/support/tickets/${t.id}/messages`)
      .then((r) => r.json())
      .then((data) => { if (data.ticket) setSelectedTicket(data.ticket); else setSelectedTicket(t); });
    setView("conversation");
  }

  function pickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setImageFile(f);
    setImagePreview(URL.createObjectURL(f));
  }

  function removeImage() {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function sendReply() {
    if (!selectedTicket) return;
    if (!reply.trim() && !imageFile) return;
    setSending(true);
    try {
      if (imageFile) {
        setUploading(true);
        const fd = new FormData();
        fd.append("image", imageFile);
        const upRes = await fetch("/api/support/upload", { method: "POST", body: fd });
        const upData = await upRes.json();
        setUploading(false);
        if (upRes.ok && upData.url) {
          await fetch(`/api/support/tickets/${selectedTicket.id}/messages`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ body: upData.url }),
          });
        }
        removeImage();
      }
      if (reply.trim()) {
        await fetch(`/api/support/tickets/${selectedTicket.id}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ body: reply.trim() }),
        });
        setReply("");
      }
      await loadTickets();
    } catch { /* silent */ }
    finally { setSending(false); setUploading(false); }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-[200] flex size-14 items-center justify-center rounded-full text-white shadow-lg transition-all hover:scale-105 active:scale-95"
        style={{ background: HEADER_BG, boxShadow: "0 8px 24px rgba(79,70,229,0.4)" }}
        aria-label="Support"
      >
        {open ? <X className="h-5 w-5" /> : (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-6 w-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
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
          className="fixed bottom-24 right-6 z-[199] w-[400px] max-w-[calc(100vw-1.5rem)] rounded-2xl bg-white overflow-hidden flex flex-col"
          style={{ maxHeight: "min(680px, calc(100vh - 120px))", boxShadow: "0 24px 64px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)" }}
        >
          {/* ── HOME VIEW ───────────────────────────────── */}
          {view === "home" && (
            <>
              {/* Hero header */}
              <div className="relative px-6 pt-6 pb-8 shrink-0" style={{ background: HEADER_BG }}>
                {/* Top bar */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-9 items-center justify-center rounded-xl bg-[#111]">
                      <ArrowUpRight className="h-4 w-4 text-white" strokeWidth={2.5} />
                    </div>
                    <div>
                      <p className="text-[14px] font-bold text-white leading-tight">Support</p>
                      <div className="flex items-center gap-1.5">
                        <span className={cn("size-1.5 rounded-full", adminOnline ? "bg-green-400" : "bg-white/50")} />
                        <p className="text-[11px] text-white/80">{adminOnline ? "Online" : "We'll reply soon"}</p>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setOpen(false)} className="flex size-8 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 transition">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                {/* Greeting */}
                <p className="text-[26px] font-bold text-white leading-snug">Hi there! 👋</p>
                <p className="text-[14px] text-white/80 mt-1.5 leading-relaxed">
                  How can we help you create amazing ads today?
                </p>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto bg-white">
                {/* Feature list */}
                <div className="px-5 pt-5 pb-4 space-y-1">
                  {FEATURES.map((f) => {
                    const Icon = f.icon;
                    return (
                      <div key={f.label} className="flex items-center gap-3.5 px-3 py-3.5 rounded-xl hover:bg-[#F9FAFB] transition-colors">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl" style={{ background: f.bg }}>
                          <Icon className="h-5 w-5" style={{ color: f.color }} strokeWidth={1.8} />
                        </div>
                        <div>
                          <p className="text-[14px] font-semibold text-[#111111]">{f.label}</p>
                          <p className="text-[12px] text-[#6B7280]">{f.sub}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>


                {/* CTAs */}
                <div className="px-5 pt-3 pb-5 space-y-2.5">
                  <button
                    onClick={() => startConversation("General question")}
                    disabled={starting}
                    className="w-full flex items-center justify-between rounded-xl px-5 py-3.5 text-[14px] font-bold text-white transition hover:brightness-110 disabled:opacity-60"
                    style={{ background: HEADER_BG }}
                  >
                    Start a conversation
                    <ChevronLeft className="h-4 w-4 rotate-180" />
                  </button>
                  <a href="/pricing"
                    className="w-full flex items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] px-5 py-3.5 text-[14px] font-semibold text-[#374151] hover:bg-[#F9FAFB] transition">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4">
                      <rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" />
                    </svg>
                    View pricing
                  </a>
                </div>

                {/* Footer */}
                <p className="text-center text-[11px] text-[#9CA3AF] pb-4">We typically reply in a few minutes</p>
              </div>
            </>
          )}

          {/* ── CONVERSATION VIEW ───────────────────────── */}
          {view === "conversation" && selectedTicket && (
            <>
              {/* Header */}
              <div className="flex items-center gap-3 px-5 py-4 shrink-0" style={{ background: HEADER_BG }}>
                <button onClick={() => { setView("home"); setSelectedTicket(null); }}
                  className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 transition">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#111]">
                  <ArrowUpRight className="h-4 w-4 text-white" strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-bold text-white leading-tight">Support</p>
                  <div className="flex items-center gap-1.5">
                    <span className={cn("size-1.5 rounded-full", adminOnline ? "bg-green-400" : "bg-white/50")} />
                    <p className="text-[11px] text-white/80">{adminOnline ? "Online" : "We'll reply soon"}</p>
                  </div>
                </div>
                <button onClick={() => setOpen(false)} className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 transition">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Ticket subject bar */}
              <div className="px-5 py-2.5 bg-[#F9FAFB] border-b border-[#F3F4F6] shrink-0">
                <p className="text-[12px] font-semibold text-[#374151] truncate">{selectedTicket.subject}</p>
                <p className="text-[11px] text-[#9CA3AF]">
                  {selectedTicket.status === "CLOSED" ? "Resolved" : selectedTicket.status === "REPLIED" ? "Admin replied" : "Awaiting reply"}
                </p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 bg-white">
                {selectedTicket.messages.length === 0 && (
                  <div className="flex items-end gap-2.5">
                    <AiAvatar />
                    <div className="rounded-2xl rounded-tl-sm bg-[#F3F4F6] px-4 py-3 max-w-[78%]">
                      <p className="text-[14px] leading-relaxed text-[#111111]">Hi! How can I help you today?</p>
                    </div>
                  </div>
                )}
                {selectedTicket.messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              {selectedTicket.status === "CLOSED" ? (
                <div className="px-5 py-4 border-t border-[#F3F4F6] text-center bg-white shrink-0">
                  <p className="text-[13px] text-[#9CA3AF]">This conversation has been resolved.</p>
                </div>
              ) : (
                <div className="px-4 py-3 border-t border-[#F3F4F6] bg-white shrink-0">
                  {imagePreview && (
                    <div className="relative mb-2 inline-block">
                      <img src={imagePreview} alt="preview" className="h-16 w-16 rounded-xl object-cover border border-[#E5E7EB]" />
                      <button onClick={removeImage} className="absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full bg-gray-600 text-white text-[8px]">✕</button>
                    </div>
                  )}
                  <div className="flex items-center gap-2 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2.5 focus-within:border-[#4F46E5]/50 focus-within:ring-2 focus-within:ring-[#4F46E5]/15 transition-all">
                    <button onClick={() => fileInputRef.current?.click()} className="shrink-0 text-[#9CA3AF] hover:text-[#4F46E5] transition-colors">
                      <Paperclip className="h-4.5 w-4.5 h-[18px] w-[18px]" />
                    </button>
                    <textarea
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
                      placeholder="Type your message..."
                      rows={1}
                      className="flex-1 bg-transparent text-[14px] text-[#111111] placeholder:text-[#9CA3AF] focus:outline-none resize-none max-h-24 leading-5"
                      style={{ minHeight: "20px" }}
                      onInput={(e) => {
                        const t = e.currentTarget;
                        t.style.height = "auto";
                        t.style.height = Math.min(t.scrollHeight, 96) + "px";
                      }}
                    />
                    <button className="shrink-0 text-[#9CA3AF] hover:text-[#4F46E5] transition-colors">
                      <Smile className="h-[18px] w-[18px]" />
                    </button>
                    <button
                      onClick={sendReply}
                      disabled={(!reply.trim() && !imageFile) || sending}
                      className="flex size-9 shrink-0 items-center justify-center rounded-xl text-white disabled:opacity-40 hover:brightness-110 transition"
                      style={{ background: HEADER_BG }}
                    >
                      {(sending || uploading) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </button>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" className="sr-only" onChange={pickImage} />
                </div>
              )}

              {/* Powered by */}
              <div className="flex items-center justify-center gap-1.5 py-2.5 bg-white border-t border-[#F3F4F6] shrink-0">
                <span className="text-amber-400 text-[11px]">⚡</span>
                <p className="text-[11px] text-[#9CA3AF] font-medium">Powered by UGCads</p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
