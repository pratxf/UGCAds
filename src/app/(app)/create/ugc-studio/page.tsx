"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
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
  faUser,
  faBox,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import { useAvatars, type LibraryItem, type LibraryCategory } from "@/lib/hooks/use-library";
import { addActiveGeneration } from "@/lib/active-generations";

type Mode = "ugc" | "product";
type VideoModel = "kling-3.0/video" | "sora-2-image-to-video";
type AspectRatio = "9:16" | "1:1" | "16:9";
type Duration = "5" | "10" | "15";

const VIDEO_MODELS: { id: VideoModel; name: string; logo: string }[] = [
  { id: "kling-3.0/video", name: "Kling 3.0", logo: "/models/kling-3.jpg" },
  { id: "sora-2-image-to-video", name: "Sora 2", logo: "/models/sora-2.png" },
];

// Palette
const P = {
  bg: "#000000",
  surface: "#0a0a0a",
  panel: "#111111",
  border: "rgba(125,57,235,0.2)",
  borderHover: "rgba(125,57,235,0.5)",
  primary: "#7D39EB",
  lime: "#C6FF33",
  muted: "rgba(255,255,255,0.45)",
  subtle: "rgba(255,255,255,0.25)",
  ube: "#7D39EB",
  americanBlue: "#4f20c8",
};

function downloadAsset(url: string, id: string, prefix: string) {
  const filename = `${prefix}-${id.slice(-6)}.mp4`;
  const a = document.createElement("a");
  a.href = `/api/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`;
  a.download = filename;
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
        style={{ background: "rgba(10,10,10,0.95)", backdropFilter: "blur(24px)", border: `1px solid ${P.border}` }}>

        {/* Sidebar */}
        <div className="w-[185px] shrink-0 flex flex-col p-5 gap-0.5"
          style={{ borderRight: `1px solid ${P.border}` }}>
          <p className="text-[14px] font-semibold text-white mb-5">Select Avatar</p>
          {[{ id: "all", label: "All" }, { id: "my", label: "My avatars" }].map((item) => (
            <button key={item.id} onClick={() => setCatFilter(item.id)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-left transition-colors"
              style={{ color: catFilter === item.id ? "#fff" : P.muted, background: catFilter === item.id ? "rgba(125,57,235,0.2)" : "transparent" }}>
              {item.label}
            </button>
          ))}
          {categories.length > 0 && (
            <>
              <div className="my-3" style={{ height: 1, background: P.border }} />
              {categories.map((c) => (
                <button key={c.id} onClick={() => setCatFilter(c.id)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-left transition-colors"
                  style={{ color: catFilter === c.id ? "#fff" : P.muted, background: catFilter === c.id ? "rgba(58,62,108,0.4)" : "transparent" }}>
                  {c.name}
                </button>
              ))}
            </>
          )}
        </div>

        {/* Grid */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: `1px solid ${P.border}` }}>
            <div className="flex-1 flex items-center gap-2.5 h-9 rounded-xl px-3"
              style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${P.border}` }}>
              <FontAwesomeIcon icon={faMagnifyingGlass} style={{ fontSize: 12, color: P.muted }} />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..."
                className="flex-1 bg-transparent text-[13px] text-white outline-none" style={{ caretColor: P.ube }} />
            </div>
            <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-xl transition"
              style={{ border: `1px solid ${P.border}`, color: P.muted }}>
              <FontAwesomeIcon icon={faXmark} style={{ fontSize: 14 }} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-5">
            <div className="grid grid-cols-5 gap-3">
              <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                className="relative aspect-[3/4] rounded-xl flex flex-col items-center justify-center gap-2.5 transition"
                style={{ border: `2px dashed ${P.borderHover}`, background: "rgba(125,57,235,0.05)" }}>
                {uploading
                  ? <FontAwesomeIcon icon={faCircleNotch} className="animate-spin" style={{ fontSize: 18, color: P.ube }} />
                  : <>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "rgba(125,57,235,0.3)" }}>
                      <FontAwesomeIcon icon={faPlus} style={{ fontSize: 15, color: P.ube }} />
                    </div>
                    <span className="text-[10px] font-medium" style={{ color: P.muted }}>Create avatar</span>
                  </>}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
              {filtered.map((c) => (
                <button key={c.id} type="button" onClick={() => { onSelect(c.id); onClose(); }}
                  className="relative aspect-[3/4] rounded-xl overflow-hidden transition-all"
                  style={{ border: selected === c.id ? `2px solid ${P.ube}` : "2px solid transparent" }}>
                  <Image src={c.imageUrl} alt={c.name} fill className="object-cover object-top" sizes="140px" />
                  <div className="absolute inset-x-0 bottom-0 pb-2 pt-8 px-2"
                    style={{ background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)" }}>
                    <p className="text-[11px] font-semibold text-white truncate">{c.name}</p>
                  </div>
                  {selected === c.id && (
                    <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full" style={{ background: P.ube }}>
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

// ── Main Page ─────────────────────────────────────────────────────

export default function UGCStudio() {
  const [mode, setMode] = useState<Mode>("ugc");
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);

  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const [customAvatar, setCustomAvatar] = useState<{ id: string; name: string; imageUrl: string; categoryId: null } | null>(null);

  const productFileRef = useRef<File | null>(null);
  const [productImage, setProductImage] = useState<string | null>(null);

  const [prompt, setPrompt] = useState("");
  const [videoModel, setVideoModel] = useState<VideoModel>("kling-3.0/video");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("9:16");
  const [duration, setDuration] = useState<Duration>("5");

  const [isGenerating, setIsGenerating] = useState(false);
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

  const onDrop = useCallback((files: File[]) => {
    const f = files[0];
    if (!f) return;
    productFileRef.current = f;
    setProductImage(URL.createObjectURL(f));
  }, []);
  const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: { "image/*": [] }, maxFiles: 1 });

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
    if (isGenerating) return;
    setError(null); setFinalVideoUrl(null); setIsGenerating(true);
    try {
      if (mode === "ugc") {
        const isCustom = selectedCharacter === customAvatar?.id;
        const res = await fetch("/api/generate/ugc", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            characterId: isCustom ? undefined : selectedCharacter,
            isCustomAvatar: isCustom,
            customAvatarUrl: isCustom ? customAvatar?.imageUrl : undefined,
            prompt: prompt.trim(), videoModel,
            aspectRatio: aspectRatio === "9:16" ? "NINE_SIXTEEN" : aspectRatio === "16:9" ? "SIXTEEN_NINE" : "ONE_ONE",
            duration,
          }),
        });
        const data = await res.json() as { id?: string; error?: string };
        if (!res.ok || !data.id) { setError(data.error || "Failed"); setIsGenerating(false); return; }
        setGenerationId(data.id);
        addActiveGeneration({ id: data.id, type: "UGC Ad", status: "Processing" });
        startPolling(data.id);
      } else {
        const isCustom = selectedCharacter === customAvatar?.id;
        const fd = new FormData();
        fd.append("productImage", productFileRef.current!);
        fd.append("prompt", prompt.trim());
        fd.append("videoModel", videoModel);
        fd.append("aspectRatio", aspectRatio === "9:16" ? "NINE_SIXTEEN" : aspectRatio === "16:9" ? "SIXTEEN_NINE" : "ONE_ONE");
        fd.append("duration", duration);
        if (isCustom && customAvatar) {
          fd.append("isCustomAvatar", "true");
          fd.append("customAvatarUrl", customAvatar.imageUrl);
        } else if (selectedCharacter) {
          fd.append("characterId", selectedCharacter);
          fd.append("isCustomAvatar", "false");
        }
        const res = await fetch("/api/generate/product-ad", { method: "POST", body: fd });
        const data = await res.json() as { id?: string; error?: string };
        if (!res.ok || !data.id) { setError(data.error || "Failed"); setIsGenerating(false); return; }
        setGenerationId(data.id);
        addActiveGeneration({ id: data.id, type: "Product Ad", status: "Processing" });
        startPolling(data.id);
      }
    } catch { setError("Network error. Please try again."); setIsGenerating(false); }
  }

  const canGenerate = mode === "ugc"
    ? !!selectedCharacter && prompt.trim().length > 0 && !isGenerating
    : !!selectedCharacter && !!productImage && prompt.trim().length > 0 && !isGenerating;

  const currentModel = VIDEO_MODELS.find((m) => m.id === videoModel)!;

  return (
    <div className="flex flex-col" style={{ minHeight: "calc(100vh - 2rem)" }}>
      <div className="flex flex-col flex-1 px-8 pt-8 pb-10">

        {/* ── Generating shimmer view ─────────────── */}
        {isGenerating && !finalVideoUrl && (() => {
          const skeletonW = aspectRatio === "9:16" ? 220 : aspectRatio === "16:9" ? 440 : 300;
          const skeletonH = aspectRatio === "9:16" ? 390 : aspectRatio === "16:9" ? 247 : 300;
          return (
            <div className="flex flex-col items-center justify-center flex-1 gap-8 py-10">
              <div className="flex flex-col items-center gap-2 text-center">
                <p className="text-[24px] font-bold text-white" style={{ letterSpacing: "-0.02em" }}>Generating your video</p>
                <p className="text-[13px]" style={{ color: P.muted }}>Usually takes 2 to 4 minutes</p>
              </div>

              {/* Shimmer skeleton */}
              <div className="relative overflow-hidden rounded-2xl shimmer-sweep"
                style={{
                  width: skeletonW,
                  height: skeletonH,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(125,57,235,0.25)",
                  boxShadow: "0 0 40px rgba(125,57,235,0.12)",
                }}>
                {/* Violet corner glow */}
                <div className="absolute inset-x-0 bottom-0 h-1/3 pointer-events-none"
                  style={{ background: "linear-gradient(to top, rgba(125,57,235,0.08), transparent)" }} />
                {/* Model badge */}
                <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center gap-2">
                  <img src={currentModel.logo} alt={currentModel.name}
                    className="size-8 rounded-lg object-cover opacity-50" />
                  <span className="text-[10px] font-semibold tracking-widest uppercase opacity-30 text-white">
                    {currentModel.name}
                  </span>
                </div>
              </div>

              {/* Pulsing progress bar */}
              <div className="relative h-[3px] rounded-full overflow-hidden" style={{ width: skeletonW, background: "rgba(255,255,255,0.05)" }}>
                <div className="absolute inset-y-0 left-0 rounded-full animate-pulse"
                  style={{ width: "40%", background: "linear-gradient(90deg, #7D39EB, #C6FF33)" }} />
              </div>

              <button
                onClick={() => { stopPolling(); setIsGenerating(false); setGenerationId(null); }}
                className="text-[12px] transition hover:text-white/60"
                style={{ color: "rgba(255,255,255,0.25)" }}>
                Cancel
              </button>
            </div>
          );
        })()}

        {/* ── Result view ──────────────────────────── */}
        {finalVideoUrl && (
          <div className="flex flex-col items-center justify-center flex-1 gap-6">
            <video src={finalVideoUrl} controls autoPlay className="rounded-2xl"
              style={{ maxHeight: 420, aspectRatio: aspectRatio.replace(":", "/") }} />
            <div className="flex gap-3">
              <button onClick={() => downloadAsset(finalVideoUrl, generationId!, mode === "ugc" ? "ugc-ad" : "product-ad")}
                className="inline-flex items-center gap-2 h-10 px-5 rounded-xl text-[13px] font-bold transition hover:brightness-110"
                style={{ background: "#C6FF33", color: "#000" }}>
                <FontAwesomeIcon icon={faDownload} style={{ fontSize: 12 }} /> Download
              </button>
              <button onClick={() => { setFinalVideoUrl(null); setGenerationId(null); setError(null); }}
                className="inline-flex items-center gap-2 h-10 px-5 rounded-xl text-[13px] font-semibold transition"
                style={{ border: `1px solid ${P.border}`, color: P.muted }}>
                <FontAwesomeIcon icon={faArrowsRotate} style={{ fontSize: 12 }} /> New
              </button>
            </div>
          </div>
        )}

        {/* ── Idle state ───────────────────────────── */}
        {!isGenerating && !finalVideoUrl && (
          <div className="flex flex-col items-center justify-end flex-1 gap-10 pb-16">

            {/* Headline */}
            <h2 className="text-[38px] font-bold text-center text-white"
              style={{ letterSpacing: "-0.02em", lineHeight: 1.1 }}>
              {mode === "ugc" ? "TURN ANY CHARACTER INTO A VIDEO AD" : "PAIR AN AVATAR WITH YOUR PRODUCT"}
            </h2>

            {/* ── Input area ─────────────────────────── */}
            <div className="w-full" style={{ maxWidth: 1020 }}>

              {/* Mode toggle */}
              <div className="flex gap-2 mb-4">
                {([["ugc", faUser, "UGC Ad"], ["product", faBox, "Product Ad"]] as const).map(([m, icon, label]) => (
                  <button key={m} onClick={() => setMode(m)}
                    className="flex items-center gap-2 h-8 px-4 rounded-full text-[12px] font-semibold transition-all"
                    style={mode === m
                      ? { background: "rgba(125,57,235,0.2)", color: "#fff", border: `1px solid ${P.borderHover}`, boxShadow: "0 0 12px rgba(125,57,235,0.3)" }
                      : { background: "transparent", color: P.muted, border: `1px solid rgba(255,255,255,0.1)` }}>
                    <FontAwesomeIcon icon={icon} style={{ fontSize: 11 }} />
                    {label}
                  </button>
                ))}
              </div>

              {/* Main container */}
              <div className="flex items-stretch gap-4 rounded-[28px] p-4"
                style={{ background: "rgba(8,8,8,0.97)", backdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 0 60px rgba(125,57,235,0.08)" }}>

                {/* Left: input + settings */}
                <div className="flex-1 flex flex-col justify-center gap-4 py-1 pl-1 min-w-0">

                  {/* Input row */}
                  <div className="flex items-start">
                    <textarea
                      value={prompt}
                      onChange={(e) => {
                        setPrompt(e.target.value);
                        const el = e.target;
                        el.style.height = "auto";
                        el.style.height = Math.min(el.scrollHeight, 120) + "px";
                      }}
                      placeholder="Describe what happens in the ad..."
                      className="flex-1 w-full bg-transparent border-none outline-none text-[17px] font-medium leading-relaxed"
                      style={{ color: "#d1c5cb", caretColor: P.ube, resize: "none", overflowY: "auto", minHeight: "28px", height: "28px", maxHeight: "120px" }}
                    />
                  </div>

                  {/* Settings pills */}
                  <div className="flex items-center gap-3 flex-wrap">

                    {/* Model dropdown */}
                    <div className="relative">
                      <button onClick={() => { setModelOpen((o) => !o); }}
                        className="flex items-center gap-2 rounded-xl px-3.5 py-2 transition-all hover:bg-white/5"
                        style={{ background: "rgba(125,57,235,0.2)", border: "1px solid rgba(125,57,235,0.5)", boxShadow: "0 0 12px rgba(125,57,235,0.35)" }}>
                        <img src={currentModel.logo} alt={currentModel.name} className="size-5 rounded object-cover shrink-0" />
                        <span className="text-[13px] font-bold tracking-wide" style={{ color: "#e2d5dc" }}>{currentModel.name}</span>
                        <FontAwesomeIcon icon={faChevronDown} style={{ fontSize: 11, color: "#9ca3af", transform: modelOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
                      </button>
                      {modelOpen && (
                        <div className="absolute bottom-full left-0 mb-1.5 rounded-xl overflow-hidden shadow-2xl z-20"
                          style={{ background: "#080808", border: `1px solid ${P.border}`, minWidth: 160 }}>
                          {VIDEO_MODELS.map((m) => (
                            <button key={m.id} onClick={() => { setVideoModel(m.id); if (m.id === "sora-2-image-to-video" && duration === "5") setDuration("10"); setModelOpen(false); }}
                              className="w-full flex items-center gap-2.5 px-3.5 h-11 text-[13px] transition hover:bg-white/5"
                              style={{ color: videoModel === m.id ? P.ube : "#c4c6e8" }}>
                              <img src={m.logo} alt={m.name} className="size-6 rounded object-cover shrink-0" />
                              <span className="flex-1 text-left">{m.name}</span>
                              {videoModel === m.id && <FontAwesomeIcon icon={faCheck} style={{ fontSize: 10, color: P.ube }} />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Aspect ratio */}
                    {(["9:16", "1:1", "16:9"] as AspectRatio[]).map((a) => (
                      <button key={a} onClick={() => setAspectRatio(a)}
                        className="flex items-center gap-2 rounded-xl px-3.5 py-2 transition-all hover:bg-white/5"
                        style={aspectRatio === a
                          ? { background: "rgba(125,57,235,0.2)", border: "1px solid rgba(125,57,235,0.5)", boxShadow: "0 0 10px rgba(125,57,235,0.35)" }
                          : { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={aspectRatio === a ? P.ube : "#d1d5db"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="3" width="12" height="18" rx="2"/></svg>
                        <span className="text-[13px] font-bold tracking-wide" style={{ color: aspectRatio === a ? "#fff" : "#e2d5dc" }}>{a}</span>
                      </button>
                    ))}

                    {/* Duration */}
                    {(["5", "10", "15"] as Duration[]).map((d) => {
                      const isLocked = d === "5" && videoModel === "sora-2-image-to-video";
                      const isActive = duration === d && !isLocked;
                      return (
                        <button key={d} onClick={() => !isLocked && setDuration(d)} disabled={isLocked}
                          className="relative flex items-center gap-2 rounded-xl px-3.5 py-2 transition-all"
                          style={isLocked
                            ? { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", cursor: "not-allowed", opacity: 0.35 }
                            : isActive
                              ? { background: "rgba(125,57,235,0.2)", border: "1px solid rgba(125,57,235,0.5)", boxShadow: "0 0 10px rgba(125,57,235,0.35)" }
                              : { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={isActive ? P.ube : "#d1d5db"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6V12L16 14"/></svg>
                          <span className="text-[13px] font-bold tracking-wide" style={{ color: isActive ? "#fff" : "#e2d5dc" }}>{d}s</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Right: upload boxes + generate */}
                <div className="flex items-center gap-3 shrink-0">

                  {/* Product box — product mode only */}
                  {mode === "product" && (
                    <div className="relative w-[88px] h-[88px] rounded-2xl overflow-hidden cursor-pointer transition-colors group"
                      style={{ background: "#0a1020" }}>
                      {productImage ? (
                        <>
                          <div {...getRootProps()} className="absolute inset-0">
                            <input {...getInputProps()} />
                            <Image src={productImage} alt="Product" fill className="object-contain" sizes="88px" />
                          </div>
                          <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)" }} />
                          <button type="button" onClick={() => { setProductImage(null); productFileRef.current = null; }}
                            className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full z-10 transition hover:bg-white/30"
                            style={{ background: "rgba(0,0,0,0.6)" }}>
                            <FontAwesomeIcon icon={faXmark} style={{ fontSize: 8, color: "white" }} />
                          </button>
                        </>
                      ) : (
                        <div {...getRootProps()} className="absolute inset-0 p-2.5 flex flex-col justify-between">
                          <input {...getInputProps()} />
                          <div className="w-[22px] h-[22px] rounded-full flex items-center justify-center transition-colors"
                            style={{ border: "1px solid rgba(74,46,59,0.8)", color: "#9ca3af" }}>
                            <FontAwesomeIcon icon={faPlus} style={{ fontSize: 10 }} />
                          </div>
                          <span className="text-[10px] font-extrabold text-center text-white tracking-wider">PRODUCT</span>
                        </div>
                      )}
                      {productImage && <span className="absolute bottom-2 left-0 right-0 z-10 text-[10px] font-extrabold text-center text-white tracking-wider">PRODUCT</span>}
                    </div>
                  )}

                  {/* Avatar box */}
                  <button type="button" onClick={() => setAvatarModalOpen(true)}
                    className="relative w-[88px] h-[88px] rounded-2xl overflow-hidden cursor-pointer transition-colors group"
                    style={{ background: "rgba(125,57,235,0.08)", border: "1px solid rgba(125,57,235,0.2)" }}>
                    {selectedChar ? (
                      <>
                        <Image src={selectedChar.imageUrl} alt={selectedChar.name} fill className="object-cover object-top" sizes="88px" />
                        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)" }} />
                        <button type="button" onClick={(e) => { e.stopPropagation(); setSelectedCharacter(null); }}
                          className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full z-10 transition hover:bg-white/30"
                          style={{ background: "rgba(0,0,0,0.6)" }}>
                          <FontAwesomeIcon icon={faXmark} style={{ fontSize: 8, color: "white" }} />
                        </button>
                      </>
                    ) : (
                      <div className="absolute inset-0 p-2.5 flex flex-col justify-between">
                        <div className="w-[22px] h-[22px] rounded-full flex items-center justify-center"
                          style={{ border: "1px solid rgba(74,46,59,0.8)", color: "#9ca3af" }}>
                          <FontAwesomeIcon icon={faPlus} style={{ fontSize: 10 }} />
                        </div>
                        <span className="text-[10px] font-extrabold text-center text-white tracking-wider">AVATAR</span>
                      </div>
                    )}
                    {selectedChar && <span className="absolute bottom-2 left-0 right-0 z-10 text-[10px] font-extrabold text-center text-white tracking-wider">AVATAR</span>}
                  </button>

                  {/* Generate button */}
                  <button type="button" onClick={handleGenerate} disabled={!canGenerate}
                    className="h-[88px] px-5 rounded-2xl flex items-center gap-2 transition-all"
                    style={{
                      background: canGenerate ? "#C6FF33" : "rgba(255,255,255,0.04)",
                      boxShadow: canGenerate ? "0 0 28px rgba(198,255,51,0.35)" : "none",
                      cursor: canGenerate ? "pointer" : "not-allowed",
                      opacity: canGenerate ? 1 : 0.5,
                    }}>
                    {isGenerating ? (
                      <FontAwesomeIcon icon={faCircleNotch} className="animate-spin" style={{ fontSize: 20, color: "#000" }} />
                    ) : (
                      <>
                        <span className="font-extrabold text-[13px] tracking-wide" style={{ color: canGenerate ? "#000" : "rgba(255,255,255,0.3)" }}>GENERATE</span>
                        <div className="flex items-center gap-1.5 pl-1">
                          <FontAwesomeIcon icon={faWandMagicSparkles} style={{ fontSize: 13, color: canGenerate ? "#000" : "rgba(255,255,255,0.3)" }} />
                          <span className="text-base font-extrabold" style={{ color: canGenerate ? "#000" : "rgba(255,255,255,0.3)" }}>
                            {duration === "15" ? 25 : duration === "10" ? 20 : 15}
                          </span>
                        </div>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <p className="mt-3 text-[12px] px-4 py-2.5 rounded-xl"
                  style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.15)" }}>
                  {error}
                </p>
              )}
            </div>
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
