"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Play, Star, Zap, Clock, Shield } from "lucide-react";

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
  { icon: Zap,    bold: "10K+",         muted: "ads generated" },
  { icon: Clock,  bold: "Ready in",        muted: "under 2 minutes" },
  { icon: Shield, bold: "Cancel",          muted: "anytime" },
];


export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden bg-[#F6F8FF] pt-20 pb-16 sm:pt-24 sm:pb-20">

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
                Trusted by 200+ brands worldwide
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
              </div>
            </motion.div>

            {/* Heading */}
            <motion.h1
              custom={1} variants={FADE_UP} initial="hidden" animate="show"
              className="text-[2.75rem] sm:text-5xl lg:text-[3.5rem] font-bold tracking-tight text-[#111111] leading-[1.08]"
              style={{ fontFamily: "Satoshi, sans-serif" }}
            >
              Create{" "}
              <span style={{
                background: "linear-gradient(90deg, #2563EB, #4F46E5)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>Human Looking</span>{" "}
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
                className="inline-flex items-center gap-2 rounded-2xl bg-[#2563EB] px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                Start at $5
                <span className="text-base leading-none">→</span>
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex items-center gap-2 rounded-2xl border border-[#E5E7EB] bg-white px-7 py-3.5 text-sm font-medium text-[#374151] hover:border-[#D1D5DB] hover:bg-[#F9FAFB] transition-all duration-200"
              >
                <Play className="h-3.5 w-3.5 fill-[#111111] text-[#111111]" />
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
            className="relative w-full aspect-[1.58]"
          >
            {/* Decorative card 1 — back, blue, rotated counter-clockwise */}
            <div className="absolute inset-0 bg-[#DFE6FA] rounded-[24px] shadow-sm" style={{ transform: "rotate(-4.5deg)" }} />

            {/* Decorative card 2 — middle, white, rotated clockwise */}
            <div className="absolute inset-0 bg-white rounded-[24px] shadow-sm" style={{ transform: "rotate(3.5deg)" }} />

            {/* Foreground video card */}
            <div className="absolute inset-0 rounded-[24px] overflow-hidden shadow-[0_15px_40px_-10px_rgba(0,0,0,0.15)] z-20 bg-gray-200">
              <video
                src="/videos/hero-reel.mp4"
                autoPlay muted loop playsInline preload="auto"
                className="w-full h-full object-cover"
              />

              {/* Top-left: AI Generated badge */}
              <div className="absolute top-5 left-5 bg-white rounded-full px-3.5 py-2 flex items-center gap-1.5 shadow-md">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#1A56FF">
                  <path d="M10 2C10 7.5 14.5 12 20 12C14.5 12 10 16.5 10 22C10 16.5 5.5 12 0 12C5.5 12 10 7.5 10 2Z" />
                  <path d="M21 3C21 5 22.5 6.5 24.5 6.5C22.5 6.5 21 8 21 10C21 8 19.5 6.5 17.5 6.5C19.5 6.5 21 5 21 3Z" />
                </svg>
                <span className="text-[#1A1D20] text-[13px] font-semibold tracking-wide">AI Generated</span>
              </div>

              {/* Top-right: Avg. ROAS */}
              <div className="absolute top-5 right-5 bg-white rounded-[16px] px-4 py-3 shadow-md min-w-[110px]">
                <div className="text-[#808489] text-[12px] font-medium mb-1">Avg. ROAS</div>
                <div className="flex items-center gap-2">
                  <span className="text-[#1A56FF] text-[24px] font-bold leading-none tracking-tight">3.1x</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2EBA5B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 17 9 11 13 15 21 7" />
                    <polyline points="14 7 21 7 21 14" />
                  </svg>
                </div>
              </div>

              {/* Bottom: caption bar with blur */}
              <div className="absolute bottom-5 left-5 right-5 bg-[#363636]/80 backdrop-blur-md rounded-[20px] p-1.5 pr-5 flex items-center gap-3 shadow-xl">
                <div className="w-[40px] h-[40px] bg-[#1A56FF] rounded-[14px] flex items-center justify-center shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-white">
                    <rect x="2.5" y="9.5" width="2.5" height="5" rx="1.25" />
                    <rect x="7" y="5.5" width="2.5" height="13" rx="1.25" />
                    <rect x="11.5" y="3" width="2.5" height="18" rx="1.25" />
                    <rect x="16" y="5.5" width="2.5" height="13" rx="1.25" />
                    <rect x="20.5" y="9.5" width="2.5" height="5" rx="1.25" />
                  </svg>
                </div>
                <span className="text-white text-[14px] font-medium leading-snug">
                  I've tried so many products, but this one changed everything.
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
