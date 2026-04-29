"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

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

const features: { title: string; description: string; video?: string; image?: string }[] = [
  {
    title: "UGC Ad Creator",
    description:
      "Pick an AI character, write your script, and generate a professional video ad in under 2 minutes. Realistic avatars that look and move like real people.",
    video: "/videos/feature-ugc.mp4",
  },
  {
    title: "Product Ad Creator",
    description:
      "Upload your product image and let AI build a complete ad narrative around it. Characters present your product naturally with authentic voiceovers.",
    video: "/videos/feature-product.mp4",
  },
  {
    title: "Product Photoshoot",
    description:
      "Place your product into stunning lifestyle scenes instantly. Generate professional product photography with AI in seconds.",
    image: "/images/product-mockup.webp",
  },
];

export default function Features() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef);

  return (
    <section id="features" className="relative py-24 sm:py-32">
      <div
        ref={sectionRef}
        className={cn(
          "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 transition-all duration-700 ease-out",
          inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}
      >
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground max-w-3xl leading-tight">
          AI is changing how ads are made, how founders scale their business, and how brands connect with audiences.
        </h2>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className={cn(
                "group rounded-2xl overflow-hidden border border-border bg-card transition-all duration-500 hover:border-primary/30",
                inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              )}
              style={{ transitionDelay: `${300 + i * 150}ms` }}
            >
              <div className="relative aspect-square overflow-hidden">
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
              </div>

              <div className="p-5">
                <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
