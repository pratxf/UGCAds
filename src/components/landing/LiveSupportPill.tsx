"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";

export default function LiveSupportPill() {
  return (
    <Link
      href="/login"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-full px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
      style={{ background: "linear-gradient(135deg, #2563EB, #06B6D4)" }}
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
      </span>
      <MessageCircle className="h-4 w-4" />
      Live support
    </Link>
  );
}
