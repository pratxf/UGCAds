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
import type { FalVideoModel } from "@/lib/fal-generation";

type AspectRatio = "9:16" | "16:9";
type Duration = "4" | "5" | "8" | "10" | "12" | "15" | "16" | "20";

type VideoModel = FalVideoModel & { allowedDurations?: Duration[] };

const VIDEO_MODELS: VideoModel[] = [
  { id: "bytedance/seedance-2.0/fast/image-to-video",    name: "Seedance 2", tag: "ByteDance · 720p", logo: "/models/seedance-2.webp", credits: 15, maxDuration: 15, allowedDurations: ["5", "10", "15"] },
  { id: "fal-ai/sora-2/image-to-video",                  name: "Sora 2",     tag: "OpenAI · 720p",    logo: "/models/sora-2.webp",     credits: 20, maxDuration: 20, allowedDurations: ["8", "12", "16"] },
  { id: "fal-ai/kling-video/v3/standard/image-to-video", name: "Kling 3.0",  tag: "Kling · Standard", logo: "/models/kling-3.webp",    credits: 15, maxDuration: 15, allowedDurations: ["5", "10", "15"] },
];

function getDurationOptions(model: VideoModel): { value: Duration; label: string }[] {
  const all: { value: Duration; label: string }[] = [
    { value: "4", label: "4s" },
    { value: "5", label: "5s" },
    { value: "8", label: "8s" },
    { value: "10", label: "10s" },
    { value: "12", label: "12s" },
    { value: "15", label: "15s" },
    { value: "16", label: "16s" },
    { value: "20", label: "20s" },
  ];
  if (model.allowedDurations) return all.filter((o) => model.allowedDurations!.includes(o.value));
  return all.filter((o) => parseInt(o.value) <= model.maxDuration);
}

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
  onCustomUpload: (file: File, preview: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const uploadRef = useRef<HTMLInputElement>(null);

  const filtered = items.filter((item) =>
    (catFilter === "all" || item.categoryId === catFilter) &&
    (!search || item.name.toLowerCase().includes(search.toLowerCase()))
  );

  if (!open) return null;

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    onCustomUpload(file, URL.createObjectURL(file));
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 lg:pl-[256px] lg:pr-3">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 flex w-full max-w-[1120px] h-[720px] rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "#FFFFFF", border: "1px solid #E5E7EB" }}>

        {/* Sidebar */}
        <div className="w-[185px] shrink-0 flex flex-col p-4 gap-0.5 overflow-y-auto" style={{ borderRight: "1px solid #E5E7EB", scrollbarWidth: "none" }}>
          <p className="text-[14px] font-semibold text-[#111111] mb-3">Select Avatar</p>
          <button onClick={() => setCatFilter("all")}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-left transition-colors"
            style={{ color: catFilter === "all" ? "#2563EB" : "#6B7280", background: catFilter === "all" ? "rgba(37,99,235,0.1)" : "transparent" }}>
            All
          </button>
          {categories.map((c) => (
            <button key={c.id} onClick={() => setCatFilter(c.id)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-left transition-colors"
              style={{ color: catFilter === c.id ? "#2563EB" : "#6B7280", background: catFilter === c.id ? "rgba(37,99,235,0.1)" : "transparent" }}>
              {c.name}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-[#E5E7EB]">
            <div className="flex-1 flex items-center gap-2.5 h-9 rounded-xl px-3 bg-[#F3F4F6] border border-[#E5E7EB]">
              <FontAwesomeIcon icon={faMagnifyingGlass} style={{ fontSize: 12, color: "#6B7280" }} />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search avatars..."
                className="flex-1 bg-transparent text-[13px] text-[#111111] outline-none" />
            </div>
            <button onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E5E7EB] text-[#6B7280] transition hover:bg-[#F3F4F6]">
              <FontAwesomeIcon icon={faXmark} style={{ fontSize: 14 }} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-5">
            <div className="grid grid-cols-5 gap-3">
              {/* Upload your own */}
              <input ref={uploadRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
              <button type="button" onClick={() => uploadRef.current?.click()}
                className="relative aspect-[3/4] rounded-xl overflow-hidden transition-all flex flex-col items-center justify-center gap-2"
                style={{ border: "2px dashed #D1D5DB", background: "#FAFAFA" }}>
                <div className="w-8 h-8 rounded-full bg-[#F3F4F6] flex items-center justify-center">
                  <FontAwesomeIcon icon={faPlus} style={{ fontSize: 13, color: "#9CA3AF" }} />
                </div>
                <span className="text-[10px] text-[#9CA3AF] font-medium text-center px-2 leading-tight">Upload your own</span>
              </button>

              {filtered.map((c) => (
                <button key={c.id} type="button" onClick={() => { onSelect(c.id); onClose(); }}
                  className="relative aspect-[3/4] rounded-xl overflow-hidden transition-all"
                  style={{ border: selected === c.id ? "2px solid #2563EB" : "2px solid transparent" }}>
                  <img src={c.thumbnailUrl || c.imageUrl} alt={c.name} className="w-full h-full object-cover object-top" />
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
  icon, label, value, options, onChange,
}: {
  icon: React.ReactNode;
  label: string;
  value: T;
  options: { value: T; label: string; locked?: boolean; shape?: React.ReactNode }[];
  onChange: (v: T) => void;
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
      <button type="button" onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-3.5 py-2 text-[13px] font-medium text-[#374151] transition hover:bg-[#F9FAFB] hover:border-[#D1D5DB]">
        {icon}
        <span className="text-[#9CA3AF] text-[11px]">{label}</span>
        <span className="font-semibold">{options.find(o => o.value === value)?.label ?? value}</span>
        <FontAwesomeIcon icon={faChevronDown} style={{ fontSize: 10, color: "#9CA3AF", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
      </button>
      {open && (
        <div className="absolute bottom-full left-0 mb-1.5 rounded-xl overflow-hidden shadow-xl z-20 min-w-[130px]"
          style={{ background: "#FFFFFF", border: "1px solid #E5E7EB" }}>
          {options.map((opt) => (
            <button key={opt.value} type="button" disabled={opt.locked}
              onClick={() => { if (!opt.locked) { onChange(opt.value); setOpen(false); } }}
              className="w-full flex items-center gap-3 px-3.5 h-11 text-[13px] transition hover:bg-[#F3F4F6]"
              style={{ color: opt.locked ? "#D1D5DB" : value === opt.value ? "#2563EB" : "#374151", cursor: opt.locked ? "not-allowed" : "pointer" }}>
              {opt.shape && <span className="flex-shrink-0">{opt.shape}</span>}
              <span className="flex-1 text-left">{opt.label}</span>
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
  useEffect(() => {
    window.dispatchEvent(new CustomEvent(avatarModalOpen ? "app:modal-open" : "app:modal-close"));
  }, [avatarModalOpen]);

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

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadedPreviews, setUploadedPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [customAvatarFile, setCustomAvatarFile] = useState<File | null>(null);
  const [customAvatarPreview, setCustomAvatarPreview] = useState<string | null>(null);

  const [prompt, setPrompt] = useState("");
  const [videoModel, setVideoModel] = useState<string>(VIDEO_MODELS[0].id);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("9:16");
  const [duration, setDuration] = useState<Duration>("5");

  const activeModel = VIDEO_MODELS.find((m) => m.id === videoModel) ?? VIDEO_MODELS[0];

  function handleModelChange(id: string) {
    setVideoModel(id);
    const model = VIDEO_MODELS.find((m) => m.id === id);
    if (model && parseInt(duration) > model.maxDuration) {
      const opts = getDurationOptions(model);
      setDuration(opts[opts.length - 1].value);
    }
  }

  const [isGenerating, setIsGenerating] = useState(false);
  const [isWritingScript, setIsWritingScript] = useState(false);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [finalVideoUrl, setFinalVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { items: characters, categories } = useAvatars();
  const selectedChar = characters.find((c) => c.id === selectedCharacter);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stopPolling = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  }, []);
  useEffect(() => () => stopPolling(), [stopPolling]);

  function addImages(files: FileList | File[]) {
    const arr = Array.from(files).filter(f => f.type.startsWith("image/"));
    const toAdd = arr.slice(0, 2 - uploadedFiles.length);
    if (!toAdd.length) return;
    setUploadedFiles(prev => [...prev, ...toAdd]);
    setUploadedPreviews(prev => [...prev, ...toAdd.map(f => URL.createObjectURL(f))]);
  }

  function removeImage(idx: number) {
    URL.revokeObjectURL(uploadedPreviews[idx]);
    setUploadedFiles(prev => prev.filter((_, i) => i !== idx));
    setUploadedPreviews(prev => prev.filter((_, i) => i !== idx));
  }

  function handleCustomAvatarUpload(file: File, preview: string) {
    if (customAvatarPreview) URL.revokeObjectURL(customAvatarPreview);
    setCustomAvatarFile(file);
    setCustomAvatarPreview(preview);
    setSelectedCharacter(null);
  }

  function removeCustomAvatar() {
    if (customAvatarPreview) URL.revokeObjectURL(customAvatarPreview);
    setCustomAvatarFile(null);
    setCustomAvatarPreview(null);
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
      fd.append("aspectRatio", aspectRatio === "9:16" ? "NINE_SIXTEEN" : "SIXTEEN_NINE");
      fd.append("duration", duration);
      if (selectedCharacter) fd.append("characterId", selectedCharacter);
      if (customAvatarFile) fd.append("avatarImage", customAvatarFile);
      if (uploadedFiles[0]) fd.append("image1", uploadedFiles[0]);
      if (uploadedFiles[1]) fd.append("image2", uploadedFiles[1]);

      const res = await fetch("/api/generate/studio", { method: "POST", body: fd });
      const data = await res.json() as { id?: string; error?: string };
      if (!res.ok || !data.id) { setError(data.error || "Failed"); setIsGenerating(false); return; }
      setGenerationId(data.id);
      addActiveGeneration({ id: data.id, type: "Video Ad", status: "GENERATING_VIDEO", thumbnailUrl: selectedChar?.thumbnailUrl || selectedChar?.imageUrl || customAvatarPreview || null });
      // Reset inputs — orb in top-right tracks the queue
      setIsGenerating(false);
      setPrompt("");
      setSelectedCharacter(null);
      setCustomAvatarFile(null);
      setCustomAvatarPreview(null);
      setUploadedFiles([]);
      setUploadedPreviews([]);
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
  const durationNum = parseInt(duration);
  const creditCost = durationNum >= 15 ? 25 : durationNum >= 10 ? 20 : 15;
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center gap-6" style={{ minHeight: "calc(100vh - 80px)" }}>

      {/* ── Generating state ─── */}
      {isGenerating && !finalVideoUrl && (() => {
        const skW = aspectRatio === "9:16" ? 200 : aspectRatio === "16:9" ? 380 : 260;
        const skH = aspectRatio === "9:16" ? 355 : aspectRatio === "16:9" ? 214 : 260;
        return (
          <div className="flex flex-col items-center gap-6">
            <div className="text-center">
              <p className="text-[22px] font-bold text-[#111111]" style={{ letterSpacing: "-0.02em" }}>Generating your video</p>
              <p className="text-[13px] text-[#9CA3AF] mt-1">Usually 2 to 4 minutes. Start another while you wait</p>
            </div>
            <div className="relative overflow-hidden rounded-2xl shimmer-sweep"
              style={{ width: skW, height: skH, background: "#F3F4F6", border: "1px solid #E5E7EB" }} />
            <div className="relative h-[3px] rounded-full overflow-hidden" style={{ width: skW, background: "#E5E7EB" }}>
              <div className="absolute inset-y-0 left-0 rounded-full animate-pulse"
                style={{ width: "40%", background: "linear-gradient(90deg, #2563EB, #06B6D4)" }} />
            </div>
            <button onClick={() => { stopPolling(); setIsGenerating(false); setGenerationId(null); }}
              className="text-[12px] text-[#9CA3AF] hover:text-[#6B7280] transition">Cancel</button>
          </div>
        );
      })()}

      {/* ── Result state ─── */}
      {finalVideoUrl && (
        <div className="flex flex-col items-center gap-5">
          <video src={finalVideoUrl} controls autoPlay className="rounded-2xl"
            style={{ maxHeight: 400, aspectRatio: aspectRatio.replace(":", "/") }} />
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

      {/* ── Idle state ─── */}
      {!isGenerating && !finalVideoUrl && (<>

        {/* Hero video deck */}
        <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: 480, height: 270 }}>
          {HERO_VIDEOS.map((src, i) => {
            const offset = (i - heroIdx + 3) % 3;
            const isActive = offset === 0;
            const isRight = offset === 1;
            const tx = isActive ? "translateX(-50%)" : isRight ? "translateX(calc(-50% + 88px))" : "translateX(calc(-50% - 88px))";
            const rotate = isActive ? "rotate(0deg)" : isRight ? "rotate(6deg)" : "rotate(-6deg)";
            const scale = isActive ? "scale(1)" : "scale(0.78)";
            return (
              <div key={i} className="absolute"
                style={{
                  left: "50%", top: 0,
                  width: 145, height: 258,
                  borderRadius: 18, overflow: "hidden",
                  transform: `${tx} ${rotate} ${scale}`,
                  transformOrigin: "bottom center",
                  zIndex: isActive ? 3 : isRight ? 2 : 1,
                  opacity: 1,
                  boxShadow: isActive ? "0 16px 48px rgba(0,0,0,0.16)" : "0 6px 16px rgba(0,0,0,0.08)",
                  transition: "transform 0.45s cubic-bezier(0.4,0,0.2,1), opacity 0.45s ease",
                }}>
                <video
                  ref={el => { heroRefs.current[i] = el; if (el) { el.muted = true; el.playsInline = true; if (isActive) setTimeout(() => el.play().catch(() => {}), 60); } }}
                  src={src} playsInline
                  onEnded={() => setHeroIdx(n => (n + 1) % 3)}
                  className="w-full h-full object-cover"
                />
              </div>
            );
          })}
        </div>

        {/* Headline — no subtitle */}
        <h2 className="text-[38px] font-bold text-[#111111] text-center flex-shrink-0"
          style={{ letterSpacing: "-0.025em", lineHeight: 1.1 }}>
          Turn Any Character Into a{" "}
          <span style={{ background: "linear-gradient(135deg, #2563EB 0%, #818CF8 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Video Ad
          </span>
        </h2>

        {/* ── Input card ─── */}
        <div className="w-full flex-shrink-0" style={{ maxWidth: 720 }}>

          {/* Card: textarea left + actions right */}
          <div className="rounded-2xl border bg-white flex overflow-hidden"
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false); }}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files.length) addImages(e.dataTransfer.files); }}
            style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06)", borderColor: isDragging ? "#2563EB" : "#E5E7EB", outline: isDragging ? "2px dashed #2563EB" : "none", outlineOffset: 2 }}>

            {/* Left: prompt */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Top bar: Add file + thumbnails (left) + Write with AI (right) */}
              <div className="flex items-center justify-between px-4 pt-3 pb-2 gap-3 border-b border-[#F3F4F6]">
                <div className="flex items-center gap-2 flex-wrap">
                  <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden"
                    onChange={(e) => e.target.files && addImages(e.target.files)} />
                  {/* Add file button — hidden when 2 files attached */}
                  {uploadedFiles.length < 2 && (
                    <button type="button" onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-all"
                      style={{ color: "#374151", background: "#F3F4F6", border: "1px solid #D1D5DB" }}>
                      <FontAwesomeIcon icon={faPaperclip} style={{ fontSize: 11 }} />
                      Add file
                    </button>
                  )}
                  {/* Image thumbnails — side by side */}
                  {uploadedPreviews.map((src, i) => (
                    <div key={i} className="relative rounded-lg overflow-hidden border border-[#E5E7EB] flex-shrink-0"
                      style={{ width: 36, height: 36 }}>
                      <img src={src} alt="" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeImage(i)}
                        className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-black/60">
                        <FontAwesomeIcon icon={faXmark} style={{ fontSize: 7, color: "white" }} />
                      </button>
                    </div>
                  ))}
                  {/* Custom avatar chip */}
                  {customAvatarPreview && (
                    <div className="relative rounded-lg overflow-hidden border-2 border-[#2563EB] flex-shrink-0"
                      style={{ width: 36, height: 36 }}>
                      <img src={customAvatarPreview} alt="Avatar" className="w-full h-full object-cover object-top" />
                      <button type="button" onClick={removeCustomAvatar}
                        className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-black/60">
                        <FontAwesomeIcon icon={faXmark} style={{ fontSize: 7, color: "white" }} />
                      </button>
                    </div>
                  )}
                </div>
                <button type="button" onClick={handleWriteScript}
                  disabled={!prompt.trim() || isWritingScript}
                  className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold flex-shrink-0 transition-all"
                  style={{
                    background: prompt.trim() && !isWritingScript ? "rgba(37,99,235,0.07)" : "transparent",
                    color: prompt.trim() && !isWritingScript ? "#2563EB" : "#D1D5DB",
                    border: "1px solid",
                    borderColor: prompt.trim() && !isWritingScript ? "rgba(37,99,235,0.18)" : "#F3F4F6",
                    cursor: !prompt.trim() || isWritingScript ? "not-allowed" : "pointer",
                  }}>
                  {isWritingScript
                    ? <FontAwesomeIcon icon={faCircleNotch} className="animate-spin" style={{ fontSize: 10 }} />
                    : <FontAwesomeIcon icon={faWandMagicSparkles} style={{ fontSize: 10 }} />}
                  AI Assist
                </button>
              </div>

              {/* Textarea — fills remaining height */}
              <div className="flex-1 relative px-4 pt-3 pb-2 flex flex-col">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe what happens in the ad..."
                  className="flex-1 w-full bg-transparent border-none outline-none text-[15px] leading-relaxed text-[#111111] placeholder-[#D1D5DB] resize-none"
                  style={{ minHeight: 0 }}
                  maxLength={10000}
                />
                <div className="flex justify-end pt-1">
                  <span className="text-[11px] text-[#D1D5DB]">{prompt.length} / 10000</span>
                </div>
              </div>
            </div>

            {/* Right: avatar + generate */}
            <div className="w-[170px] flex-shrink-0 flex flex-col items-center justify-between p-5 gap-4"
              style={{ borderLeft: "1px solid #EFEFEF" }}>

              {/* Avatar picker — rounded square */}
              <div className="flex flex-col items-center gap-2 w-full">
                <button type="button" onClick={() => setAvatarModalOpen(true)}
                  className="relative w-full transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{ aspectRatio: "3/4" }}>
                  {selectedChar ? (
                    <>
                      <div className="w-full h-full rounded-2xl overflow-hidden border-2 border-[#2563EB]">
                        <Image src={selectedChar.imageUrl} alt={selectedChar.name} fill className="object-cover object-top" sizes="160px" />
                      </div>
                      <button type="button" onClick={(e) => { e.stopPropagation(); setSelectedCharacter(null); }}
                        className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/50 border border-white/30 z-10">
                        <FontAwesomeIcon icon={faXmark} style={{ fontSize: 8, color: "white" }} />
                      </button>
                    </>
                  ) : customAvatarPreview ? (
                    <>
                      <div className="w-full h-full rounded-2xl overflow-hidden border-2 border-[#2563EB]">
                        <img src={customAvatarPreview} alt="Custom avatar" className="w-full h-full object-cover object-top" />
                      </div>
                      <button type="button" onClick={(e) => { e.stopPropagation(); removeCustomAvatar(); }}
                        className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/50 border border-white/30 z-10">
                        <FontAwesomeIcon icon={faXmark} style={{ fontSize: 8, color: "white" }} />
                      </button>
                    </>
                  ) : (
                    <div className="w-full h-full rounded-2xl border-2 border-dashed border-[#D1D5DB] flex flex-col items-center justify-center gap-2 hover:border-[#2563EB] hover:bg-blue-50/40 transition-all bg-[#FAFAFA]">
                      <div className="w-9 h-9 rounded-full bg-[#F3F4F6] flex items-center justify-center">
                        <FontAwesomeIcon icon={faPlus} style={{ fontSize: 14, color: "#9CA3AF" }} />
                      </div>
                      <span className="text-[11px] text-[#9CA3AF] font-medium">Choose avatar</span>
                    </div>
                  )}
                </button>
                {(selectedChar || customAvatarPreview) && (
                  <span className="text-[11px] text-[#9CA3AF] text-center">
                    {selectedChar?.name ?? "Custom"} · <button type="button" onClick={() => setAvatarModalOpen(true)} className="text-[#2563EB] hover:underline">Change</button>
                  </span>
                )}
              </div>

              {/* Generate */}
              <button type="button" onClick={handleGenerate} disabled={!canGenerate}
                className="w-full flex items-center justify-center gap-2 rounded-xl text-[13px] font-bold transition-all"
                style={{
                  height: 44,
                  background: canGenerate ? "#2563EB" : "#F3F4F6",
                  color: canGenerate ? "#FFFFFF" : "#9CA3AF",
                  cursor: canGenerate ? "pointer" : "not-allowed",
                }}>
                {isGenerating
                  ? <FontAwesomeIcon icon={faCircleNotch} className="animate-spin" style={{ fontSize: 13 }} />
                  : <FontAwesomeIcon icon={faWandMagicSparkles} style={{ fontSize: 12 }} />}
                <span>Generate</span>
                <span className="text-[11px] opacity-60">·{creditCost}</span>
              </button>
            </div>
          </div>

          {/* Settings row */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <DropdownPill
              icon={activeModel.logo
                ? <img src={activeModel.logo} alt="" className="w-4 h-4 rounded-sm object-contain" />
                : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg>}
              label="Model  "
              value={videoModel}
              options={VIDEO_MODELS.map((m) => ({
                value: m.id,
                label: m.name,
                shape: <img src={m.logo} alt="" className="w-5 h-5 rounded-sm object-contain flex-shrink-0" />,
              }))}
              onChange={handleModelChange}
            />
            <DropdownPill
              icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="3" width="12" height="18" rx="2"/></svg>}
              label="Aspect Ratio  "
              value={aspectRatio}
              options={[
                {
                  value: "9:16" as AspectRatio, label: "9:16",
                  shape: <span className="inline-block rounded-[3px] border-[1.5px] border-current flex-shrink-0" style={{ width: 10, height: 17 }} />,
                },
                {
                  value: "16:9" as AspectRatio, label: "16:9",
                  shape: <span className="inline-block rounded-[3px] border-[1.5px] border-current flex-shrink-0" style={{ width: 20, height: 11 }} />,
                },
              ]}
              onChange={setAspectRatio}
            />
            <DropdownPill
              icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6V12L16 14"/></svg>}
              label="Duration  "
              value={duration}
              options={getDurationOptions(activeModel)}
              onChange={setDuration}
            />
          </div>

          {error && (
            <p className="mt-2 text-[12px] px-4 py-2 rounded-xl bg-red-50 text-red-500 border border-red-100">{error}</p>
          )}
        </div>

      </>)}

      {/* Avatar modal */}
      <AvatarModal
        open={avatarModalOpen}
        onClose={() => setAvatarModalOpen(false)}
        selected={selectedCharacter}
        onSelect={setSelectedCharacter}
        items={characters}
        categories={categories}
        onCustomUpload={handleCustomAvatarUpload}
      />
    </div>
  );
}
