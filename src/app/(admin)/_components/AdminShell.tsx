"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Users,
  Film,
  DollarSign,
  Shield,
  ChevronLeft,
  Settings,
  UserCircle,
  ImageIcon,
  Shirt,
  RotateCcw,
  MessageCircle,
  Tag,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = { label: string; href: string; icon: typeof BarChart3 };
type Section = { label?: string; items: NavItem[] };

const SECTIONS: Section[] = [
  {
    items: [
      { label: "Overview", href: "/admin", icon: BarChart3 },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Users", href: "/admin/users", icon: Users },
      { label: "Generations", href: "/admin/generations", icon: Film },
      { label: "Refunds", href: "/admin/refunds", icon: RotateCcw },
      { label: "Support", href: "/admin/support", icon: MessageCircle },
    ],
  },
  {
    label: "Library",
    items: [
      { label: "UGC Studio Avatars", href: "/admin/avatars", icon: UserCircle },
      { label: "Photoshoot Templates", href: "/admin/photoshoot-templates", icon: ImageIcon },
      { label: "Try-On Models", href: "/admin/tryon-models", icon: Shirt },
    ],
  },
  {
    label: "Business",
    items: [
      { label: "Revenue", href: "/admin/revenue", icon: DollarSign },
      { label: "Pricing", href: "/admin/pricing", icon: Tag },
      { label: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-[#08080A]">
      <aside className="fixed inset-y-0 left-0 z-30 flex w-[252px] flex-col border-r border-white/[0.06] bg-[#0A0A0E]">
        {/* Brand */}
        <div className="flex h-16 items-center gap-3 px-5 border-b border-white/[0.06]">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
            <Shield className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-bold leading-tight text-foreground">Admin</p>
            <p className="text-[10px] text-muted-foreground leading-tight">UGCAds Console</p>
          </div>
        </div>

        {/* Sectioned nav */}
        <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
          {SECTIONS.map((section, i) => (
            <div key={i}>
              {section.label && (
                <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/30">
                  {section.label}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active =
                    item.href === "/admin"
                      ? pathname === "/admin"
                      : pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-all",
                        active
                          ? "bg-primary/10 text-primary"
                          : "text-white/60 hover:text-foreground hover:bg-white/[0.04]"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-white/[0.06]">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium text-white/55 hover:text-foreground hover:bg-white/[0.04] transition-all"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Back to App
          </Link>
        </div>
      </aside>

      <div className="ml-[252px] flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 flex h-14 items-center border-b border-white/[0.06] bg-[#08080A]/80 backdrop-blur-xl px-8">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-white/40">
            Admin Console
          </p>
        </header>
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
