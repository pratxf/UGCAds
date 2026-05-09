"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowRight, Sparkles } from "lucide-react";

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

export default function FinalCTA() {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef);

  return (
    <section ref={sectionRef} className="relative py-24 sm:py-32 overflow-hidden bg-white">
      {/* Gradient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-cyan-50" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-[#2563EB]/10 to-[#06B6D4]/10 blur-[80px]" />
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div
          className={cn(
            "mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700 transition-all duration-700 ease-out",
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          <Sparkles className="h-3.5 w-3.5" />
          Join 200+ brands already scaling with AI
        </div>

        <h2
          className={cn(
            "text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-[#111111] transition-all duration-700 ease-out",
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
          style={{ transitionDelay: "80ms" }}
        >
          Ready to create ads that{" "}
          <span className="gradient-text">actually convert?</span>
        </h2>

        <p
          className={cn(
            "mt-6 text-lg text-[#6B7280] max-w-2xl mx-auto transition-all duration-700 ease-out",
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
          style={{ transitionDelay: "160ms" }}
        >
          Start with a $5 trial. No subscription required, no credit card to remember, no commitment.
        </p>

        <div
          className={cn(
            "mt-10 flex flex-wrap items-center justify-center gap-4 transition-all duration-700 ease-out",
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
          style={{ transitionDelay: "240ms" }}
        >
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-full bg-[#2563EB] px-10 py-4 text-base font-semibold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-700 hover:shadow-blue-500/35 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            Get Started Free
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-10 py-4 text-base font-medium text-[#111111] hover:border-blue-200 hover:bg-blue-50 transition-all duration-200"
          >
            View all plans
          </Link>
        </div>

        <p
          className={cn(
            "mt-5 text-sm text-[#9CA3AF] transition-all duration-700 ease-out",
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
          style={{ transitionDelay: "320ms" }}
        >
          No credit card required. Cancel anytime.
        </p>
      </div>
    </section>
  );
}
