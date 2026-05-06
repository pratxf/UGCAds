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
  const ovalW  = size === "sm" ? 18 : size === "lg" ? 26 : 22;
  const ovalH  = size === "sm" ? 20 : size === "lg" ? 28 : 24;

  return (
    <Link href={href} className={cn("inline-flex items-center select-none", className)}>
      <span
        className={cn("font-bold tracking-tight text-[#111111] dark:text-white flex items-center gap-0", textSize)}
        style={{ fontFamily: "Satoshi, sans-serif", letterSpacing: "-0.02em" }}
      >
        <span>ugc</span>

        {/* Styled "a" — blue oval with white arrow icon */}
        <span
          className="relative inline-flex items-center justify-center mx-[1px]"
          style={{ width: ovalW, height: ovalH }}
        >
          {/* Blue oval background */}
          <svg
            width={ovalW}
            height={ovalH}
            viewBox="0 0 22 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute inset-0"
          >
            <rect width="22" height="24" rx="7" fill="#2563EB" />
          </svg>
          {/* Arrow-up-right icon inside */}
          <svg
            width={ovalW * 0.55}
            height={ovalH * 0.55}
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="relative z-10"
          >
            <path
              d="M2.5 9.5L9.5 2.5M9.5 2.5H4.5M9.5 2.5V7.5"
              stroke="white"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>

        {!collapsed && <span>ds</span>}
      </span>
    </Link>
  );
}
