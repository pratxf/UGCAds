"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3, Users, Film, DollarSign, Shield, ChevronLeft,
  UserCircle, ImageIcon, Shirt, RotateCcw, MessageCircle, Tag, Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = { label: string; href: string; icon: typeof BarChart3; accent: string; activeBg: string; activeText: string };
type Section = { label?: string; dotColor?: string; items: NavItem[] };

const sky   = { accent: "border-sky-400/60",   activeBg: "from-sky-500/[0.14] to-transparent",   activeText: "text-sky-300",   dot: "bg-sky-400"   };
const vio   = { accent: "border-violet-400/60", activeBg: "from-violet-500/[0.14] to-transparent", activeText: "text-violet-300", dot: "bg-violet-400" };
const em    = { accent: "border-emerald-400/60",activeBg: "from-emerald-500/[0.14] to-transparent",activeText: "text-emerald-300",dot: "bg-emerald-400"};

const SECTIONS: Section[] = [
  {
    items: [
      { label: "Overview", href: "/admin", icon: BarChart3, ...sky },
    ],
  },
  {
    label: "Operations", dotColor: "bg-sky-400",
    items: [
      { label: "Users",       href: "/admin/users",       icon: Users,          ...sky },
      { label: "Generations", href: "/admin/generations", icon: Film,           ...sky },
      { label: "Refunds",     href: "/admin/refunds",     icon: RotateCcw,      ...sky },
      { label: "Support",     href: "/admin/support",     icon: MessageCircle,  ...sky },
    ],
  },
  {
    label: "Library", dotColor: "bg-violet-400",
    items: [
      { label: "UGC Avatars",          href: "/admin/avatars",               icon: UserCircle, ...vio },
      { label: "Photoshoot Templates", href: "/admin/photoshoot-templates",  icon: ImageIcon,  ...vio },
      { label: "Try-On Models",        href: "/admin/tryon-models",          icon: Shirt,      ...vio },
    ],
  },
  {
    label: "Business", dotColor: "bg-emerald-400",
    items: [
      { label: "Revenue", href: "/admin/revenue", icon: DollarSign, ...em },
      { label: "Pricing", href: "/admin/pricing", icon: Tag,        ...em },
    ],
  },
];

const PAGE_TITLES: Record<string, string> = {
  "/admin":                      "Overview",
  "/admin/users":                "Users",
  "/admin/generations":          "Generations",
  "/admin/refunds":              "Refunds",
  "/admin/support":              "Support",
  "/admin/avatars":              "UGC Avatars",
  "/admin/photoshoot-templates": "Photoshoot Templates",
  "/admin/tryon-models":         "Try-On Models",
  "/admin/revenue":              "Revenue",
  "/admin/pricing":              "Pricing",
};

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const pageTitle = PAGE_TITLES[pathname] ?? "Admin";

  return (
    <div
      className="flex min-h-screen"
      style={{
        background: "#05080E",
        backgroundImage: "radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    >
      {/* ── Sidebar ─────────────────────────────────── */}
      <aside
        className="fixed inset-y-0 left-0 z-30 flex w-[240px] flex-col"
        style={{
          background: "linear-gradient(180deg, #08101E 0%, #060A14 100%)",
          borderRight: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        {/* Logo */}
        <div className="flex h-[60px] items-center gap-3 px-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div
            className="flex size-9 items-center justify-center rounded-xl shrink-0"
            style={{ background: "linear-gradient(135deg, #0EA5E9 0%, #2563EB 100%)", boxShadow: "0 0 16px rgba(14,165,233,0.35)" }}
          >
            <Shield className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-[13px] font-bold text-slate-100" style={{ fontFamily: "Satoshi, sans-serif" }}>UGCAds</p>
            <p className="text-[10px] text-slate-600 font-medium tracking-wide uppercase">Admin Console</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2.5 space-y-5">
          {SECTIONS.map((section, si) => (
            <div key={si}>
              {section.label && (
                <div className="flex items-center gap-2 px-2.5 mb-1.5">
                  <span className={cn("size-1.5 rounded-full shrink-0", section.dotColor)} />
                  <p className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-slate-600">
                    {section.label}
                  </p>
                </div>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-[12.5px] font-medium transition-all duration-150 relative",
                        active
                          ? cn("bg-gradient-to-r border-l-2", item.activeBg, item.accent, item.activeText, "pl-[9px]")
                          : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]"
                      )}
                    >
                      <Icon className={cn("h-[15px] w-[15px] shrink-0", active ? item.activeText : "text-slate-600")} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-2.5 py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-lg px-2.5 py-[7px] text-[12px] font-medium text-slate-600 hover:text-slate-300 hover:bg-white/[0.04] transition-all"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Back to App
          </Link>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────── */}
      <div className="ml-[240px] flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header
          className="sticky top-0 z-20 flex h-[60px] items-center justify-between px-8"
          style={{
            background: "rgba(5,8,14,0.8)",
            backdropFilter: "blur(16px)",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600">Admin</span>
            <span className="text-slate-700">/</span>
            <span className="text-[12px] font-semibold text-slate-300">{pageTitle}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] text-slate-600 font-medium">Live</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
