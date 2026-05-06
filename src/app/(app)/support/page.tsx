"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeadset,
  faEnvelope,
  faChevronRight,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "How do credits work?",
    a: "Credits are consumed per generation. UGC Studio costs 15 to 25 credits per video depending on length. Product Photoshoot costs 1 credit per image. AI Try-On costs 5 credits per result. Credits reset monthly on your billing date.",
  },
  {
    q: "What formats are supported?",
    a: "Videos are delivered in MP4 (H.264). You can choose 5 or 10 seconds for UGC Studio, and 15 seconds for Kling 2.6. Photoshoot images are delivered as high-resolution JPGs.",
  },
  {
    q: "How long does generation take?",
    a: "UGC Studio videos take 2 to 4 minutes depending on the model. Product Photoshoots are typically done in about 30 seconds. AI Try-On results are ready in under a minute.",
  },
  {
    q: "Can I use the content commercially?",
    a: "Yes. All AI-generated content on UGCAds is fully licensed for commercial use across any platform including TikTok, Instagram, YouTube, and paid ads.",
  },
  {
    q: "Can I get a refund for a failed generation?",
    a: "Failed generations are automatically detected and refunded to your credit balance within a few minutes. For other refund requests, reach out to our support team.",
  },
  {
    q: "Can I upload my own avatar or model?",
    a: "Yes. In UGC Studio you can upload a custom avatar image. The AI will animate it with your script and selected voice.",
  },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4 pb-8">

      {/* Header */}
      <motion.div variants={fadeUp}>
        <h1 className="text-xl font-bold text-[#111111]">Support</h1>
        <p className="mt-1 text-sm text-[#6B7280]">We&apos;re here to help. Reach out or browse common questions below.</p>
      </motion.div>

      {/* Contact channels */}
      <motion.div variants={fadeUp} className="grid gap-3 sm:grid-cols-2">

        {/* Live chat */}
        <div
          className="group relative overflow-hidden rounded-3xl p-6 cursor-pointer transition-all hover:scale-[1.01]"
          style={{
            background: "linear-gradient(135deg, rgba(37,99,235,0.08) 0%, rgba(37,99,235,0.03) 100%)",
            border: "1px solid rgba(37,99,235,0.2)",
          }}
        >
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl mb-4"
            style={{ background: "rgba(37,99,235,0.1)", border: "1px solid rgba(37,99,235,0.2)" }}
          >
            <FontAwesomeIcon icon={faHeadset} style={{ fontSize: 22, color: "#2563EB" }} />
          </div>
          <h3 className="text-base font-bold text-[#111111]">Live chat</h3>
          <p className="mt-1.5 text-sm text-[#6B7280] leading-relaxed">
            Chat with our team in real time. We&apos;re online Monday to Friday, 9am to 6pm EST.
          </p>
          <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#2563EB] group-hover:gap-2.5 transition-all">
            Start chat
            <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 13 }} />
          </div>
        </div>

        {/* Email */}
        <a
          href="mailto:support@ugcads.com"
          className="group relative overflow-hidden rounded-3xl p-6 transition-all hover:scale-[1.01]"
          style={{
            background: "linear-gradient(135deg, rgba(6,182,212,0.08) 0%, rgba(6,182,212,0.03) 100%)",
            border: "1px solid rgba(6,182,212,0.2)",
          }}
        >
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl mb-4"
            style={{ background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.25)" }}
          >
            <FontAwesomeIcon icon={faEnvelope} style={{ fontSize: 22, color: "#06B6D4" }} />
          </div>
          <h3 className="text-base font-bold text-[#111111]">Email support</h3>
          <p className="mt-1.5 text-sm text-[#6B7280] leading-relaxed">
            Send us an email at <span className="text-[#374151] font-medium">support@ugcads.com</span> and we&apos;ll reply within 24 hours.
          </p>
          <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#06B6D4] group-hover:gap-2.5 transition-all">
            Send email
            <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 13 }} />
          </div>
        </a>
      </motion.div>

      {/* FAQ */}
      <motion.div
        variants={fadeUp}
        className="rounded-3xl border border-[#E5E7EB] bg-white p-6"
      >
        <div className="mb-5">
          <h3 className="text-base font-bold text-[#111111]">Frequently asked questions</h3>
          <p className="mt-0.5 text-xs text-[#6B7280]">Quick answers to the most common questions</p>
        </div>
        <div className="divide-y divide-[#F3F4F6]">
          {faqs.map((faq, i) => {
            const open = openFaq === i;
            return (
              <div key={i} className="py-0.5">
                <button
                  onClick={() => setOpenFaq(open ? null : i)}
                  className="flex w-full items-center justify-between py-3.5 text-left group/faq"
                >
                  <span className={cn("text-[13px] font-semibold pr-4 transition-colors", open ? "text-[#111111]" : "text-[#374151] group-hover/faq:text-[#111111]")}>
                    {faq.q}
                  </span>
                  <FontAwesomeIcon
                    icon={faChevronRight}
                    className={cn("shrink-0 text-[#9CA3AF] transition-transform duration-200", open ? "rotate-90" : "rotate-0")}
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
                      <p className="pb-4 pr-8 text-sm text-[#6B7280] leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Footer note */}
      <motion.p variants={fadeUp} className="text-xs text-[#9CA3AF] text-center pb-2">
        Still stuck? Email us at support@ugcads.com and we&apos;ll get back to you within 24 hours.
      </motion.p>

    </motion.div>
  );
}
