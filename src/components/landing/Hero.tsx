"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { Play, Star } from "lucide-react";

const FADE_UP: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 90, damping: 20 } },
};

export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden bg-[#F7F7F5] pt-28 pb-20 sm:pt-36 sm:pb-28">
      {/* Decorative gradient blobs */}
      <div className="pointer-events-none absolute inset-0 -z-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 h-[600px] w-[600px] rounded-full bg-blue-100/60 blur-[120px]" />
        <div className="absolute top-1/3 -left-24 h-[400px] w-[400px] rounded-full bg-cyan-100/50 blur-[100px]" />
        <div className="absolute bottom-0 right-1/3 h-[300px] w-[300px] rounded-full bg-blue-50/80 blur-[80px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
          {/* Left column — text */}
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
          >
            {/* Badge */}
            <motion.div variants={FADE_UP} className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700">
              <Star className="h-3.5 w-3.5 fill-blue-500 text-blue-500" />
              Trusted by 10,000+ brands worldwide
            </motion.div>

            <motion.h1
              variants={FADE_UP}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#111111] leading-[1.08]"
            >
              Create{" "}
              <span className="gradient-text">Human Looking</span>{" "}
              Ads in Minutes
            </motion.h1>

            <motion.p
              variants={FADE_UP}
              className="mt-6 text-lg text-[#6B7280] max-w-lg leading-relaxed"
            >
              AI video ads with real-looking characters and authentic voices. No studio, no actors, no editing skills needed.
            </motion.p>

            <motion.div variants={FADE_UP} className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-[#2563EB] px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-700 hover:shadow-blue-500/35 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                Start for Free
                <span className="text-base leading-none">→</span>
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-8 py-3.5 text-sm font-medium text-[#111111] hover:border-blue-200 hover:bg-blue-50 transition-all duration-200"
              >
                <Play className="h-3.5 w-3.5 fill-[#2563EB] text-[#2563EB]" />
                See How It Works
              </Link>
            </motion.div>

            <motion.div
              variants={FADE_UP}
              className="mt-10 flex flex-wrap items-center gap-6 text-sm text-[#6B7280]"
            >
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
                10,000+ ads generated
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
                Ready in under 2 minutes
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
                Cancel anytime
              </span>
            </motion.div>
          </motion.div>

          {/* Right column — video showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="relative"
          >
            {/* Outer glow ring */}
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-blue-200/40 to-cyan-200/40 blur-xl" />

            <div className="relative rounded-2xl overflow-hidden border border-[#E5E7EB] shadow-2xl shadow-blue-900/10 bg-white">
              <video
                src="/videos/hero-reel.mov"
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                className="w-full aspect-video object-cover"
              />

              {/* Floating stats overlay */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <div className="flex items-center gap-2 rounded-xl bg-white/90 backdrop-blur-sm border border-white/60 px-3 py-2 shadow-sm">
                  <div className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
                  <span className="text-xs font-semibold text-[#111111]">Generating ad...</span>
                </div>
                <div className="rounded-xl bg-white/90 backdrop-blur-sm border border-white/60 px-3 py-2 shadow-sm">
                  <span className="text-xs font-semibold text-[#2563EB]">1:47 remaining</span>
                </div>
              </div>
            </div>

            {/* Floating social proof pill */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="absolute -right-6 top-8 rounded-2xl bg-white border border-[#E5E7EB] shadow-lg px-4 py-3 hidden lg:block"
            >
              <div className="text-xs text-[#6B7280]">Avg. ROAS</div>
              <div className="text-xl font-bold text-[#111111]">3.1<span className="text-[#2563EB]">x</span></div>
            </motion.div>

            {/* Floating speed pill */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="absolute -left-6 bottom-12 rounded-2xl bg-white border border-[#E5E7EB] shadow-lg px-4 py-3 hidden lg:block"
            >
              <div className="text-xs text-[#6B7280]">Generated in</div>
              <div className="text-xl font-bold text-[#111111]">1<span className="text-[#06B6D4]">m 47s</span></div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
