"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWandMagicSparkles,
  faUpload,
  faDownload,
  faArrowsRotate,
  faXmark,
  faChevronDown,
  faChevronUp,
  faCircleNotch,
  faCheck,
  faImage,
} from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";
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
  const proxied = `/api/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(`product-ad-${id.slice(-6)}.mp4`)}`;
  const a = document.createElement("a");
  a.href = proxied;
  a.download = `product-ad-${id.slice(-6)}.mp4`;
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

// ─── Shimmer ─────────────────────────────────────────────────────

function VideoShimmer({ aspectRatio }: { aspectRatio: AspectRatio }) {
  const style = aspectRatio === "9:16" ? "aspect-[9/16] max-w-[220px]" : aspectRatio === "16:9" ? "aspect-[16/9] max-w-full" : "aspect-square max-w-[320px]";
  return (
    <div className={cn("relative rounded-3xl overflow-hidden bg-white/[0.03] border border-white/10 mx-auto w-full", style)}>
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

export default function ProductAdCreator() {
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

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stopPolling = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  }, []);
  useEffect(() => () => stopPolling(), [stopPolling]);

  const onDrop = useCallback((files: File[]) => {
    const f = files[0];
    if (!f) return;
    productFileRef.current = f;
    const url = URL.createObjectURL(f);
    setProductImage(url);
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { "image/*": [] }, maxFiles: 1 });

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
    if (!productFileRef.current || !prompt.trim() || isGenerating) return;
    setError(null);
    setFinalVideoUrl(null);
    setIsGenerating(true);

    const fd = new FormData();
    fd.append("productImage", productFileRef.current);
    fd.append("prompt", prompt.trim());
    fd.append("videoModel", videoModel);
    fd.append("aspectRatio", aspectRatio === "9:16" ? "NINE_SIXTEEN" : aspectRatio === "16:9" ? "SIXTEEN_NINE" : "ONE_ONE");
    fd.append("duration", duration);

    try {
      const res = await fetch("/api/generate/product-ad", { method: "POST", body: fd });
      const data = await res.json() as { id?: string; error?: string };
      if (!res.ok || !data.id) {
        setError(data.error || "Failed to start generation");
        setIsGenerating(false);
        return;
      }
      setGenerationId(data.id);
      addActiveGeneration({ id: data.id, type: "Product Ad", status: "Processing" });
      startPolling(data.id);
    } catch {
      setError("Network error. Please try again.");
      setIsGenerating(false);
    }
  }

  const canGenerate = !!productImage && prompt.trim().length > 0 && !isGenerating;

  return (
    <div className="mx-auto w-full max-w-[1100px]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* Left: product image + result */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Product upload */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-white/50">Product Image</h2>
              {productImage && (
                <button type="button" onClick={() => { setProductImage(null); productFileRef.current = null; }} className="text-white/40 hover:text-white transition">
                  <FontAwesomeIcon icon={faXmark} style={{ fontSize: 14 }} />
                </button>
              )}
            </div>

            {!productImage ? (
              <div
                {...getRootProps()}
                className={cn(
                  "aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 cursor-pointer transition text-white/40",
                  isDragActive ? "border-primary/60 bg-primary/5 text-primary" : "border-white/15 hover:border-primary/30 hover:text-white/60"
                )}
              >
                <input {...getInputProps()} />
                <FontAwesomeIcon icon={faUpload} style={{ fontSize: 28 }} />
                <div className="text-center">
                  <p className="text-[13px] font-semibold">Drop product image</p>
                  <p className="text-[11px] text-white/30 mt-0.5">or click to browse</p>
                </div>
              </div>
            ) : (
              <div {...getRootProps()} className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group">
                <input {...getInputProps()} />
                <Image src={productImage} alt="Product" fill className="object-contain" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <p className="text-white text-xs font-semibold">Change image</p>
                </div>
              </div>
            )}
          </div>

          {/* Result */}
          {(isGenerating || finalVideoUrl) && (
            <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 flex flex-col items-center gap-4">
              {isGenerating && !finalVideoUrl && <VideoShimmer aspectRatio={aspectRatio} />}
              {finalVideoUrl && (
                <>
                  <video src={finalVideoUrl} controls autoPlay className="rounded-2xl max-h-[360px] max-w-full" />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => downloadAsset(finalVideoUrl, generationId!)}
                      className="inline-flex items-center gap-2 rounded-xl bg-primary text-black px-4 h-9 text-xs font-bold hover:brightness-105 transition"
                    >
                      <FontAwesomeIcon icon={faDownload} style={{ fontSize: 12 }} /> Download
                    </button>
                    <button
                      type="button"
                      onClick={() => { setFinalVideoUrl(null); setGenerationId(null); setError(null); }}
                      className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 text-white/70 px-4 h-9 text-xs font-semibold hover:bg-white/10 transition"
                    >
                      <FontAwesomeIcon icon={faArrowsRotate} style={{ fontSize: 12 }} /> New
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Right: settings */}
        <div className="lg:col-span-7 rounded-3xl border border-white/10 bg-white/[0.025] p-5 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] flex flex-col gap-5">

          {/* Prompt */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.12em] text-white/50 block mb-2">Video Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              placeholder="Describe what you want the product video to show..."
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
                      aspectRatio === a.value ? "border-primary/40 bg-primary/5 text-primary" : "border-white/10 bg-white/5 text-white/50 hover:text-white"
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
                      duration === d.value ? "border-primary/40 bg-primary/5 text-primary" : "border-white/10 bg-white/5 text-white/50 hover:text-white"
                    )}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <p className="text-xs text-destructive bg-destructive/10 rounded-xl px-4 py-2.5">{error}</p>
          )}

          <button
            type="button"
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="w-full h-12 rounded-2xl bg-gradient-to-r from-primary via-primary to-primary/80 text-black font-bold text-sm flex items-center justify-center gap-2 hover:brightness-105 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <><FontAwesomeIcon icon={faCircleNotch} className="animate-spin" style={{ fontSize: 14 }} /> Generating...</>
            ) : (
              <><FontAwesomeIcon icon={faWandMagicSparkles} style={{ fontSize: 14 }} /> Generate Product Ad · 2 credits</>
            )}
          </button>

          {!productImage && (
            <p className="text-center text-[11px] text-white/30">Upload a product image to continue</p>
          )}
        </div>
      </div>
    </div>
  );
}
