"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Star, User } from "lucide-react";

const testimonials = [
  {
    text: "I run a small Shopify store and couldn't justify $500 for a single UGC video. At $5 to test the platform, I had nothing to lose. Got my first video in under 10 minutes. The actor looked natural enough to run on Meta without anyone flagging it as AI.",
    name: "Ryan S.",
    role: "Shopify Store Owner",
    color: "bg-blue-100 text-blue-700",
  },
  {
    text: "The try-on feature alone is worth it for my clothing brand. Instead of hiring models for every SKU, I upload the product and get a clean visual in seconds. It's not perfect but it's 90% of the way there for a fraction of the cost.",
    name: "Emma K.",
    role: "Fashion Brand Founder",
    color: "bg-purple-100 text-purple-700",
  },
  {
    text: "What I appreciate is the pricing structure. You're not locked into a monthly subscription from day one. The $5 starter lets you actually see what you're buying before committing. Most AI tools don't give you that.",
    name: "Daniel R.",
    role: "DTC Founder",
    color: "bg-emerald-100 text-emerald-700",
  },
  {
    text: "We're a two-person marketing team managing five brand accounts. ugcads let us produce ad variations at a pace that was simply impossible before. We went from testing 2 creatives a week to around 15.",
    name: "Marcus D.",
    role: "Marketing Team Lead",
    color: "bg-orange-100 text-orange-700",
  },
  {
    text: "The 50+ language support is genuinely useful. We sell in Southeast Asia and Latin America. Being able to generate localized voiceovers without hiring native speakers for each market saved us real budget.",
    name: "Sofia L.",
    role: "Global Brand Manager",
    color: "bg-cyan-100 text-cyan-700",
  },
  {
    text: "Script generation is decent for a starting point. I don't use the AI script as-is, but it gives me a solid structure — hook, problem, solution, CTA — that I then edit. Cuts my scripting time in half.",
    name: "Priya N.",
    role: "Content Marketer",
    color: "bg-pink-100 text-pink-700",
  },
  {
    text: "As a media buyer, my job is to find winning creatives fast. ugcads lets me produce 10 hook variations of the same ad in an afternoon and push them all into a Meta campaign. The one that wins gets scaled. The cost per test is almost nothing.",
    name: "Jordan H.",
    role: "Meta Media Buyer",
    color: "bg-blue-100 text-blue-700",
  },
  {
    text: "The product photography tool surprised me. I expected mediocre outputs but the lighting and scene composition are actually good enough for ad creatives. Not for a premium brand homepage, but absolutely for paid social.",
    name: "Chloe M.",
    role: "E-commerce Manager",
    color: "bg-violet-100 text-violet-700",
  },
  {
    text: "I was skeptical about the actor library since they only advertise 100+ actors versus competitors with 500+. But the ones available cover enough age ranges, ethnicities, and tones that I haven't felt limited in practice.",
    name: "Alex T.",
    role: "Brand Advertiser",
    color: "bg-amber-100 text-amber-700",
  },
  {
    text: "Turnaround time is real. I timed it. Script to finished video was 7 minutes on my first try. For context, briefing a UGC creator, waiting for delivery, and going through revisions used to take me 10 to 14 days.",
    name: "Tyler B.",
    role: "Performance Marketer",
    color: "bg-teal-100 text-teal-700",
  },
  {
    text: "The agency plan at $103 per month makes sense if you're producing for multiple clients. 25 video generations and 500 product photos per month means you can service at least 4 to 5 clients without hitting limits.",
    name: "Lena W.",
    role: "Agency Owner",
    color: "bg-indigo-100 text-indigo-700",
  },
  {
    text: "I tested ugcads videos against real creator UGC in a split test on TikTok. The AI video underperformed slightly on engagement but was close enough that the cost difference made the AI version the better business decision.",
    name: "Omar F.",
    role: "TikTok Advertiser",
    color: "bg-rose-100 text-rose-700",
  },
  {
    text: "The interface requires almost no learning curve. I gave it to a team member with zero video production experience. She had three ad drafts ready before I finished my next meeting. That kind of accessibility matters in a small business.",
    name: "Grace P.",
    role: "Small Business Owner",
    color: "bg-green-100 text-green-700",
  },
  {
    text: "For product photography specifically, the AI scenes and lighting options mean I can match the visual tone of my brand without renting a studio. My product photos used to cost $200 a session. Now I generate 20 variations for a few credits.",
    name: "Sam K.",
    role: "Brand Photographer",
    color: "bg-sky-100 text-sky-700",
  },
  {
    text: "The characters don't look robotic. That was my main concern going in. There's still a subtle AI quality if you look closely, but at the scroll speed of most social feeds, it reads as a real person talking to a camera.",
    name: "Nadia C.",
    role: "Social Media Manager",
    color: "bg-fuchsia-100 text-fuchsia-700",
  },
  {
    text: "I run a dropshipping business. Speed and cost are everything. ugcads fits that model perfectly. I can create a test ad for a new product the same day I list it, without waiting on a creator or spending money before I know the product converts.",
    name: "Jake R.",
    role: "Dropshipping Entrepreneur",
    color: "bg-blue-100 text-blue-700",
  },
  {
    text: "The fact that it covers three use cases in one platform — UGC video, product photos, and model try-ons — means I'm not juggling three separate subscriptions. Consolidation alone saves me money and mental overhead.",
    name: "Maya S.",
    role: "DTC Brand Manager",
    color: "bg-emerald-100 text-emerald-700",
  },
  {
    text: "Live support is listed on all plans including the $5 starter. I tested it and got a response in under 20 minutes. For a platform at this price point, that level of support access is genuinely above average.",
    name: "Chris V.",
    role: "Early Adopter",
    color: "bg-orange-100 text-orange-700",
  },
  {
    text: "I've used Arcads and HeyGen before. ugcads is more limited in actor variety and editing styles, but it's also significantly cheaper and faster to use. For brands that need volume over polish, it's the better tradeoff.",
    name: "Lisa T.",
    role: "Growth Marketer",
    color: "bg-purple-100 text-purple-700",
  },
  {
    text: "Credit rollover not carrying over is a legitimate complaint. But if you plan your usage properly and match your plan to your actual output needs, it's not a problem. The flexibility across video, photos, and try-ons is genuinely useful.",
    name: "Ben A.",
    role: "Paid Social Specialist",
    color: "bg-cyan-100 text-cyan-700",
  },
];

function Avatar({ name, color }: { name: string; color: string }) {
  const initial = name.charAt(0).toUpperCase();
  return (
    <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${color}`}>
      {initial}
    </div>
  );
}

function TestimonialCard({ item }: { item: typeof testimonials[0] }) {
  return (
    <div
      className="bg-white w-[300px] flex-shrink-0 flex flex-col p-6 transition-all duration-300 hover:-translate-y-1"
      style={{
        borderRadius: 20,
        border: "1px solid #E5E7EB",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.10)")}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)")}
    >
      <div className="flex gap-1 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-[#F59E0B] text-[#F59E0B]" />
        ))}
      </div>
      <p className="text-[14px] text-[#374151] leading-relaxed flex-1">&ldquo;{item.text}&rdquo;</p>
      <div className="flex items-center gap-3 mt-5">
        <Avatar name={item.name} color={item.color} />
        <div>
          <div className="text-[13px] font-semibold text-[#111111] leading-tight">{item.name}</div>
          <div className="text-[12px] text-[#6B7280] mt-0.5">{item.role}</div>
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

  const row1 = testimonials.slice(0, 7);
  const row2 = testimonials.slice(7, 14);
  const row3 = testimonials.slice(13, 20);

  return (
    <section className="relative py-24 sm:py-32 bg-white overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 h-[400px] w-[400px] rounded-full bg-blue-50/80 blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 h-[300px] w-[300px] rounded-full bg-cyan-50/80 blur-[80px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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

      <div className="relative">
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-white to-transparent" />

        <div className="flex flex-col gap-5">
          <ScrollingRow items={row1} duration={40} />
          <ScrollingRow items={row2} reverse duration={35} />
          <ScrollingRow items={row3} duration={45} />
        </div>
      </div>
    </section>
  );
}
