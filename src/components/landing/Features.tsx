"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Video, ShoppingBag, Camera, Zap, Globe, Users } from "lucide-react";

function useInView(ref: React.RefObject<HTMLElement | null>, margin = "-100px") {
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

const features: {
  title: string;
  description: string;
  video?: string;
  image?: string;
  badge: string;
  badgeColor: string;
}[] = [
  {
    title: "UGC Ad Creator",
    description:
      "Pick an AI character, write your script, and generate a professional video ad in under 2 minutes. Realistic avatars that look and move like real people.",
    video: "/videos/feature-ugc.mp4",
    badge: "Most Popular",
    badgeColor: "bg-blue-100 text-blue-700",
  },
  {
    title: "Product Ad Creator",
    description:
      "Upload your product image and let AI build a complete ad narrative around it. Characters present your product naturally with authentic voiceovers.",
    video: "/videos/feature-product.mp4",
    badge: "New",
    badgeColor: "bg-cyan-100 text-cyan-700",
  },
  {
    title: "Product Photoshoot",
    description:
      "Place your product into stunning lifestyle scenes instantly. Generate professional product photography with AI in seconds.",
    image: "/images/product-mockup.webp",
    badge: "AI Powered",
    badgeColor: "bg-green-100 text-green-700",
  },
];

const stats = [
  { icon: Zap, label: "Avg. generation time", value: "Under 2 min" },
  { icon: Users, label: "AI characters", value: "117+" },
  { icon: Globe, label: "Languages supported", value: "50+" },
  { icon: Video, label: "Ads generated", value: "10,000+" },
];

export default function Features() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef);

  return (
    <section id="features" className="relative py-24 sm:py-32 bg-white">
      <div
        ref={sectionRef}
        className={cn(
          "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 transition-all duration-700 ease-out",
          inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}
      >
        {/* Section header */}
        <div className="max-w-3xl mb-16">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700">
            <Zap className="h-3.5 w-3.5" />
            Built for performance
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#111111] leading-tight">
            AI is changing how ads are made{" "}
            <span className="gradient-text">and how brands scale</span>
          </h2>
          <p className="mt-4 text-lg text-[#6B7280]">
            Three powerful tools to cover every stage of your ad production workflow.
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className={cn(
                "group rounded-2xl overflow-hidden border border-[#E5E7EB] bg-white shadow-sm transition-all duration-500 hover:shadow-md hover:border-blue-200 hover:-translate-y-1",
                inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              )}
              style={{ transitionDelay: `${300 + i * 150}ms` }}
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-[#F7F7F5]">
                {feature.video ? (
                  <video
                    src={feature.video}
                    muted
                    autoPlay
                    loop
                    playsInline
                    preload="metadata"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
                <div className="absolute top-3 left-3">
                  <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", feature.badgeColor)}>
                    {feature.badge}
                  </span>
                </div>
              </div>

              <div className="p-5">
                <h3 className="text-base font-semibold text-[#111111]">{feature.title}</h3>
                <p className="mt-2 text-sm text-[#6B7280] leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={cn(
                "rounded-2xl border border-[#E5E7EB] bg-[#F7F7F5] p-6 transition-all duration-700 ease-out",
                inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              )}
              style={{ transitionDelay: `${600 + i * 100}ms` }}
            >
              <stat.icon className="h-5 w-5 text-[#2563EB] mb-3" />
              <div className="text-2xl font-bold text-[#111111]">{stat.value}</div>
              <div className="text-sm text-[#6B7280] mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
