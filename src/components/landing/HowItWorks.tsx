"use client";

import { motion } from "framer-motion";
import { Sparkles, Mic, Film, ChevronDown } from "lucide-react";

/* ── Step dot indicator ─────────────────────────────────── */
function StepDots({ active }: { active: number }) {
  return (
    <div className="flex items-center gap-1.5 mb-6">
      {[0, 1, 2].map((i) =>
        i === active ? (
          <div key={i} className="h-2 w-5 rounded-full bg-[#2563EB]" />
        ) : (
          <div key={i} className="h-2 w-2 rounded-full bg-[#D1D5DB]" />
        )
      )}
    </div>
  );
}

/* ── Script editor mockup ───────────────────────────────── */
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

/* ── Actor grid mockup ──────────────────────────────────── */
const actors = [
  { name: "Angela", src: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=200", h: 108 },
  { name: "Mike",   src: "https://images.unsplash.com/photo-1500048993953-d23a436266cf?auto=format&fit=crop&q=80&w=200", h: 108 },
  { name: "Saman",  src: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&q=80&w=200", h: 132 },
  { name: "Mila",   src: "https://images.unsplash.com/photo-1526510747491-58f928ec870f?auto=format&fit=crop&q=80&w=200", h: 108 },
  { name: "Jason",  src: "https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?auto=format&fit=crop&q=80&w=200", h: 108 },
];

function ActorGrid() {
  return (
    <div className="flex items-end justify-center gap-2 px-6 py-4">
      {actors.map((a) => (
        <div key={a.name} className="flex flex-col items-center gap-1">
          <div
            className="relative rounded-xl overflow-hidden w-16"
            style={{ height: a.h }}
          >
            <img src={a.src} alt={a.name} className="w-full h-full object-cover" />
            <div className="absolute top-1.5 right-1.5 rounded bg-black/60 px-1 py-px text-[9px] font-bold text-white leading-none">
              HD
            </div>
          </div>
          <span className="text-[10px] text-[#6B7280]">{a.name}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Video stack mockup ─────────────────────────────────── */
const videoSrcs = [
  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=300",
  "https://images.unsplash.com/photo-1500048993953-d23a436266cf?auto=format&fit=crop&q=80&w=300",
  "https://images.unsplash.com/photo-1526510747491-58f928ec870f?auto=format&fit=crop&q=80&w=300",
];

function VideoStack() {
  return (
    <div className="relative h-48 w-full flex items-center justify-center">
      {videoSrcs.map((src, i) => (
        <div
          key={i}
          className="absolute rounded-xl overflow-hidden border-2 border-white shadow-lg"
          style={{
            width:  i === 1 ? 110 : 86,
            height: i === 1 ? 150 : 120,
            left:   `calc(50% + ${(i - 1) * 72}px)`,
            transform: `translateX(-50%) rotate(${(i - 1) * 6}deg)`,
            zIndex: i === 1 ? 3 : i === 0 ? 1 : 2,
          }}
        >
          <img src={src} alt="" className="w-full h-full object-cover" />
          {i === 1 && (
            <div className="absolute top-1.5 left-1.5 rounded bg-black/70 px-1.5 py-px text-[9px] font-semibold text-white">
              01:48
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Main component ─────────────────────────────────────── */
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
          className="text-center mb-14"
        >
          <div className="inline-flex items-center rounded-full border border-[#C7D2FE] bg-[#E0E7FF] px-4 py-1.5 text-sm font-medium text-[#4338CA] mb-5">
            Never been easier
          </div>
          <h2
            className="text-4xl sm:text-5xl lg:text-[3.25rem] font-bold tracking-tight text-[#111111] leading-[1.1]"
            style={{ fontFamily: "Satoshi, sans-serif" }}
          >
            Create{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #2563EB 0%, #818CF8 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              AI UGC
            </span>{" "}
            videos in minutes
          </h2>
          <p className="mt-4 text-[1.0625rem] text-[#6B7280]">
            From idea to video in minutes — ready to use instantly.
          </p>
        </motion.div>

        {/* Bento rows */}
        <div className="space-y-3">

          {/* Row 1 */}
          <div className="grid grid-cols-2 gap-3">
            <motion.div
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}
              className="rounded-2xl bg-white border border-[#E5E7EB] p-8 flex flex-col justify-end min-h-[240px]"
            >
              <StepDots active={0} />
              <h3 className="text-xl font-bold text-[#111111] mb-2" style={{ fontFamily: "Satoshi, sans-serif" }}>
                Write or generate your script
              </h3>
              <p className="text-sm text-[#6B7280] leading-relaxed">
                Enter or automatically generate a script that aligns with your brand&apos;s message to personalize your AI-generated video.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.15 }}
              className="rounded-2xl bg-white border border-[#E5E7EB] flex items-center justify-center p-6 min-h-[240px]"
            >
              <ScriptEditorMockup />
            </motion.div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-2 gap-3">
            <motion.div
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}
              className="rounded-2xl bg-white border border-[#E5E7EB] flex items-center min-h-[240px] overflow-hidden"
            >
              <ActorGrid />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.15 }}
              className="rounded-2xl bg-white border border-[#E5E7EB] p-8 flex flex-col justify-end min-h-[240px]"
            >
              <StepDots active={1} />
              <h3 className="text-xl font-bold text-[#111111] mb-2" style={{ fontFamily: "Satoshi, sans-serif" }}>
                Choose from 500+ AI actors
              </h3>
              <p className="text-sm text-[#6B7280] leading-relaxed">
                Select the perfect AI actor to represent your message and build visual consistency across every campaign.
              </p>
            </motion.div>
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-2 gap-3">
            <motion.div
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}
              className="rounded-2xl bg-white border border-[#E5E7EB] p-8 flex flex-col justify-end min-h-[240px]"
            >
              <StepDots active={2} />
              <h3 className="text-xl font-bold text-[#111111] mb-2" style={{ fontFamily: "Satoshi, sans-serif" }}>
                Generate your video
              </h3>
              <p className="text-sm text-[#6B7280] leading-relaxed">
                Combine the selected avatar and script to quickly produce a high-quality, personalized video for your brand in minutes.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.15 }}
              className="rounded-2xl bg-white border border-[#E5E7EB] flex items-center justify-center overflow-hidden min-h-[240px]"
            >
              <VideoStack />
            </motion.div>
          </div>
        </div>

        {/* Language section */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-10"
        >
          <div
            className="w-full overflow-hidden mb-6"
            style={{ borderRadius: 24, aspectRatio: "3 / 1", background: "#E8EEFF" }}
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
        </motion.div>

      </div>
    </section>
  );
}
