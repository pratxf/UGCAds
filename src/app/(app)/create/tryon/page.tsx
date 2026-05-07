"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUpload,
  faWandMagicSparkles,
  faCircleNotch,
  faDownload,
  faArrowsRotate,
  faCheck,
  faShirt,
  faXmark,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";

type TryonModel = {
  id: string;
  name: string;
  gender: "female" | "male";
  bodyType: string;
  ethnicity: string;
  imageUrl: string;
};

type GenderFilter = "all" | "female" | "male";
type Category = "tops" | "bottoms" | "full-body" | "outerwear";

const CATEGORIES: { id: Category; label: string; emoji: string }[] = [
  { id: "tops", label: "Tops", emoji: "👕" },
  { id: "bottoms", label: "Bottoms", emoji: "👖" },
  { id: "full-body", label: "Full Body", emoji: "👗" },
  { id: "outerwear", label: "Outerwear", emoji: "🧥" },
];

export default function TryonCreator() {
  const [models, setModels] = useState<TryonModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [genderFilter, setGenderFilter] = useState<GenderFilter>("all");
  const [libraryOpen, setLibraryOpen] = useState(false);

  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [garmentFile, setGarmentFile] = useState<File | null>(null);
  const [garmentPreview, setGarmentPreview] = useState<string | null>(null);
  const [category, setCategory] = useState<Category | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [genStatus, setGenStatus] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const garmentRef = useRef<File | null>(null);

  useEffect(() => {
    fetch("/api/tryon-models")
      .then((r) => r.json())
      .then((d) => setModels(d.models || []))
      .finally(() => setLoading(false));
  }, []);

  const onDrop = useCallback((files: File[]) => {
    const f = files[0];
    if (!f) return;
    garmentRef.current = f;
    setGarmentFile(f);
    setGarmentPreview(URL.createObjectURL(f));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  const filteredModels = models.filter(
    (m) => genderFilter === "all" || m.gender === genderFilter,
  );
  const visibleModels = filteredModels.slice(0, 5);
  const selectedModelObj = models.find((m) => m.id === selectedModel);
  // Always include selected model in the visible row even if filtered out
  const ensureVisibleSelected =
    selectedModelObj && !visibleModels.find((m) => m.id === selectedModelObj.id)
      ? [selectedModelObj, ...visibleModels.slice(0, 4)]
      : visibleModels;

  const canGenerate =
    !!selectedModel && !!garmentRef.current && !!category && !isGenerating;

  // Polling
  useEffect(() => {
    if (!generationId || resultUrl || error) return;
    let cancelled = false;
    const tick = async () => {
      try {
        const res = await fetch(`/api/generations/${generationId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        setGenStatus(data.status);
        if (data.status === "COMPLETED" && data.finalVideoUrl) {
          setResultUrl(data.finalVideoUrl);
          setIsGenerating(false);
        } else if (data.status === "FAILED") {
          setError(data.errorMessage || "Try-on failed. Your credits have been refunded.");
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
  }, [generationId, resultUrl, error]);

  async function handleGenerate() {
    if (!canGenerate) return;
    setError(null);
    setResultUrl(null);
    setGenStatus("PENDING");
    setIsGenerating(true);

    const fd = new FormData();
    fd.append("tryonModelId", selectedModel!);
    fd.append("garmentCategory", category!);
    fd.append("garmentImage", garmentRef.current!);

    try {
      const res = await fetch("/api/generate/tryon", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Try-on failed");
        setIsGenerating(false);
        return;
      }
      // Inline pipeline returns finished result directly
      if (data.status === "COMPLETED" && data.finalVideoUrl) {
        setResultUrl(data.finalVideoUrl);
        setIsGenerating(false);
        return;
      }
      setGenerationId(data.id);
    } catch {
      setError("Try-on failed. Please try again.");
      setIsGenerating(false);
    }
  }

  function tryDifferentModel() {
    setSelectedModel(null);
    setResultUrl(null);
    setGenerationId(null);
    setGenStatus(null);
    setError(null);
  }

  function tryDifferentGarment() {
    garmentRef.current = null;
    setGarmentFile(null);
    setGarmentPreview(null);
    setCategory(null);
    setResultUrl(null);
    setGenerationId(null);
    setGenStatus(null);
    setError(null);
  }

  function regenerate() {
    setResultUrl(null);
    setGenerationId(null);
    setGenStatus(null);
    setError(null);
    handleGenerate();
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_440px] gap-5 lg:items-start">
      {/* LEFT: model picker (default) OR result canvas (when generating/done) */}
      <div className="flex flex-col gap-5">
        {isGenerating || resultUrl ? (
          <section className="relative rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] overflow-hidden min-h-[600px]">
            {isGenerating && (
              <>
                <div className="absolute inset-0 bg-white" />
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
                    {genStatus === "GENERATING_TRYON" ? "Generating try-on..." : "Preparing try-on..."}
                  </p>
                </div>
              </>
            )}
            {resultUrl && !isGenerating && (
              <div className="absolute inset-0 flex items-center justify-center p-6 bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resultUrl}
                  alt="Try-on result"
                  className="max-w-full max-h-full object-contain rounded-xl animate-in fade-in duration-500"
                />
              </div>
            )}
          </section>
        ) : (
          <section className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-foreground">1. Choose Model</h2>
              <span className="text-[11px] text-[#9CA3AF]">
                {filteredModels.length} models
              </span>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {(["all", "female", "male"] as const).map((g) => (
                <Chip key={g} active={genderFilter === g} onClick={() => setGenderFilter(g)}>
                  {g === "all" ? "All" : g === "female" ? "Women" : "Men"}
                </Chip>
              ))}
            </div>
            {loading ? (
              <div className="py-8 text-center text-[#9CA3AF] text-sm">Loading models…</div>
            ) : filteredModels.length === 0 ? (
              <div className="py-8 text-center text-[#9CA3AF] text-sm">No models match this filter</div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {ensureVisibleSelected.map((m) => (
                  <ModelTile
                    key={m.id}
                    model={m}
                    selected={selectedModel === m.id}
                    onClick={() => setSelectedModel(m.id)}
                  />
                ))}
                {filteredModels.length > 5 && (
                  <button
                    type="button"
                    onClick={() => setLibraryOpen(true)}
                    className="aspect-[3/4] flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#D1D5DB] bg-[#F9FAFB] hover:border-primary/30 hover:bg-primary/[0.03] transition text-center"
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 border border-primary/30 text-primary">
                      <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: 16 }} />
                    </span>
                    <span className="text-xs font-semibold text-[#374151] leading-tight px-2">
                      View {filteredModels.length - 5} more
                    </span>
                  </button>
                )}
              </div>
            )}
          </section>
        )}
      </div>

      {/* RIGHT: garment + category + actions */}
      <aside className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] flex flex-col overflow-hidden lg:sticky lg:top-20">
        <div className="shrink-0 p-4 space-y-4">
            {/* Garment */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[12px] font-semibold uppercase tracking-wider text-[#6B7280]">
                  Garment
                </h3>
                {garmentPreview && (
                  <button
                    type="button"
                    onClick={tryDifferentGarment}
                    className="text-[11px] text-[#6B7280] hover:text-destructive transition"
                  >
                    Replace
                  </button>
                )}
              </div>
              {garmentPreview ? (
                <div className="relative rounded-xl border border-primary/30 bg-primary/[0.04] overflow-hidden h-32">
                  <Image src={garmentPreview} alt="Garment" fill className="object-contain p-2" sizes="400px" />
                </div>
              ) : (
                <div
                  {...getRootProps()}
                  className={cn(
                    "rounded-xl border-2 border-dashed cursor-pointer transition flex flex-col items-center justify-center gap-1.5 py-6 text-center",
                    isDragActive
                      ? "border-primary bg-primary/5"
                      : "border-[#D1D5DB] bg-[#F9FAFB] hover:border-[#9CA3AF]",
                  )}
                >
                  <input {...getInputProps()} />
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <FontAwesomeIcon icon={faUpload} style={{ fontSize: 14 }} />
                  </span>
                  <p className="text-[12px] font-semibold">Upload clothing item</p>
                  <p className="text-[10px] text-[#9CA3AF]">JPG, PNG, WEBP up to 10MB</p>
                </div>
              )}
            </div>

            {/* Category */}
            <div>
              <h3 className="text-[12px] font-semibold uppercase tracking-wider text-[#6B7280] mb-2">
                Category
              </h3>
              <div className="grid grid-cols-4 gap-1.5">
                {CATEGORIES.map((c) => {
                  const sel = category === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCategory(c.id)}
                      className={cn(
                        "rounded-lg border py-2 flex flex-col items-center gap-0.5 transition",
                        sel
                          ? "border-primary bg-primary/[0.06] text-primary"
                          : "border-[#E5E7EB] bg-[#F3F4F6] text-[#374151] hover:border-[#D1D5DB]",
                      )}
                    >
                      <span className="text-lg">{c.emoji}</span>
                      <span className="text-[10px] font-semibold">{c.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-[#E5E7EB] bg-[#F9FAFB] p-5">
          {resultUrl ? (
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => downloadAsset(resultUrl, "tryon", "jpg")}
                className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-xl bg-primary text-white text-sm font-bold transition hover:brightness-105"
              >
                <FontAwesomeIcon icon={faDownload} style={{ fontSize: 13 }} />
                Download
              </button>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={regenerate}
                  className="inline-flex items-center justify-center gap-1.5 h-10 rounded-xl border border-[#E5E7EB] bg-[#F3F4F6] text-[#374151] text-[11px] font-semibold hover:bg-[#E5E7EB] transition"
                >
                  <FontAwesomeIcon icon={faArrowsRotate} style={{ fontSize: 10 }} />
                  Regenerate
                </button>
                <button
                  type="button"
                  onClick={tryDifferentModel}
                  className="inline-flex items-center justify-center h-10 rounded-xl border border-[#E5E7EB] bg-[#F3F4F6] text-[#374151] text-[11px] font-semibold hover:bg-[#E5E7EB] transition"
                >
                  Different model
                </button>
                <button
                  type="button"
                  onClick={tryDifferentGarment}
                  className="inline-flex items-center justify-center h-10 rounded-xl border border-[#E5E7EB] bg-[#F3F4F6] text-[#374151] text-[11px] font-semibold hover:bg-[#E5E7EB] transition"
                >
                  Different garment
                </button>
              </div>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={!canGenerate}
                className="w-full inline-flex items-center justify-center gap-2 h-12 rounded-xl bg-primary text-white text-sm font-bold transition hover:brightness-105 disabled:bg-[#F3F4F6] disabled:text-[#9CA3AF] disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <FontAwesomeIcon icon={faCircleNotch} style={{ fontSize: 14 }} className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faWandMagicSparkles} style={{ fontSize: 14 }} />
                    Try On — 5 credits
                  </>
                )}
              </button>
              {error && <p className="mt-2 text-center text-[11px] text-destructive">{error}</p>}
            </>
          )}
        </div>
      </aside>

      {libraryOpen && (
        <LibraryModal
          models={filteredModels}
          genderFilter={genderFilter}
          setGenderFilter={setGenderFilter}
          selectedId={selectedModel}
          onSelect={(id) => {
            setSelectedModel(id);
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

function ModelTile({
  model,
  selected,
  onClick,
}: {
  model: TryonModel;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative aspect-[3/4] rounded-2xl overflow-hidden border bg-[#F3F4F6] cursor-pointer transition",
        selected
          ? "border-primary shadow-sm"
          : "border-[#E5E7EB] hover:border-[#D1D5DB]",
      )}
    >
      {model.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={model.imageUrl}
          alt={model.name}
          loading="eager"
          decoding="async"
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover object-top"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-[#F3F4F6] to-[#F9FAFB]">
          <span className="text-4xl">👤</span>
        </div>
      )}
      {selected && (
        <span className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary">
          <FontAwesomeIcon icon={faCheck} className="text-black" style={{ fontSize: 10 }} />
        </span>
      )}
    </button>
  );
}

function LibraryModal({
  models,
  genderFilter,
  setGenderFilter,
  selectedId,
  onSelect,
  onClose,
}: {
  models: TryonModel[];
  genderFilter: GenderFilter;
  setGenderFilter: (g: GenderFilter) => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 lg:pl-[268px]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-6xl max-h-[88vh] overflow-hidden rounded-3xl border border-[#E5E7EB] bg-white flex flex-col"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
          <h3 className="text-lg font-bold tracking-tight text-[#111111]">Choose a model</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg border border-[#E5E7EB] bg-[#F3F4F6] text-[#6B7280] hover:text-[#111111] hover:bg-[#E5E7EB] transition"
          >
            <FontAwesomeIcon icon={faXmark} style={{ fontSize: 13 }} />
          </button>
        </div>
        <div className="flex flex-wrap gap-2 px-6 py-3 border-b border-[#E5E7EB]">
          {(["all", "female", "male"] as const).map((g) => (
            <Chip key={g} active={genderFilter === g} onClick={() => setGenderFilter(g)}>
              {g === "all" ? "All" : g === "female" ? "Women" : "Men"}
            </Chip>
          ))}
        </div>
        <div className="overflow-y-auto p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {models.map((m) => (
              <ModelTile
                key={m.id}
                model={m}
                selected={selectedId === m.id}
                onClick={() => onSelect(m.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Chip({
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
        "rounded-full border px-3 py-1 text-[11px] capitalize transition",
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-[#E5E7EB] text-[#6B7280] hover:border-[#D1D5DB] hover:text-[#374151]",
      )}
    >
      {children}
    </button>
  );
}
