import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  collapsed?: boolean;
  href?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Logo({ collapsed = false, href = "/", className, size = "md" }: LogoProps) {
  const textSize = size === "sm" ? "text-lg" : size === "lg" ? "text-2xl" : "text-xl";
  const boxSize = size === "sm" ? 20 : size === "lg" ? 28 : 24;
  const iconSize = boxSize * 0.52;

  return (
    <Link href={href} className={cn("inline-flex items-center gap-1 select-none", className)}>
      <span
        className={cn("font-bold tracking-tight text-[#111111] dark:text-white", textSize)}
        style={{ letterSpacing: "-0.02em" }}
      >
        ugc
      </span>

      {/* Blue square icon */}
      <span
        className="inline-flex items-center justify-center flex-shrink-0 rounded-[6px]"
        style={{ width: boxSize, height: boxSize, background: "#2563EB" }}
      >
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2.5 9.5L9.5 2.5M9.5 2.5H4.5M9.5 2.5V7.5"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>

      {!collapsed && (
        <span
          className={cn("font-bold tracking-tight text-[#111111] dark:text-white", textSize)}
          style={{ letterSpacing: "-0.02em" }}
        >
          ads
        </span>
      )}
    </Link>
  );
}
