"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faXmark, faCheck, faSpinner, faTriangleExclamation, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import {
  ACTIVE_GENERATIONS_EVENT,
  readActiveGenerations,
  removeActiveGeneration,
  updateActiveGeneration,
  type ActiveGeneration,
} from "@/lib/active-generations";

const LIVE_STATUSES = new Set([
  "PENDING", "GENERATING_AUDIO", "GENERATING_SCENE",
  "GENERATING_VIDEO", "SYNCING_LIPS", "GENERATING_TRYON",
]);

function statusLabel(status: string) {
  switch (status) {
    case "PENDING": return "Queued";
    case "GENERATING_AUDIO": return "Generating voiceover";
    case "GENERATING_SCENE": return "Compositing scene";
    case "GENERATING_VIDEO": return "Generating video";
    case "SYNCING_LIPS": return "Syncing lips";
    case "GENERATING_TRYON": return "Generating try-on";
    default: return "Generating";
  }
}

function downloadVideo(url: string, id: string) {
  const a = document.createElement("a");
  a.href = `/api/download?url=${encodeURIComponent(url)}&filename=video-${id.slice(-6)}.mp4`;
  a.download = `video-${id.slice(-6)}.mp4`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function VideoPreviewModal({ url, onClose }: { url: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative z-10 flex flex-col items-center gap-4" onClick={(e) => e.stopPropagation()}>
        <video src={url} controls autoPlay className="rounded-2xl max-h-[80vh] max-w-[90vw] shadow-2xl" />
        <button onClick={onClose}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-[#111111] text-sm font-semibold hover:bg-gray-100 transition">
          <FontAwesomeIcon icon={faXmark} style={{ fontSize: 12 }} /> Close
        </button>
      </div>
    </div>
  );
}

export default function GenerationsOrb() {
  const [items, setItems] = useState<ActiveGeneration[]>([]);
  const [open, setOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const sync = useCallback(() => setItems(readActiveGenerations()), []);

  useEffect(() => {
    sync();
    window.addEventListener(ACTIVE_GENERATIONS_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(ACTIVE_GENERATIONS_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [sync]);

  useEffect(() => {
    const active = items.filter((item) => LIVE_STATUSES.has(item.status));
    if (active.length === 0) return;
    let cancelled = false;
    const poll = async () => {
      await Promise.all(active.map(async (item) => {
        try {
          const res = await fetch(`/api/generations/${item.id}`);
          if (!res.ok || cancelled) return;
          const data = await res.json();
          updateActiveGeneration(item.id, { status: data.status, finalVideoUrl: data.finalVideoUrl, errorMessage: data.errorMessage });
        } catch {}
      }));
      if (!cancelled) sync();
    };
    poll();
    const interval = window.setInterval(poll, 3500);
    return () => { cancelled = true; window.clearInterval(interval); };
  }, [items, sync]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const [modalOpen, setModalOpen] = useState(false);
  useEffect(() => {
    const onOpen  = () => setModalOpen(true);
    const onClose = () => setModalOpen(false);
    window.addEventListener("app:modal-open",  onOpen);
    window.addEventListener("app:modal-close", onClose);
    return () => {
      window.removeEventListener("app:modal-open",  onOpen);
      window.removeEventListener("app:modal-close", onClose);
    };
  }, []);

  const liveCount = items.filter((i) => LIVE_STATUSES.has(i.status)).length;
  const isActive = liveCount > 0;
  const hasAny = items.length > 0;

  if (modalOpen) return null;

  return (
    <>
      {previewUrl && <VideoPreviewModal url={previewUrl} onClose={() => setPreviewUrl(null)} />}

      <div className="relative" ref={dropdownRef}>
        {/* Pill trigger */}
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 rounded-full px-3 py-1.5 transition-all hover:bg-[#F3F4F6] active:scale-[0.97]"
          style={{
            background: "#FFFFFF",
            border: "1.5px solid #E5E7EB",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          }}
        >
          {/* Status dot */}
          <span
            className="h-2 w-2 rounded-full flex-shrink-0"
            style={{
              background: isActive ? "#10B981" : "#D1D5DB",
              boxShadow: isActive ? "0 0 0 3px rgba(16,185,129,0.18)" : "none",
            }}
          />
          <span className="text-[13px] font-semibold text-[#374151]">{hasAny ? items.length : "0"}</span>
          <span className="hidden sm:inline text-[12px] text-[#9CA3AF]">
            {isActive ? "Generating" : hasAny ? "Jobs" : "No jobs"}
          </span>
          <FontAwesomeIcon
            icon={faChevronDown}
            style={{ fontSize: 10, color: "#9CA3AF", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}
          />
        </button>

        {/* Dropdown */}
        {open && (
          <div
            className="absolute right-0 top-full mt-2 w-[300px] rounded-2xl border border-[#E5E7EB] bg-white overflow-hidden z-50"
            style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.12)", maxHeight: 400 }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#F3F4F6]">
              <p className="text-[13px] font-semibold text-[#111111]">Generations</p>
              {items.some(i => !LIVE_STATUSES.has(i.status)) && (
                <button
                  onClick={() => items.filter(i => !LIVE_STATUSES.has(i.status)).forEach(i => removeActiveGeneration(i.id))}
                  className="text-[11px] text-[#9CA3AF] hover:text-[#6B7280] transition"
                >
                  Clear done
                </button>
              )}
            </div>

            {items.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-[13px] text-[#9CA3AF]">No generations yet</p>
              </div>
            ) : (
              <div className="overflow-y-auto" style={{ maxHeight: 340 }}>
                {items.map((item) => {
                  const isLive = LIVE_STATUSES.has(item.status);
                  const isDone = item.status === "COMPLETED";
                  const isFailed = item.status === "FAILED";
                  return (
                    <div key={item.id}
                      className="flex items-center gap-3 px-4 py-3 border-b border-[#F9FAFB] hover:bg-[#FAFAFA] transition-colors last:border-0">
                      {/* Thumbnail */}
                      <div
                        className="relative w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center"
                        onClick={() => isDone && item.finalVideoUrl && setPreviewUrl(item.finalVideoUrl)}
                        style={{ background: "#F3F4F6", cursor: isDone && item.finalVideoUrl ? "pointer" : "default" }}
                      >
                        {isDone && item.finalVideoUrl ? (
                          <>
                            <video src={item.finalVideoUrl} className="w-full h-full object-cover" muted playsInline />
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-xl">
                              <span className="text-white text-[9px] font-bold">PLAY</span>
                            </div>
                          </>
                        ) : item.thumbnailUrl ? (
                          <>
                            <img src={item.thumbnailUrl} alt="" className="w-full h-full object-cover object-top" />
                            {isLive && (
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-xl">
                                <FontAwesomeIcon icon={faSpinner} className="animate-spin" style={{ fontSize: 12, color: "white" }} />
                              </div>
                            )}
                          </>
                        ) : (
                          <FontAwesomeIcon
                            icon={isFailed ? faTriangleExclamation : isLive ? faSpinner : faCheck}
                            className={isLive ? "animate-spin" : ""}
                            style={{ fontSize: 14, color: isFailed ? "#EF4444" : isDone ? "#10B981" : "#2563EB" }}
                          />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-[#111111] truncate">{item.type}</p>
                        <p className="text-[11px] truncate"
                          style={{ color: isFailed ? "#EF4444" : isDone ? "#10B981" : "#6B7280" }}>
                          {isLive ? statusLabel(item.status) : isDone ? "Completed" : item.errorMessage || "Failed"}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {isDone && item.finalVideoUrl && (
                          <button onClick={() => downloadVideo(item.finalVideoUrl!, item.id)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-[#F3F4F6] transition" title="Download">
                            <FontAwesomeIcon icon={faDownload} style={{ fontSize: 11, color: "#6B7280" }} />
                          </button>
                        )}
                        {!isLive && (
                          <button onClick={() => removeActiveGeneration(item.id)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-[#F3F4F6] transition" title="Dismiss">
                            <FontAwesomeIcon icon={faXmark} style={{ fontSize: 11, color: "#9CA3AF" }} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
