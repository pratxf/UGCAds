"use client";

import Link from "next/link";
import { Logo } from "@/components/ui/logo";

const links = {
  Product: [
    { title: "Features", href: "#features" },
    { title: "How It Works", href: "#how-it-works" },
    { title: "Pricing", href: "#pricing" },
    { title: "Changelog", href: "#" },
  ],
  Company: [
    { title: "About", href: "#" },
    { title: "Contact", href: "/support" },
    { title: "Blog", href: "#" },
    { title: "Affiliates", href: "#" },
  ],
  Legal: [
    { title: "Privacy Policy", href: "/privacy" },
    { title: "Terms of Service", href: "/terms" },
    { title: "Refund Policy", href: "/refund" },
    { title: "Acceptable Use", href: "/acceptable-use" },
  ],
};

const socials = [
  { label: "X (Twitter)", href: "#" },
  { label: "Instagram", href: "#" },
  { label: "YouTube", href: "#" },
  { label: "LinkedIn", href: "#" },
  { label: "TikTok", href: "#" },
];

export default function Footer() {
  return (
    <footer className="bg-[#F7F7F5] border-t border-[#E5E7EB]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand column */}
          <div className="md:col-span-2">
            <Logo href="/" />
            <p className="mt-4 text-sm text-[#6B7280] leading-relaxed max-w-xs">
              AI-powered video ads with real-looking characters and authentic voices. From idea to live ad in under 2 minutes.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              {socials.map((s) => (
                <Link
                  key={s.label}
                  href={s.href}
                  className="text-xs text-[#9CA3AF] hover:text-[#2563EB] transition-colors"
                >
                  {s.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <h4 className="text-xs font-semibold text-[#111111] uppercase tracking-wider mb-4">
                {section}
              </h4>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item.title}>
                    <Link
                      href={item.href}
                      className="text-sm text-[#6B7280] hover:text-[#2563EB] transition-colors"
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#9CA3AF]">
            &copy; {new Date().getFullYear()} ugcads. All rights reserved.
          </p>
          <p className="text-xs text-[#9CA3AF]">
            support@ugcads.com
          </p>
        </div>
      </div>
    </footer>
  );
}
