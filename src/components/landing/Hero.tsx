"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Play, Star, Zap, Clock, Shield, TrendingUp } from "lucide-react";

const FADE_UP = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

const avatars = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=80&h=80",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=80&h=80",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=80&h=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=80&h=80",
];

const stats = [
  { icon: Zap,    bold: "10,000+",         muted: "ads generated" },
  { icon: Clock,  bold: "Ready in",        muted: "under 2 minutes" },
  { icon: Shield, bold: "Cancel",          muted: "anytime" },
];

const brandLogos = [
  { name: "Verizon", suffix: "✓" },
  { name: "Airwallex", suffix: "" },
  { name: "HubSpot", suffix: "" },
  { name: "sunski", suffix: "" },
  { name: "Wilson", suffix: "" },
];

export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-white via-[#F4F7FF] to-[#EEF2FF] pt-20 pb-16 sm:pt-24 sm:pb-20">

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* ── Left column ─────────────────────────────────── */}
          <div className="flex flex-col">

            {/* Trust badge */}
            <motion.div
              custom={0} variants={FADE_UP} initial="hidden" animate="show"
              className="mb-6 flex items-center gap-3 flex-wrap"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-4 py-1.5 text-sm font-medium text-[#374151] shadow-sm">
                <Star className="h-3.5 w-3.5 fill-[#2563EB] text-[#2563EB]" />
                Trusted by 10,000+ brands worldwide
              </div>

              {/* Avatar stack */}
              <div className="flex items-center">
                <div className="flex -space-x-2.5">
                  {avatars.map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt=""
                      className="h-8 w-8 rounded-full border-2 border-white object-cover"
                      style={{ zIndex: avatars.length - i }}
                    />
                  ))}
                </div>
                <span className="ml-2 text-sm font-semibold text-[#6B7280]">+10K</span>
              </div>
            </motion.div>

            {/* Heading */}
            <motion.h1
              custom={1} variants={FADE_UP} initial="hidden" animate="show"
              className="text-[2.75rem] sm:text-5xl lg:text-[3.5rem] font-bold tracking-tight text-[#111111] leading-[1.08]"
              style={{ fontFamily: "Satoshi, sans-serif" }}
            >
              Create{" "}
              <span className="gradient-text">Human Looking</span>{" "}
              Ads in Minutes
            </motion.h1>

            {/* Subtext */}
            <motion.p
              custom={2} variants={FADE_UP} initial="hidden" animate="show"
              className="mt-5 text-[1.0625rem] text-[#6B7280] leading-relaxed max-w-lg"
            >
              AI video ads with real-looking characters and authentic voices.
              No studio, no actors, no editing skills needed.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              custom={3} variants={FADE_UP} initial="hidden" animate="show"
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-xl bg-[#2563EB] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                Start for Free
                <span className="text-base leading-none">→</span>
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-7 py-3.5 text-sm font-medium text-[#374151] hover:border-[#D1D5DB] hover:bg-[#F9FAFB] transition-all duration-200"
              >
                <Play className="h-3.5 w-3.5 fill-[#2563EB] text-[#2563EB]" />
                See How It Works
              </Link>
            </motion.div>

            {/* Stats row */}
            <motion.div
              custom={4} variants={FADE_UP} initial="hidden" animate="show"
              className="mt-10 flex items-center gap-6 flex-wrap"
            >
              {stats.map(({ icon: Icon, bold, muted }) => (
                <div key={bold} className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 border border-blue-100 flex-shrink-0">
                    <Icon className="h-4 w-4 text-[#2563EB]" />
                  </div>
                  <div className="flex flex-col leading-tight">
                    <span className="text-sm font-bold text-[#111111]">{bold}</span>
                    <span className="text-xs text-[#9CA3AF]">{muted}</span>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ── Right column ─────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
            className="relative flex flex-col"
          >
            {/* Blob behind card */}
            <div className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-blue-200/40 to-indigo-200/30 blur-2xl -z-10" />

            {/* Video card */}
            <div className="relative rounded-2xl overflow-hidden border border-white/80 shadow-2xl shadow-blue-900/10 bg-[#1a1a2e] aspect-[4/3]">
              <video
                src="/videos/hero-reel.mov"
                autoPlay muted loop playsInline preload="auto"
                className="w-full h-full object-cover"
              />

              {/* Top-left: AI Generated badge */}
              <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5 rounded-full bg-white/95 backdrop-blur-sm px-3 py-1.5 shadow-sm border border-white/60">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2563EB]">
                  <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none">
                    <path d="M6 1l1.5 3h3L8 6l1 3.5L6 8l-3 1.5L4 6 1.5 4h3z" fill="currentColor"/>
                  </svg>
                </div>
                <span className="text-xs font-semibold text-[#111111]">AI Generated</span>
              </div>

              {/* Top-right: ROAS card */}
              <div className="absolute top-3.5 right-3.5 rounded-xl bg-white/95 backdrop-blur-sm border border-white/60 shadow-sm px-3 py-2">
                <div className="text-[10px] font-medium text-[#9CA3AF] leading-none mb-1">Avg. ROAS</div>
                <div className="flex items-center gap-1">
                  <span className="text-lg font-bold text-[#2563EB] leading-none">3.1x</span>
                  <TrendingUp className="h-3.5 w-3.5 text-[#10B981]" strokeWidth={2.5} />
                </div>
              </div>

              {/* Bottom: caption bar */}
              <div className="absolute bottom-0 left-0 right-0 flex items-center gap-3 bg-black/60 backdrop-blur-sm px-4 py-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#2563EB]">
                  {/* Waveform icon */}
                  <svg className="h-4 w-4 text-white" viewBox="0 0 16 16" fill="currentColor">
                    <rect x="1" y="5" width="2" height="6" rx="1"/>
                    <rect x="4.5" y="2" width="2" height="12" rx="1"/>
                    <rect x="8" y="4" width="2" height="8" rx="1"/>
                    <rect x="11.5" y="1" width="2" height="14" rx="1"/>
                  </svg>
                </div>
                <p className="flex-1 text-xs text-white font-medium leading-snug">
                  I've tried so many products, but this one changed everything.
                </p>
                <span className="flex-shrink-0 rounded-md bg-black/40 px-2 py-0.5 text-[11px] font-semibold text-white">
                  1:47
                </span>
              </div>
            </div>

            {/* Brand logos below card */}
            <div className="mt-5">
              <p className="text-[10px] font-semibold tracking-widest text-[#9CA3AF] uppercase mb-3">
                Trusted by leading brands
              </p>
              <div className="flex items-center gap-5 flex-wrap">
                {brandLogos.map(({ name, suffix }) => (
                  <span
                    key={name}
                    className="text-sm font-bold text-[#9CA3AF] hover:text-[#6B7280] transition-colors tracking-tight"
                    style={{ fontFamily: "Satoshi, sans-serif" }}
                  >
                    {name}{suffix}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
