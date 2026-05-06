"use client";

import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Users, Film, Download } from "lucide-react";

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

const steps = [
  {
    icon: Users,
    title: "Pick Your Character",
    description:
      "Choose from 117+ realistic AI-generated characters that match your brand and target audience. Filter by gender, style, or ethnicity.",
    benefits: ["117 diverse AI characters", "Filter by gender, style, ethnicity", "Realistic human-like appearance"],
    iconBg: "bg-blue-100",
    iconColor: "text-[#2563EB]",
    dotColor: "bg-[#2563EB]",
  },
  {
    icon: Film,
    title: "Write Your Script",
    description:
      "Write your ad script or let our AI generate one that converts. Add a natural voiceover using ElevenLabs integration.",
    benefits: ["AI voiceover with ElevenLabs", "Script auto-generation option", "Multiple voice styles available"],
    iconBg: "bg-cyan-100",
    iconColor: "text-[#06B6D4]",
    dotColor: "bg-[#06B6D4]",
  },
  {
    icon: Download,
    title: "Download Your Ad",
    description:
      "In under two minutes, your professional video ad is ready. Export optimized for TikTok, Instagram, YouTube, and more.",
    benefits: ["Ready in under 2 minutes", "Optimized for all platforms", "Multiple aspect ratios"],
    iconBg: "bg-green-100",
    iconColor: "text-[#10B981]",
    dotColor: "bg-[#10B981]",
  },
];

export default function HowItWorksSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef);

  return (
    <section id="how-it-works" className="relative py-24 sm:py-32 bg-[#F7F7F5]">
      <div
        ref={sectionRef}
        className={cn(
          "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 transition-all duration-700 ease-out",
          inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}
      >
        {/* Header */}
        <div className="text-center mb-16">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-4 py-1.5 text-sm font-medium text-[#6B7280]">
            Simple 3-step process
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#111111]">
            From idea to{" "}
            <span className="gradient-text">live ad in minutes</span>
          </h2>
          <p className="mt-4 text-lg text-[#6B7280] max-w-xl mx-auto">
            No studio. No actors. No editing skills. Just a script and a click.
          </p>
        </div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">

          {/* Connector lines between cards (desktop only) */}
          <div className="hidden md:flex absolute top-8 left-0 right-0 items-center pointer-events-none px-[calc(16.67%-1rem)]">
            <div className="flex-1 h-px bg-gradient-to-r from-[#2563EB]/20 to-[#06B6D4]/40 ml-16 mr-0" />
            <div className="flex-1 h-px bg-gradient-to-r from-[#06B6D4]/40 to-[#10B981]/20 ml-0 mr-16" />
          </div>

          {steps.map((step, i) => (
            <div
              key={step.title}
              className={cn(
                "flex flex-col rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300",
                inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              )}
              style={{ transitionDelay: `${200 + i * 150}ms` }}
            >
              {/* Icon + step number row */}
              <div className="flex items-center gap-3 mb-5">
                <div className={cn("flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl", step.iconBg)}>
                  <step.icon className={cn("h-6 w-6", step.iconColor)} />
                </div>
                <span className="text-sm font-semibold text-[#9CA3AF] tracking-widest">
                  STEP {i + 1}
                </span>
              </div>

              {/* Text */}
              <h3 className="text-base font-semibold text-[#111111] mb-2">{step.title}</h3>
              <p className="text-sm text-[#6B7280] leading-relaxed mb-5">{step.description}</p>

              {/* Benefits */}
              <ul className="mt-auto space-y-2">
                {step.benefits.map((b) => (
                  <li key={b} className="flex items-center gap-2 text-sm text-[#6B7280]">
                    <div className={cn("h-1.5 w-1.5 rounded-full flex-shrink-0", step.dotColor)} />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
