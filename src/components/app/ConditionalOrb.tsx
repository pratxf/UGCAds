"use client";

import { usePathname } from "next/navigation";
import GenerationsOrb from "./GenerationsOrb";

const ORB_PATHS = [
  "/create/ugc-studio",
  "/create/product-photoshoot",
  "/create/tryon",
];

export default function ConditionalOrb() {
  const pathname = usePathname();
  if (!ORB_PATHS.some((p) => pathname.startsWith(p))) return null;
  return <GenerationsOrb />;
}
