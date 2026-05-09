"use client";

import { useRef, useState, useEffect } from "react";
import { Check, X, TrendingDown, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

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
    category: "UGC Video Ad (1 ad)",
    agency: "$300 – $1,000",
    ugcads: "From $5",
    agencyBad: true,
  },
  {
    category: "Product Photoshoot (20 photos)",
    agency: "$500 – $2,000",
    ugcads: "From $5",
    agencyBad: true,
  },
  {
    category: "Full Campaign (10 video ads)",
    agency: "$3,000 – $10,000",
    ugcads: "$39 / month",
    agencyBad: true,
  },
  {
    category: "Turnaround Time",
    agency: "1 – 4 weeks",
    ugcads: "Under 2 minutes",
    agencyBad: true,
  },
  {
    category: "Scale to 100 ads / month",
    agency: "$30,000+",
    ugcads: "$129 / month",
    agencyBad: true,
  },
  {
    category: "Creative Control",
    agency: "Limited (agency decides)",
    ugcads: "Full control",
    agencyBad: true,
  },
  {
    category: "A/B Test Variations",
    agency: "Extra cost per variation",
    ugcads: "Instant, no extra cost",
    agencyBad: true,
  },
];

const highlights = [
  {
    icon: TrendingDown,
    label: "Cost reduction",
    value: "Up to 98%",
    sub: "vs traditional agency",
    color: "text-[#10B981]",
    bg: "bg-green-50",
  },
  {
    icon: Clock,
    label: "Time saved",
    value: "99%",
    sub: "from weeks to minutes",
    color: "text-[#2563EB]",
    bg: "bg-blue-50",
  },
];

export default function ComparisonTable() {
  const headingRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const headingInView = useInView(headingRef);
  const tableInView = useInView(tableRef);

  return (
    <section className="relative py-24 sm:py-32 bg-[#F7F7F5]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          ref={headingRef}
          className={cn(
            "text-center mb-12 transition-all duration-700 ease-out",
            headingInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-4 py-1.5 text-sm font-medium text-[#6B7280]">
            <TrendingDown className="h-3.5 w-3.5 text-[#10B981]" />
            The smarter choice
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#111111]">
            Real agency cost vs{" "}
            <span className="gradient-text">ugcads</span>
          </h2>
          <p className="mt-4 text-lg text-[#6B7280] max-w-xl mx-auto">
            See how much you are leaving on the table every time you hire a traditional agency.
          </p>
        </div>

        {/* Highlight stats */}
        <div
          className={cn(
            "grid grid-cols-2 gap-4 mb-10 transition-all duration-700 ease-out",
            headingInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
          style={{ transitionDelay: "150ms" }}
        >
          {highlights.map((h) => (
            <div key={h.label} className={cn("rounded-2xl p-5 border border-[#E5E7EB]", h.bg)}>
              <h.icon className={cn("h-5 w-5 mb-2", h.color)} />
              <div className={cn("text-2xl font-bold", h.color)}>{h.value}</div>
              <div className="text-sm font-medium text-[#111111] mt-0.5">{h.label}</div>
              <div className="text-xs text-[#6B7280] mt-0.5">{h.sub}</div>
            </div>
          ))}
        </div>

        {/* Comparison table */}
        <div
          ref={tableRef}
          className={cn(
            "rounded-2xl overflow-hidden border border-[#E5E7EB] bg-white shadow-sm transition-all duration-700 ease-out",
            tableInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px]">
              <thead>
                <tr className="border-b border-[#E5E7EB]">
                  <th className="p-4 text-left text-sm font-semibold text-[#111111] w-[45%]">
                    What you need
                  </th>
                  <th className="p-4 text-center text-sm font-semibold text-[#6B7280] w-[27.5%]">
                    <div className="flex flex-col items-center gap-1">
                      <span className="rounded-full bg-red-50 border border-red-100 px-3 py-1 text-red-600">
                        Traditional Agency
                      </span>
                    </div>
                  </th>
                  <th className="p-4 text-center text-sm font-semibold w-[27.5%]">
                    <div className="flex flex-col items-center gap-1">
                      <span className="rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-[#2563EB]">
                        ugcads
                      </span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr
                    key={row.category}
                    className={cn(
                      "border-b border-[#F3F4F6] transition-all duration-700 ease-out hover:bg-[#F9FAFB]",
                      tableInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
                      i === rows.length - 1 && "border-b-0"
                    )}
                    style={{ transitionDelay: `${i * 80}ms` }}
                  >
                    <td className="p-4 text-sm font-medium text-[#111111]">{row.category}</td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center gap-1.5 text-sm text-red-500 font-medium">
                        <X className="h-3.5 w-3.5 flex-shrink-0" strokeWidth={2.5} />
                        {row.agency}
                      </span>
                    </td>
                    <td className="p-4 text-center bg-blue-50/30">
                      <span className="inline-flex items-center gap-1.5 text-sm text-[#2563EB] font-semibold">
                        <Check className="h-3.5 w-3.5 flex-shrink-0" strokeWidth={2.5} />
                        {row.ugcads}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CTA */}
        <div
          className={cn(
            "mt-10 text-center transition-all duration-700 ease-out",
            tableInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
          style={{ transitionDelay: `${rows.length * 80}ms` }}
        >
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-full bg-[#2563EB] px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-700 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            Start saving today
            <span className="text-base leading-none">→</span>
          </Link>
          <p className="mt-3 text-sm text-[#6B7280]">No contract. No hidden fees. Cancel anytime.</p>
        </div>
      </div>
    </section>
  );
}
