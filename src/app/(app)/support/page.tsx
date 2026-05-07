"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeadset,
  faEnvelope,
  faChevronDown,
  faArrowRight,
  faBolt,
  faFile,
  faClock,
  faShieldHalved,
  faRotateRight,
  faUser,
  faBookOpen,
  faArrowUpRightFromSquare,
  faMinus,
  faXmark,
  faPaperclip,
  faPaperPlane,
} from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const faqs = [
  {
    icon: faBolt,
    iconBg: "rgba(37,99,235,0.1)",
    iconColor: "#2563EB",
    q: "How do credits work?",
    a: "Credits are consumed per generation. UGC Studio costs 15 to 25 credits per video depending on length. Product Photoshoot costs 1 credit per image. AI Try-On costs 5 credits per result. Credits reset monthly on your billing date.",
  },
  {
    icon: faFile,
    iconBg: "rgba(37,99,235,0.1)",
    iconColor: "#2563EB",
    q: "What formats are supported?",
    a: "Videos are delivered in MP4 (H.264). You can choose 5 or 10 seconds for UGC Studio, and 15 seconds for Kling 2.6. Photoshoot images are delivered as high-resolution JPGs.",
  },
  {
    icon: faClock,
    iconBg: "rgba(37,99,235,0.1)",
    iconColor: "#2563EB",
    q: "How long does generation take?",
    a: "UGC Studio videos take 2 to 4 minutes depending on the model. Product Photoshoots are typically done in about 30 seconds. AI Try-On results are ready in under a minute.",
  },
  {
    icon: faShieldHalved,
    iconBg: "rgba(37,99,235,0.1)",
    iconColor: "#2563EB",
    q: "Can I use the content commercially?",
    a: "Yes. All AI-generated content on UGCAds is fully licensed for commercial use across any platform including TikTok, Instagram, YouTube, and paid ads.",
  },
  {
    icon: faRotateRight,
    iconBg: "rgba(37,99,235,0.1)",
    iconColor: "#2563EB",
    q: "Can I get a refund for a failed generation?",
    a: "Failed generations are automatically detected and refunded to your credit balance within a few minutes. For other refund requests, reach out to our support team.",
  },
  {
    icon: faUser,
    iconBg: "rgba(37,99,235,0.1)",
    iconColor: "#2563EB",
    q: "Can I upload my own avatar or model?",
    a: "Yes. In UGC Studio you can upload a custom avatar image. The AI will animate it with your script and selected voice.",
  },
];

interface ChatMessage {
  id: number;
  from: "user" | "agent";
  text: string;
  time: string;
}

const initialMessages: ChatMessage[] = [
  { id: 1, from: "user", text: "How do credits work?", time: "10:30 AM" },
  { id: 2, from: "agent", text: "Credits are used for every generation you create. The number of credits depends on the type of generation and settings you choose.", time: "10:31 AM" },
  { id: 3, from: "user", text: "Do unused credits expire?", time: "10:31 AM" },
  { id: 4, from: "agent", text: "No, your credits never expire. You can use them anytime.", time: "10:32 AM" },
];

function getTime() {
  const d = new Date();
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  return `${h % 12 || 12}:${m} ${h >= 12 ? "PM" : "AM"}`;
}

/* ------------------------------------------------------------------ */
/*  Agent Avatar                                                       */
/* ------------------------------------------------------------------ */

function AgentAvatar({ initials, bg, size = 32 }: { initials: string; bg: string; size?: number }) {
  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-bold shrink-0"
      style={{ width: size, height: size, background: bg, fontSize: size * 0.38 }}
    >
      {initials}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Live Chat Widget                                                   */
/* ------------------------------------------------------------------ */

function LiveChatWidget({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [minimized, setMinimized] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function send() {
    const text = input.trim();
    if (!text) return;
    const userMsg: ChatMessage = { id: Date.now(), from: "user", text, time: getTime() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    // Simulated agent reply
    setTimeout(() => {
      const replies = [
        "Thanks for reaching out! Our team will get back to you shortly.",
        "That's a great question. Let me check that for you.",
        "Got it! Is there anything else I can help you with?",
        "Sure, I can help with that. Give me a moment.",
      ];
      const reply: ChatMessage = {
        id: Date.now() + 1,
        from: "agent",
        text: replies[Math.floor(Math.random() * replies.length)],
        time: getTime(),
      };
      setMessages((prev) => [...prev, reply]);
    }, 1200);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 24, scale: 0.97 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="fixed bottom-6 right-6 z-50 flex flex-col rounded-2xl bg-white overflow-hidden"
      style={{
        width: 360,
        maxHeight: minimized ? 64 : 560,
        boxShadow: "0 8px 40px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)",
        border: "1px solid #E5E7EB",
        transition: "max-height 0.25s ease",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 shrink-0" style={{ background: "#fff", borderBottom: minimized ? "none" : "1px solid #F3F4F6" }}>
        <div className="flex items-center gap-2.5">
          <span className="size-2.5 rounded-full bg-green-500 shrink-0" />
          <div>
            <p className="text-[13px] font-bold text-[#111111] leading-none">Live chat</p>
            {!minimized && <p className="text-[11px] text-[#6B7280] mt-0.5">We&apos;re online</p>}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMinimized((v) => !v)}
            className="flex h-7 w-7 items-center justify-center rounded-full text-[#9CA3AF] hover:text-[#374151] hover:bg-[#F3F4F6] transition"
          >
            <FontAwesomeIcon icon={faMinus} style={{ fontSize: 12 }} />
          </button>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full text-[#9CA3AF] hover:text-[#374151] hover:bg-[#F3F4F6] transition"
          >
            <FontAwesomeIcon icon={faXmark} style={{ fontSize: 13 }} />
          </button>
        </div>
      </div>

      {!minimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" style={{ background: "#F9FAFB" }}>
            {/* Agent avatars greeting */}
            <div className="flex items-center gap-1 mb-1">
              {[
                { initials: "E", bg: "#7C3AED" },
                { initials: "M", bg: "#2563EB" },
                { initials: "J", bg: "#059669" },
              ].map((a, i) => (
                <div key={i} style={{ marginLeft: i > 0 ? -8 : 0 }}>
                  <AgentAvatar initials={a.initials} bg={a.bg} size={30} />
                </div>
              ))}
            </div>
            <div>
              <p className="text-[13px] font-bold text-[#111111]">Hello! 👋</p>
              <p className="text-[13px] text-[#374151]">How can we help you today?</p>
            </div>

            {messages.map((msg) => (
              <div key={msg.id} className={cn("flex gap-2", msg.from === "user" ? "flex-row-reverse" : "flex-row")}>
                {msg.from === "agent" && (
                  <AgentAvatar initials="E" bg="#7C3AED" size={28} />
                )}
                <div className={cn("max-w-[75%]", msg.from === "user" ? "items-end" : "items-start")}>
                  {msg.from === "agent" && (
                    <p className="text-[10px] font-semibold text-[#9CA3AF] mb-1 ml-1">Emma</p>
                  )}
                  <div
                    className="rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed"
                    style={msg.from === "user"
                      ? { background: "#2563EB", color: "#fff", borderBottomRightRadius: 4 }
                      : { background: "#fff", color: "#111111", border: "1px solid #E5E7EB", borderBottomLeftRadius: 4 }}
                  >
                    {msg.text}
                  </div>
                  <p className={cn("text-[10px] text-[#9CA3AF] mt-1", msg.from === "user" ? "text-right" : "text-left ml-1")}>
                    {msg.time} {msg.from === "user" && "✓"}
                  </p>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 shrink-0 border-t border-[#F3F4F6] bg-white">
            <div className="flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Type a message..."
                className="flex-1 bg-transparent text-[13px] text-[#111111] placeholder-[#9CA3AF] outline-none"
              />
              <button className="text-[#9CA3AF] hover:text-[#6B7280] transition">
                <FontAwesomeIcon icon={faPaperclip} style={{ fontSize: 13 }} />
              </button>
              <button
                onClick={send}
                disabled={!input.trim()}
                className="flex h-7 w-7 items-center justify-center rounded-full transition disabled:opacity-40"
                style={{ background: input.trim() ? "#2563EB" : "#E5E7EB" }}
              >
                <FontAwesomeIcon icon={faPaperPlane} style={{ fontSize: 11, color: input.trim() ? "#fff" : "#9CA3AF" }} />
              </button>
            </div>
            <p className="text-center text-[10px] text-[#C4C9D4] mt-2">Powered by ugcads support</p>
          </div>
        </>
      )}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
      <div className="space-y-5 pb-8 max-w-3xl">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-[#111111]">Support</h1>
          <p className="mt-1 text-sm text-[#6B7280]">We&apos;re here to help. Reach out or find answers to common questions.</p>
        </div>

        {/* Contact cards */}
        <div className="grid gap-4 sm:grid-cols-2">

          {/* Live chat card */}
          <div
            className="rounded-2xl bg-white border border-[#E5E7EB] p-6"
            style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl"
                style={{ background: "rgba(37,99,235,0.1)" }}
              >
                <FontAwesomeIcon icon={faHeadset} style={{ fontSize: 22, color: "#2563EB" }} />
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-[11px] font-semibold text-green-700">
                <span className="size-1.5 rounded-full bg-green-500" />
                Online
              </span>
            </div>

            <h3 className="text-[15px] font-bold text-[#111111]">Live chat</h3>
            <p className="mt-1.5 text-sm text-[#6B7280] leading-relaxed">
              Chat with our team in real time. We typically reply in a few minutes.
            </p>

            <div className="mt-5 flex items-center justify-between">
              <button
                onClick={() => setChatOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-bold text-white transition hover:brightness-105"
                style={{ background: "#2563EB" }}
              >
                Start live chat
                <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 12 }} />
              </button>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[
                    { initials: "E", bg: "#7C3AED" },
                    { initials: "M", bg: "#2563EB" },
                    { initials: "J", bg: "#059669" },
                  ].map((a, i) => (
                    <div key={i} style={{ marginLeft: i > 0 ? -6 : 0 }}>
                      <AgentAvatar initials={a.initials} bg={a.bg} size={24} />
                    </div>
                  ))}
                </div>
                <span className="text-[11px] text-[#6B7280] font-medium">3 agents online</span>
              </div>
            </div>
          </div>

          {/* Email card */}
          <div
            className="rounded-2xl bg-white border border-[#E5E7EB] p-6"
            style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
          >
            <div className="mb-4">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl"
                style={{ background: "rgba(6,182,212,0.1)" }}
              >
                <FontAwesomeIcon icon={faEnvelope} style={{ fontSize: 20, color: "#06B6D4" }} />
              </div>
            </div>

            <h3 className="text-[15px] font-bold text-[#111111]">Email support</h3>
            <p className="mt-1.5 text-sm text-[#6B7280] leading-relaxed">
              Send us an email and we&apos;ll get back to you within 24 hours.
            </p>

            <div className="mt-5 flex items-center gap-4">
              <a
                href="mailto:support@ugcads.com?subject=Support%20Request"
                className="inline-flex items-center gap-2 rounded-xl border border-[#2563EB] px-4 py-2.5 text-[13px] font-semibold text-[#2563EB] transition hover:bg-[#2563EB]/5"
              >
                Send email
                <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 12 }} />
              </a>
              <span className="text-[12px] text-[#6B7280]">support@ugcads.com</span>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div
          className="rounded-2xl bg-white border border-[#E5E7EB] overflow-hidden"
          style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
        >
          <div className="px-6 pt-6 pb-4">
            <h3 className="text-[15px] font-bold text-[#111111]">Frequently asked questions</h3>
            <p className="mt-0.5 text-[13px] text-[#6B7280]">Quick answers to the most common questions</p>
          </div>

          <div className="divide-y divide-[#F3F4F6]">
            {faqs.map((faq, i) => {
              const open = openFaq === i;
              return (
                <div key={i}>
                  <button
                    onClick={() => setOpenFaq(open ? null : i)}
                    className="flex w-full items-center gap-3 px-6 py-4 text-left hover:bg-[#FAFAFA] transition"
                  >
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                      style={{ background: faq.iconBg }}
                    >
                      <FontAwesomeIcon icon={faq.icon} style={{ fontSize: 13, color: faq.iconColor }} />
                    </div>
                    <span className={cn(
                      "flex-1 text-[13px] font-semibold",
                      open ? "text-[#111111]" : "text-[#374151]"
                    )}>
                      {faq.q}
                    </span>
                    <FontAwesomeIcon
                      icon={faChevronDown}
                      className={cn("shrink-0 text-[#9CA3AF] transition-transform duration-200", open && "rotate-180")}
                      style={{ fontSize: 12 }}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="overflow-hidden"
                      >
                        <p className="px-6 pb-4 pl-[4.25rem] text-sm text-[#6B7280] leading-relaxed">{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* Still need help footer */}
        <div
          className="rounded-2xl bg-white border border-[#E5E7EB] px-6 py-4 flex items-center gap-4"
          style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
        >
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            style={{ background: "rgba(99,102,241,0.1)" }}
          >
            <FontAwesomeIcon icon={faBookOpen} style={{ fontSize: 16, color: "#6366F1" }} />
          </div>
          <div className="flex-1">
            <p className="text-[13px] font-bold text-[#111111]">Still need help?</p>
            <p className="text-[12px] text-[#6B7280]">Check out our Help Center for detailed guides and tutorials.</p>
          </div>
          <a
            href="mailto:support@ugcads.com?subject=Support%20Request"
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] px-4 py-2 text-[13px] font-semibold text-[#374151] transition whitespace-nowrap"
          >
            Visit Help Center
            <FontAwesomeIcon icon={faArrowUpRightFromSquare} style={{ fontSize: 11 }} />
          </a>
        </div>
      </div>

      {/* Live chat widget */}
      <AnimatePresence>
        {chatOpen && <LiveChatWidget onClose={() => setChatOpen(false)} />}
      </AnimatePresence>
    </>
  );
}
