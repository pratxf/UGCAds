"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Plus, Minus } from "lucide-react";

function useInView(ref: React.RefObject<HTMLElement | null>, margin = "-80px") {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { rootMargin: margin }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref, margin]);
  return inView;
}

const faqs = [
  {
    question: "How do credits work?",
    answer:
      "Each video generation costs credits based on your plan. Your monthly allowance renews on your billing date. You can purchase additional credits any time if you need more.",
    meta: "Credits",
  },
  {
    question: "Can I upgrade or downgrade my plan?",
    answer:
      "Absolutely. Switch plans at any time from your dashboard. Upgrades take effect immediately with prorated billing, and downgrades apply at the start of your next billing cycle.",
    meta: "Billing",
  },
  {
    question: "Do unused credits expire?",
    answer:
      "No. Unused credits roll over to the next month as long as your subscription is active, so nothing ever goes to waste.",
    meta: "Credits",
  },
  {
    question: "What video formats are supported?",
    answer:
      "We export in MP4 (H.264) optimized for TikTok, Instagram Reels, YouTube Shorts, and Facebook. Choose portrait (9:16), landscape (16:9), or square (1:1) aspect ratios.",
    meta: "Export",
  },
  {
    question: "Can I use my own product images?",
    answer:
      "Yes. Product Ad Mode lets you upload your product images and the AI builds a complete ad narrative around them, including a character presenting your product naturally.",
    meta: "Product",
  },
  {
    question: "What is the $5 Starter plan?",
    answer:
      "The $5 Starter is a one-time purchase, not a subscription. It gives you 1 video generation and 20 product photos so you can try the platform risk-free before committing to a monthly plan.",
    meta: "Pricing",
  },
  {
    question: "What is your refund policy?",
    answer:
      "We offer a 3-day refund window on all subscription plans, provided no credits have been used. Contact support@ugcads.com within 3 days of purchase for a full refund. Failed generations are automatically refunded.",
    meta: "Policy",
  },
];

const metaColors: Record<string, string> = {
  Credits: "bg-blue-50 text-blue-600",
  Billing: "bg-green-50 text-green-600",
  Export: "bg-cyan-50 text-cyan-600",
  Product: "bg-purple-50 text-purple-600",
  Pricing: "bg-amber-50 text-amber-600",
  Policy: "bg-red-50 text-red-600",
};

export default function FAQ() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="relative py-24 sm:py-32 bg-[#F7F7F5]">
      <div
        ref={sectionRef}
        className={cn(
          "mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 transition-all duration-700 ease-out",
          inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}
      >
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-4 py-1.5 text-sm font-medium text-[#6B7280]">
            FAQ
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#111111]">
            Frequently asked questions
          </h2>
          <p className="mt-4 text-base text-[#6B7280]">
            Everything you need to know about ugcads, from credits to exports.
          </p>
        </div>

        {/* Items */}
        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={faq.question}
                className={cn(
                  "rounded-2xl border bg-white overflow-hidden transition-all duration-300",
                  isOpen ? "border-[#2563EB]/30 shadow-sm shadow-blue-100" : "border-[#E5E7EB]",
                  inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                )}
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 p-5 text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={cn("flex-shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium", metaColors[faq.meta] ?? "bg-[#F1F5F9] text-[#6B7280]")}>
                      {faq.meta}
                    </span>
                    <span className="text-sm font-semibold text-[#111111]">{faq.question}</span>
                  </div>
                  <div className={cn(
                    "flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center transition-colors",
                    isOpen ? "bg-[#2563EB] text-white" : "bg-[#F1F5F9] text-[#6B7280]"
                  )}>
                    {isOpen ? <Minus className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                  </div>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-sm text-[#6B7280] leading-relaxed border-t border-[#F3F4F6] pt-4">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
