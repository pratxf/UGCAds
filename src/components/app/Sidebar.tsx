"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGrip,
  faVideo,
  faBox,
  faImage,
  faShirt,
  faClock,
  faCreditCard,
  faHeadset,
  faRightFromBracket,
  faUser,
  faEllipsis,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { cn } from "@/lib/utils";
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
  { label: "UGC Ad", icon: faVideo, href: "/create/ugc", cost: "20" },
  { label: "Product Ad", icon: faBox, href: "/create/product-ad", cost: "20" },
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
}

function NavLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
  return (
    <Link
      href={item.href}
      className={cn(
        "group flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-sm transition-all",
        isActive
          ? "bg-gradient-to-r from-primary/15 via-violet/10 to-transparent text-foreground ring-1 ring-inset ring-white/10"
          : "text-muted-foreground hover:text-foreground hover:bg-white/10"
      )}
    >
      <span className="flex items-center gap-3">
        <FontAwesomeIcon
          icon={item.icon}
          className={cn(
            "transition-colors",
            isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
          )}
          style={{ fontSize: 18 }}
        />
        <span className="font-medium">{item.label}</span>
      </span>
    </Link>
  );
}

export default function Sidebar({ userName = "User", userEmail, userAvatar }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { open, setOpen } = useMobileNav();

  // Close drawer on route change
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
          "fixed inset-0 z-30 bg-black/60 backdrop-blur-sm transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-screen w-[252px] flex-col border-r border-white/5 bg-[#0A0A0F] transition-transform duration-300 ease-out",
          "lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
      {/* Mobile close button */}
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-lg text-white/60 hover:bg-white/10 hover:text-foreground transition lg:hidden"
        aria-label="Close menu"
      >
        <FontAwesomeIcon icon={faXmark} style={{ fontSize: 14 }} />
      </button>
      {/* Logo */}
      <div className="flex h-14 shrink-0 items-center gap-2 border-b border-white/5 px-5">
        <Logo href="/dashboard" size="sm" />
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
          <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/50">
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
          <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/50">
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
      <div className="shrink-0 space-y-2.5 border-t border-white/5 p-3">
        {/* User */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex w-full items-center gap-3 rounded-2xl border border-white/5 bg-white/5 p-2.5 transition-colors hover:bg-white/10">
            {userAvatar ? (
              <span className="h-9 w-9 overflow-hidden rounded-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={userAvatar} alt={userName} className="h-full w-full object-cover" />
              </span>
            ) : (
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet to-amber text-sm font-bold text-black">
                {initial}
              </span>
            )}
            <div className="flex-1 text-left min-w-0">
              <p className="text-[13px] font-medium text-foreground truncate">{userName}</p>
              <p className="text-[11px] text-muted-foreground truncate">{userEmail}</p>
            </div>
            <FontAwesomeIcon icon={faEllipsis} className="shrink-0 text-white/50" style={{ fontSize: 16 }} />
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
