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
  const fontSize = size === "sm" ? "0.875rem" : size === "lg" ? "1.2rem" : "1rem";

  return (
    <Link href={href} className={cn("flex items-center gap-2.5", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/logo-u.svg" alt="UGCAds" width={iconSize} height={iconSize} className="shrink-0 rounded-[6px]" />
      {!collapsed && (
        <span
          className="font-bold text-foreground"
          style={{
            fontFamily: "var(--font-jakarta), sans-serif",
            fontSize,
            letterSpacing: "0.06em",
          }}
        >
          ugcads
        </span>
      )}
    </Link>
  );
}
