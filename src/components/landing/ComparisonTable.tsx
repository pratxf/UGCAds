"use client";

import { useRef, useState, useEffect } from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

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

const features = [
  {
    label: "AI Characters",
    basic: "5 characters",
    creator: "20+ characters",
    agency: "All characters",
  },
  {
    label: "Voiceovers",
    basic: true,
    creator: true,
    agency: true,
  },
  {
    label: "Speed",
    basic: "Standard",
    creator: "Faster",
    agency: "Priority",
  },
  {
    label: "Templates",
    basic: "Basic",
    creator: "Premium",
    agency: "All",
  },
  {
    label: "Watermark-free",
    basic: false,
    creator: true,
    agency: true,
  },
  {
    label: "API Access",
    basic: false,
    creator: false,
    agency: "Coming Soon",
  },
  {
    label: "Team Seats",
    basic: false,
    creator: false,
    agency: "3 seats",
  },
  {
    label: "Priority Support",
    basic: false,
    creator: true,
    agency: true,
  },
];

function CellValue({ value }: { value: boolean | string }) {
  if (value === true)
    return <Check className="size-5 text-mint mx-auto" />;
  if (value === false)
    return <X className="size-5 text-muted-foreground/40 mx-auto" />;
  return (
    <span className="text-sm text-foreground/80">{value}</span>
  );
}

export default function ComparisonTable() {
  const headingRef = useRef<HTMLDivElement>(null);
  const tableWrapperRef = useRef<HTMLDivElement>(null);
  const headingInView = useInView(headingRef);
  const tableInView = useInView(tableWrapperRef);

  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          ref={headingRef}
          className={cn(
            "text-center mb-16 transition-all duration-700 ease-out",
            headingInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Compare <span className="gradient-text">Plans</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Find the perfect plan for your needs.
          </p>
        </div>

        <div
          ref={tableWrapperRef}
          className={cn(
            "glass rounded-2xl overflow-hidden overflow-x-auto transition-all duration-700 ease-out",
            tableInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-white/10">
                <th className="p-4 text-left text-sm font-medium text-muted-foreground">
                  Feature
                </th>
                <th className="p-4 text-center text-sm font-medium">Basic</th>
                <th className="p-4 text-center text-sm font-medium">
                  <span className="gradient-text">Creator</span>
                </th>
                <th className="p-4 text-center text-sm font-medium">Agency</th>
              </tr>
            </thead>
            <tbody>
              {features.map((f, i) => (
                <tr
                  key={f.label}
                  className={cn(
                    "table-row border-b border-white/5 transition-all duration-700 ease-out hover:bg-white/[0.02]",
                    tableInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
                    i === features.length - 1 && "border-b-0"
                  )}
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  <td className="p-4 text-sm font-medium">{f.label}</td>
                  <td className="p-4 text-center">
                    <CellValue value={f.basic} />
                  </td>
                  <td className="p-4 text-center bg-white/[0.02]">
                    <CellValue value={f.creator} />
                  </td>
                  <td className="p-4 text-center">
                    <CellValue value={f.agency} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
