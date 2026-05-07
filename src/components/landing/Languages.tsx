"use client";

import { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

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

export default function Languages() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);

  return (
    <section className="relative py-20 sm:py-28 bg-white overflow-hidden">
      <div
        ref={ref}
        className={cn(
          "mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 flex flex-col items-center transition-all duration-700 ease-out",
          inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}
      >
        {/* Flag image card */}
        <div
          className="w-full overflow-hidden"
          style={{
            borderRadius: 24,
            aspectRatio: "3 / 1",
            background: "#E8EEFF",
          }}
        >
          <img
            src="/images/languages-flags.png"
            alt="50+ language flags"
            className="w-full h-full object-cover object-center"
            style={{ transform: "scale(1.22)", mixBlendMode: "multiply" }}
          />
        </div>

        {/* Text */}
        <div className="mt-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111111]">
            50+ Languages
          </h2>
          <p className="mt-2 text-[#6B7280] text-base max-w-lg mx-auto">
            Instantly localize your videos with native voices and perfect lip-sync.
          </p>
        </div>
      </div>
    </section>
  );
}
