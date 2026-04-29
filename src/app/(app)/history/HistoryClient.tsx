"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFilm,
  faDownload,
  faPlay,
  faCheck,
  faSpinner,
  faXmark,
  faWandMagicSparkles,
} from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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
  { value: "ugc", label: "UGC" },
  { value: "product", label: "Product" },
  { value: "mockup", label: "Product Photoshoot" },
  { value: "tryon", label: "Try-On" },
] as const;

const tabMap: Record<string, AdType> = {
  ugc: "UGC Ad",
  product: "Product Ad",
  mockup: "Product Photoshoot",
  tryon: "AI Try-On",
};

function statusIcon(s: Status) {
  return s === "Complete" ? faCheck : s === "Processing" ? faSpinner : faXmark;
}
function statusStyle(s: Status) {
  return s === "Complete"
    ? "text-primary bg-black/60 ring-1 ring-primary/30"
    : s === "Processing"
    ? "text-amber bg-black/60 ring-1 ring-amber/30"
    : "text-destructive bg-black/60 ring-1 ring-destructive/30";
}
function typeStyle(t: AdType) {
  if (t === "UGC Ad") return "text-primary";
  if (t === "Product Ad") return "text-violet";
  if (t === "AI Try-On") return "text-emerald-400";
  return "text-amber";
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" as const } },
};

type StatCardProps = {
  icon: IconDefinition;
  label: string;
  value: number;
  iconClass: string;
  badgeClass: string;
  valueClass?: string;
};

function StatCard({ icon, label, value, iconClass, badgeClass, valueClass }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className={cn("flex size-7 items-center justify-center rounded-lg", badgeClass)}>
          <FontAwesomeIcon icon={icon} className={iconClass} style={{ fontSize: 14 }} />
        </div>
        <span className="text-[11px] text-white/60">{label}</span>
      </div>
      <p className={cn("text-2xl font-bold", valueClass ?? "text-white")}>{value}</p>
    </div>
  );
}

function downloadAsset(url: string, type: string, id: string) {
  const isImage = type === "Product Photoshoot" || type === "AI Try-On";
  const ext = isImage ? "jpg" : "mp4";
  const filename = `${type.toLowerCase().replace(/\s+/g, "-")}-${id.slice(-6)}.${ext}`;
  // Route through our /api/download proxy so Content-Disposition forces save.
  const proxied = `/api/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`;
  const a = document.createElement("a");
  a.href = proxied;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export default function HistoryClient({ items: rawItems }: { items: Item[] }) {
  const items = rawItems.filter((i) => i.status !== "Failed");
  const [tab, setTab] = useState("all");
  const [preview, setPreview] = useState<Item | null>(null);
  const filtered = tab === "all" ? items : items.filter((i) => i.type === tabMap[tab]);

  // Stats
  const total = items.length;
  const complete = items.filter((g) => g.status === "Complete").length;
  const processing = items.filter((g) => g.status === "Processing").length;


  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5 pb-8">
      {/* Stats row */}
      <motion.div variants={fadeUp} className="grid gap-3 grid-cols-1 sm:grid-cols-3">
        <StatCard
          icon={faFilm}
          label="Total"
          value={total}
          iconClass="text-white/60"
          badgeClass="bg-white/10"
        />
        <StatCard
          icon={faCheck}
          label="Complete"
          value={complete}
          iconClass="text-primary"
          badgeClass="bg-primary/10"
          valueClass="text-primary"
        />
        <StatCard
          icon={faSpinner}
          label="Processing"
          value={processing}
          iconClass="text-amber"
          badgeClass="bg-amber/10"
          valueClass="text-amber"
        />
      </motion.div>

      {/* Filter tabs */}
      <motion.div variants={fadeUp} className="flex gap-1.5 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-[11px] font-medium transition-all flex items-center gap-1.5",
              tab === t.value
                ? "bg-foreground text-background"
                : "border border-white/10 bg-white/5 text-white/60 hover:text-white"
            )}
          >
            {t.label}
          </button>
        ))}
      </motion.div>

      {/* Grid or empty */}
      <motion.div variants={fadeUp}>
        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.03] p-12 text-center">
            <div className="size-14 mx-auto rounded-2xl bg-primary/10 ring-1 ring-primary/20 shadow-[0_0_40px_rgba(57,255,20,0.15)] flex items-center justify-center mb-3">
              <FontAwesomeIcon
                icon={total === 0 ? faWandMagicSparkles : faFilm}
                className="text-primary"
                style={{ fontSize: 24 }}
              />
            </div>
            <p className="text-sm font-semibold text-white">
              {total === 0 ? "No generations yet" : "Nothing in this category"}
            </p>
            <p className="text-xs text-white/60 mt-1 mb-4">
              {total === 0 ? "Create your first ad to see it here" : "Try a different filter"}
            </p>
            {total === 0 && (
              <Link
                href="/create/ugc"
                className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary via-violet to-amber text-background px-4 h-9 text-xs font-semibold hover:brightness-110 transition-all"
              >
                <FontAwesomeIcon icon={faWandMagicSparkles} style={{ fontSize: 12 }} /> Create your first ad
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => g.status === "Complete" && g.finalUrl && setPreview(g)}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all hover:border-white/20 hover:shadow-lg hover:shadow-black/30 text-left disabled:cursor-default"
                disabled={g.status !== "Complete" || !g.finalUrl}
              >
                <div className="relative aspect-[4/3] bg-white/[0.03] overflow-hidden">
                  {g.characterImage || g.thumbnailUrl ? (
                    <Image
                      src={(g.thumbnailUrl || g.characterImage)!}
                      alt={g.title}
                      fill
                      className="object-cover object-top transition-transform duration-300 group-hover:scale-105"
                      sizes="300px"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center">
                      <FontAwesomeIcon icon={faFilm} className="text-white/20" style={{ fontSize: 32 }} />
                    </div>
                  )}
                  {g.finalUrl && g.status === "Complete" && g.type !== "Product Photoshoot" && g.type !== "AI Try-On" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex size-10 items-center justify-center rounded-full bg-white/90 shadow-lg">
                        <FontAwesomeIcon icon={faPlay} className="text-black ml-0.5" style={{ fontSize: 16 }} />
                      </div>
                    </div>
                  )}
                  <div
                    className={cn(
                      "absolute top-2.5 left-2.5 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium backdrop-blur-sm",
                      statusStyle(g.status)
                    )}
                  >
                    <FontAwesomeIcon
                      icon={statusIcon(g.status)}
                      className={g.status === "Processing" ? "animate-spin" : ""}
                      style={{ fontSize: 10 }}
                    />
                    {g.status}
                  </div>
                  {g.finalUrl && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        downloadAsset(g.finalUrl!, g.type, g.id);
                      }}
                      className="absolute top-2.5 right-2.5 flex size-7 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
                    >
                      <FontAwesomeIcon icon={faDownload} style={{ fontSize: 12 }} />
                    </button>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-[13px] font-semibold text-white truncate">{g.title}</p>
                  <div className="mt-1.5 flex items-center justify-between">
                    <span className={cn("text-[11px] font-medium", typeStyle(g.type))}>{g.type}</span>
                    <span className="text-[11px] text-white/50">{g.date}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </motion.div>

      {preview && preview.finalUrl && (
        <PreviewModal item={preview} onClose={() => setPreview(null)} />
      )}
    </motion.div>
  );
}

function PreviewModal({ item, onClose }: { item: Item; onClose: () => void }) {
  const isVideo = item.type === "UGC Ad" || item.type === "Product Ad";
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-3xl border border-white/10 bg-[#0c0c10] overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
          <div>
            <p className="text-sm font-semibold text-white">{item.title}</p>
            <p className="text-[11px] text-white/50">{item.type} · {item.date}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => downloadAsset(item.finalUrl!, item.type, item.id)}
              className="inline-flex items-center gap-2 rounded-lg bg-primary text-black px-3 h-9 text-xs font-bold hover:brightness-105 transition"
            >
              <FontAwesomeIcon icon={faDownload} style={{ fontSize: 12 }} />
              Download
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex size-9 items-center justify-center rounded-lg text-white/60 hover:text-foreground hover:bg-white/5 transition"
            >
              <FontAwesomeIcon icon={faXmark} style={{ fontSize: 14 }} />
            </button>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center bg-black overflow-hidden">
          {isVideo ? (
            <video src={item.finalUrl!} controls autoPlay className="max-h-[80vh] max-w-full" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.finalUrl!} alt={item.title} className="max-h-[80vh] max-w-full object-contain" />
          )}
        </div>
      </div>
    </div>
  );
}
