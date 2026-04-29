"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";

const FADE_IN: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } },
};

export default function Hero() {
  return (
    <section className="relative w-full h-screen overflow-hidden">
      {/* Background video */}
      <video
        src="/videos/hero-reel.mov"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/30" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end pb-24 md:pb-32 px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12 } } }}
          className="max-w-2xl"
        >
          <motion.h1
            variants={FADE_IN}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.05]"
          >
            Create{" "}
            <span className="gradient-text">Human Looking</span>{" "}
            Ads in Minutes
          </motion.h1>

          <motion.p
            variants={FADE_IN}
            className="mt-6 text-base sm:text-lg text-white/70 max-w-xl leading-relaxed"
          >
            AI-powered video ads with real-looking characters and authentic voices. No studio, no actors, no editing skills.
          </motion.p>

          <motion.div variants={FADE_IN} className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/signup"
              className="relative inline-flex rounded-full p-[2px] rotatingGradient hover:scale-105 active:scale-95 transition-transform"
            >
              <span className="inline-flex items-center rounded-full bg-background/90 backdrop-blur-sm px-7 py-3 text-sm font-semibold text-foreground">
                Get Started →
              </span>
            </Link>
            <Link
              href="#how-it-works"
              className="inline-flex items-center rounded-full border border-white/20 bg-white/5 backdrop-blur-sm px-7 py-3 text-sm font-medium text-white hover:bg-white/10 transition-colors"
            >
              See How It Works
            </Link>
          </motion.div>

          <motion.div
            variants={FADE_IN}
            className="mt-8 flex items-center gap-6 text-xs text-white/50"
          >
            <span>✓ 10,000+ ads generated</span>
            <span>✓ 3 day refund policy</span>
            <span>✓ Cancel anytime</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
