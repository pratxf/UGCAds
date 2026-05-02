"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faClock, faSpinner, faXmark } from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";
import {
  ACTIVE_GENERATIONS_EVENT,
  readActiveGenerations,
  removeActiveGeneration,
  updateActiveGeneration,
  type ActiveGeneration,
} from "@/lib/active-generations";

const liveStatuses = new Set([
  "PENDING",
  "GENERATING_AUDIO",
  "GENERATING_SCENE",
  "GENERATING_VIDEO",
  "SYNCING_LIPS",
  "UPLOADING_GARMENT",
  "GENERATING_TRYON",
]);

export default function ActiveGenerationsPill() {
  const pathname = usePathname();
  const [items, setItems] = useState<ActiveGeneration[]>([]);

  useEffect(() => {
    const sync = () => setItems(readActiveGenerations());
    sync();
    window.addEventListener(ACTIVE_GENERATIONS_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(ACTIVE_GENERATIONS_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => {
    const active = items.filter((item) => liveStatuses.has(item.status));
    if (active.length === 0) return;

    let cancelled = false;
    const poll = async () => {
      await Promise.all(
        active.map(async (item) => {
          try {
            const res = await fetch(`/api/generations/${item.id}`);
            if (!res.ok || cancelled) return;
            const data = await res.json();
            updateActiveGeneration(item.id, {
              status: data.status,
              finalVideoUrl: data.finalVideoUrl,
              errorMessage: data.errorMessage,
            });
          } catch {
            // Keep the pill around; the next poll can recover.
          }
        }),
      );
      if (!cancelled) setItems(readActiveGenerations());
    };

    poll();
    const interval = window.setInterval(poll, 3500);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [items]);

  const visibleItems = useMemo(() => items.slice(0, 3), [items]);
  if (visibleItems.length === 0) return null;

  const needsBottomBarClearance =
    pathname === "/create/ugc" || pathname === "/create/product-ad";

  return (
    <div
      className={cn(
        "fixed right-4 z-40 flex w-[min(360px,calc(100vw-32px))] flex-col gap-2",
        needsBottomBarClearance ? "bottom-28" : "bottom-4",
      )}
    >
      {visibleItems.map((item) => {
        const isDone = item.status === "COMPLETED";
        const isFailed = item.status === "FAILED";
        const isLive = !isDone && !isFailed;
        return (
          <div
            key={item.id}
            className="rounded-2xl border border-white/10 bg-[#0A0A0F]/95 p-3 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border",
                  isLive && "border-primary/30 bg-primary/10 text-primary",
                  isDone && "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
                  isFailed && "border-destructive/30 bg-destructive/10 text-destructive",
                )}
              >
                <FontAwesomeIcon
                  icon={isLive ? faSpinner : isDone ? faCheck : faXmark}
                  className={isLive ? "animate-spin" : ""}
                  style={{ fontSize: 14 }}
                />
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">
                  {item.type}
                </p>
                <p className="truncate text-[11px] text-white/50">
                  {isLive ? statusLabel(item.status) : isDone ? "Ready in History" : item.errorMessage || "Generation failed"}
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <Link
                  href="/history"
                  className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-[11px] font-semibold text-white/70 transition hover:bg-white/10 hover:text-foreground"
                >
                  History
                </Link>
                <button
                  type="button"
                  onClick={() => removeActiveGeneration(item.id)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-white/45 transition hover:bg-white/10 hover:text-foreground"
                  aria-label="Dismiss generation status"
                >
                  <FontAwesomeIcon icon={faXmark} style={{ fontSize: 11 }} />
                </button>
              </div>
            </div>
          </div>
        );
      })}
      {items.length > 3 && (
        <Link
          href="/history"
          className="self-end rounded-full border border-white/10 bg-[#0A0A0F]/90 px-3 py-1.5 text-[11px] font-semibold text-white/60 backdrop-blur-xl transition hover:text-foreground"
        >
          <FontAwesomeIcon icon={faClock} className="mr-1.5" style={{ fontSize: 10 }} />
          {items.length - 3} more in History
        </Link>
      )}
    </div>
  );
}

function statusLabel(status: string) {
  switch (status) {
    case "PENDING":
      return "Queued";
    case "GENERATING_AUDIO":
      return "Generating voiceover";
    case "GENERATING_SCENE":
      return "Compositing scene";
    case "GENERATING_VIDEO":
      return "Generating video";
    case "SYNCING_LIPS":
      return "Syncing lips";
    case "GENERATING_TRYON":
      return "Generating try-on";
    default:
      return "Generating";
  }
}
