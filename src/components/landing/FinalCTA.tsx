"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  useInView hook                                                     */
/* ------------------------------------------------------------------ */

function useInView(ref: React.RefObject<HTMLElement | null>, margin = "-100px") {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } }, { rootMargin: margin });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref, margin]);
  return inView;
}

export default function FinalCTA() {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef);

  return (
    <section ref={sectionRef} className="relative py-24 sm:py-32 overflow-hidden">
      {/* Decorative floating orbs */}
      <div className="absolute inset-0 -z-10">
        <div
          className="absolute top-0 left-1/4 h-[400px] w-[400px] rounded-full bg-mint/8 blur-[120px] animate-[float-mint_3s_ease-in-out_infinite]"
        />
        <div
          className="absolute bottom-0 right-1/4 h-[350px] w-[350px] rounded-full bg-violet/8 blur-[120px] animate-[float-violet_3.5s_ease-in-out_infinite]"
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[250px] w-[250px] rounded-full bg-amber/5 blur-[100px] animate-[float-amber_2.8s_ease-in-out_infinite]"
        />
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <h2
          className={cn(
            "text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight transition-all duration-700 ease-out",
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          Ready to Create Ads That{" "}
          <span className="gradient-text">Convert?</span>
        </h2>

        <p
          className={cn(
            "mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto transition-all duration-700 ease-out",
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
          style={{ transitionDelay: "120ms" }}
        >
          Join 10,000+ businesses creating professional ads with AI.
        </p>

        <div
          className={cn(
            "mt-10 transition-all duration-700 ease-out",
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
          style={{ transitionDelay: "240ms" }}
        >
          <Link
            href="/signup"
            className="inline-flex bg-primary text-primary-foreground rounded-full px-10 py-4 text-lg font-semibold transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]"
          >
            Start Creating &rarr;
          </Link>
        </div>
      </div>

      {/* Orb floating keyframes */}
      <style>{`
        @keyframes float-mint {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-30px); }
        }
        @keyframes float-violet {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(25px); }
        }
        @keyframes float-amber {
          0%, 100% { transform: translate(-50%, -50%); }
          50% { transform: translate(-50%, calc(-50% - 20px)); }
        }
      `}</style>
    </section>
  );
}
