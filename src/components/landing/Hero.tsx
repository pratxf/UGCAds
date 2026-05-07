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
  { icon: Zap,    bold: "200+",         muted: "ads generated" },
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
                <span className="ml-2 text-sm font-semibold text-[#6B7280]">+200</span>
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
                Start for Free
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
            className="relative flex flex-col"
          >
            {/* Ghost card — solid lavender, clearly offset behind main card */}
            <div
              className="absolute inset-0 rounded-3xl"
              style={{
                background: "#E0E7FF",
                transform: "rotate(3deg) translate(14px, 16px)",
                zIndex: 0,
              }}
            />

            {/* Video card */}
            <div
              className="relative rounded-3xl overflow-hidden shadow-2xl shadow-blue-900/15 bg-[#1a1a2e] aspect-[4/3]"
              style={{ zIndex: 1 }}
            >
              <video
                src="/videos/hero-reel.mov"
                autoPlay muted loop playsInline preload="auto"
                className="w-full h-full object-cover"
              />

              {/* Top-left: AI Generated badge — dark pill */}
              <div
                className="absolute top-4 left-4 flex items-center gap-2 rounded-full px-3 py-2 shadow-lg"
                style={{ background: "#1C1C2E" }}
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2563EB] flex-shrink-0">
                  <Star className="h-2.5 w-2.5 text-white fill-white" />
                </div>
                <span className="text-[12px] font-semibold text-white leading-none">AI Generated</span>
              </div>

              {/* Top-right: ROAS card */}
              <div className="absolute top-4 right-4 rounded-2xl bg-white shadow-lg px-3.5 py-2.5">
                <div className="text-[10px] font-medium text-[#9CA3AF] leading-none mb-1.5">Avg. ROAS</div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-bold text-[#2563EB] leading-none">3.1x</span>
                  <TrendingUp className="h-4 w-4 text-[#10B981]" strokeWidth={2.5} />
                </div>
              </div>

              {/* Bottom: floating caption bar */}
              <div
                className="absolute bottom-4 left-4 right-4 flex items-center gap-3 rounded-2xl px-4 py-3"
                style={{ background: "#111827" }}
              >
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-[#2563EB]">
                  <svg className="h-4 w-4 text-white" viewBox="0 0 16 16" fill="currentColor">
                    <rect x="1" y="5" width="2" height="6" rx="1"/>
                    <rect x="4.5" y="2" width="2" height="12" rx="1"/>
                    <rect x="8" y="4" width="2" height="8" rx="1"/>
                    <rect x="11.5" y="1" width="2" height="14" rx="1"/>
                  </svg>
                </div>
                <p className="flex-1 text-[13px] text-white font-medium leading-snug">
                  I've tried so many products, but this one changed everything.
                </p>
              </div>
            </div>

          </motion.div>
        </div>
      </div>
    </section>
  );
}
