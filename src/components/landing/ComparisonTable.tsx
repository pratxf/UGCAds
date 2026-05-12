"use client";

import { useRef, useState, useEffect } from "react";
import {
  Video, Image, Layers, Clock, SlidersHorizontal, BarChart2, Lightbulb,
  Users, Star, Shield, Coins, Headphones, ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { STARTER_PLAN, SUBSCRIPTION_PLANS } from "@/lib/pricing";

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

const rows = [
  {
    icon: Video,
    iconBg: "#EFF6FF",
    iconColor: "#2563EB",
    category: "UGC-style video ad",
    agency: `$300 – $1,000+ per ad`,
    ugcads: `From $${STARTER_PLAN.priceUsd}`,
  },
  {
    icon: Image,
    iconBg: "#F0FDF4",
    iconColor: "#16A34A",
    category: "Product photos",
    agency: "$500 – $2,000+ per shoot",
    ugcads: "1 credit per photo",
  },
  {
    icon: Layers,
    iconBg: "#F5F3FF",
    iconColor: "#7C3AED",
    category: "Ad variations",
    agency: "Extra cost per variation",
    ugcads: "Use credits flexibly",
  },
  {
    icon: Clock,
    iconBg: "#FFF7ED",
    iconColor: "#EA580C",
    category: "Turnaround time",
    agency: "Days to weeks",
    ugcads: "Generate in minutes",
  },
  {
    icon: SlidersHorizontal,
    iconBg: "#F5F3FF",
    iconColor: "#6D28D9",
    category: "Creative control",
    agency: "Limited revision rounds",
    ugcads: "Create and adjust anytime",
  },
  {
    icon: BarChart2,
    iconBg: "#F0FDF4",
    iconColor: "#15803D",
    category: "Scaling ad creatives",
    agency: "Cost increases quickly",
    ugcads: `Plans from $${SUBSCRIPTION_PLANS[0].monthlyPriceUsd}/month`,
  },
  {
    icon: Lightbulb,
    iconBg: "#FEFCE8",
    iconColor: "#CA8A04",
    category: "Testing new ideas",
    agency: "Slow and costly",
    ugcads: "Test multiple hooks & angles fast",
  },
];

const badges = [
  { icon: Shield,    label: "No subscription trap" },
  { icon: Coins,     label: "Use credits flexibly" },
  { icon: Headphones, label: "Live & priority support" },
];

export default function ComparisonTable() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, "-60px");

  return (
    <section className="relative py-24 sm:py-32 bg-white">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div
          ref={sectionRef}
          className={cn(
            "text-center mb-12 transition-all duration-700 ease-out",
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#111111]">
            Create more. Spend less.
          </h2>
          <p className="mt-4 text-[17px] text-[#6B7280] max-w-xl mx-auto leading-relaxed">
            UGCads gives you everything you need to create high-performing ads{" "}
            faster, cheaper, and with complete creative control.
          </p>
        </div>

        {/* Table card */}
        <div
          className={cn(
            "rounded-2xl overflow-hidden border border-[#E5E7EB] bg-white shadow-sm transition-all duration-700 ease-out",
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
          style={{ transitionDelay: "100ms" }}
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr>
                  {/* Col 1 header */}
                  <th className="px-6 py-4 text-left w-[40%] border-b border-[#E5E7EB]">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2563EB]">
                        <Shield className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
                      </div>
                      <span className="text-[14px] font-semibold text-[#111111]">What you need</span>
                    </div>
                  </th>
                  {/* Col 2 header — Traditional */}
                  <th className="px-6 py-4 text-center w-[30%] border-b border-[#E5E7EB]" style={{ background: "rgba(254,226,226,0.35)" }}>
                    <div className="flex items-center justify-center gap-2">
                      <Users className="h-4 w-4 text-red-500" />
                      <span className="text-[14px] font-semibold text-red-500">Traditional Production</span>
                    </div>
                  </th>
                  {/* Col 3 header — UGCads */}
                  <th className="px-6 py-4 text-center w-[30%] border-b border-[#E5E7EB]" style={{ background: "rgba(219,234,254,0.4)" }}>
                    <div className="flex items-center justify-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#2563EB]">
                        <ArrowUpRight className="h-4 w-4 text-white" strokeWidth={2.5} />
                      </div>
                      <span className="text-[14px] font-semibold text-[#1D4ED8]">UGCads</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr
                    key={row.category}
                    className={cn(
                      "transition-all duration-500 ease-out",
                      i < rows.length - 1 ? "border-b border-[#F3F4F6]" : ""
                    )}
                    style={{ transitionDelay: `${120 + i * 60}ms` }}
                  >
                    {/* Category */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                          style={{ background: row.iconBg }}>
                          <row.icon className="h-4 w-4" style={{ color: row.iconColor }} strokeWidth={1.8} />
                        </div>
                        <span className="text-[14px] font-medium text-[#111111]">{row.category}</span>
                      </div>
                    </td>
                    {/* Traditional */}
                    <td className="px-6 py-4 text-center" style={{ background: "rgba(254,226,226,0.15)" }}>
                      <span className="text-[13px] font-medium text-red-500">{row.agency}</span>
                    </td>
                    {/* UGCads */}
                    <td className="px-6 py-4 text-center" style={{ background: "rgba(219,234,254,0.2)" }}>
                      <span className="text-[13px] font-semibold text-[#2563EB]">{row.ugcads}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer banner */}
        <div
          className={cn(
            "mt-4 rounded-2xl px-6 py-5 flex items-center justify-between gap-4 transition-all duration-700 ease-out",
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
          style={{ background: "#F1F5F9", transitionDelay: `${120 + rows.length * 60}ms` }}
        >
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#2563EB]">
              <Star className="h-5 w-5 text-white" fill="white" />
            </div>
            <div>
              <p className="text-[15px] font-bold text-[#111111]">Powerful results without the production headaches.</p>
              <p className="text-[13px] text-[#6B7280] mt-0.5">More creative. Lower cost. Faster results.</p>
            </div>
          </div>
          <Link
            href="/signup"
            className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-[#2563EB] px-5 py-2.5 text-[13px] font-bold text-white hover:bg-blue-700 transition-all whitespace-nowrap"
          >
            Start creating today
            <span className="text-base leading-none">→</span>
          </Link>
        </div>

        {/* Bottom badges */}
        <div
          className={cn(
            "mt-6 flex items-center justify-center gap-8 flex-wrap transition-all duration-700 ease-out",
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
          style={{ transitionDelay: `${180 + rows.length * 60}ms` }}
        >
          {badges.map((b) => (
            <div key={b.label} className="flex items-center gap-2 text-[13px] text-[#6B7280]">
              <b.icon className="h-4 w-4 text-[#9CA3AF]" strokeWidth={1.8} />
              {b.label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
