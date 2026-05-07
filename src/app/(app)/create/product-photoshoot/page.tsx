"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUpload,
  faWandMagicSparkles,
  faDownload,
  faArrowsRotate,
  faXmark,
  faImage,
  faCircleNotch,
  faTableCellsLarge,
  faPenToSquare,
  faCheck,
  faPlus,
  faChevronDown,
  faChevronUp,
} from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";
import { usePhotoshootTemplates, type LibraryItem } from "@/lib/hooks/use-library";

type AspectRatio = "1:1" | "4:5" | "9:16" | "16:9";
type BgMode = "templates" | "custom";

const aspectChoices: AspectRatio[] = ["1:1", "4:5", "9:16", "16:9"];
const aspectClassMap: Record<AspectRatio, string> = {
  "1:1": "aspect-square max-w-[520px] max-h-[520px]",
  "4:5": "aspect-[4/5] max-w-[460px] max-h-[575px]",
  "9:16": "aspect-[9/16] max-w-[340px] max-h-[600px]",
  "16:9": "aspect-[16/9] max-w-[640px] max-h-[360px]",
};

export default function PhotoshootCreator() {
  const productFileRef = useRef<File | null>(null);
  const [productImage, setProductImage] = useState<string | null>(null);
  const [productName, setProductName] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1");
  const [bgMode, setBgMode] = useState<BgMode>("templates");
  const [customPrompt, setCustomPrompt] = useState("");
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [modelChoice, setModelChoice] = useState<string>("seedream/4.5-edit");
  const [modelPickerOpen, setModelPickerOpen] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [genStatus, setGenStatus] = useState<string | null>(null);
  const [usedModel, setUsedModel] = useState<string | null>(null);
  const [finalImageUrl, setFinalImageUrl] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const { items: photoshootTemplates, categories: templateCategories } = usePhotoshootTemplates();

  const filteredTemplates = photoshootTemplates.filter(
    (t) => categoryFilter === "all" || t.categoryId === categoryFilter,
  );

  const selectedTemplateObj: LibraryItem | undefined = photoshootTemplates.find(
    (t) => t.id === selectedTemplate,
  );

  // Promote selected template to the front of the visible row
  const visibleTemplates = (() => {
    const head = filteredTemplates.slice(0, 5);
    if (!selectedTemplateObj) return head;
    if (head.find((t) => t.id === selectedTemplateObj.id)) return head;
    return [selectedTemplateObj, ...head.slice(0, 4)];
  })();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      productFileRef.current = file;
      setProductImage(URL.createObjectURL(file));
      setProductName(file.name);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, open: openFilePicker } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
    noClick: false,
  });

  // Poll the real generation every 3s until COMPLETED or FAILED
  useEffect(() => {
    if (!generationId || finalImageUrl || generationError) return;
    let cancelled = false;
    const tick = async () => {
      try {
        const res = await fetch(`/api/generations/${generationId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        setGenStatus(data.status);
        if (data.aiModel) setUsedModel(data.aiModel);
        if (data.status === "COMPLETED" && data.finalVideoUrl) {
          setFinalImageUrl(data.finalVideoUrl);
          setIsGenerating(false);
        } else if (data.status === "FAILED") {
          setGenerationError(data.errorMessage || "Generation failed. Your credit has been refunded.");
          setIsGenerating(false);
        }
      } catch {
        /* swallow */
      }
    };
    tick();
    const interval = setInterval(tick, 3000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [generationId, finalImageUrl, generationError]);

  const hasBackground =
    bgMode === "templates" ? !!selectedTemplate : customPrompt.trim().length > 0;
  const canGenerate = !!productFileRef.current && hasBackground && !isGenerating;

  async function handleGenerate() {
    if (!productFileRef.current || !hasBackground) return;
    setGenerationError(null);
    setFinalImageUrl(null);
    setGenStatus("PENDING");
    setUsedModel(modelChoice);
    setIsGenerating(true);

    const fd = new FormData();
    fd.append("productImage", productFileRef.current);
    fd.append("imageModel", modelChoice);
    fd.append("aspectRatio", aspectRatio);
    if (bgMode === "templates" && selectedTemplate) {
      // skip synthetic custom-* IDs that come from the user-uploaded scene tile
      if (!selectedTemplate.startsWith("custom-")) {
        fd.append("templateId", selectedTemplate);
      } else {
        // treat as custom — but we don't have a prompt. Force user back to custom mode.
        setIsGenerating(false);
        setGenerationError("Switch to Custom Prompt to describe your scene.");
        return;
      }
    } else {
      fd.append("customPrompt", customPrompt.trim());
    }

    try {
      const res = await fetch("/api/generate/mockup", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setGenerationError(data?.error || "Generation failed. Your credit has been refunded.");
        setIsGenerating(false);
        return;
      }
      // Inline pipeline returns the finished result directly — short-circuit
      if (data.status === "COMPLETED" && data.finalVideoUrl) {
        setFinalImageUrl(data.finalVideoUrl);
        setIsGenerating(false);
        return;
      }
      setGenerationId(data.id);
    } catch {
      setGenerationError("Generation failed. Your credit has been refunded.");
      setIsGenerating(false);
    }
  }

  const reset = () => {
    setProductImage(null);
    setProductName(null);
    setIsGenerating(false);
    setGenerationId(null);
    setGenStatus(null);
    setFinalImageUrl(null);
    setGenerationError(null);
    setUsedModel(null);
    productFileRef.current = null;
  };

  const tryDifferentScene = () => {
    setSelectedTemplate(null);
    setCustomPrompt("");
    setIsGenerating(false);
    setGenerationId(null);
    setGenStatus(null);
    setFinalImageUrl(null);
    setGenerationError(null);
    setUsedModel(null);
  };

  const regenerate = () => {
    setIsGenerating(false);
    setGenerationId(null);
    setGenStatus(null);
    setFinalImageUrl(null);
    setGenerationError(null);
    handleGenerate();
  };

  const removeProduct = () => {
    setProductImage(null);
    setProductName(null);
    productFileRef.current = null;
  };

  return (
    <div className="-m-4 sm:-m-6 lg:-m-8 grid lg:h-screen grid-cols-1 lg:grid-cols-[minmax(0,1fr)_440px] lg:overflow-hidden">
      {/* ─────────────── CANVAS PANEL ─────────────── */}
      <div className="flex flex-col items-center justify-center gap-4 p-4 sm:p-6 lg:p-8 lg:overflow-y-auto">
        {/* Top toolbar: live + aspect */}
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-primary">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            Live
          </span>
          {aspectChoices.map((a) => {
            const active = aspectRatio === a;
            return (
              <button
                key={a}
                type="button"
                onClick={() => setAspectRatio(a)}
                className={cn(
                  "rounded-lg border px-3 py-1.5 text-xs transition",
                  active
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-[#E5E7EB] bg-[#F9FAFB] text-[#6B7280] hover:border-[#D1D5DB] hover:text-foreground",
                )}
              >
                {a}
              </button>
            );
          })}
        </div>

        {/* Canvas */}
        <div
          {...(productImage ? {} : getRootProps())}
          className={cn(
            "relative w-full mx-auto rounded-3xl border bg-[#F9FAFB] overflow-hidden shadow-[0_20px_60px_-20px_rgba(0,0,0,0.12)] transition-all",
            aspectClassMap[aspectRatio],
            !productImage && "cursor-pointer hover:bg-[#F3F4F6]",
            isDragActive ? "border-primary" : "border-[#E5E7EB] hover:border-[#D1D5DB]",
          )}
        >
          {!productImage && <input {...getInputProps()} />}

          {/* Decorative grid + glow background */}
          <div
            className="absolute inset-0 pointer-events-none opacity-40"
            style={{
              backgroundImage:
                "linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 30%, rgba(37,99,235,0.04) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(6,182,212,0.03) 0%, transparent 50%)",
            }}
          />

          {/* Content state */}
          {!productImage && !isGenerating && !finalImageUrl && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <div
                className={cn(
                  "flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed transition-all",
                  isDragActive
                    ? "border-primary/50 scale-105"
                    : "border-[#E5E7EB]",
                )}
              >
                <FontAwesomeIcon
                  icon={faUpload}
                  style={{ fontSize: 26 }}
                  className={cn(
                    "transition-colors",
                    isDragActive ? "text-primary" : "text-[#9CA3AF]",
                  )}
                />
              </div>
              <div className="text-center">
                <p className="text-[15px] font-medium text-foreground">
                  {isDragActive ? "Drop here" : "Upload a product to start"}
                </p>
                <p className="mt-1.5 text-xs text-[#9CA3AF]">
                  Drop an image here or pick a scene
                </p>
              </div>
            </div>
          )}

          {productImage && !isGenerating && !finalImageUrl && (
            <>
              {selectedTemplateObj && bgMode === "templates" && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={selectedTemplateObj.imageUrl}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover opacity-30 pointer-events-none"
                />
              )}
              <Image
                src={productImage}
                alt="Product"
                fill
                sizes="600px"
                className="object-cover drop-shadow-[0_20px_40px_rgba(0,0,0,0.55)]"
              />
              <button
                type="button"
                onClick={removeProduct}
                className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-lg bg-black/60 backdrop-blur border border-white/10 text-white hover:text-white hover:bg-black/80 transition"
                aria-label="Remove product"
              >
                <FontAwesomeIcon icon={faXmark} style={{ fontSize: 13 }} />
              </button>
              {productName && (
                <span className="absolute bottom-3 left-3 max-w-[60%] truncate inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/50 backdrop-blur px-2.5 py-1 text-[10px] font-medium text-white/80">
                  <FontAwesomeIcon icon={faImage} style={{ fontSize: 9 }} />
                  {productName}
                </span>
              )}
            </>
          )}

          {isGenerating && (
            <div className="absolute inset-0 overflow-hidden bg-black">
              {/* Soft breathing aurora — no shimmer streak (was causing visible banding) */}
              <div
                className="absolute inset-[-20%] animate-aurora-soft"
                style={{
                  background:
                    "radial-gradient(circle at 30% 20%, rgba(125,57,235,0.25), transparent 55%), radial-gradient(circle at 75% 65%, rgba(198,255,51,0.15), transparent 60%), radial-gradient(circle at 45% 90%, rgba(125,57,235,0.18), transparent 55%)",
                  filter: "blur(30px)",
                }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10">
                <div className="flex gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-dot" style={{ animationDelay: "0s" }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-dot" style={{ animationDelay: "0.2s" }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-dot" style={{ animationDelay: "0.4s" }} />
                </div>
                <p className="text-base font-semibold text-foreground">
                  {genStatus === "GENERATING_SCENE"
                    ? "Generating scene..."
                    : "Preparing your photoshoot..."}
                </p>
              </div>
            </div>
          )}

          {finalImageUrl && !isGenerating && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={finalImageUrl}
                alt="Generated photoshoot"
                className="absolute inset-0 h-full w-full object-contain animate-in fade-in duration-500 bg-black"
              />
            </>
          )}

          {generationError && (
            <div className="absolute inset-x-4 bottom-4 rounded-xl border border-destructive/40 bg-destructive/10 backdrop-blur px-3 py-2 text-[11px] text-destructive">
              {generationError}
            </div>
          )}
        </div>

        {!productImage && (
          <button
            type="button"
            onClick={openFilePicker}
            className="text-[11px] text-[#9CA3AF] hover:text-[#374151] transition"
          >
            or click to browse files
          </button>
        )}
      </div>

      {/* ─────────────── RIGHT PANEL ─────────────── */}
      <aside className="flex flex-col border-t lg:border-t-0 lg:border-l border-[#E5E7EB] bg-white lg:overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 border-b border-[#E5E7EB]">

            {/* Model picker */}
            {(() => {
              const IMAGE_MODELS = [
                { id: "seedream/4.5-edit", name: "Seedream 4.5", tag: "ByteDance · 4K Edit", logo: "/models/seedream-4-5.jpg" },
                { id: "gpt-image-2-image-to-image", name: "GPT Image 2", tag: "OpenAI · Photoreal", logo: "/models/gpt-image-2.png" },
                { id: "seedream/5-lite-image-to-image", name: "Seedream 5 Lite", tag: "ByteDance · Fast", logo: "/models/seedream-5-lite.png" },
                { id: "flux-2/pro-image-to-image", name: "Flux 2 Pro", tag: "BFL · Multi-reference", logo: "/models/flux-2-pro.jpg" },
              ];
              const current = IMAGE_MODELS.find((m) => m.id === modelChoice) || IMAGE_MODELS[0];
              return (
                <div className="mb-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF] mb-2">Image Model</p>
                  <button
                    type="button"
                    onClick={() => setModelPickerOpen((o) => !o)}
                    className="w-full flex items-center justify-between rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2.5 hover:bg-[#F3F4F6] transition"
                  >
                    <div className="flex items-center gap-2.5">
                      {"logo" in current && current.logo
                        ? <img src={current.logo} alt={current.name} className="size-7 rounded-lg object-cover shrink-0" />
                        : <div className={cn("flex size-7 items-center justify-center rounded-lg text-white text-[10px] font-bold shrink-0", (current as { color?: string }).color)}>{(current as { initials?: string }).initials}</div>
                      }
                      <div className="text-left">
                        <p className="text-[13px] font-semibold text-[#111111]">{current.name}</p>
                        <p className="text-[10px] text-[#9CA3AF]">{current.tag}</p>
                      </div>
                    </div>
                    <FontAwesomeIcon icon={modelPickerOpen ? faChevronUp : faChevronDown} className="text-[#9CA3AF] shrink-0" style={{ fontSize: 11 }} />
                  </button>
                  {modelPickerOpen && (
                    <div className="mt-1.5 rounded-xl border border-[#E5E7EB] bg-white overflow-hidden shadow-sm">
                      {IMAGE_MODELS.map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => { setModelChoice(m.id); setModelPickerOpen(false); }}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2.5 text-left transition hover:bg-[#F9FAFB]",
                            modelChoice === m.id ? "bg-primary/[0.06]" : ""
                          )}
                        >
                          {"logo" in m && m.logo
                            ? <img src={m.logo} alt={m.name} className="size-7 rounded-lg object-cover shrink-0" />
                            : <div className={cn("flex size-7 items-center justify-center rounded-lg text-white text-[10px] font-bold shrink-0", (m as { color?: string }).color)}>{(m as { initials?: string }).initials}</div>
                          }
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold text-[#111111]">{m.name}</p>
                            <p className="text-[10px] text-[#9CA3AF]">{m.tag}</p>
                          </div>
                          {modelChoice === m.id && <FontAwesomeIcon icon={faCheck} className="text-primary shrink-0" style={{ fontSize: 11 }} />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Mode tabs */}
            <div className="flex gap-1 p-1 mb-5 rounded-xl bg-[#F3F4F6]">
              {([
                { id: "templates", label: "Templates", icon: faTableCellsLarge },
                { id: "custom", label: "Custom Prompt", icon: faPenToSquare },
              ] as const).map((tab) => {
                const active = bgMode === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setBgMode(tab.id);
                      // selecting one mode clears the other input
                      if (tab.id === "templates") setCustomPrompt("");
                      else setSelectedTemplate(null);
                    }}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition",
                      active
                        ? "bg-white text-[#111111] shadow-[0_1px_3px_rgba(0,0,0,0.1)]"
                        : "text-[#9CA3AF] hover:text-[#374151]",
                    )}
                  >
                    <FontAwesomeIcon
                      icon={tab.icon}
                      style={{ fontSize: 11 }}
                      className={active ? "opacity-100" : "opacity-60"}
                    />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {bgMode === "templates" ? (
              <>
                {/* Category chips */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  <CategoryChip
                    active={categoryFilter === "all"}
                    onClick={() => setCategoryFilter("all")}
                  >
                    All
                  </CategoryChip>
                  {templateCategories.map((cat) => (
                    <CategoryChip
                      key={cat.id}
                      active={categoryFilter === cat.id}
                      onClick={() => setCategoryFilter(cat.id)}
                    >
                      {cat.name}
                    </CategoryChip>
                  ))}
                </div>

                {/* Scene grid: 2-column — selected first + templates + View More */}
                <div className="grid grid-cols-2 gap-3">
                  {visibleTemplates.map((t) => (
                    <TemplateTile
                      key={t.id}
                      template={t}
                      selected={selectedTemplate === t.id}
                      onClick={() => setSelectedTemplate(t.id)}
                    />
                  ))}
                  {filteredTemplates.length > visibleTemplates.length && (
                    <button
                      type="button"
                      onClick={() => setLibraryOpen(true)}
                      className="aspect-square flex flex-col items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] hover:border-primary/30 hover:bg-primary/[0.04] hover:-translate-y-0.5 transition-all text-center"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 border border-primary/30 text-primary">
                        <FontAwesomeIcon icon={faTableCellsLarge} style={{ fontSize: 13 }} />
                      </span>
                      <span className="text-xs font-semibold text-[#374151] leading-tight px-2">
                        View {filteredTemplates.length - visibleTemplates.length} more
                      </span>
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-3">
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Describe the scene for your product..."
                  rows={5}
                  className="w-full resize-y rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-3.5 text-[13px] leading-relaxed text-[#111111] placeholder:text-[#9CA3AF] outline-none focus:border-primary/40 transition"
                />
                <p className="text-[10px] text-[#9CA3AF]">Examples:</p>
                <ul className="space-y-1 text-[11px] text-[#6B7280] leading-relaxed">
                  <li>&quot;On a marble kitchen counter with soft morning light&quot;</li>
                  <li>&quot;Floating on water with tropical leaves around it&quot;</li>
                  <li>&quot;On a gym floor next to dumbbells and a water bottle&quot;</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Sticky footer: generate or post-result actions */}
        <div className="shrink-0 border-t border-[#E5E7EB] bg-white p-5">
          {finalImageUrl ? (
            <div className="space-y-3">
              <div className="rounded-xl border border-primary/30 bg-primary/[0.06] px-3 py-2 text-[11px] text-primary">
                Generated with {
                  usedModel === "seedream/4.5-edit" ? "Seedream 4.5" :
                  usedModel === "gpt-image-2-image-to-image" ? "GPT Image 2" :
                  usedModel === "seedream/5-lite-image-to-image" ? "Seedream 5 Lite" :
                  usedModel === "flux-2/pro-image-to-image" ? "Flux 2 Pro" :
                  usedModel || "AI"
                }
              </div>
              <button
                type="button"
                onClick={() => downloadAsset(finalImageUrl, "photoshoot", "jpg")}
                className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-xl bg-primary text-white text-sm font-bold ring-1 ring-inset ring-black/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_1px_2px_rgba(0,0,0,0.35)] transition hover:brightness-105"
              >
                <FontAwesomeIcon icon={faDownload} style={{ fontSize: 13 }} />
                Download
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={regenerate}
                  className="inline-flex items-center justify-center gap-2 h-10 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] text-[#374151] hover:text-[#111111] text-xs font-semibold transition hover:bg-[#F3F4F6]"
                >
                  <FontAwesomeIcon icon={faArrowsRotate} style={{ fontSize: 11 }} />
                  Regenerate
                </button>
                <button
                  type="button"
                  onClick={tryDifferentScene}
                  className="inline-flex items-center justify-center gap-2 h-10 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] text-[#374151] hover:text-[#111111] text-xs font-semibold transition hover:bg-[#F3F4F6]"
                >
                  <FontAwesomeIcon icon={faWandMagicSparkles} style={{ fontSize: 11 }} />
                  Try different scene
                </button>
              </div>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={!canGenerate}
                className="w-full inline-flex items-center justify-center gap-2 h-12 rounded-xl bg-primary text-white text-sm font-bold ring-1 ring-inset ring-black/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_1px_2px_rgba(0,0,0,0.35)] transition-all hover:brightness-105 hover:-translate-y-0.5 hover:shadow-[0_6px_28px_rgba(37,99,235,0.25)] active:translate-y-0 disabled:bg-[#F3F4F6] disabled:text-[#9CA3AF] disabled:cursor-not-allowed disabled:ring-0 disabled:shadow-none disabled:translate-y-0"
              >
                {isGenerating ? (
                  <>
                    <FontAwesomeIcon icon={faCircleNotch} style={{ fontSize: 14 }} className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faWandMagicSparkles} style={{ fontSize: 14 }} />
                    Generate Photoshoot
                  </>
                )}
              </button>
              <p className="mt-2 text-center text-[11px] text-[#9CA3AF]">
                Uses 1 credit per generation
              </p>
              {generationError && (
                <p className="mt-2 text-center text-[11px] text-destructive">
                  {generationError}
                </p>
              )}
            </>
          )}
        </div>
      </aside>

      {libraryOpen && (
        <LibraryModal
          templates={photoshootTemplates}
          categories={templateCategories}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          selectedId={selectedTemplate}
          onSelect={(id) => {
            setSelectedTemplate(id);
            setLibraryOpen(false);
          }}
          onClose={() => setLibraryOpen(false)}
        />
      )}
    </div>
  );
}

function downloadAsset(url: string, kind: string, ext: string) {
  const filename = `ugcads-${kind}-${Date.now()}.${ext}`;
  const proxied = `/api/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`;
  const a = document.createElement("a");
  a.href = proxied;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function CategoryChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-xs transition",
        active
          ? "bg-[#111111] text-white border-[#111111] font-medium"
          : "border-[#E5E7EB] text-[#6B7280] hover:border-[#D1D5DB] hover:text-[#374151]",
      )}
    >
      {children}
    </button>
  );
}

function TemplateTile({
  template,
  selected,
  onClick,
}: {
  template: LibraryItem;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative aspect-square overflow-hidden rounded-xl border bg-[#F3F4F6] cursor-pointer transition-all",
        selected
          ? "border-primary shadow-sm"
          : "border-[#E5E7EB] hover:border-[#D1D5DB] hover:-translate-y-0.5 hover:shadow-[0_6px_24px_rgba(0,0,0,0.08)]",
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={template.imageUrl}
        alt={template.name}
        loading="eager"
        decoding="async"
        fetchPriority="high"
        className="absolute inset-0 h-full w-full object-cover"
      />
      {selected && (
        <span className="absolute top-1.5 right-1.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-primary">
          <FontAwesomeIcon icon={faCheck} className="text-white" style={{ fontSize: 8 }} />
        </span>
      )}
    </button>
  );
}

function LibraryModal({
  templates,
  categories,
  categoryFilter,
  setCategoryFilter,
  selectedId,
  onSelect,
  onClose,
}: {
  templates: LibraryItem[];
  categories: { id: string; name: string }[];
  categoryFilter: string;
  setCategoryFilter: (v: string) => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  const filtered = templates.filter(
    (t) => categoryFilter === "all" || t.categoryId === categoryFilter,
  );
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4 lg:pl-[268px]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-5xl max-h-[85vh] overflow-hidden rounded-3xl border border-[#E5E7EB] bg-white flex flex-col shadow-xl"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
          <h3 className="text-lg font-bold tracking-tight text-[#111111]">Photoshoot template library</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] text-[#6B7280] hover:text-[#111111] hover:bg-[#F3F4F6] transition"
          >
            <FontAwesomeIcon icon={faXmark} style={{ fontSize: 13 }} />
          </button>
        </div>
        <div className="flex flex-wrap gap-2 px-6 py-3 border-b border-[#E5E7EB]">
          <CategoryChip active={categoryFilter === "all"} onClick={() => setCategoryFilter("all")}>
            All
          </CategoryChip>
          {categories.map((c) => (
            <CategoryChip
              key={c.id}
              active={categoryFilter === c.id}
              onClick={() => setCategoryFilter(c.id)}
            >
              {c.name}
            </CategoryChip>
          ))}
        </div>
        <div className="overflow-y-auto p-6">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {filtered.map((t) => (
              <TemplateTile
                key={t.id}
                template={t}
                selected={selectedId === t.id}
                onClick={() => onSelect(t.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CustomTemplateTile({
  onUploaded,
}: {
  onUploaded: (t: LibraryItem) => void;
}) {
  const [uploading, setUploading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch("/api/avatars/upload-custom", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        alert(data?.error || "Upload failed");
        return;
      }
      onUploaded({
        id: `custom-${Date.now()}`,
        name: "Custom Scene",
        imageUrl: data.url,
        categoryId: null,
      });
    } catch {
      alert("Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <label className="relative aspect-square cursor-pointer flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-[#D1D5DB] bg-[#F9FAFB] hover:border-primary/40 hover:bg-primary/[0.03] transition text-center">
      <input
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleFile}
        disabled={uploading}
      />
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 border border-primary/30 text-primary">
        <FontAwesomeIcon icon={uploading ? faCircleNotch : faPlus} className={uploading ? "animate-spin" : ""} style={{ fontSize: 11 }} />
      </span>
      <span className="text-[10px] font-semibold text-[#374151] leading-tight px-1">
        {uploading ? "Uploading..." : "Upload custom"}
      </span>
    </label>
  );
}
