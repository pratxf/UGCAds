"use client";

import { useEffect, useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWandMagicSparkles,
  faCircleNotch,
  faDownload,
  faArrowsRotate,
  faCheck,
  faShirt,
  faXmark,
  faPaperclip,
  faPlus,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import { addActiveGeneration } from "@/lib/active-generations";

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

// ── Model Modal ──────────────────────────────────────────────────

function ModelModal({
  open, onClose, models, selected, onSelect, genderFilter, setGenderFilter,
}: {
  open: boolean;
  onClose: () => void;
  models: TryonModel[];
  selected: string | null;
  onSelect: (id: string) => void;
  genderFilter: GenderFilter;
  setGenderFilter: (g: GenderFilter) => void;
}) {
  const [search, setSearch] = useState("");

  const filtered = models.filter((m) =>
    (genderFilter === "all" || m.gender === genderFilter) &&
    (!search || m.name.toLowerCase().includes(search.toLowerCase()))
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 lg:pl-[268px]">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 flex w-full max-w-[880px] h-[600px] rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "#FFFFFF", border: "1px solid #E5E7EB" }}>

        {/* Sidebar */}
        <div className="w-[185px] shrink-0 flex flex-col p-5 gap-0.5" style={{ borderRight: "1px solid #E5E7EB" }}>
          <p className="text-[14px] font-semibold text-[#111111] mb-5">Select Model</p>
          {(["all", "female", "male"] as const).map((g) => (
            <button key={g} onClick={() => setGenderFilter(g)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-left capitalize transition-colors"
              style={{ color: genderFilter === g ? "#2563EB" : "#6B7280", background: genderFilter === g ? "rgba(37,99,235,0.1)" : "transparent" }}>
              {g === "all" ? "All" : g === "female" ? "Women" : "Men"}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-[#E5E7EB]">
            <div className="flex-1 flex items-center gap-2.5 h-9 rounded-xl px-3 bg-[#F3F4F6] border border-[#E5E7EB]">
              <FontAwesomeIcon icon={faMagnifyingGlass} style={{ fontSize: 12, color: "#6B7280" }} />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search models..."
                className="flex-1 bg-transparent text-[13px] text-[#111111] outline-none" />
            </div>
            <button onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E5E7EB] text-[#6B7280] transition hover:bg-[#F3F4F6]">
              <FontAwesomeIcon icon={faXmark} style={{ fontSize: 14 }} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-5">
            <div className="grid grid-cols-5 gap-3">
              {filtered.map((m) => (
                <button key={m.id} type="button" onClick={() => { onSelect(m.id); onClose(); }}
                  className="relative aspect-[3/4] rounded-xl overflow-hidden transition-all"
                  style={{ border: selected === m.id ? "2px solid #2563EB" : "2px solid transparent" }}>
                  {m.imageUrl ? (
                    <img src={m.imageUrl} alt={m.name} className="w-full h-full object-cover object-top" />
                  ) : (
                    <div className="w-full h-full bg-[#F3F4F6] flex items-center justify-center">
                      <span className="text-3xl">👤</span>
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 pb-2 pt-6 px-2"
                    style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75), transparent)" }}>
                    <p className="text-[10px] font-semibold text-white truncate">{m.name}</p>
                  </div>
                  {selected === m.id && (
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

// ── Main Page ─────────────────────────────────────────────────────

export default function TryonCreator() {
  const [models, setModels] = useState<TryonModel[]>([]);
  const [genderFilter, setGenderFilter] = useState<GenderFilter>("all");
  const [modelModalOpen, setModelModalOpen] = useState(false);

  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const garmentRef = useRef<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [garmentPreview, setGarmentPreview] = useState<string | null>(null);
  const [garmentName, setGarmentName] = useState<string | null>(null);
  const [category, setCategory] = useState<Category | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [genStatus, setGenStatus] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedModelObj = models.find((m) => m.id === selectedModel);

  useEffect(() => {
    fetch("/api/tryon-models")
      .then((r) => r.json())
      .then((d) => setModels(d.models || []));
  }, []);

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
      } catch {}
    };
    tick();
    const interval = setInterval(tick, 3000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [generationId, resultUrl, error]);

  function handleGarmentFile(file: File) {
    garmentRef.current = file;
    if (garmentPreview) URL.revokeObjectURL(garmentPreview);
    setGarmentPreview(URL.createObjectURL(file));
    setGarmentName(file.name);
  }

  function removeGarment() {
    if (garmentPreview) URL.revokeObjectURL(garmentPreview);
    garmentRef.current = null;
    setGarmentPreview(null);
    setGarmentName(null);
  }

  const canGenerate = !!selectedModel && !!garmentRef.current && !!category && !isGenerating;

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
      if (data.status === "COMPLETED" && data.finalVideoUrl) {
        setResultUrl(data.finalVideoUrl);
        setIsGenerating(false);
        return;
      }
      setGenerationId(data.id);
      addActiveGeneration({ id: data.id, type: "AI Try-On", status: "GENERATING_TRYON" });
    } catch {
      setError("Try-on failed. Please try again.");
      setIsGenerating(false);
    }
  }

  function reset() {
    removeGarment();
    setSelectedModel(null);
    setCategory(null);
    setIsGenerating(false); setGenerationId(null); setGenStatus(null);
    setResultUrl(null); setError(null);
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6" style={{ minHeight: "calc(100vh - 80px)" }}>

      {/* ── Generating state ─── */}
      {isGenerating && !resultUrl && (
        <div className="flex flex-col items-center gap-6">
          <div className="text-center">
            <p className="text-[22px] font-bold text-[#111111]" style={{ letterSpacing: "-0.02em" }}>
              {genStatus === "GENERATING_TRYON" ? "Generating try-on" : "Preparing try-on"}
            </p>
            <p className="text-[13px] text-[#9CA3AF] mt-1">Usually 30–90 seconds</p>
          </div>
          <div className="relative overflow-hidden rounded-2xl shimmer-sweep"
            style={{ width: 220, height: 293, background: "#F3F4F6", border: "1px solid #E5E7EB" }} />
          <div className="relative h-[3px] rounded-full overflow-hidden" style={{ width: 220, background: "#E5E7EB" }}>
            <div className="absolute inset-y-0 left-0 rounded-full animate-pulse"
              style={{ width: "40%", background: "linear-gradient(90deg, #2563EB, #06B6D4)" }} />
          </div>
          <button onClick={() => { setIsGenerating(false); setGenerationId(null); setGenStatus(null); }}
            className="text-[12px] text-[#9CA3AF] hover:text-[#6B7280] transition">Cancel</button>
        </div>
      )}

      {/* ── Result state ─── */}
      {resultUrl && !isGenerating && (
        <div className="flex flex-col items-center gap-5">
          <img src={resultUrl} alt="Try-on result"
            className="rounded-2xl object-contain shadow-xl"
            style={{ maxHeight: 500, maxWidth: "100%" }} />
          <div className="flex gap-3">
            <button onClick={() => downloadAsset(resultUrl, "tryon", "jpg")}
              className="inline-flex items-center gap-2 h-10 px-5 rounded-xl text-[13px] font-bold bg-[#2563EB] text-white transition hover:brightness-110">
              <FontAwesomeIcon icon={faDownload} style={{ fontSize: 12 }} /> Download
            </button>
            <button onClick={() => { setResultUrl(null); setGenerationId(null); setError(null); handleGenerate(); }}
              className="inline-flex items-center gap-2 h-10 px-5 rounded-xl text-[13px] font-semibold border border-[#E5E7EB] text-[#6B7280] transition hover:bg-[#F3F4F6]">
              <FontAwesomeIcon icon={faArrowsRotate} style={{ fontSize: 12 }} /> Regenerate
            </button>
            <button onClick={reset}
              className="inline-flex items-center gap-2 h-10 px-5 rounded-xl text-[13px] font-semibold border border-[#E5E7EB] text-[#6B7280] transition hover:bg-[#F3F4F6]">
              New
            </button>
          </div>
        </div>
      )}

      {/* ── Idle state ─── */}
      {!isGenerating && !resultUrl && (<>

        {/* Hero samples fan */}
        <div className="relative flex items-center justify-center flex-shrink-0 gap-3" style={{ height: 200 }}>
          {[
            { src: "/images/tryon-samples/to-1.avif", w: 120, h: 160, rotate: "-6deg", z: 1, opacity: 1 },
            { src: "/images/tryon-samples/to-2.avif", w: 135, h: 180, rotate: "-2deg", z: 2, opacity: 1 },
            { src: "/images/tryon-samples/to-3.avif", w: 150, h: 200, rotate: "0deg",  z: 3, opacity: 1 },
            { src: "/images/tryon-samples/to-4.avif", w: 135, h: 180, rotate: "2deg",  z: 2, opacity: 1 },
            { src: "/images/tryon-samples/to-5.avif", w: 120, h: 160, rotate: "6deg",  z: 1, opacity: 1 },
          ].map((card, i) => (
            <div key={i} className="flex-shrink-0 rounded-2xl overflow-hidden"
              style={{
                width: card.w, height: card.h,
                border: "1px solid #E5E7EB",
                transform: `rotate(${card.rotate})`,
                zIndex: card.z,
                opacity: card.opacity,
                boxShadow: card.z === 3 ? "0 16px 48px rgba(0,0,0,0.18)" : "0 4px 12px rgba(0,0,0,0.08)",
              }}>
              <img src={card.src} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>

        {/* Headline */}
        <h2 className="text-[38px] font-bold text-[#111111] text-center flex-shrink-0"
          style={{ letterSpacing: "-0.025em", lineHeight: 1.1 }}>
          Try Any Garment On{" "}
          <span style={{ background: "linear-gradient(135deg, #2563EB 0%, #06B6D4 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Instantly
          </span>
        </h2>

        {/* ── Input card ─── */}
        <div className="w-full flex-shrink-0" style={{ maxWidth: 720 }}>

          <div className="rounded-2xl border border-[#E5E7EB] bg-white flex overflow-hidden"
            style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>

            {/* Left: garment upload + category */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Top bar: Add file + garment thumbnail */}
              <div className="flex items-center gap-2 px-4 pt-3 pb-2 border-b border-[#F3F4F6]">
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleGarmentFile(e.target.files[0])} />
                {!garmentPreview && (
                  <button type="button" onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-all"
                    style={{ color: "#374151", background: "#F3F4F6", border: "1px solid #D1D5DB" }}>
                    <FontAwesomeIcon icon={faPaperclip} style={{ fontSize: 11 }} />
                    Add garment
                  </button>
                )}
                {garmentPreview && (
                  <div className="relative rounded-lg overflow-hidden border border-[#E5E7EB] flex-shrink-0"
                    style={{ width: 36, height: 36 }}>
                    <img src={garmentPreview} alt="Garment" className="w-full h-full object-cover" />
                    <button type="button" onClick={removeGarment}
                      className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-black/60">
                      <FontAwesomeIcon icon={faXmark} style={{ fontSize: 7, color: "white" }} />
                    </button>
                  </div>
                )}
              </div>

              {/* Category selector */}
              <div className="flex-1 flex flex-col px-4 pt-4 pb-3 min-h-0 gap-3">
                <p className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider">Garment type</p>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map((c) => (
                    <button key={c.id} type="button" onClick={() => setCategory(c.id)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all"
                      style={{
                        border: category === c.id ? "1.5px solid #2563EB" : "1.5px solid #E5E7EB",
                        background: category === c.id ? "rgba(37,99,235,0.06)" : "#FAFAFA",
                        color: category === c.id ? "#2563EB" : "#374151",
                      }}>
                      <span className="text-[18px] leading-none">{c.emoji}</span>
                      {c.label}
                      {category === c.id && (
                        <FontAwesomeIcon icon={faCheck} style={{ fontSize: 10, marginLeft: "auto" }} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: model picker + generate */}
            <div className="w-[170px] flex-shrink-0 flex flex-col items-center justify-between p-5 gap-4"
              style={{ borderLeft: "1px solid #EFEFEF" }}>

              {/* Model picker */}
              <div className="flex flex-col items-center gap-2 w-full">
                <button type="button" onClick={() => setModelModalOpen(true)}
                  className="relative w-full transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{ aspectRatio: "3/4" }}>
                  {selectedModelObj ? (
                    <>
                      <div className="w-full h-full rounded-2xl overflow-hidden border-2 border-[#2563EB]">
                        {selectedModelObj.imageUrl ? (
                          <img src={selectedModelObj.imageUrl} alt={selectedModelObj.name}
                            className="w-full h-full object-cover object-top" />
                        ) : (
                          <div className="w-full h-full bg-[#F3F4F6] flex items-center justify-center">
                            <span className="text-4xl">👤</span>
                          </div>
                        )}
                      </div>
                      <button type="button" onClick={(e) => { e.stopPropagation(); setSelectedModel(null); }}
                        className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/50 border border-white/30 z-10">
                        <FontAwesomeIcon icon={faXmark} style={{ fontSize: 8, color: "white" }} />
                      </button>
                    </>
                  ) : (
                    <div className="w-full h-full rounded-2xl border-2 border-dashed border-[#D1D5DB] flex flex-col items-center justify-center gap-2 hover:border-[#2563EB] hover:bg-blue-50/40 transition-all bg-[#FAFAFA]">
                      <div className="w-9 h-9 rounded-full bg-[#F3F4F6] flex items-center justify-center">
                        <FontAwesomeIcon icon={faPlus} style={{ fontSize: 14, color: "#9CA3AF" }} />
                      </div>
                      <span className="text-[11px] text-[#9CA3AF] font-medium text-center px-2 leading-tight">Choose model</span>
                    </div>
                  )}
                </button>
                {selectedModelObj && (
                  <span className="text-[11px] text-[#9CA3AF] text-center">
                    {selectedModelObj.name} · <button type="button" onClick={() => setModelModalOpen(true)} className="text-[#2563EB] hover:underline">Change</button>
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
                <span className="text-[11px] opacity-60">·5</span>
              </button>
            </div>
          </div>

          {error && (
            <p className="mt-2 text-[12px] px-4 py-2 rounded-xl bg-red-50 text-red-500 border border-red-100">{error}</p>
          )}
        </div>

      </>)}

      <ModelModal
        open={modelModalOpen}
        onClose={() => setModelModalOpen(false)}
        models={models}
        selected={selectedModel}
        onSelect={setSelectedModel}
        genderFilter={genderFilter}
        setGenderFilter={setGenderFilter}
      />
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
