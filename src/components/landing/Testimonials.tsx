"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

const testimonials = [
  {
    text: "ugcads cut our ad production time by 90%. We went from one video a week to five a day, and our ROAS doubled.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Sarah Mitchell",
    role: "Operations Manager, TrendHive",
  },
  {
    text: "The AI characters are shockingly realistic. Our clients can't tell the difference between ugcads content and a real shoot.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150&h=150",
    name: "James Ortega",
    role: "Creative Director, ScaleUp Agency",
  },
  {
    text: "We tested 40 ad variations in a single afternoon. The product ad mode is a game-changer for e-commerce.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Priya Kapoor",
    role: "Head of Growth, NovaBrands",
  },
  {
    text: "Onboarding was seamless. Within 10 minutes we had our first ad generated. No tutorials needed.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Marcus Chen",
    role: "CEO, DropShipPro",
  },
  {
    text: "The voiceover quality blew us away. ElevenLabs integration makes every ad sound professionally produced.",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Zara Hussein",
    role: "Content Lead, MediaForge",
  },
  {
    text: "We replaced a $5K/month video production budget with ugcads. The ROI is unmatched.",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Aliza Rahman",
    role: "Marketing Director, GrowthLab",
  },
  {
    text: "Being able to pick the perfect character for each ad means every piece of content feels on-brand. Conversion rates jumped 34%.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150&h=150",
    name: "David Kim",
    role: "Performance Marketer, AdVentures",
  },
  {
    text: "The speed is incredible. We ship ads faster than our competitors can brief their agencies.",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Sana Patel",
    role: "VP Marketing, QuickCommerce",
  },
  {
    text: "Credits rolling over is a huge plus. We scale up during launches and relax during off-season without wasting money.",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Ryan Torres",
    role: "E-commerce Manager, FreshBrands",
  },
];

function TestimonialCard({ item }: { item: typeof testimonials[0] }) {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 w-[300px] flex-shrink-0 flex flex-col">
      <div className="flex gap-0.5 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="h-3.5 w-3.5 fill-[#F59E0B] text-[#F59E0B]" />
        ))}
      </div>
      <p className="text-sm text-[#374151] leading-relaxed flex-1">{item.text}</p>
      <div className="flex items-center gap-3 mt-5 pt-4 border-t border-[#F3F4F6]">
        <img
          src={item.image}
          alt={item.name}
          className="h-10 w-10 rounded-full object-cover border border-[#E5E7EB] flex-shrink-0"
        />
        <div>
          <div className="text-sm font-semibold text-[#111111]">{item.name}</div>
          <div className="text-xs text-[#6B7280]">{item.role}</div>
        </div>
      </div>
    </div>
  );
}

function ScrollingRow({
  items,
  reverse = false,
  duration = 30,
}: {
  items: typeof testimonials;
  reverse?: boolean;
  duration?: number;
}) {
  return (
    <div className="relative flex overflow-hidden py-2">
      <motion.div
        className="flex items-stretch gap-5"
        animate={{ x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
        transition={{ duration, ease: "linear", repeat: Infinity }}
      >
        {[...items, ...items].map((item, i) => (
          <TestimonialCard key={i} item={item} />
        ))}
      </motion.div>
    </div>
  );
}

function useInView(ref: React.RefObject<HTMLElement | null>, margin = "-80px") {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { rootMargin: margin }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref, margin]);
  return inView;
}

export default function Testimonials() {
  const headerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(headerRef);

  const col1 = testimonials.slice(0, 5);
  const col2 = testimonials.slice(4, 9);

  return (
    <section className="relative py-24 sm:py-32 bg-white overflow-hidden">
      {/* Background gradient */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 h-[400px] w-[400px] rounded-full bg-blue-50/80 blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 h-[300px] w-[300px] rounded-full bg-cyan-50/80 blur-[80px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          ref={headerRef}
          className={cn(
            "text-center mb-14 transition-all duration-700 ease-out",
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-[#F7F7F5] px-4 py-1.5 text-sm font-medium text-[#6B7280]">
            <Star className="h-3.5 w-3.5 fill-[#F59E0B] text-[#F59E0B]" />
            Customer stories
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#111111]">
            Loved by{" "}
            <span className="gradient-text">200+ businesses</span>
          </h2>
          <p className="mt-4 text-lg text-[#6B7280] max-w-xl mx-auto">
            See why brands worldwide trust ugcads to produce scroll-stopping video ads at scale.
          </p>
        </div>
      </div>

      {/* Scrolling rows with fade edges */}
      <div className="relative">
        {/* Left/right fade masks */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-white to-transparent" />

        <div className="flex flex-col gap-5">
          <ScrollingRow items={col1} duration={35} />
          <ScrollingRow items={col2} reverse duration={28} />
        </div>
      </div>
    </section>
  );
}
