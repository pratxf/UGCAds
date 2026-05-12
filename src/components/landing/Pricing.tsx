"use client";

import { useState, useEffect, useRef } from "react";
import { PricingSection } from "@/components/ui/pricing";
import { cn } from "@/lib/utils";
import { STARTER_PLAN, SUBSCRIPTION_PLANS } from "@/lib/pricing";

function useInView(ref: React.RefObject<HTMLElement | null>, margin = "-100px") {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { rootMargin: margin }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref, margin]);
  return inView;
}

const PLANS = [
  {
    name: STARTER_PLAN.name,
    info: "Try ugcads with one real project",
    price: { monthly: STARTER_PLAN.priceUsd, yearly: STARTER_PLAN.priceUsd },
    oneTime: true,
    features: STARTER_PLAN.features.map((f) => ({ text: f })),
    btn: { text: `Try for $${STARTER_PLAN.priceUsd}`, href: "/signup" },
  },
  ...SUBSCRIPTION_PLANS.map((p) => ({
    name: p.name,
    info: p.description,
    highlighted: p.highlighted,
    price: { monthly: p.monthlyPriceUsd, yearly: p.yearlyTotalUsd },
    features: p.features.map((f) => ({ text: f })),
    btn: { text: "Get Started", href: "/signup" },
  })),
];

export default function Pricing({ headingAs }: { headingAs?: "h1" | "h2" }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef);

  return (
    <section id="pricing" className="relative py-24 sm:py-32 bg-white">
      <div
        ref={sectionRef}
        className={cn(
          "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 transition-all duration-700 ease-out",
          inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}
      >
        <PricingSection
          plans={PLANS}
          heading="Simple, Transparent Pricing"
          description="Start at $5 or commit to a monthly plan. No subscription trap. Just pay for what you create."
          headingAs={headingAs}
        />
      </div>
    </section>
  );
}
