"use client";

import Link from "next/link";
import { Logo } from "@/components/ui/logo";

const links = {
  Product: [
    { title: "Features", href: "/#features" },
    { title: "How It Works", href: "/#how-it-works" },
    { title: "Pricing", href: "/pricing" },
  ],
  Company: [
    { title: "About", href: "/about" },
    { title: "Contact", href: "/contact" },
    { title: "Blog", href: "/blog" },
  ],
  Legal: [
    { title: "Privacy Policy", href: "/privacy" },
    { title: "Terms of Service", href: "/terms" },
    { title: "Refund Policy", href: "/refund" },
    { title: "Acceptable Use", href: "/acceptable-use" },
  ],
};

const socials = [
  {
    label: "X",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    label: "Threads",
    href: "#",
    icon: (
      <svg viewBox="0 0 192 192" fill="currentColor" className="h-4 w-4">
        <path d="M141.537 88.988a66.667 66.667 0 00-2.518-1.143c-1.482-27.307-16.403-42.94-41.457-43.1h-.34c-14.986 0-27.449 6.396-35.12 18.035l13.78 9.452c5.73-8.695 14.724-10.548 21.34-10.548h.232c8.246.053 14.465 2.452 18.49 7.13 2.95 3.39 4.928 8.051 5.93 13.93a73.258 73.258 0 00-23.82-1.575c-23.984 1.385-39.385 15.403-38.43 34.887.488 9.845 5.41 18.31 13.868 23.845 7.143 4.75 16.348 7.073 25.93 6.534 12.635-.703 22.554-5.522 29.47-14.322 5.268-6.696 8.606-15.354 10.108-26.278 6.07 3.669 10.56 8.516 13.012 14.441 4.197 10.173 4.44 26.894-8.694 40.024-11.555 11.553-25.44 16.53-46.38 16.686-23.246-.175-40.822-7.6-52.24-22.064C42.017 137.66 36.9 120.048 36.741 97.824c.16-22.224 5.277-39.836 15.206-52.348C63.365 31.012 80.94 23.587 104.187 23.412c23.412.175 41.247 7.63 53.011 22.162 5.771 7.17 10.13 16.25 12.975 26.96l16.192-4.325c-3.467-12.93-9.073-24.04-16.698-33.019-15.49-19.26-38.19-29.044-67.458-29.27h-.264c-29.206.226-51.695 10.06-66.892 29.243C22.78 51.724 16.552 71.951 16.363 97.824v.36c.189 25.873 6.417 46.1 18.519 62.1 15.197 19.182 37.686 29.016 66.892 29.242h.264c26.253-.2 44.786-7.054 59.953-22.219 20.517-20.513 19.896-46.14 13.14-61.85-4.738-11.485-13.787-20.7-33.594-26.47z" />
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.95a8.22 8.22 0 004.84 1.56V7.07a4.85 4.85 0 01-1.07-.38z" />
      </svg>
    ),
  },
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
              Create AI video ads in minutes. No studio, no actors, no hassle.
            </p>
            <div className="mt-5 flex items-center gap-2">
              {socials.map((s) => (
                <Link
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors"
                >
                  {s.icon}
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
            support@ugcads.us
          </p>
        </div>
      </div>
    </footer>
  );
}
