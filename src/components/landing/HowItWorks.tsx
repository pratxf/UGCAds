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
    step: "01",
    icon: Users,
    title: "Pick Your Character",
    description:
      "Choose from 117+ realistic AI-generated characters that match your brand and target audience. Filter by gender, style, or ethnicity.",
    benefits: ["117 diverse AI characters", "Filter by gender, style, ethnicity", "Realistic human-like appearance"],
    color: "bg-blue-50 text-blue-600",
    iconBg: "bg-blue-100",
  },
  {
    step: "02",
    icon: Film,
    title: "Write Your Script",
    description:
      "Write your ad script or let our AI generate one that converts. Add a natural voiceover using ElevenLabs integration.",
    benefits: ["AI voiceover with ElevenLabs", "Script auto-generation option", "Multiple voice styles available"],
    color: "bg-cyan-50 text-cyan-600",
    iconBg: "bg-cyan-100",
  },
  {
    step: "03",
    icon: Download,
    title: "Download Your Ad",
    description:
      "In under two minutes, your professional video ad is ready. Export optimized for TikTok, Instagram, YouTube, and more.",
    benefits: ["Ready in under 2 minutes", "Optimized for all platforms", "Multiple aspect ratios"],
    color: "bg-green-50 text-green-600",
    iconBg: "bg-green-100",
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

        {/* Steps */}
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-12 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-px bg-gradient-to-r from-[#2563EB]/30 via-[#06B6D4]/50 to-[#10B981]/30" />

          {steps.map((step, i) => (
            <div
              key={step.step}
              className={cn(
                "relative flex flex-col transition-all duration-700 ease-out",
                inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              )}
              style={{ transitionDelay: `${200 + i * 150}ms` }}
            >
              {/* Step number + icon */}
              <div className="flex items-center gap-4 mb-6">
                <div className={cn("relative flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm", step.iconBg)}>
                  <step.icon className={cn("h-5 w-5", step.color.split(" ")[1])} />
                  <div className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#2563EB] text-white text-[10px] font-bold">
                    {i + 1}
                  </div>
                </div>
                <div className="text-4xl font-bold text-[#E5E7EB]">{step.step}</div>
              </div>

              {/* Content card */}
              <div className="flex-1 rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <h3 className="text-lg font-semibold text-[#111111] mb-2">{step.title}</h3>
                <p className="text-sm text-[#6B7280] leading-relaxed mb-5">{step.description}</p>
                <ul className="space-y-2">
                  {step.benefits.map((b) => (
                    <li key={b} className="flex items-center gap-2 text-sm text-[#6B7280]">
                      <div className={cn("h-1.5 w-1.5 rounded-full flex-shrink-0", step.color.split(" ")[1].replace("text-", "bg-"))} />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
