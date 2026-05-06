"use client";

import { motion } from "framer-motion";
import {
  Star, Zap, AlignLeft, Video, Upload, Sparkles, Download,
  LayoutGrid, Sun, ArrowUpRight, Clock, TrendingUp,
  DollarSign, Shield, Camera, Shirt,
} from "lucide-react";

const FADE_UP = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

const cards = [
  {
    num: "1.",
    title: "UGC Studio",
    subtitle: "Generate UGC Ads",
    accentColor: "#2563EB",
    accentBg: "#EFF6FF",
    iconBg: "#DBEAFE",
    Icon: Video,
    media: { type: "video" as const, src: "/videos/feature-ugc.mp4", timestamp: "01:47" },
    description: "Create realistic UGC-style videos with AI characters and authentic voiceovers in minutes.",
    tags: [
      { icon: Zap,       label: "AI Characters" },
      { icon: AlignLeft, label: "AI Script"     },
      { icon: Video,     label: "AI Video"      },
    ],
  },
  {
    num: "2.",
    title: "Try On",
    subtitle: "AI Model Try-On",
    accentColor: "#7D39EB",
    accentBg: "#F5F3FF",
    iconBg: "#EDE9FE",
    Icon: Shirt,
    media: { type: "tryon" as const, before: "/images/tryon-before.avif", after: "/images/tryon-after.avif" },
    description: "Showcase apparel and accessories with realistic AI model try-ons in any setting.",
    tags: [
      { icon: Upload,   label: "Upload Product" },
      { icon: Sparkles, label: "AI Try-On"      },
      { icon: Download, label: "Download"        },
    ],
  },
  {
    num: "3.",
    title: "Product Photoshoot",
    subtitle: "AI Product Photography",
    accentColor: "#10B981",
    accentBg: "#ECFDF5",
    iconBg: "#D1FAE5",
    Icon: Camera,
    media: { type: "image" as const, src: "/images/product-mockup.webp" },
    description: "Generate stunning, studio-quality product photos in seconds with AI.",
    tags: [
      { icon: LayoutGrid, label: "AI Scenes"   },
      { icon: Sun,        label: "AI Lighting" },
      { icon: Download,   label: "HD Images"   },
    ],
  },
];

const stats = [
  { icon: Clock,      label: "Save Time",          desc: "Create in minutes, not hours"          },
  { icon: TrendingUp, label: "Boost Performance",   desc: "Ads designed to convert"               },
  { icon: DollarSign, label: "Reduce Costs",        desc: "No studio, no hiring, no hassle"       },
  { icon: Shield,     label: "Safe & Secure",       desc: "Your data and content are protected"   },
];

export default function Features() {
  return (
    <section id="features" className="relative py-24 sm:py-32 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          custom={0} variants={FADE_UP} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="mb-14"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-4 py-1.5 text-sm font-medium text-[#374151] shadow-sm">
            <Star className="h-3.5 w-3.5 fill-[#2563EB] text-[#2563EB]" />
            Three AI-powered tools. Endless ad possibilities.
          </div>
          <h2 className="text-[2.25rem] sm:text-[2.75rem] font-bold tracking-tight text-[#111111] leading-[1.1] max-w-2xl"
              style={{ fontFamily: "Satoshi, sans-serif" }}>
            Everything you need to{" "}
            <span className="gradient-text">create</span> and{" "}
            <span className="gradient-text">scale</span> winning ads
          </h2>
          <p className="mt-4 text-[1.0625rem] text-[#6B7280] max-w-xl leading-relaxed">
            Generate high-converting UGC videos, try products on models, and create studio-quality photos — all powered by AI.
          </p>
        </motion.div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {cards.map((card, i) => (
            <motion.div
              key={card.title}
              custom={i + 1} variants={FADE_UP} initial="hidden" whileInView="show" viewport={{ once: true }}
              className="group rounded-2xl border border-[#E5E7EB] bg-white overflow-hidden hover:border-[#D1D5DB] hover:shadow-md transition-all duration-300"
            >
              {/* Card header */}
              <div className="flex items-start justify-between px-4 pt-4 pb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-xl flex-shrink-0"
                    style={{ background: card.iconBg }}
                  >
                    <card.Icon className="h-4.5 w-4.5" style={{ color: card.accentColor }} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#111111] leading-tight">
                      {card.num} {card.title}
                    </p>
                    <p className="text-xs text-[#9CA3AF]">{card.subtitle}</p>
                  </div>
                </div>
                <button
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-opacity hover:opacity-80"
                  style={{ background: card.accentColor }}
                >
                  <ArrowUpRight className="h-3.5 w-3.5 text-white" />
                </button>
              </div>

              {/* Media */}
              <div className="relative mx-3 overflow-hidden rounded-xl bg-[#F3F4F6]" style={{ aspectRatio: "16/10" }}>
                {card.media.type === "video" ? (
                  <>
                    <video
                      src={card.media.src}
                      muted autoPlay loop playsInline preload="metadata"
                      className="w-full h-full object-cover"
                    />
                    {"timestamp" in card.media && card.media.timestamp && (
                      <div className="absolute bottom-2 right-2 rounded-md bg-black/70 px-1.5 py-0.5 text-[11px] font-semibold text-white">
                        {card.media.timestamp}
                      </div>
                    )}
                  </>
                ) : card.media.type === "tryon" ? (
                  <div className="flex h-full w-full">
                    <div className="flex-1 relative">
                      <img src={card.media.before} alt="Before" className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md border border-[#E5E7EB]">
                      <ArrowUpRight className="h-3.5 w-3.5 text-[#7D39EB]" />
                    </div>
                    <div className="flex-1 relative">
                      <img src={card.media.after} alt="After" className="w-full h-full object-cover" />
                    </div>
                  </div>
                ) : (
                  <img
                    src={card.media.src}
                    alt={card.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Body */}
              <div className="px-4 pt-3 pb-4">
                <p className="text-sm text-[#6B7280] leading-relaxed mb-3">
                  {card.description}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {card.tags.map(({ icon: Icon, label }) => (
                    <span
                      key={label}
                      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
                      style={{ background: card.accentBg, color: card.accentColor }}
                    >
                      <Icon className="h-3 w-3" />
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats bar */}
        <motion.div
          custom={4} variants={FADE_UP} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[#E5E7EB] rounded-2xl border border-[#E5E7EB] bg-white overflow-hidden"
        >
          {stats.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex items-center gap-3 px-6 py-5">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-50 border border-blue-100">
                <Icon className="h-4.5 w-4.5 text-[#2563EB]" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#111111] leading-tight">{label}</p>
                <p className="text-xs text-[#6B7280] leading-snug">{desc}</p>
              </div>
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
