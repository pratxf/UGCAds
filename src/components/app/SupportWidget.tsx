"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { MessageCircle, X, Send, Loader2, ChevronLeft, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Message = { id: string; fromAdmin: boolean; body: string; createdAt: string };
type Ticket = {
  id: string;
  subject: string;
  status: "OPEN" | "REPLIED" | "CLOSED";
  updatedAt: string;
  messages: Message[];
};

const PREMADE = [
  { label: "Generation failed", subject: "My generation failed or errored" },
  { label: "Credits not working", subject: "Credits issue" },
  { label: "Billing issue", subject: "Billing or payment problem" },
  { label: "Request a refund", subject: "I need a refund" },
  { label: "How does pricing work?", subject: "Question about pricing" },
  { label: "Something else", subject: "General question" },
];

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

function MessageBubble({ msg }: { msg: Message }) {
  const isImg = isImageUrl(msg.body);
  return (
    <div className={cn("flex", msg.fromAdmin ? "justify-start" : "justify-end")}>
      {msg.fromAdmin && (
        <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#2563EB] text-[9px] font-bold text-white mr-2 mt-0.5">S</div>
      )}
      <div className={cn("max-w-[80%] rounded-2xl overflow-hidden", msg.fromAdmin ? "bg-[#F3F4F6] rounded-tl-sm" : "bg-[#2563EB] rounded-tr-sm")}>
        {isImg ? (
          <img src={msg.body} alt="attachment" className="max-w-full max-h-48 object-contain" />
        ) : (
          <div className="px-3.5 py-2.5">
            <p className={cn("text-sm leading-relaxed whitespace-pre-wrap", msg.fromAdmin ? "text-[#111111]" : "text-white")}>{msg.body}</p>
            <p className={cn("text-[10px] mt-1", msg.fromAdmin ? "text-[#9CA3AF]" : "text-white/60")}>{relTime(msg.createdAt)}</p>
          </div>
        )}
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
  const [loading, setLoading] = useState(false);
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

  useEffect(() => { if (open) { setLoading(true); loadTickets().finally(() => setLoading(false)); } }, [open]);
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
        className="fixed bottom-6 right-6 z-[200] flex size-14 items-center justify-center rounded-full bg-[#2563EB] text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-700 hover:scale-105 active:scale-95"
        aria-label="Support"
      >
        {open ? <X className="h-5 w-5" /> : (
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
        <div className="fixed bottom-24 right-6 z-[199] w-[440px] max-w-[calc(100vw-1.5rem)] rounded-2xl bg-white border border-[#E5E7EB] shadow-2xl shadow-black/10 overflow-hidden flex flex-col" style={{ maxHeight: "min(680px, calc(100vh - 120px))" }}>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 bg-[#2563EB] shrink-0">
            <div className="flex items-center gap-3.5">
              <div className="flex size-11 items-center justify-center rounded-full bg-white/20">
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-[15px] font-bold text-white">Support</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={cn("size-2 rounded-full", adminOnline ? "bg-green-400" : "bg-white/40")} />
                  <p className="text-[12px] text-white/80">{adminOnline ? "Online now" : "We'll reply soon"}</p>
                </div>
              </div>
            </div>
            {view === "conversation" && (
              <button onClick={() => { setView("home"); setSelectedTicket(null); }} className="flex size-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition">
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Home view */}
          {view === "home" && (
            <div className="flex-1 overflow-y-auto">
              {/* Greeting */}
              <div className="px-6 pt-6 pb-5">
                <p className="text-[17px] font-bold text-[#111111]">How can we help?</p>
                <p className="text-[13px] text-[#6B7280] mt-1">Pick a topic and we'll get back to you.</p>
              </div>

              {/* Premade questions */}
              <div className="px-5 pb-5 grid grid-cols-2 gap-2.5">
                {PREMADE.map((q) => (
                  <button
                    key={q.subject}
                    onClick={() => startConversation(q.subject)}
                    disabled={starting}
                    className="text-left rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3.5 text-[13px] font-semibold text-[#374151] hover:border-[#2563EB]/40 hover:bg-blue-50/50 hover:text-[#2563EB] transition-all disabled:opacity-50"
                  >
                    {q.label}
                  </button>
                ))}
              </div>

              {/* Existing conversations */}
              {loading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-4 w-4 animate-spin text-[#9CA3AF]" />
                </div>
              ) : tickets.length > 0 && (
                <div>
                  <p className="px-6 py-2.5 text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wide border-t border-[#F3F4F6]">Previous conversations</p>
                  {tickets.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => openTicket(t)}
                      className="w-full text-left px-6 py-4 hover:bg-[#F9FAFB] transition border-b border-[#F3F4F6] last:border-0"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[14px] font-semibold text-[#111111] truncate flex-1">{t.subject}</p>
                        {t.status === "REPLIED" && <span className="shrink-0 size-2 rounded-full bg-[#2563EB]" />}
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-full",
                          t.status === "REPLIED" ? "bg-blue-100 text-[#2563EB]" :
                          t.status === "CLOSED" ? "bg-gray-100 text-gray-500" :
                          "bg-amber-100 text-amber-700"
                        )}>
                          {t.status === "REPLIED" ? "Reply received" : t.status === "CLOSED" ? "Resolved" : "Awaiting reply"}
                        </span>
                        <span className="text-[10px] text-[#9CA3AF]">{relTime(t.updatedAt)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Conversation view */}
          {view === "conversation" && selectedTicket && (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Ticket sub-header */}
              <div className="px-5 py-3 border-b border-[#F3F4F6] bg-[#F9FAFB] shrink-0">
                <p className="text-[13px] font-semibold text-[#374151] truncate">{selectedTicket.subject}</p>
                <p className="text-[11px] text-[#9CA3AF] mt-0.5">
                  {selectedTicket.status === "CLOSED" ? "Resolved" : selectedTicket.status === "REPLIED" ? "Admin replied" : "Awaiting reply"}
                </p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
                {selectedTicket.messages.length === 0 && (
                  <p className="text-center text-xs text-[#9CA3AF] py-4">Send your first message below.</p>
                )}
                {selectedTicket.messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply bar or closed state */}
              {selectedTicket.status === "CLOSED" ? (
                <div className="px-5 py-5 border-t border-[#F3F4F6] text-center shrink-0">
                  <p className="text-[13px] text-[#9CA3AF]">This conversation has been resolved.</p>
                </div>
              ) : (
                <div className="px-5 py-4 border-t border-[#F3F4F6] shrink-0">
                  {/* Image preview */}
                  {imagePreview && (
                    <div className="relative mb-2 inline-block">
                      <img src={imagePreview} alt="preview" className="h-16 w-16 rounded-lg object-cover border border-[#E5E7EB]" />
                      <button onClick={removeImage} className="absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full bg-gray-600 text-white text-[8px]">✕</button>
                    </div>
                  )}
                  <div className="flex items-end gap-2">
                    <div className="flex-1 flex items-end gap-1 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2 focus-within:border-[#2563EB]/50 focus-within:ring-2 focus-within:ring-[#2563EB]/20 transition-all">
                      <textarea
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
                        placeholder="Type a message..."
                        rows={1}
                        className="flex-1 bg-transparent text-sm text-[#111111] placeholder:text-[#9CA3AF] focus:outline-none resize-none max-h-24 leading-5"
                        style={{ minHeight: "20px" }}
                        onInput={(e) => {
                          const t = e.currentTarget;
                          t.style.height = "auto";
                          t.style.height = Math.min(t.scrollHeight, 96) + "px";
                        }}
                      />
                      <button onClick={() => fileInputRef.current?.click()} className="shrink-0 text-[#9CA3AF] hover:text-[#2563EB] transition-colors pb-0.5">
                        <ImageIcon className="h-4 w-4" />
                      </button>
                    </div>
                    <button
                      onClick={sendReply}
                      disabled={(!reply.trim() && !imageFile) || sending}
                      className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#2563EB] text-white disabled:opacity-40 hover:bg-blue-700 transition"
                    >
                      {(sending || uploading) ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" className="sr-only" onChange={pickImage} />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
