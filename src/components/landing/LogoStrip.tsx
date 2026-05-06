"use client";

import { LogoCloud } from "@/components/ui/logo-cloud-3";

const logos = [
  { src: "/logos/bestbuy.svg", alt: "Best Buy" },
  { src: "/logos/macys.svg", alt: "Macys" },
  { src: "/logos/lowes.svg", alt: "Lowes" },
  { src: "/logos/temu.svg", alt: "Temu" },
  { src: "/logos/ulta.svg", alt: "Ulta" },
  { src: "/logos/newegg.svg", alt: "Newegg" },
  { src: "/logos/zappos.svg", alt: "Zappos" },
  { src: "/logos/new-balance.svg", alt: "New Balance" },
  { src: "/logos/steve-madden.svg", alt: "Steve Madden" },
  { src: "/logos/goody.svg", alt: "Goody" },
  { src: "/logos/floor-decor.svg", alt: "Floor & Decor" },
];

export default function LogoStrip() {
  return (
    <section className="py-14 bg-white border-y border-[#E5E7EB]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="mb-6 text-center text-sm font-medium text-[#9CA3AF] uppercase tracking-widest">
          Trusted by 200+ businesses worldwide
        </p>
        <LogoCloud logos={logos} />
      </div>
    </section>
  );
}
