"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

function ScrollReset() {
  const lenis = useLenis();
  const pathname = usePathname();

  useEffect(() => {
    lenis?.scrollTo(0, { immediate: true });
    // Force Lenis to recalculate scroll height after navigation
    setTimeout(() => lenis?.resize(), 100);
  }, [pathname, lenis]);

  return null;
}

export function LenisProvider({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis root options={{ lerp: 0.12, smoothWheel: true, autoResize: true }}>
      <ScrollReset />
      {children}
    </ReactLenis>
  );
}
