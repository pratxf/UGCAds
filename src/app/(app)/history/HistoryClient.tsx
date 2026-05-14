"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFilm,
  faDownload,
  faPlay,
  faPause,
  faCheck,
  faCompress,
  faExpand,
  faSpinner,
  faVolumeHigh,
  faVolumeXmark,
  faXmark,
  faWandMagicSparkles,
  faMagnifyingGlass,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

type AdType = "UGC Ad" | "Product Ad" | "Product Photoshoot" | "AI Try-On";
type Status = "Complete" | "Processing" | "Failed";

interface Item {
  id: string;
  title: string;
  type: AdType;
  status: Status;
  date: string;
  characterImage: string | null;
  finalUrl: string | null;
  thumbnailUrl: string | null;
}

const tabs = [
  { value: "all", label: "All" },
  { value: "ugc", label: "UGC Video" },
  { value: "mockup", label: "Product Photoshoot" },
  { value: "tryon", label: "AI Try-On" },
] as const;

const tabMap: Record<string, AdType> = {
  ugc: "UGC Ad",
  product: "Product Ad",
  mockup: "Product Photoshoot",
  tryon: "AI Try-On",
};

function typeDisplayLabel(t: AdType) {
  if (t === "UGC Ad") return "UGC Video";
  if (t === "Product Ad") return "Product Video";
  return t;
}

function typeTagStyle(t: AdType): React.CSSProperties {
  switch (t) {
    case "UGC Ad": return { background: "rgba(37,99,235,0.08)", color: "#2563EB" };
    case "Product Ad": return { background: "rgba(124,58,237,0.08)", color: "#7C3AED" };
    case "Product Photoshoot": return { background: "rgba(6,182,212,0.08)", color: "#0891B2" };
    case "AI Try-On": return { background: "rgba(168,85,247,0.08)", color: "#9333EA" };
  }
}

function statusBadgeStyle(s: Status): React.CSSProperties {
  if (s === "Complete") return { background: "rgba(16,185,129,0.15)", color: "#059669" };
  if (s === "Processing") return { background: "rgba(245,158,11,0.15)", color: "#D97706" };
  return { background: "rgba(239,68,68,0.15)", color: "#DC2626" };
}

function downloadAsset(url: string, type: string, id: string) {
  const isImage = type === "Product Photoshoot" || type === "AI Try-On";
  const ext = isImage ? "jpg" : "mp4";
  const filename = `${type.toLowerCase().replace(/\s+/g, "-")}-${id.slice(-6)}.${ext}`;
  const proxied = `/api/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`;
  const a = document.createElement("a");
  a.href = proxied;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export default function HistoryClient({ items: rawItems }: { items: Item[] }) {
  const [liveItems, setLiveItems] = useState<Item[]>(rawItems.filter((i) => i.status !== "Failed"));
  const items = liveItems;
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [preview, setPreview] = useState<Item | null>(null);

  useEffect(() => {
    const processingIds = liveItems.filter((i) => i.status === "Processing").map((i) => i.id);
    if (processingIds.length === 0) return;

    const interval = setInterval(async () => {
      const updates = await Promise.all(
        processingIds.map(async (id) => {
          try {
            const res = await fetch(`/api/generate/status?id=${id}`);
            if (!res.ok) return null;
            const data = await res.json();
            return { id, ...data };
          } catch {
            return null;
          }
        })
      );

      setLiveItems((prev) => {
        let changed = false;
        const next = prev.map((item) => {
          const update = updates.find((u) => u?.id === item.id);
          if (!update) return item;
          if (update.status === "Complete" && item.status !== "Complete") {
            changed = true;
            const finalUrl = update.finalUrl ?? item.finalUrl;
            const isVideo = item.type === "UGC Ad" || item.type === "Product Ad";
            return { ...item, status: "Complete" as Status, finalUrl, thumbnailUrl: isVideo ? item.thumbnailUrl : (finalUrl ?? item.thumbnailUrl) };
          }
          if (update.status === "Failed") {
            changed = true;
            return { ...item, status: "Failed" as Status };
          }
          return item;
        });
        return changed ? next.filter((i) => i.status !== "Failed") : prev;
      });
    }, 5000);

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveItems.map((i) => i.id + i.status).join(",")]);

  const total = items.length;
  const complete = items.filter((g) => g.status === "Complete").length;
  const processing = items.filter((g) => g.status === "Processing").length;

  const filtered = items
    .filter((i) => tab === "all" || i.type === tabMap[tab])
    .filter((i) => !search || i.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sort === "oldest" ? 0 : 0); // server already sorted newest; just reverse if oldest

  return (
    <div className="space-y-5 pb-8">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-[#111111]" style={{ letterSpacing: "-0.02em" }}>History</h1>
          <p className="text-[13px] text-[#6B7280] mt-0.5">View and manage all your generated content.</p>
        </div>
        {/* Search */}
        <div className="flex items-center gap-2.5 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 w-[220px] flex-shrink-0"
          style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <FontAwesomeIcon icon={faMagnifyingGlass} style={{ fontSize: 12, color: "#9CA3AF" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ads..."
            className="flex-1 bg-transparent text-[13px] text-[#111111] outline-none placeholder-[#9CA3AF]"
          />
        </div>
      </div>

      {/* Stats row + sort */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-5">
          <span className="text-[13px]">
            <span className="font-bold text-[#111111]">{total}</span>
            <span className="text-[#6B7280] ml-1.5">Total</span>
          </span>
          <span className="text-[13px]">
            <span className="font-bold" style={{ color: "#2563EB" }}>{complete}</span>
            <span className="text-[#6B7280] ml-1.5">Complete</span>
          </span>
          <span className="text-[13px]">
            <span className="font-bold" style={{ color: "#D97706" }}>{processing}</span>
            <span className="text-[#6B7280] ml-1.5">Processing</span>
          </span>
        </div>
        {/* Sort */}
        <div className="relative">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as "newest" | "oldest")}
            className="appearance-none flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white pl-3 pr-8 py-2 text-[13px] font-medium text-[#374151] outline-none cursor-pointer hover:bg-[#F9FAFB] transition"
            style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
          <FontAwesomeIcon icon={faChevronDown} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" style={{ fontSize: 10 }} />
        </div>
      </div>


      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[#E5E7EB] bg-white p-12 text-center">
          <div className="size-14 mx-auto rounded-2xl bg-[#EFF6FF] flex items-center justify-center mb-3">
            <FontAwesomeIcon icon={total === 0 ? faWandMagicSparkles : faFilm} className="text-[#2563EB]" style={{ fontSize: 24 }} />
          </div>
          <p className="text-sm font-semibold text-[#111111]">
            {total === 0 ? "No generations yet" : "Nothing in this category"}
          </p>
          <p className="text-xs text-[#6B7280] mt-1 mb-4">
            {total === 0 ? "Create your first ad to see it here" : "Try a different filter"}
          </p>
          {total === 0 && (
            <Link href="/create/ugc-studio"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#2563EB] text-white px-4 h-9 text-xs font-semibold hover:brightness-110 transition-all">
              <FontAwesomeIcon icon={faWandMagicSparkles} style={{ fontSize: 12 }} /> Create your first ad
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((g) => {
            const isVideo = g.type === "UGC Ad" || g.type === "Product Ad";
            const canPreview = g.status === "Complete" && Boolean(g.finalUrl);
            const thumbnail = g.thumbnailUrl || g.characterImage;

            return (
              <article key={g.id}
                onClick={() => canPreview && setPreview(g)}
                className={cn(
                  "group rounded-2xl border border-[#E5E7EB] bg-white overflow-hidden transition-all",
                  canPreview ? "cursor-pointer hover:shadow-lg hover:shadow-black/8 hover:-translate-y-0.5" : "cursor-default"
                )}
                style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>

                {/* Thumbnail */}
                <div className="relative aspect-[4/3] bg-[#F3F4F6] overflow-hidden">
                  {thumbnail ? (
                    <Image src={thumbnail} alt={g.title} fill
                      className="object-cover object-top transition-transform duration-300 group-hover:scale-105"
                      sizes="360px" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FontAwesomeIcon icon={faFilm} style={{ fontSize: 32, color: "#D1D5DB" }} />
                    </div>
                  )}

                  {/* Processing overlay */}
                  {g.status === "Processing" && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3"
                      style={{ background: "rgba(0,0,0,0.45)" }}>
                      <FontAwesomeIcon icon={faWandMagicSparkles} style={{ fontSize: 28, color: "white" }} />
                      <p className="text-white text-[13px] font-semibold">Rendering your video...</p>
                      <div className="w-[55%] h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.25)" }}>
                        <div className="h-full rounded-full" style={{ background: "#F59E0B", animation: "progress-sweep 90s linear forwards" }} />
                      </div>
                    </div>
                  )}

                  {/* Status badge top-left */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold backdrop-blur-sm"
                    style={statusBadgeStyle(g.status)}>
                    <FontAwesomeIcon
                      icon={g.status === "Complete" ? faCheck : g.status === "Processing" ? faSpinner : faXmark}
                      className={g.status === "Processing" ? "animate-spin" : ""}
                      style={{ fontSize: 9 }} />
                    {g.status}
                  </div>

                  {/* Play / image button top-right */}
                  <div className="absolute top-2.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-full"
                    style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}>
                    <FontAwesomeIcon icon={isVideo ? faPlay : faExpand}
                      style={{ fontSize: isVideo ? 11 : 10, color: "white", marginLeft: isVideo ? 2 : 0 }} />
                  </div>

                  {/* Download on hover */}
                  {g.finalUrl && (
                    <button type="button"
                      onClick={(e) => { e.stopPropagation(); downloadAsset(g.finalUrl!, g.type, g.id); }}
                      className="absolute bottom-2.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}>
                      <FontAwesomeIcon icon={faDownload} style={{ fontSize: 11, color: "white" }} />
                    </button>
                  )}
                </div>

                {/* Card footer */}
                <div className="px-4 py-3">
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <p className="text-[13px] font-bold text-[#111111] truncate flex-1">{g.title}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full" style={typeTagStyle(g.type)}>
                      {typeDisplayLabel(g.type)}
                    </span>
                    <span className="text-[11px] text-[#9CA3AF]">{g.date}</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {preview && preview.finalUrl && (
        <PreviewModal item={preview} onClose={() => setPreview(null)} />
      )}
    </div>
  );
}

function PreviewModal({ item, onClose }: { item: Item; onClose: () => void }) {
  const isVideo = item.type === "UGC Ad" || item.type === "Product Ad";
  return createPortal(
    <div onClick={onClose} className="flex items-center justify-center bg-black/90 p-4"
      style={{ position: "fixed", inset: 0, zIndex: 2147483647 }}>
      <div onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-2xl">
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#E5E7EB]">
          <div>
            <p className="text-sm font-semibold text-[#111111]">{item.title}</p>
            <p className="text-[11px] text-[#6B7280]">{typeDisplayLabel(item.type)} · {item.date}</p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => downloadAsset(item.finalUrl!, item.type, item.id)}
              className="inline-flex items-center gap-2 rounded-lg bg-[#2563EB] text-white px-3 h-9 text-xs font-bold hover:brightness-105 transition">
              <FontAwesomeIcon icon={faDownload} style={{ fontSize: 12 }} /> Download
            </button>
            <button type="button" onClick={onClose}
              className="flex size-9 items-center justify-center rounded-lg text-[#6B7280] hover:bg-[#F3F4F6] transition">
              <FontAwesomeIcon icon={faXmark} style={{ fontSize: 14 }} />
            </button>
          </div>
        </div>
        <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-black">
          {isVideo ? (
            <CustomVideoPlayer src={item.finalUrl!} poster={item.thumbnailUrl || item.characterImage || undefined} />
          ) : (
            <ImagePreview src={item.finalUrl!} alt={item.title} />
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

function ImagePreview({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="relative flex min-h-[280px] w-full items-center justify-center">
      {!loaded && <LoadingOverlay label="Loading image" />}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} decoding="async" onLoad={() => setLoaded(true)}
        className={cn("max-h-[80vh] max-w-full object-contain transition-opacity duration-200", loaded ? "opacity-100" : "opacity-0")} />
    </div>
  );
}

function CustomVideoPlayer({ src, poster }: { src: string; poster?: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onFSChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFSChange);
    return () => document.removeEventListener("fullscreenchange", onFSChange);
  }, []);

  useEffect(() => { setIsReady(false); setIsPlaying(false); setCurrentTime(0); }, [src]);

  const togglePlay = async () => {
    const v = videoRef.current; if (!v) return;
    v.paused ? await v.play().catch(() => undefined) : v.pause();
  };
  const toggleMute = () => {
    const v = videoRef.current; if (!v) return;
    v.muted = !v.muted; setIsMuted(v.muted);
  };
  const seek = (val: string) => {
    const v = videoRef.current; if (!v) return;
    v.currentTime = Number(val); setCurrentTime(Number(val));
  };
  const toggleFullscreen = async () => {
    if (!shellRef.current) return;
    document.fullscreenElement
      ? await document.exitFullscreen().catch(() => undefined)
      : await shellRef.current.requestFullscreen().catch(() => undefined);
  };

  return (
    <div ref={shellRef} className="relative flex max-h-[80vh] w-full items-center justify-center bg-black">
      {!isReady && <LoadingOverlay label="Loading video" />}
      <video ref={videoRef} src={src} poster={poster} autoPlay playsInline preload="metadata"
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
        onCanPlay={() => setIsReady(true)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onWaiting={() => setIsReady(false)}
        onPlaying={() => setIsReady(true)}
        onClick={togglePlay}
        className={cn("max-h-[80vh] max-w-full cursor-pointer object-contain transition-opacity duration-200", isReady ? "opacity-100" : "opacity-0")}
      />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent px-4 pb-4 pt-10">
        <input type="range" min={0} max={Number.isFinite(duration) && duration > 0 ? duration : 0}
          step={0.01} value={currentTime} onChange={(e) => seek(e.target.value)}
          className="h-1 w-full accent-[#2563EB]" aria-label="Seek video" />
        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <IconButton onClick={togglePlay} label={isPlaying ? "Pause" : "Play"}>
              <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} style={{ fontSize: 13 }} />
            </IconButton>
            <span className="min-w-[76px] text-xs font-medium text-white/80">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <IconButton onClick={toggleMute} label={isMuted ? "Unmute" : "Mute"}>
              <FontAwesomeIcon icon={isMuted ? faVolumeXmark : faVolumeHigh} style={{ fontSize: 13 }} />
            </IconButton>
            <IconButton onClick={toggleFullscreen} label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}>
              <FontAwesomeIcon icon={isFullscreen ? faCompress : faExpand} style={{ fontSize: 13 }} />
            </IconButton>
          </div>
        </div>
      </div>
    </div>
  );
}

function IconButton({ children, label, onClick }: { children: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} title={label}
      className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20">
      {children}
    </button>
  );
}

function LoadingOverlay({ label }: { label: string }) {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black">
      <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-white/70">
        <FontAwesomeIcon icon={faSpinner} className="animate-spin text-[#2563EB]" style={{ fontSize: 12 }} />
        {label}
      </div>
    </div>
  );
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${String(secs).padStart(2, "0")}`;
}
