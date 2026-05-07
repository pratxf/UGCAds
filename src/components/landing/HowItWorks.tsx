"use client";

import { motion } from "framer-motion";
import { Sparkles, Mic, ChevronDown } from "lucide-react";

function ScriptEditorMockup() {
  return (
    <div className="w-full max-w-sm rounded-2xl border border-[#E5E7EB] bg-white shadow-sm overflow-hidden">
      <div className="flex items-start justify-between gap-3 p-4 border-b border-[#F3F4F6]">
        <span className="text-sm text-[#9CA3AF]">Write your script...</span>
        <div className="flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-100 px-2.5 py-1 whitespace-nowrap">
          <Sparkles className="h-3 w-3 text-indigo-500" />
          <span className="text-[11px] font-medium text-indigo-500">AI Script writer</span>
        </div>
      </div>
      <div className="h-16" />
      <div className="px-4 py-2.5 border-t border-[#F3F4F6] flex items-center justify-between">
        <span className="text-xs text-[#2563EB] font-medium">+ Credits <span className="text-[#6B7280]">6</span></span>
        <span className="text-xs text-[#9CA3AF]">0/1000</span>
      </div>
      <div className="px-4 py-3 flex items-center gap-2">
        <button className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs text-[#374151]">
          🎬 Talking Actors
          <ChevronDown className="h-3 w-3 text-[#9CA3AF]" />
        </button>
        <button className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs text-[#374151]">
          + Add Actors
        </button>
        <button className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs text-[#374151]">
          <Mic className="h-3 w-3" /> Edit Voice
        </button>
      </div>
    </div>
  );
}

const CELL = "p-10 flex flex-col justify-end min-h-[280px]";
const CELL_IMG = "overflow-hidden flex items-end justify-center min-h-[280px] relative bg-[#F6F8FF]";

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative bg-[#EEF2FF] py-24 sm:py-32">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center rounded-full border border-[#C7D2FE] bg-[#E0E7FF] px-4 py-1.5 text-sm font-medium text-[#4338CA] mb-5">
            Never been easier
          </div>
          <h2
            className="text-4xl sm:text-5xl lg:text-[3.25rem] font-bold tracking-tight text-[#111111] leading-[1.1]"
            style={{ fontFamily: "Satoshi, sans-serif" }}
          >
            Create{" "}
            <span style={{
              background: "linear-gradient(135deg, #2563EB 0%, #818CF8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              AI UGC
            </span>{" "}
            videos in minutes
          </h2>
          <p className="mt-4 text-[1.0625rem] text-[#6B7280]">
            From idea to video in minutes — ready to use instantly.
          </p>
        </motion.div>

        {/* Seamless bento grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="overflow-hidden rounded-3xl border border-[#E5E7EB] bg-white"
        >
          {/* Row 1 */}
          <div className="grid grid-cols-2 divide-x divide-[#E5E7EB]">
            {/* Text cell */}
            <div className={CELL}>
              <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-widest mb-3">Step 01</p>
              <h3 className="text-2xl font-bold text-[#111111] mb-3" style={{ fontFamily: "Satoshi, sans-serif" }}>
                Write or generate your script
              </h3>
              <p className="text-sm text-[#6B7280] leading-relaxed">
                Enter or automatically generate a script that aligns with your brand&apos;s message to personalize your AI-generated video.
              </p>
            </div>
            {/* Mockup cell — card1 */}
            <div className={CELL_IMG} style={{ minHeight: 280 }}>
              <img
                src="/images/howitworks-card1.avif"
                alt="UGC Studio script editor"
                className="w-full h-full object-cover object-top"
                style={{ minHeight: 280 }}
              />
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-[#E5E7EB]" />

          {/* Row 2 */}
          <div className="grid grid-cols-2 divide-x divide-[#E5E7EB]">
            {/* Image cell — card2 */}
            <div className={CELL_IMG} style={{ minHeight: 300 }}>
              <img
                src="/images/howitworks-card2.avif"
                alt="AI actors"
                className="w-full h-full object-cover object-top"
                style={{ minHeight: 300 }}
              />
            </div>
            {/* Text cell */}
            <div className={CELL}>
              <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-widest mb-3">Step 02</p>
              <h3 className="text-2xl font-bold text-[#111111] mb-3" style={{ fontFamily: "Satoshi, sans-serif" }}>
                Choose from 500+ AI actors
              </h3>
              <p className="text-sm text-[#6B7280] leading-relaxed">
                Select the perfect AI actor to represent your message and build visual consistency across every campaign.
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-[#E5E7EB]" />

          {/* Row 3 */}
          <div className="grid grid-cols-2 divide-x divide-[#E5E7EB]">
            {/* Text cell */}
            <div className={CELL}>
              <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-widest mb-3">Step 03</p>
              <h3 className="text-2xl font-bold text-[#111111] mb-3" style={{ fontFamily: "Satoshi, sans-serif" }}>
                Generate your video
              </h3>
              <p className="text-sm text-[#6B7280] leading-relaxed">
                Combine the selected avatar and script to quickly produce a high-quality, personalized video for your brand in minutes.
              </p>
            </div>
            {/* Image cell — card3 */}
            <div className={CELL_IMG} style={{ minHeight: 300 }}>
              <img
                src="/images/howitworks-card3.avif"
                alt="Generated video"
                className="w-full h-full object-cover object-top"
                style={{ minHeight: 300 }}
              />
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-[#E5E7EB]" />

          {/* Language section */}
          <div className="p-8">
            <div
              className="w-full overflow-hidden mb-6"
              style={{ borderRadius: 16, aspectRatio: "3 / 1", background: "#E8EEFF" }}
            >
              <img
                src="/images/languages-flags.avif"
                alt="50+ language flags"
                className="w-full h-full object-cover object-center"
                style={{ transform: "scale(1.22)", mixBlendMode: "multiply" }}
              />
            </div>
            <div className="text-center">
              <p className="text-base font-bold text-[#111111]">50+ Languages</p>
              <p className="text-sm text-[#6B7280] mt-0.5">
                Instantly localize your videos with native voices and perfect lip-sync.
              </p>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
