"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "How long does a video take to generate?",
    answer: "Most videos are ready in under 2 minutes. Generation time depends on the length of your script and current platform load, but we prioritize speed so you can iterate quickly.",
  },
  {
    question: "Can AI hold my product?",
    answer: "Yes. With our Product Ad mode you can upload your product image and the AI character will naturally hold and present it in the video ad.",
  },
  {
    question: "If I edit an already generated video, will it be considered a new video/take a video credit?",
    answer: "No. Light edits like trimming or caption changes on an existing generated video do not consume a new credit. Only generating a new video from scratch uses a credit.",
  },
  {
    question: "What should I do if my video is taking too long to generate?",
    answer: "If your video has been processing for more than 10 minutes, refresh the page. If it still shows as processing, contact our support team and we'll investigate and refund the credit if needed.",
  },
  {
    question: "How do I upgrade my plan?",
    answer: "Go to Dashboard → Billing → Upgrade Plan. Upgrades take effect immediately and you're billed the prorated difference for the rest of your current billing cycle.",
  },
  {
    question: "How can I cancel?",
    answer: "You can cancel anytime from Dashboard → Billing → Cancel Subscription. Your plan stays active until the end of the billing period and you won't be charged again.",
  },
  {
    question: "Are there any limits on the use of ads made with ugcads?",
    answer: "You own the ads you create. You can use them on any platform — TikTok, Instagram, Facebook, YouTube, and more — for both organic and paid campaigns with no extra licensing fees.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="relative py-24 sm:py-32 bg-[#EEF2FF]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-12 lg:gap-20">

          {/* Left: label + heading */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:sticky lg:top-28 self-start"
          >
            <div className="inline-flex items-center rounded-lg border border-[#C7D2FE] bg-[#E0E7FF] px-3 py-1 text-xs font-semibold text-[#4338CA] mb-5">
              FAQ
            </div>
            <h2
              className="text-3xl sm:text-4xl font-bold tracking-tight text-[#111111] leading-[1.12]"
              style={{ fontFamily: "Satoshi, sans-serif" }}
            >
              We&apos;ve covered everything
            </h2>
            <p className="mt-3 text-[#6B7280]">Everything you need to know.</p>
          </motion.div>

          {/* Right: accordion */}
          <div className="space-y-3">
            {faqs.map((faq, i) => {
              const isOpen = openIndex === i;
              return (
                <motion.div
                  key={faq.question}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="rounded-2xl border border-[#E5E7EB] bg-white overflow-hidden"
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left"
                  >
                    <span className="text-[0.9375rem] font-medium text-[#111111] leading-snug">
                      {faq.question}
                    </span>
                    <ChevronRight
                      className={cn(
                        "h-4.5 w-4.5 flex-shrink-0 text-[#9CA3AF] transition-transform duration-200",
                        isOpen && "rotate-90"
                      )}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="answer"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="px-6 pb-5 text-sm text-[#6B7280] leading-relaxed border-t border-[#F3F4F6] pt-3">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
