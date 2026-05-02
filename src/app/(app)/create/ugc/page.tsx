"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWandMagicSparkles,
  faPlay,
  faDownload,
  faArrowsRotate,
  faChevronDown,
  faChevronUp,
  faPlus,
  faCircleNotch,
  faVideo,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";
import { useAvatars, type LibraryItem, type LibraryCategory } from "@/lib/hooks/use-library";
import { addActiveGeneration } from "@/lib/active-generations";

type VideoModel = "kling-3.0/video" | "sora-2-image-to-video";
type AspectRatio = "9:16" | "1:1" | "16:9";
type Duration = "5" | "10" | "15";

const VIDEO_MODELS: { id: VideoModel; name: string; tag: string; initials: string; color: string }[] = [
  { id: "kling-3.0/video", name: "Kling 3.0", tag: "Pro · Native Audio", initials: "K", color: "bg-orange-500" },
  { id: "sora-2-image-to-video", name: "Sora 2", tag: "OpenAI · Experimental", initials: "S", color: "bg-black border border-white/20" },
];

const ASPECT_CHOICES: { value: AspectRatio; hint: string; boxClass: string }[] = [
  { value: "9:16", hint: "TikTok / Reels", boxClass: "w-4 h-7" },
  { value: "1:1", hint: "Instagram", boxClass: "w-6 h-6" },
  { value: "16:9", hint: "YouTube", boxClass: "w-7 h-4" },
];

const DURATION_CHOICES: { value: Duration; label: string }[] = [
  { value: "5", label: "5s" },
  { value: "10", label: "10s" },
  { value: "15", label: "15s" },
];

function downloadAsset(url: string, id: string) {
  const proxied = `/api/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(`ugc-ad-${id.slice(-6)}.mp4`)}`;
  const a = document.createElement("a");
  a.href = proxied;
  a.download = `ugc-ad-${id.slice(-6)}.mp4`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// ─── Model Picker ────────────────────────────────────────────────

function ModelPicker({ value, onChange }: { value: VideoModel; onChange: (v: VideoModel) => void }) {
  const [open, setOpen] = useState(false);
  const current = VIDEO_MODELS.find((m) => m.id === value)!;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/5 transition"
      >
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-white/50">Video Model</span>
        <FontAwesomeIcon icon={open ? faChevronUp : faChevronDown} className="text-white/40" style={{ fontSize: 11 }} />
      </button>

      <div className="px-4 pb-3">
        <div className="flex items-center justify-between rounded-xl bg-white/5 border border-white/10 px-3 py-2.5">
          <div className="flex items-center gap-2.5">
            <div className={cn("flex size-7 items-center justify-center rounded-lg text-white text-[11px] font-bold", current.color)}>
              {current.initials}
            </div>
            <div>
              <p className="text-[13px] font-semibold text-white">{current.name}</p>
              <p className="text-[10px] text-white/40">{current.tag}</p>
            </div>
          </div>
          {!open && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setOpen(true); }}
              className="text-[11px] font-semibold text-primary/80 hover:text-primary flex items-center gap-1 transition"
            >
              Switch →
            </button>
          )}
        </div>
      </div>

      {open && (
        <div className="px-4 pb-4 space-y-2">
          {VIDEO_MODELS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => { onChange(m.id); setOpen(false); }}
              className={cn(
                "w-full flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition",
                value === m.id
                  ? "border-primary/40 bg-primary/5"
                  : "border-white/10 bg-white/[0.02] hover:bg-white/5"
              )}
            >
              <div className={cn("flex size-7 items-center justify-center rounded-lg text-white text-[11px] font-bold shrink-0", m.color)}>
                {m.initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-white">{m.name}</p>
                <p className="text-[10px] text-white/40">{m.tag}</p>
              </div>
              {value === m.id && (
                <FontAwesomeIcon icon={faCheck} className="text-primary" style={{ fontSize: 11 }} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Character Picker ────────────────────────────────────────────

function CharacterPicker({
  selected,
  onSelect,
  items,
  categories,
  categoryFilter,
  setCategoryFilter,
  onCustomUpload,
}: {
  selected: string | null;
  onSelect: (id: string) => void;
  items: LibraryItem[];
  categories: LibraryCategory[];
  categoryFilter: string;
  setCategoryFilter: (c: string) => void;
  onCustomUpload: (av: { id: string; name: string; imageUrl: string; categoryId: null }) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

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
      }
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Category tabs */}
      <div className="flex gap-1.5 flex-wrap mb-3">
        <button
          onClick={() => setCategoryFilter("all")}
          className={cn(
            "rounded-full px-3 py-1 text-[11px] font-medium transition",
            categoryFilter === "all" ? "bg-foreground text-background" : "border border-white/10 bg-white/5 text-white/60 hover:text-white"
          )}
        >All</button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategoryFilter(c.id)}
            className={cn(
              "rounded-full px-3 py-1 text-[11px] font-medium transition",
              categoryFilter === c.id ? "bg-foreground text-background" : "border border-white/10 bg-white/5 text-white/60 hover:text-white"
            )}
          >{c.name}</button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-2 overflow-y-auto flex-1 pr-1" style={{ maxHeight: 480 }}>
        {/* Upload button */}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="relative aspect-[3/4] rounded-2xl border-2 border-dashed border-white/15 bg-white/[0.02] flex flex-col items-center justify-center gap-1.5 hover:border-primary/40 hover:bg-primary/5 transition text-white/40 hover:text-primary disabled:opacity-50"
        >
          {uploading ? (
            <FontAwesomeIcon icon={faCircleNotch} className="animate-spin" style={{ fontSize: 20 }} />
          ) : (
            <>
              <FontAwesomeIcon icon={faPlus} style={{ fontSize: 18 }} />
              <span className="text-[10px] font-medium">Upload</span>
            </>
          )}
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />

        {items.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onSelect(c.id)}
            className={cn(
              "relative aspect-[3/4] rounded-2xl overflow-hidden border-2 transition-all",
              selected === c.id ? "border-primary shadow-[0_0_0_2px_rgba(57,255,20,0.3)]" : "border-transparent hover:border-white/20"
            )}
          >
            <Image src={c.imageUrl} alt={c.name} fill className="object-cover object-top" sizes="120px" />
            {selected === c.id && (
              <div className="absolute top-1.5 right-1.5 flex size-5 items-center justify-center rounded-full bg-primary">
                <FontAwesomeIcon icon={faCheck} className="text-black" style={{ fontSize: 9 }} />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Shimmer ─────────────────────────────────────────────────────

function VideoShimmer() {
  return (
    <div className="relative rounded-3xl overflow-hidden bg-white/[0.03] border border-white/10 aspect-[9/16] max-w-[260px] mx-auto">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_1.8s_ease-in-out_infinite] bg-[length:200%_100%]" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
        <div className="flex gap-1.5">
          {[0, 0.2, 0.4].map((d) => (
            <span key={d} className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-dot" style={{ animationDelay: `${d}s` }} />
          ))}
        </div>
        <p className="text-sm font-semibold text-white/70">Generating video...</p>
        <p className="text-[11px] text-white/40">This may take a few minutes</p>
      </div>
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────

export default function UGCAdCreator() {
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const [customAvatar, setCustomAvatar] = useState<{ id: string; name: string; imageUrl: string; categoryId: null } | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("all");
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
  const filtered = characters.filter(
    (c) => categoryFilter === "all" || c.categoryId === categoryFilter || c.id === customAvatar?.id
  );
  const selectedChar = characters.find((c) => c.id === selectedCharacter);

  // Polling
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  }, []);

  useEffect(() => () => stopPolling(), [stopPolling]);

  function startPolling(id: string) {
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/generate/status?id=${id}`);
        const data = await res.json() as { status: string; finalUrl?: string; errorMessage?: string };
        if (data.status === "Complete") {
          stopPolling();
          setFinalVideoUrl(data.finalUrl!);
          setIsGenerating(false);
        } else if (data.status === "Failed") {
          stopPolling();
          setError(data.errorMessage || "Generation failed. Credits refunded.");
          setIsGenerating(false);
        }
      } catch {}
    }, 5000);
  }

  async function handleGenerate() {
    if (!selectedCharacter || !prompt.trim() || isGenerating) return;
    setError(null);
    setFinalVideoUrl(null);
    setIsGenerating(true);

    const isCustom = selectedCharacter === customAvatar?.id;
    const body = {
      characterId: isCustom ? undefined : selectedCharacter,
      isCustomAvatar: isCustom,
      customAvatarUrl: isCustom ? customAvatar?.imageUrl : undefined,
      prompt: prompt.trim(),
      videoModel,
      aspectRatio: aspectRatio === "9:16" ? "NINE_SIXTEEN" : aspectRatio === "16:9" ? "SIXTEEN_NINE" : "ONE_ONE",
      duration,
    };

    try {
      const res = await fetch("/api/generate/ugc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json() as { id?: string; error?: string };
      if (!res.ok || !data.id) {
        setError(data.error || "Failed to start generation");
        setIsGenerating(false);
        return;
      }
      setGenerationId(data.id);
      addActiveGeneration({ id: data.id, type: "UGC Ad", status: "Processing" });
      startPolling(data.id);
    } catch {
      setError("Network error. Please try again.");
      setIsGenerating(false);
    }
  }

  const canGenerate = !!selectedCharacter && prompt.trim().length > 0 && !isGenerating;

  return (
    <div className="mx-auto w-full max-w-[1300px]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* Left: character picker */}
        <div className="lg:col-span-5 rounded-3xl border border-white/10 bg-white/[0.025] p-5 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
          <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-white/50 mb-4">Choose Character</h2>
          <CharacterPicker
            selected={selectedCharacter}
            onSelect={setSelectedCharacter}
            items={filtered}
            categories={categories}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            onCustomUpload={(av) => { setCustomAvatar(av); setSelectedCharacter(av.id); }}
          />
        </div>

        {/* Right: settings + result */}
        <div className="lg:col-span-7 flex flex-col gap-4">

          {/* Result / shimmer panel */}
          {(isGenerating || finalVideoUrl) && (
            <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 flex flex-col items-center">
              {isGenerating && !finalVideoUrl && <VideoShimmer />}
              {finalVideoUrl && (
                <div className="w-full flex flex-col items-center gap-4">
                  <video
                    src={finalVideoUrl}
                    controls
                    autoPlay
                    className="rounded-2xl max-h-[480px] max-w-full"
                    style={{ aspectRatio: aspectRatio.replace(":", "/") }}
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => downloadAsset(finalVideoUrl, generationId!)}
                      className="inline-flex items-center gap-2 rounded-xl bg-primary text-black px-4 h-9 text-xs font-bold hover:brightness-105 transition"
                    >
                      <FontAwesomeIcon icon={faDownload} style={{ fontSize: 12 }} />
                      Download
                    </button>
                    <button
                      type="button"
                      onClick={() => { setFinalVideoUrl(null); setGenerationId(null); setError(null); }}
                      className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 text-white/70 px-4 h-9 text-xs font-semibold hover:bg-white/10 transition"
                    >
                      <FontAwesomeIcon icon={faArrowsRotate} style={{ fontSize: 12 }} />
                      New
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Settings panel */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] flex flex-col gap-5">

            {/* Video prompt */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.12em] text-white/50 block mb-2">Video Prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                placeholder="Describe what you want the character to do in the video..."
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[13px] text-white placeholder:text-white/25 outline-none resize-none focus:border-primary/40 transition"
              />
            </div>

            {/* Video model */}
            <ModelPicker value={videoModel} onChange={setVideoModel} />

            {/* Aspect ratio + duration */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.12em] text-white/50 block mb-2">Aspect Ratio</label>
                <div className="flex gap-2">
                  {ASPECT_CHOICES.map((a) => (
                    <button
                      key={a.value}
                      type="button"
                      onClick={() => setAspectRatio(a.value)}
                      className={cn(
                        "flex-1 rounded-xl border py-3 flex flex-col items-center gap-1.5 transition text-[11px]",
                        aspectRatio === a.value
                          ? "border-primary/40 bg-primary/5 text-primary"
                          : "border-white/10 bg-white/5 text-white/50 hover:text-white"
                      )}
                    >
                      <div className={cn("border-2 rounded-sm", aspectRatio === a.value ? "border-primary" : "border-current", a.boxClass)} />
                      {a.value}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-[0.12em] text-white/50 block mb-2">Duration</label>
                <div className="flex gap-2">
                  {DURATION_CHOICES.map((d) => (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => setDuration(d.value)}
                      className={cn(
                        "flex-1 rounded-xl border py-3 text-[12px] font-semibold transition",
                        duration === d.value
                          ? "border-primary/40 bg-primary/5 text-primary"
                          : "border-white/10 bg-white/5 text-white/50 hover:text-white"
                      )}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-xs text-destructive bg-destructive/10 rounded-xl px-4 py-2.5">{error}</p>
            )}

            {/* Generate button */}
            <button
              type="button"
              onClick={handleGenerate}
              disabled={!canGenerate}
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-primary via-primary to-primary/80 text-black font-bold text-sm flex items-center justify-center gap-2 hover:brightness-105 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <FontAwesomeIcon icon={faCircleNotch} className="animate-spin" style={{ fontSize: 14 }} />
                  Generating...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faWandMagicSparkles} style={{ fontSize: 14 }} />
                  Generate UGC Ad · 2 credits
                </>
              )}
            </button>

            {!selectedCharacter && (
              <p className="text-center text-[11px] text-white/30">Select a character to continue</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
