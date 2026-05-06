"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWandMagicSparkles, faBolt, faBars } from "@fortawesome/free-solid-svg-icons";
import { useMobileNav } from "@/lib/stores/mobile-nav";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/create/ugc": "Create UGC Ad",
  "/create/product-ad": "Create Product Ad",
  "/create/product-photoshoot": "Product Photoshoot",
  "/create/tryon": "AI Try-On",
  "/history": "History",
  "/credits": "Credits & Billing",
  "/support": "Support",
};

export default function TopBar({ credits = 0 }: { credits?: number }) {
  const pathname = usePathname();
  const title = pageTitles[pathname] || "Dashboard";
  const { toggle } = useMobileNav();

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-white/5 bg-black/20 px-4 sm:px-6 backdrop-blur-xl">
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          onClick={toggle}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-foreground transition lg:hidden"
          aria-label="Open menu"
        >
          <FontAwesomeIcon icon={faBars} style={{ fontSize: 16 }} />
        </button>
        <h1 className="truncate text-base sm:text-xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {/* Credits */}
        <Link
          href="/credits"
          className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-white/10"
        >
          <FontAwesomeIcon icon={faWandMagicSparkles} className="text-amber" style={{ fontSize: 14 }} />
          {credits % 10 === 0 ? credits / 10 : (credits / 10).toFixed(1)}
        </Link>

        {/* Upgrade */}
        <Link
          href="/credits?upgrade=true"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-3 sm:px-5 py-2 sm:py-2.5 text-xs font-semibold text-primary-foreground shadow-sm shadow-blue-500/20 transition-all hover:brightness-105 active:scale-[0.99]"
        >
          <FontAwesomeIcon icon={faBolt} style={{ fontSize: 14 }} />
          <span className="hidden sm:inline">Upgrade</span>
        </Link>
      </div>
    </header>
  );
}
