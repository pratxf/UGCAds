"use client";

import { useState } from "react";
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
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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
                onClick={() => window.dispatchEvent(new CustomEvent("support:open"))}
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
                href="mailto:support@ugcads.us?subject=Support%20Request"
                className="inline-flex items-center gap-2 rounded-xl border border-[#2563EB] px-4 py-2.5 text-[13px] font-semibold text-[#2563EB] transition hover:bg-[#2563EB]/5"
              >
                Send email
                <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 12 }} />
              </a>
              <span className="text-[12px] text-[#6B7280]">support@ugcads.us</span>
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

      </div>

    </>
  );
}
