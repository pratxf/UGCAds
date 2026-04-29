"use client";

import React from "react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedMarqueeHeroProps {
  tagline: string;
  title: React.ReactNode;
  description: string;
  ctaText: string;
  ctaHref?: string;
  videos: string[];
  className?: string;
}

const FADE_IN_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } },
};

function VideoCard({ src, index }: { src: string; index: number }) {
  return (
    <div
      className="relative aspect-[9/16] h-48 md:h-64 flex-shrink-0 rounded-2xl overflow-hidden border border-white/10 shadow-md"
      style={{ rotate: `${index % 2 === 0 ? -2 : 5}deg` }}
    >
      <video
        src={src}
        muted
        autoPlay
        loop
        playsInline
        preload="metadata"
        className="w-full h-full object-cover"
      />
    </div>
  );
}

export const AnimatedMarqueeHero: React.FC<AnimatedMarqueeHeroProps> = ({
  tagline,
  title,
  description,
  ctaText,
  ctaHref = "/signup",
  videos,
  className,
}) => {
  const allVideos = [...videos, ...videos];

  return (
    <section
      className={cn(
        "relative w-full min-h-screen overflow-hidden bg-background flex flex-col items-center text-center px-4 pt-20 md:pt-24",
        className
      )}
    >
      <div className="z-10 flex flex-col items-center">
        <motion.div
          initial="hidden"
          animate="show"
          variants={FADE_IN_VARIANTS}
          className="mb-4 inline-block rounded-full border border-border bg-card/50 px-4 py-1.5 text-sm font-medium text-muted-foreground backdrop-blur-sm"
        >
          {tagline}
        </motion.div>

        <motion.h1
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
          className="text-5xl md:text-7xl font-bold tracking-tighter text-foreground"
        >
          {typeof title === "string"
            ? title.split(" ").map((word, i) => (
                <motion.span key={i} variants={FADE_IN_VARIANTS} className="inline-block">
                  {word}&nbsp;
                </motion.span>
              ))
            : title}
        </motion.h1>

        <motion.p
          initial="hidden"
          animate="show"
          variants={FADE_IN_VARIANTS}
          transition={{ delay: 0.5 }}
          className="mt-6 max-w-xl text-lg text-muted-foreground"
        >
          {description}
        </motion.p>

        <motion.div
          initial="hidden"
          animate="show"
          variants={FADE_IN_VARIANTS}
          transition={{ delay: 0.6 }}
          className="mt-8"
        >
          <Link href={ctaHref} className="relative inline-flex rounded-full p-[2px] rotatingGradient hover:scale-105 active:scale-95 transition-transform">
            <span className="inline-flex items-center rounded-full bg-background px-8 py-3 font-semibold text-foreground">
              {ctaText}
            </span>
          </Link>
        </motion.div>
      </div>

      {/* Video marquee, CSS animation, videos paused by default, play on hover */}
      <div className="absolute bottom-0 left-0 w-full h-1/3 md:h-2/5 [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)] overflow-hidden">
        <div className="hero-marquee flex gap-4 w-max will-change-transform">
          {allVideos.map((src, index) => (
            <VideoCard key={index} src={src} index={index} />
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes hero-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .hero-marquee {
          animation: hero-scroll 50s linear infinite;
        }
        .hero-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};
