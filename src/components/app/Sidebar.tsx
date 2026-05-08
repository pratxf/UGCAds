"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileTriggerRef = useRef<HTMLButtonElement>(null);
  const [menuPos, setMenuPos] = useState({ bottom: 0, left: 0, width: 0 });

  useEffect(() => {
    setOpen(false);
  }, [pathname, setOpen]);

  useEffect(() => {
    if (profileMenuOpen) setProfileMenuOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  function openProfileMenu() {
    const el = profileTriggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setMenuPos({
      bottom: window.innerHeight - rect.top + 8,
      left: rect.left,
      width: rect.width,
    });
    setProfileMenuOpen(true);
  }

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

        {/* Credits card */}
        <div className="rounded-2xl p-4 space-y-3"
          style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>

          {/* Top row: icon + label + number */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full"
                style={{ background: "rgba(99,102,241,0.12)" }}>
                <FontAwesomeIcon icon={faBolt} style={{ fontSize: 16, color: "#6366F1" }} />
              </div>
              <span className="text-[15px] font-bold text-[#111111]">Credits</span>
            </div>
            <div className="text-right">
              <p className="text-[28px] font-bold text-[#111111] leading-none">{credits}</p>
              <p className="text-[11px] text-[#9CA3AF] mt-0.5">available</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: "#E5E7EB" }}>
            <div className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${pct}%`,
                background: pct > 20
                  ? "linear-gradient(90deg, #2563EB, #06B6D4)"
                  : "linear-gradient(90deg, #ef4444, #f97316)",
              }} />
          </div>

          {/* Usage text */}
          <p className="text-[12px]">
            <span style={{ color: "#2563EB", fontWeight: 600 }}>{credits}</span>
            <span style={{ color: "#9CA3AF" }}> / {planMax} credits remaining</span>
          </p>

          {/* Upgrade button */}
          <button
            onClick={() => router.push("/credits")}
            className="w-full flex items-center justify-center gap-2 rounded-2xl py-2.5 transition-all hover:brightness-110 active:scale-[0.98]"
            style={{ background: "#2563EB" }}
          >
            <FontAwesomeIcon icon={faArrowUp} style={{ fontSize: 11, color: "#fff" }} />
            <span className="text-[13px] font-bold text-white">Upgrade Plan</span>
          </button>
        </div>

        {/* Profile card */}
        <button
          ref={profileTriggerRef}
          type="button"
          onClick={openProfileMenu}
          className="flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-colors hover:bg-[#F3F4F6] focus:outline-none"
          style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
        >
          {userAvatar ? (
            <span className="h-11 w-11 overflow-hidden rounded-full flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={userAvatar} alt={userName} className="h-full w-full object-cover" />
            </span>
          ) : (
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[15px] font-bold text-white"
              style={{ background: "linear-gradient(135deg, #2563EB, #06B6D4)" }}>
              {initial}
            </span>
          )}
          <div className="flex-1 text-left min-w-0">
            <p className="text-[13px] font-bold text-[#111111] truncate">{userName}</p>
            <p className="text-[11px] text-[#9CA3AF] truncate">{userEmail}</p>
          </div>
          <FontAwesomeIcon icon={faEllipsis} className="shrink-0 text-[#9CA3AF]" style={{ fontSize: 16 }} />
        </button>

        {/* Portal profile menu — renders to document.body, zero layout impact */}
        {profileMenuOpen && typeof document !== "undefined" && createPortal(
          <>
            <div className="fixed inset-0 z-40" onClick={() => setProfileMenuOpen(false)} />
            <div
              className="fixed z-50 rounded-2xl overflow-hidden py-1"
              style={{
                bottom: menuPos.bottom,
                left: menuPos.left,
                width: menuPos.width,
                background: "#FFFFFF",
                border: "1px solid #E5E7EB",
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
              }}
            >
              {[
                { icon: faUser, label: "Profile", href: "/profile" },
                { icon: faCreditCard, label: "Billing", href: "/billing" },
              ].map((item) => (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => { setProfileMenuOpen(false); router.push(item.href); }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-[#374151] hover:bg-[#F3F4F6] transition-colors"
                >
                  <FontAwesomeIcon icon={item.icon} style={{ fontSize: 13, color: "#6B7280" }} />
                  {item.label}
                </button>
              ))}
              <div className="my-1 h-px mx-3" style={{ background: "#E5E7EB" }} />
              <button
                type="button"
                onClick={() => { setProfileMenuOpen(false); handleSignOut(); }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-[#DC2626] hover:bg-red-50 transition-colors"
              >
                <FontAwesomeIcon icon={faRightFromBracket} style={{ fontSize: 13 }} />
                Sign Out
              </button>
            </div>
          </>,
          document.body
        )}
      </div>
    </aside>
    </>
  );
}
