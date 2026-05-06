"use client";

import { useState, useEffect, useRef } from "react";
import { PricingSection } from "@/components/ui/pricing";
import { cn } from "@/lib/utils";

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
    name: "Starter",
    info: "Try ugcads with one real project",
    price: {
      monthly: 5,
      yearly: 5,
    },
    oneTime: true,
    features: [
      { text: "1 video generation" },
      { text: "20 product photos" },
      { text: "All AI characters" },
      { text: "Full HD export" },
      { text: "No watermark" },
    ],
    btn: {
      text: "Try for $5",
      href: "/signup",
    },
  },
  {
    name: "Basic",
    info: "For individuals getting started with AI ads",
    price: {
      monthly: 39,
      yearly: 374,
    },
    features: [
      { text: "5 video generations / month" },
      { text: "100 product photos / month" },
      { text: "All AI characters" },
      { text: "Standard speed rendering" },
      { text: "Basic templates" },
      { text: "Email support" },
    ],
    btn: {
      text: "Get Started",
      href: "/signup",
    },
  },
  {
    highlighted: true,
    name: "Creator",
    info: "For creators and small businesses scaling ads",
    price: {
      monthly: 79,
      yearly: 758,
    },
    features: [
      { text: "15 video generations / month" },
      { text: "300 product photos / month" },
      { text: "All AI characters" },
      { text: "Faster rendering", tooltip: "2x faster than Basic plan" },
      { text: "Premium templates" },
      { text: "No watermark" },
      { text: "Priority email support", tooltip: "Responses within 4 hours on business days" },
    ],
    btn: {
      text: "Start Creating",
      href: "/signup",
    },
  },
  {
    name: "Agency",
    info: "For agencies and teams producing ads at scale",
    price: {
      monthly: 129,
      yearly: 1238,
    },
    features: [
      { text: "25 video generations / month" },
      { text: "500 product photos / month" },
      { text: "All AI characters" },
      { text: "Priority rendering", tooltip: "Fastest rendering queue" },
      { text: "All templates" },
      { text: "No watermark" },
      { text: "API access (coming soon)", tooltip: "Programmatic ad generation" },
      { text: "Team seats (3 users)" },
      { text: "Priority+ support", tooltip: "Dedicated account manager" },
    ],
    btn: {
      text: "Go Agency",
      href: "/signup",
    },
  },
];

export default function Pricing() {
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
          description="Start with a $5 trial or commit to a monthly plan. No hidden fees, cancel anytime."
        />
      </div>
    </section>
  );
}
