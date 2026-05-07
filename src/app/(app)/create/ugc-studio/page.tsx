"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWandMagicSparkles,
  faDownload,
  faArrowsRotate,
  faCircleNotch,
  faXmark,
  faCheck,
  faPlus,
  faMagnifyingGlass,
  faPaperclip,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import { useAvatars, type LibraryItem, type LibraryCategory } from "@/lib/hooks/use-library";
import { addActiveGeneration } from "@/lib/active-generations";

type VideoModel = "kling-3.0/video" | "kling-2.6/image-to-video";
type AspectRatio = "9:16" | "1:1" | "16:9";
type Duration = "5" | "10" | "15";

const VIDEO_MODELS: { id: VideoModel; name: string; logo: string }[] = [
  { id: "kling-3.0/video", name: "Kling 3.0", logo: "/models/kling-3.jpg" },
  { id: "kling-2.6/image-to-video", name: "Kling 2.6", logo: "/models/kling-3.jpg" },
];

const HERO_VIDEOS = ["/videos/hero-1-h264.mp4", "/videos/hero-2-h264.mp4", "/videos/hero-3-h264.mp4"];

function downloadAsset(url: string, id: string) {
  const a = document.createElement("a");
  a.href = `/api/download?url=${encodeURIComponent(url)}&filename=video-ad-${id.slice(-6)}.mp4`;
  a.download = `video-ad-${id.slice(-6)}.mp4`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// ── Avatar Modal ──────────────────────────────────────────────────

function AvatarModal({
  open, onClose, selected, onSelect, items, categories, onCustomUpload,
}: {
  open: boolean;
  onClose: () => void;
  selected: string | null;
  onSelect: (id: string) => void;
  items: LibraryItem[];
  categories: LibraryCategory[];
  onCustomUpload: (av: { id: string; name: string; imageUrl: string; categoryId: null }) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");

  const filtered = items.filter((item) =>
    (catFilter === "all" || item.categoryId === catFilter) &&
    (!search || item.name.toLowerCase().includes(search.toLowerCase()))
  );

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload/avatar", { method: "POST", body: fd });
      const data = await res.json() as { id: string; imageUrl: string };
      if (res.ok) {
        onCustomUpload({ id: data.id, name: "My Avatar", imageUrl: data.imageUrl, categoryId: null });
        onSelect(data.id);
        onClose();
      }
    } finally { setUploading(false); }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 lg:pl-[268px]">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 flex w-full max-w-[880px] h-[600px] rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "#FFFFFF", border: "1px solid #E5E7EB" }}>

        {/* Sidebar */}
        <div className="w-[185px] shrink-0 flex flex-col p-5 gap-0.5" style={{ borderRight: "1px solid #E5E7EB" }}>
          <p className="text-[14px] font-semibold text-[#111111] mb-5">Select Avatar</p>
          {[{ id: "all", label: "All" }, { id: "my", label: "My avatars" }].map((item) => (
            <button key={item.id} onClick={() => setCatFilter(item.id)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-left transition-colors"
              style={{ color: catFilter === item.id ? "#2563EB" : "#6B7280", background: catFilter === item.id ? "rgba(37,99,235,0.1)" : "transparent" }}>
              {item.label}
            </button>
          ))}
          {categories.length > 0 && (
            <>
              <div className="my-3 h-px bg-[#E5E7EB]" />
              {categories.map((c) => (
                <button key={c.id} onClick={() => setCatFilter(c.id)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-left transition-colors"
                  style={{ color: catFilter === c.id ? "#2563EB" : "#6B7280", background: catFilter === c.id ? "rgba(37,99,235,0.1)" : "transparent" }}>
                  {c.name}
                </button>
              ))}
            </>
          )}
        </div>

        {/* Grid */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-[#E5E7EB]">
            <div className="flex-1 flex items-center gap-2.5 h-9 rounded-xl px-3 bg-[#F3F4F6] border border-[#E5E7EB]">
              <FontAwesomeIcon icon={faMagnifyingGlass} style={{ fontSize: 12, color: "#6B7280" }} />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..."
                className="flex-1 bg-transparent text-[13px] text-[#111111] outline-none" />
            </div>
            <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E5E7EB] text-[#6B7280] transition hover:bg-[#F3F4F6]">
              <FontAwesomeIcon icon={faXmark} style={{ fontSize: 14 }} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-5">
            <div className="grid grid-cols-5 gap-3">
              <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                className="relative aspect-[3/4] rounded-xl flex flex-col items-center justify-center gap-2.5 transition"
                style={{ border: "2px dashed #D1D5DB", background: "rgba(37,99,235,0.04)" }}>
                {uploading
                  ? <FontAwesomeIcon icon={faCircleNotch} className="animate-spin" style={{ fontSize: 18, color: "#2563EB" }} />
                  : <>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "rgba(37,99,235,0.15)" }}>
                      <FontAwesomeIcon icon={faPlus} style={{ fontSize: 15, color: "#2563EB" }} />
                    </div>
                    <span className="text-[10px] font-medium text-[#6B7280]">Create avatar</span>
                  </>}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
              {filtered.map((c) => (
                <button key={c.id} type="button" onClick={() => { onSelect(c.id); onClose(); }}
                  className="relative aspect-[3/4] rounded-xl overflow-hidden transition-all"
                  style={{ border: selected === c.id ? "2px solid #2563EB" : "2px solid transparent" }}>
                  <Image src={c.imageUrl} alt={c.name} fill className="object-cover object-top" sizes="140px" />
                  <div className="absolute inset-x-0 bottom-0 pb-2 pt-8 px-2"
                    style={{ background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)" }}>
                    <p className="text-[11px] font-semibold text-white truncate">{c.name}</p>
                  </div>
                  {selected === c.id && (
                    <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#2563EB]">
                      <FontAwesomeIcon icon={faCheck} style={{ fontSize: 8, color: "#fff" }} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Dropdown pill ─────────────────────────────────────────────────

function DropdownPill<T extends string>({
  icon, label, value, options, onChange, disabled,
}: {
  icon: React.ReactNode;
  label: string;
  value: T;
  options: { value: T; label: string; locked?: boolean }[];
  onChange: (v: T) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => !disabled && setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2.5 text-[13px] font-medium text-[#374151] transition hover:bg-[#F9FAFB] hover:border-[#D1D5DB]"
        style={{ cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1 }}
      >
        {icon}
        <span className="text-[#9CA3AF] text-[11px] font-medium">{label}</span>
        <span className="font-semibold">{options.find(o => o.value === value)?.label ?? value}</span>
        <FontAwesomeIcon icon={faChevronDown} style={{ fontSize: 10, color: "#9CA3AF", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
      </button>
      {open && (
        <div className="absolute bottom-full left-0 mb-1.5 rounded-xl overflow-hidden shadow-xl z-20 min-w-[140px]"
          style={{ background: "#FFFFFF", border: "1px solid #E5E7EB" }}>
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              disabled={opt.locked}
              onClick={() => { if (!opt.locked) { onChange(opt.value); setOpen(false); } }}
              className="w-full flex items-center justify-between gap-3 px-3.5 h-10 text-[13px] transition hover:bg-[#F3F4F6]"
              style={{ color: opt.locked ? "#D1D5DB" : value === opt.value ? "#2563EB" : "#374151", cursor: opt.locked ? "not-allowed" : "pointer" }}
            >
              <span>{opt.label}</span>
              {value === opt.value && !opt.locked && <FontAwesomeIcon icon={faCheck} style={{ fontSize: 10 }} />}
              {opt.locked && <span className="text-[10px] text-[#D1D5DB]">N/A</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────

export default function UGCStudio() {
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [heroIdx, setHeroIdx] = useState(0);
  const heroRefs = useRef<(HTMLVideoElement | null)[]>([null, null, null]);

  useEffect(() => {
    heroRefs.current.forEach((v, i) => {
      if (!v) return;
      v.muted = true;
      if (i === heroIdx) { v.currentTime = 0; v.play().catch(() => {}); }
      else { v.pause(); v.currentTime = 0; }
    });
  }, [heroIdx]);

  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const [customAvatar, setCustomAvatar] = useState<{ id: string; name: string; imageUrl: string; categoryId: null } | null>(null);

  // Uploaded images (max 2)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadedPreviews, setUploadedPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [prompt, setPrompt] = useState("");
  const [videoModel, setVideoModel] = useState<VideoModel>("kling-3.0/video");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("9:16");
  const [duration, setDuration] = useState<Duration>("5");

  const [isGenerating, setIsGenerating] = useState(false);
  const [isWritingScript, setIsWritingScript] = useState(false);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [finalVideoUrl, setFinalVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { items: dbCharacters, categories } = useAvatars();
  const characters = customAvatar ? [customAvatar, ...dbCharacters] : dbCharacters;
  const selectedChar = characters.find((c) => c.id === selectedCharacter);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stopPolling = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  }, []);
  useEffect(() => () => stopPolling(), [stopPolling]);

  function addImages(files: FileList | File[]) {
    const arr = Array.from(files).filter(f => f.type.startsWith("image/"));
    const remaining = 2 - uploadedFiles.length;
    const toAdd = arr.slice(0, remaining);
    if (toAdd.length === 0) return;
    setUploadedFiles(prev => [...prev, ...toAdd]);
    setUploadedPreviews(prev => [...prev, ...toAdd.map(f => URL.createObjectURL(f))]);
  }

  function removeImage(idx: number) {
    URL.revokeObjectURL(uploadedPreviews[idx]);
    setUploadedFiles(prev => prev.filter((_, i) => i !== idx));
    setUploadedPreviews(prev => prev.filter((_, i) => i !== idx));
  }

  function startPolling(id: string) {
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/generate/status?id=${id}`);
        const data = await res.json() as { status: string; finalUrl?: string; errorMessage?: string };
        if (data.status === "Complete") { stopPolling(); setFinalVideoUrl(data.finalUrl!); setIsGenerating(false); }
        else if (data.status === "Failed") { stopPolling(); setError(data.errorMessage || "Generation failed."); setIsGenerating(false); }
      } catch {}
    }, 5000);
  }

  async function handleGenerate() {
    if (isGenerating || !prompt.trim()) return;
    setError(null); setFinalVideoUrl(null); setIsGenerating(true);
    try {
      const fd = new FormData();
      fd.append("prompt", prompt.trim());
      fd.append("videoModel", videoModel);
      fd.append("aspectRatio", aspectRatio === "9:16" ? "NINE_SIXTEEN" : aspectRatio === "16:9" ? "SIXTEEN_NINE" : "ONE_ONE");
      fd.append("duration", duration);
      if (selectedCharacter && !customAvatar) fd.append("characterId", selectedCharacter);
      if (uploadedFiles[0]) fd.append("image1", uploadedFiles[0]);
      if (uploadedFiles[1]) fd.append("image2", uploadedFiles[1]);
      // If selected char is custom avatar (uploaded via modal), include as image
      if (selectedChar && customAvatar && selectedCharacter === customAvatar.id) {
        if (!uploadedFiles[0]) fd.append("image1", await urlToFile(customAvatar.imageUrl, "avatar.jpg"));
      }

      const res = await fetch("/api/generate/studio", { method: "POST", body: fd });
      const data = await res.json() as { id?: string; error?: string };
      if (!res.ok || !data.id) { setError(data.error || "Failed"); setIsGenerating(false); return; }
      setGenerationId(data.id);
      addActiveGeneration({ id: data.id, type: "Video Ad", status: "GENERATING_VIDEO" });
      startPolling(data.id);
    } catch { setError("Network error. Please try again."); setIsGenerating(false); }
  }

  async function handleWriteScript() {
    if (!prompt.trim() || isWritingScript) return;
    setIsWritingScript(true);
    try {
      const res = await fetch("/api/ai-assist/script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ existingScript: prompt.trim() }),
      });
      const data = await res.json() as { script?: string; error?: string };
      if (res.ok && data.script) setPrompt(data.script);
      else setError(data.error || "Script generation failed");
    } catch { setError("Network error"); } finally { setIsWritingScript(false); }
  }

  const canGenerate = prompt.trim().length > 0 && !isGenerating;
  const creditCost = duration === "15" ? 25 : duration === "10" ? 20 : 15;

  return (
    <div className="flex flex-col" style={{ minHeight: "calc(100vh - 4rem)" }}>
      <div className="flex flex-col flex-1 px-4 sm:px-6 lg:px-8 pt-6 pb-10">

        {/* ── Generating shimmer ───────────────────── */}
        {isGenerating && !finalVideoUrl && (() => {
          const skeletonW = aspectRatio === "9:16" ? 220 : aspectRatio === "16:9" ? 440 : 300;
          const skeletonH = aspectRatio === "9:16" ? 390 : aspectRatio === "16:9" ? 247 : 300;
          return (
            <div className="flex flex-col items-center justify-center flex-1 gap-8 py-10">
              <div className="flex flex-col items-center gap-2 text-center">
                <p className="text-[24px] font-bold text-[#111111]" style={{ letterSpacing: "-0.02em" }}>Generating your video</p>
                <p className="text-[13px] text-[#6B7280]">Usually takes 2 to 4 minutes — you can start another</p>
              </div>
              <div className="relative overflow-hidden rounded-2xl shimmer-sweep"
                style={{ width: skeletonW, height: skeletonH, background: "#F3F4F6", border: "1px solid #E5E7EB" }} />
              <div className="relative h-[3px] rounded-full overflow-hidden" style={{ width: skeletonW, background: "#E5E7EB" }}>
                <div className="absolute inset-y-0 left-0 rounded-full animate-pulse"
                  style={{ width: "40%", background: "linear-gradient(90deg, #2563EB, #06B6D4)" }} />
              </div>
              <button onClick={() => { stopPolling(); setIsGenerating(false); setGenerationId(null); }}
                className="text-[12px] text-[#9CA3AF] transition hover:text-[#6B7280]">Cancel</button>
            </div>
          );
        })()}

        {/* ── Result view ─────────────────────────── */}
        {finalVideoUrl && (
          <div className="flex flex-col items-center justify-center flex-1 gap-6">
            <video src={finalVideoUrl} controls autoPlay className="rounded-2xl"
              style={{ maxHeight: 420, aspectRatio: aspectRatio.replace(":", "/") }} />
            <div className="flex gap-3">
              <button onClick={() => downloadAsset(finalVideoUrl, generationId!)}
                className="inline-flex items-center gap-2 h-10 px-5 rounded-xl text-[13px] font-bold bg-[#2563EB] text-white transition hover:brightness-110">
                <FontAwesomeIcon icon={faDownload} style={{ fontSize: 12 }} /> Download
              </button>
              <button onClick={() => { setFinalVideoUrl(null); setGenerationId(null); setError(null); }}
                className="inline-flex items-center gap-2 h-10 px-5 rounded-xl text-[13px] font-semibold border border-[#E5E7EB] text-[#6B7280] transition hover:bg-[#F3F4F6]">
                <FontAwesomeIcon icon={faArrowsRotate} style={{ fontSize: 12 }} /> New
              </button>
            </div>
          </div>
        )}

        {/* ── Idle state ───────────────────────────── */}
        {!isGenerating && !finalVideoUrl && (
          <div className="flex flex-col items-center justify-center flex-1 gap-8">

            {/* Hero video deck */}
            <div className="relative flex items-center justify-center" style={{ width: 520, height: 320 }}>
              {HERO_VIDEOS.map((src, i) => {
                const offset = (i - heroIdx + 3) % 3;
                const isActive = offset === 0;
                const isRight = offset === 1;
                const tx = isActive ? "translateX(-50%)" : isRight ? "translateX(calc(-50% + 95px))" : "translateX(calc(-50% - 95px))";
                const rotate = isActive ? "rotate(0deg)" : isRight ? "rotate(6deg)" : "rotate(-6deg)";
                const scale = isActive ? "scale(1)" : "scale(0.8)";
                return (
                  <div key={i} className="absolute"
                    style={{
                      left: "50%", top: 0,
                      width: 155, height: 276,
                      borderRadius: 18,
                      overflow: "hidden",
                      transform: `${tx} ${rotate} ${scale}`,
                      transformOrigin: "bottom center",
                      zIndex: isActive ? 3 : isRight ? 2 : 1,
                      opacity: isActive ? 1 : 0.5,
                      boxShadow: isActive ? "0 16px 50px rgba(0,0,0,0.18)" : "0 8px 20px rgba(0,0,0,0.1)",
                      transition: "transform 0.45s cubic-bezier(0.4,0,0.2,1), opacity 0.45s ease",
                    }}>
                    <video
                      ref={el => { heroRefs.current[i] = el; if (el) { el.muted = true; el.playsInline = true; if (isActive) setTimeout(() => el.play().catch(() => {}), 60); } }}
                      src={src}
                      playsInline
                      onEnded={() => setHeroIdx(n => (n + 1) % 3)}
                      className="w-full h-full object-cover"
                    />
                  </div>
                );
              })}
            </div>

            {/* Headline */}
            <div className="text-center space-y-2">
              <h2 className="text-[36px] sm:text-[42px] font-bold text-[#111111]"
                style={{ letterSpacing: "-0.025em", lineHeight: 1.1 }}>
                Turn Any Character Into a{" "}
                <span style={{
                  background: "linear-gradient(135deg, #2563EB 0%, #818CF8 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}>Video Ad</span>
              </h2>
              <p className="text-[15px] text-[#6B7280]">
                Create studio-quality UGC videos in minutes. No camera. No crew. Just results.
              </p>
            </div>

            {/* ── Input card ───────────────────────── */}
            <div className="w-full" style={{ maxWidth: 760 }}>
              <div className="rounded-2xl border border-[#E5E7EB] bg-white overflow-hidden"
                style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>

                {/* Top bar — label + AI script button */}
                <div className="flex items-center justify-between px-5 pt-4 pb-1">
                  <p className="text-[13px] text-[#9CA3AF]">Describe what happens in the ad...</p>
                  <button
                    type="button"
                    onClick={handleWriteScript}
                    disabled={!prompt.trim() || isWritingScript}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-all"
                    style={{
                      background: prompt.trim() && !isWritingScript ? "rgba(37,99,235,0.08)" : "transparent",
                      color: prompt.trim() && !isWritingScript ? "#2563EB" : "#D1D5DB",
                      border: "1px solid",
                      borderColor: prompt.trim() && !isWritingScript ? "rgba(37,99,235,0.2)" : "#F3F4F6",
                      cursor: !prompt.trim() || isWritingScript ? "not-allowed" : "pointer",
                    }}
                  >
                    {isWritingScript
                      ? <FontAwesomeIcon icon={faCircleNotch} className="animate-spin" style={{ fontSize: 11 }} />
                      : <FontAwesomeIcon icon={faWandMagicSparkles} style={{ fontSize: 11 }} />}
                    Write with AI
                  </button>
                </div>

                {/* Textarea */}
                <div className="px-5 pb-3">
                  <textarea
                    value={prompt}
                    onChange={(e) => {
                      setPrompt(e.target.value);
                      const el = e.target;
                      el.style.height = "auto";
                      el.style.height = Math.min(el.scrollHeight, 160) + "px";
                    }}
                    placeholder={`Example:\nA skincare creator explaining why this moisturizer\nhelped her acne in 7 days.`}
                    className="w-full bg-transparent border-none outline-none text-[15px] leading-relaxed text-[#111111] placeholder-[#C4C9D4] resize-none"
                    style={{ minHeight: "80px", height: "80px", maxHeight: "160px", overflowY: "auto" }}
                    maxLength={2000}
                  />
                  <div className="text-right text-[11px] text-[#C4C9D4]">{prompt.length} / 2000</div>
                </div>

                {/* Uploaded image previews */}
                {uploadedPreviews.length > 0 && (
                  <div className="flex items-center gap-2 px-5 pb-3">
                    {uploadedPreviews.map((src, i) => (
                      <div key={i} className="relative w-14 h-14 rounded-xl overflow-hidden border border-[#E5E7EB]">
                        <img src={src} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-black/60 transition hover:bg-black/80"
                        >
                          <FontAwesomeIcon icon={faXmark} style={{ fontSize: 7, color: "white" }} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Bottom bar */}
                <div className="flex items-center gap-3 px-4 py-3 border-t border-[#F3F4F6]">

                  {/* Attach images */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => e.target.files && addImages(e.target.files)}
                  />
                  <button
                    type="button"
                    onClick={() => uploadedFiles.length < 2 && fileInputRef.current?.click()}
                    title={uploadedFiles.length >= 2 ? "Max 2 images" : "Attach images (max 2)"}
                    className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-[12px] font-medium transition-all"
                    style={{
                      color: uploadedFiles.length >= 2 ? "#D1D5DB" : "#6B7280",
                      background: "#F9FAFB",
                      border: "1px solid #E5E7EB",
                      cursor: uploadedFiles.length >= 2 ? "not-allowed" : "pointer",
                    }}
                  >
                    <FontAwesomeIcon icon={faPaperclip} style={{ fontSize: 12 }} />
                    {uploadedFiles.length > 0 ? `${uploadedFiles.length}/2` : "Add file"}
                  </button>

                  {/* Spacer */}
                  <div className="flex-1" />

                  {/* Avatar picker */}
                  <button
                    type="button"
                    onClick={() => setAvatarModalOpen(true)}
                    className="relative flex items-center gap-2 h-9 rounded-xl transition-all"
                    style={{ color: "#6B7280" }}
                    title={selectedChar ? `Avatar: ${selectedChar.name}` : "Choose avatar from library"}
                  >
                    {selectedChar ? (
                      <div className="relative">
                        <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-[#2563EB]">
                          <Image src={selectedChar.imageUrl} alt={selectedChar.name} width={36} height={36} className="object-cover object-top" />
                        </div>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setSelectedCharacter(null); }}
                          className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#6B7280]"
                        >
                          <FontAwesomeIcon icon={faXmark} style={{ fontSize: 7, color: "white" }} />
                        </button>
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded-full border border-dashed border-[#D1D5DB] flex items-center justify-center hover:border-[#2563EB] transition-colors">
                        <FontAwesomeIcon icon={faPlus} style={{ fontSize: 12, color: "#9CA3AF" }} />
                      </div>
                    )}
                    <span className="text-[12px] font-medium text-[#6B7280]">
                      {selectedChar ? "Change avatar" : "Add avatar"}
                    </span>
                  </button>

                  {/* Generate button */}
                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={!canGenerate}
                    className="flex items-center gap-2 h-9 px-5 rounded-xl text-[13px] font-bold transition-all"
                    style={{
                      background: canGenerate ? "#2563EB" : "#F3F4F6",
                      color: canGenerate ? "#FFFFFF" : "#9CA3AF",
                      cursor: canGenerate ? "pointer" : "not-allowed",
                    }}
                  >
                    {isGenerating
                      ? <FontAwesomeIcon icon={faCircleNotch} className="animate-spin" style={{ fontSize: 13 }} />
                      : <FontAwesomeIcon icon={faWandMagicSparkles} style={{ fontSize: 13 }} />}
                    Generate Ad
                    <span className="text-[11px] opacity-70 font-medium">·{creditCost}</span>
                  </button>
                </div>
              </div>

              {/* Settings row */}
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <DropdownPill
                  icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="3" width="12" height="18" rx="2"/></svg>}
                  label="Aspect Ratio"
                  value={aspectRatio}
                  options={[
                    { value: "9:16" as AspectRatio, label: "9:16" },
                    { value: "1:1" as AspectRatio, label: "1:1" },
                    { value: "16:9" as AspectRatio, label: "16:9" },
                  ]}
                  onChange={setAspectRatio}
                />
                <DropdownPill
                  icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6V12L16 14"/></svg>}
                  label="Duration"
                  value={duration}
                  options={[
                    { value: "5" as Duration, label: "5s" },
                    { value: "10" as Duration, label: "10s" },
                    { value: "15" as Duration, label: "15s", locked: videoModel === "kling-2.6/image-to-video" },
                  ]}
                  onChange={(v) => setDuration(v)}
                />
                <DropdownPill
                  icon={<img src={VIDEO_MODELS.find(m => m.id === videoModel)?.logo} alt="" className="w-4 h-4 rounded object-cover" />}
                  label="Model"
                  value={videoModel}
                  options={VIDEO_MODELS.map(m => ({ value: m.id, label: m.name }))}
                  onChange={(v) => { setVideoModel(v); if (v === "kling-2.6/image-to-video" && duration === "15") setDuration("10"); }}
                />
              </div>

              {/* Error */}
              {error && (
                <p className="mt-3 text-[12px] px-4 py-2.5 rounded-xl bg-red-50 text-red-600 border border-red-100">
                  {error}
                </p>
              )}
            </div>

            {/* Footer note */}
            <p className="text-[12px] text-[#C4C9D4] flex items-center gap-1.5">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              All content is AI-generated and royalty-free to use.
            </p>
          </div>
        )}
      </div>

      {/* Avatar modal */}
      <AvatarModal
        open={avatarModalOpen}
        onClose={() => setAvatarModalOpen(false)}
        selected={selectedCharacter}
        onSelect={setSelectedCharacter}
        items={characters}
        categories={categories}
        onCustomUpload={(av) => setCustomAvatar(av)}
      />
    </div>
  );
}

async function urlToFile(url: string, filename: string): Promise<File> {
  const res = await fetch(url);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type });
}
