"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGrip,
  faVideo,
  faImage,
  faShirt,
  faClock,
  faCreditCard,
  faHeadset,
  faRightFromBracket,
  faUser,
  faEllipsis,
  faXmark,
  faBolt,
  faArrowUp,
} from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { cn } from "@/lib/utils";
import { fromUnits, PLAN_CREDITS } from "@/lib/credits";
import { Logo } from "@/components/ui/logo";
import { useMobileNav } from "@/lib/stores/mobile-nav";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface NavItem {
  label: string;
  icon: IconDefinition;
  href: string;
  cost?: string;
}

const createNav: NavItem[] = [
  { label: "UGC Studio", icon: faVideo, href: "/create/ugc-studio", cost: "20" },
  { label: "Product Photoshoot", icon: faImage, href: "/create/product-photoshoot", cost: "1" },
  { label: "AI Try-On", icon: faShirt, href: "/create/tryon", cost: "5" },
];

const manageNav: NavItem[] = [
  { label: "History", icon: faClock, href: "/history" },
  { label: "Credits", icon: faCreditCard, href: "/credits" },
  { label: "Support", icon: faHeadset, href: "/support" },
];

interface SidebarProps {
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
  credits?: number;
  plan?: string;
}

function NavLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
  return (
    <Link
      href={item.href}
      className={cn(
        "group flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-sm transition-all",
        isActive
          ? "text-[#111111]"
          : "text-[#6B7280] hover:text-[#111111] hover:bg-[#F3F4F6]"
      )}
      style={isActive ? {
        background: "rgba(37,99,235,0.08)",
        boxShadow: "inset 0 0 0 1px rgba(37,99,235,0.2)",
      } : {}}
    >
      <span className="flex items-center gap-3">
        <FontAwesomeIcon
          icon={item.icon}
          className="transition-colors"
          style={{ fontSize: 16, color: isActive ? "#2563EB" : undefined }}
        />
        <span className="font-medium">{item.label}</span>
      </span>
    </Link>
  );
}

export default function Sidebar({ userName = "User", userEmail, userAvatar, credits: rawCredits = 0, plan = "BASIC" }: SidebarProps) {
  const credits = fromUnits(rawCredits);
  const planMax = (plan && plan in PLAN_CREDITS) ? PLAN_CREDITS[plan as keyof typeof PLAN_CREDITS] : PLAN_CREDITS.BASIC;
  const pct = Math.min(100, Math.round((credits / planMax) * 100));
  const pathname = usePathname();
  const router = useRouter();
  const { open, setOpen } = useMobileNav();

  useEffect(() => {
    setOpen(false);
  }, [pathname, setOpen]);

  async function handleSignOut() {
    await fetch("/auth/signout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const checkActive = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const initial = userName.charAt(0).toUpperCase();

  return (
    <>
      {/* Mobile backdrop */}
      <div
        onClick={() => setOpen(false)}
        className={cn(
          "fixed inset-0 z-30 bg-black/70 backdrop-blur-sm transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-screen w-[252px] flex-col transition-transform duration-300 ease-out",
          "lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
        style={{
          background: "#FFFFFF",
          borderRight: "1px solid #E5E7EB",
        }}
      >
      {/* Mobile close button */}
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-lg text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111111] transition lg:hidden"
        aria-label="Close menu"
      >
        <FontAwesomeIcon icon={faXmark} style={{ fontSize: 14 }} />
      </button>

      {/* Logo */}
      <div className="flex h-14 shrink-0 items-center gap-2 px-5">
        <Logo href="/dashboard" size="md" />
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {/* Dashboard */}
        <div>
          <NavLink
            item={{ label: "Dashboard", icon: faGrip, href: "/dashboard" }}
            isActive={checkActive("/dashboard")}
          />
        </div>

        {/* Create */}
        <div>
          <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9CA3AF]">
            Create
          </p>
          <div className="space-y-0.5">
            {createNav.map((item) => (
              <NavLink key={item.href} item={item} isActive={checkActive(item.href)} />
            ))}
          </div>
        </div>

        {/* Manage */}
        <div>
          <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9CA3AF]">
            Manage
          </p>
          <div className="space-y-0.5">
            {manageNav.map((item) => (
              <NavLink key={item.href} item={item} isActive={checkActive(item.href)} />
            ))}
          </div>
        </div>
      </nav>

      {/* Bottom */}
      <div className="shrink-0 space-y-2 p-3">

        {/* Credits widget — glass card */}
        <div className="rounded-2xl p-3 space-y-2.5"
          style={{
            background: "rgba(37,99,235,0.08)",
            border: "1px solid rgba(37,99,235,0.2)",
            backdropFilter: "blur(12px)",
          }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg"
                style={{ background: "rgba(37,99,235,0.18)" }}>
                <FontAwesomeIcon icon={faBolt} style={{ fontSize: 10, color: "#60A5FA" }} />
              </div>
              <span className="text-[12px] font-semibold text-[#6B7280]">Credits</span>
            </div>
            <span className="text-[13px] font-bold text-[#111111]">{credits}</span>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: "#E5E7EB" }}>
            <div className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${pct}%`,
                background: pct > 20
                  ? "linear-gradient(90deg, #2563EB, #06B6D4)"
                  : "linear-gradient(90deg, #ef4444, #f97316)",
                boxShadow: "none",
              }} />
          </div>

          {/* Upgrade button */}
          <button
            onClick={() => router.push("/credits")}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-2 transition-all hover:brightness-110 active:scale-[0.98]"
            style={{
              background: "#2563EB",
            }}
          >
            <FontAwesomeIcon icon={faArrowUp} style={{ fontSize: 10, color: "#fff" }} />
            <span className="text-[12px] font-bold text-white tracking-wide">Upgrade Plan</span>
          </button>
        </div>

        {/* User */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex w-full items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-2.5 transition-colors hover:bg-[#F3F4F6]">
            {userAvatar ? (
              <span className="h-9 w-9 overflow-hidden rounded-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={userAvatar} alt={userName} className="h-full w-full object-cover" />
              </span>
            ) : (
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
                style={{ background: "linear-gradient(135deg, #2563EB, #06B6D4)" }}>
                {initial}
              </span>
            )}
            <div className="flex-1 text-left min-w-0">
              <p className="text-[13px] font-medium text-[#111111] truncate">{userName}</p>
              <p className="text-[11px] text-[#9CA3AF] truncate">{userEmail}</p>
            </div>
            <FontAwesomeIcon icon={faEllipsis} className="shrink-0 text-[#9CA3AF]" style={{ fontSize: 16 }} />
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" sideOffset={8}>
            <DropdownMenuItem onClick={() => router.push("/profile")}>
              <FontAwesomeIcon icon={faUser} className="mr-2" style={{ fontSize: 14 }} />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/billing")}>
              <FontAwesomeIcon icon={faCreditCard} className="mr-2" style={{ fontSize: 14 }} />
              Billing
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <FontAwesomeIcon icon={faRightFromBracket} className="mr-2" style={{ fontSize: 14 }} />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
    </>
  );
}
