import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  collapsed?: boolean;
  href?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Logo({ collapsed = false, href = "/", className, size = "md" }: LogoProps) {
  const iconSize = size === "sm" ? 22 : size === "lg" ? 36 : 28;
  const textSize = size === "sm" ? "text-lg" : size === "lg" ? "text-2xl" : "text-xl";

  return (
    <Link href={href} className={cn("flex items-center gap-2.5", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/logo-u.svg" alt="UGCAds" width={iconSize} height={iconSize} className="shrink-0 rounded-[6px]" />
      {!collapsed && (
        <span className={cn("font-bold tracking-wide text-white", textSize)} style={{ fontVariant: "small-caps", letterSpacing: "0.04em" }}>
          UGC<span style={{ fontSize: "0.8em" }}>ADS</span>
        </span>
      )}
    </Link>
  );
}
