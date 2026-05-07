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
  faCircleNotch,
  faCheck,
  faChevronDown,
  faTableCellsLarge,
  faPenToSquare,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import { usePhotoshootTemplates, type LibraryItem } from "@/lib/hooks/use-library";
import { addActiveGeneration } from "@/lib/active-generations";

type AspectRatio = "1:1" | "4:5" | "9:16" | "16:9";
type BgMode = "templates" | "custom";

const IMAGE_MODELS = [
  { id: "seedream/4.5-edit", name: "Seedream 4.5", tag: "ByteDance · 4K Edit", logo: "/models/seedream-4-5.jpg" },
  { id: "gpt-image-2-image-to-image", name: "GPT Image 2", tag: "OpenAI · Photoreal", logo: "/models/gpt-image-2.png" },
  { id: "seedream/5-lite-image-to-image", name: "Seedream 5 Lite", tag: "ByteDance · Fast", logo: "/models/seedream-5-lite.png" },
  { id: "flux-2/pro-image-to-image", name: "Flux 2 Pro", tag: "BFL · Multi-reference", logo: "/models/flux-2-pro.jpg" },
];

// ── DropdownPill ─────────────────────────────────────────────────

function DropdownPill<T extends string>({
  icon, label, value, options, onChange,
}: {
  icon: React.ReactNode;
  label: string;
  value: T;
  options: { value: T; label: string; shape?: React.ReactNode; tag?: string; imgSrc?: string }[];
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
        <div className="absolute bottom-full left-0 mb-1.5 rounded-xl overflow-hidden shadow-xl z-20 min-w-[160px]"
          style={{ background: "#FFFFFF", border: "1px solid #E5E7EB" }}>
          {options.map((opt) => (
            <button key={opt.value} type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className="w-full flex items-center gap-3 px-3.5 h-11 text-[13px] transition hover:bg-[#F3F4F6]"
              style={{ color: value === opt.value ? "#2563EB" : "#374151" }}>
              {opt.shape && <span className="flex-shrink-0">{opt.shape}</span>}
              {opt.imgSrc && <img src={opt.imgSrc} alt="" className="w-6 h-6 rounded-md object-cover flex-shrink-0" />}
              <div className="flex-1 text-left">
                <span>{opt.label}</span>
                {opt.tag && <p className="text-[10px] text-[#9CA3AF] leading-none mt-0.5">{opt.tag}</p>}
              </div>
              {value === opt.value && <FontAwesomeIcon icon={faCheck} style={{ fontSize: 10 }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Template Library Modal ───────────────────────────────────────

function LibraryModal({
  templates, categories, categoryFilter, setCategoryFilter, selectedId, onSelect, onClose,
}: {
  templates: LibraryItem[];
  categories: { id: string; name: string }[];
  categoryFilter: string;
  setCategoryFilter: (v: string) => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");
  const filtered = templates.filter(
    (t) => (categoryFilter === "all" || t.categoryId === categoryFilter) &&
      (!search || t.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 lg:pl-[268px]">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 flex w-full max-w-[880px] h-[600px] rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "#FFFFFF", border: "1px solid #E5E7EB" }}>

        {/* Sidebar */}
        <div className="w-[185px] shrink-0 flex flex-col p-5 gap-0.5" style={{ borderRight: "1px solid #E5E7EB" }}>
          <p className="text-[14px] font-semibold text-[#111111] mb-5">Scene Templates</p>
          <button onClick={() => setCategoryFilter("all")}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-left transition-colors"
            style={{ color: categoryFilter === "all" ? "#2563EB" : "#6B7280", background: categoryFilter === "all" ? "rgba(37,99,235,0.1)" : "transparent" }}>
            All
          </button>
          {categories.length > 0 && (
            <>
              <div className="my-3 h-px bg-[#E5E7EB]" />
              {categories.map((c) => (
                <button key={c.id} onClick={() => setCategoryFilter(c.id)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-left transition-colors"
                  style={{ color: categoryFilter === c.id ? "#2563EB" : "#6B7280", background: categoryFilter === c.id ? "rgba(37,99,235,0.1)" : "transparent" }}>
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
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search templates..."
                className="flex-1 bg-transparent text-[13px] text-[#111111] outline-none" />
            </div>
            <button onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E5E7EB] text-[#6B7280] transition hover:bg-[#F3F4F6]">
              <FontAwesomeIcon icon={faXmark} style={{ fontSize: 14 }} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-5">
            <div className="grid grid-cols-4 gap-3">
              {filtered.map((t) => (
                <button key={t.id} type="button" onClick={() => { onSelect(t.id); onClose(); }}
                  className="relative aspect-square rounded-xl overflow-hidden transition-all"
                  style={{ border: selectedId === t.id ? "2px solid #2563EB" : "2px solid transparent" }}>
                  <img src={t.imageUrl} alt={t.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 pb-2 pt-6 px-2"
                    style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75), transparent)" }}>
                    <p className="text-[10px] font-semibold text-white truncate">{t.name}</p>
                  </div>
                  {selectedId === t.id && (
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

export default function PhotoshootCreator() {
  const productFileRef = useRef<File | null>(null);
  const [productImage, setProductImage] = useState<string | null>(null);
  const [productName, setProductName] = useState<string | null>(null);

  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [bgMode, setBgMode] = useState<BgMode>("templates");
  const [customPrompt, setCustomPrompt] = useState("");
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1");
  const [modelChoice, setModelChoice] = useState("seedream/4.5-edit");

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [genStatus, setGenStatus] = useState<string | null>(null);
  const [finalImageUrl, setFinalImageUrl] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const { items: photoshootTemplates, categories: templateCategories } = usePhotoshootTemplates();

  const filteredTemplates = photoshootTemplates.filter(
    (t) => categoryFilter === "all" || t.categoryId === categoryFilter
  );
  const selectedTemplateObj = photoshootTemplates.find((t) => t.id === selectedTemplate);

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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

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
        if (data.status === "COMPLETED" && data.finalVideoUrl) {
          setFinalImageUrl(data.finalVideoUrl);
          setIsGenerating(false);
        } else if (data.status === "FAILED") {
          setGenerationError(data.errorMessage || "Generation failed. Your credit has been refunded.");
          setIsGenerating(false);
        }
      } catch {}
    };
    tick();
    const interval = setInterval(tick, 3000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [generationId, finalImageUrl, generationError]);

  const hasBackground = bgMode === "templates" ? !!selectedTemplate : customPrompt.trim().length > 0;
  const canGenerate = !!productFileRef.current && hasBackground && !isGenerating;

  async function handleGenerate() {
    if (!productFileRef.current || !hasBackground) return;
    setGenerationError(null);
    setFinalImageUrl(null);
    setGenStatus("PENDING");
    setIsGenerating(true);

    const fd = new FormData();
    fd.append("productImage", productFileRef.current);
    fd.append("imageModel", modelChoice);
    fd.append("aspectRatio", aspectRatio);
    if (bgMode === "templates" && selectedTemplate) {
      if (!selectedTemplate.startsWith("custom-")) {
        fd.append("templateId", selectedTemplate);
      } else {
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
        setGenerationError(data?.error || "Generation failed.");
        setIsGenerating(false);
        return;
      }
      if (data.status === "COMPLETED" && data.finalVideoUrl) {
        setFinalImageUrl(data.finalVideoUrl);
        setIsGenerating(false);
        return;
      }
      setGenerationId(data.id);
      addActiveGeneration({ id: data.id, type: "Product Photoshoot", status: "GENERATING_SCENE" });
    } catch {
      setGenerationError("Generation failed. Your credit has been refunded.");
      setIsGenerating(false);
    }
  }

  function reset() {
    setProductImage(null); setProductName(null);
    setIsGenerating(false); setGenerationId(null); setGenStatus(null);
    setFinalImageUrl(null); setGenerationError(null);
    productFileRef.current = null;
  }

  function removeProduct() {
    setProductImage(null); setProductName(null);
    productFileRef.current = null;
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6" style={{ minHeight: "calc(100vh - 80px)" }}>

      {/* ── Generating state ─── */}
      {isGenerating && !finalImageUrl && (
        <div className="flex flex-col items-center gap-6">
          <div className="text-center">
            <p className="text-[22px] font-bold text-[#111111]" style={{ letterSpacing: "-0.02em" }}>
              {genStatus === "GENERATING_SCENE" ? "Compositing your scene" : "Preparing photoshoot"}
            </p>
            <p className="text-[13px] text-[#9CA3AF] mt-1">Usually 20–60 seconds</p>
          </div>
          <div className="relative overflow-hidden rounded-2xl shimmer-sweep"
            style={{ width: 260, height: 260, background: "#F3F4F6", border: "1px solid #E5E7EB" }} />
          <div className="relative h-[3px] rounded-full overflow-hidden" style={{ width: 260, background: "#E5E7EB" }}>
            <div className="absolute inset-y-0 left-0 rounded-full animate-pulse"
              style={{ width: "40%", background: "linear-gradient(90deg, #2563EB, #06B6D4)" }} />
          </div>
          <button onClick={() => { setIsGenerating(false); setGenerationId(null); setGenStatus(null); }}
            className="text-[12px] text-[#9CA3AF] hover:text-[#6B7280] transition">Cancel</button>
        </div>
      )}

      {/* ── Result state ─── */}
      {finalImageUrl && !isGenerating && (
        <div className="flex flex-col items-center gap-5">
          <img src={finalImageUrl} alt="Generated photoshoot"
            className="rounded-2xl object-contain shadow-xl"
            style={{ maxHeight: 480, maxWidth: "100%" }} />
          <div className="flex gap-3">
            <button onClick={() => downloadAsset(finalImageUrl, "photoshoot", "jpg")}
              className="inline-flex items-center gap-2 h-10 px-5 rounded-xl text-[13px] font-bold bg-[#2563EB] text-white transition hover:brightness-110">
              <FontAwesomeIcon icon={faDownload} style={{ fontSize: 12 }} /> Download
            </button>
            <button onClick={() => { setFinalImageUrl(null); setGenerationId(null); setGenerationError(null); handleGenerate(); }}
              className="inline-flex items-center gap-2 h-10 px-5 rounded-xl text-[13px] font-semibold border border-[#E5E7EB] text-[#6B7280] transition hover:bg-[#F3F4F6]">
              <FontAwesomeIcon icon={faArrowsRotate} style={{ fontSize: 12 }} /> Regenerate
            </button>
            <button onClick={reset}
              className="inline-flex items-center gap-2 h-10 px-5 rounded-xl text-[13px] font-semibold border border-[#E5E7EB] text-[#6B7280] transition hover:bg-[#F3F4F6]">
              <FontAwesomeIcon icon={faWandMagicSparkles} style={{ fontSize: 12 }} /> New
            </button>
          </div>
        </div>
      )}

      {/* ── Idle state ─── */}
      {!isGenerating && !finalImageUrl && (<>

        {/* Hero showcase — placeholder until user provides images */}
        <div className="relative flex items-center justify-center flex-shrink-0 gap-3" style={{ height: 200 }}>
          {[
            { w: 150, h: 150, rotate: "-6deg", z: 1, opacity: 0.5 },
            { w: 170, h: 170, rotate: "-2deg", z: 2, opacity: 0.65 },
            { w: 190, h: 190, rotate: "0deg", z: 3, opacity: 1 },
            { w: 170, h: 170, rotate: "2deg", z: 2, opacity: 0.65 },
            { w: 150, h: 150, rotate: "6deg", z: 1, opacity: 0.5 },
          ].map((card, i) => (
            <div key={i} className="flex-shrink-0 rounded-2xl overflow-hidden"
              style={{
                width: card.w, height: card.h,
                background: "linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)",
                border: "1px solid #E5E7EB",
                transform: `rotate(${card.rotate})`,
                zIndex: card.z,
                opacity: card.opacity,
                boxShadow: card.z === 3 ? "0 16px 48px rgba(0,0,0,0.12)" : "0 4px 12px rgba(0,0,0,0.06)",
              }}>
              <div className="w-full h-full flex items-center justify-center">
                <FontAwesomeIcon icon={faTableCellsLarge} style={{ fontSize: card.w * 0.2, color: "#D1D5DB" }} />
              </div>
            </div>
          ))}
        </div>

        {/* Headline */}
        <h2 className="text-[38px] font-bold text-[#111111] text-center flex-shrink-0"
          style={{ letterSpacing: "-0.025em", lineHeight: 1.1 }}>
          Turn Products Into{" "}
          <span style={{ background: "linear-gradient(135deg, #2563EB 0%, #06B6D4 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Studio Photos
          </span>
        </h2>

        {/* ── Input card ─── */}
        <div className="w-full flex-shrink-0" style={{ maxWidth: 720 }}>

          <div className="rounded-2xl border border-[#E5E7EB] bg-white flex overflow-hidden"
            style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>

            {/* Left: scene selector */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Top bar: mode tabs */}
              <div className="flex items-center justify-between px-4 pt-3 pb-2 gap-3 border-b border-[#F3F4F6]">
                <div className="flex items-center gap-0.5 rounded-lg bg-[#F3F4F6] p-0.5">
                  <button type="button" onClick={() => setBgMode("templates")}
                    className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-medium transition-all"
                    style={{
                      background: bgMode === "templates" ? "#FFFFFF" : "transparent",
                      color: bgMode === "templates" ? "#111111" : "#9CA3AF",
                      boxShadow: bgMode === "templates" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                    }}>
                    <FontAwesomeIcon icon={faTableCellsLarge} style={{ fontSize: 10 }} />
                    Templates
                  </button>
                  <button type="button" onClick={() => setBgMode("custom")}
                    className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-medium transition-all"
                    style={{
                      background: bgMode === "custom" ? "#FFFFFF" : "transparent",
                      color: bgMode === "custom" ? "#111111" : "#9CA3AF",
                      boxShadow: bgMode === "custom" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                    }}>
                    <FontAwesomeIcon icon={faPenToSquare} style={{ fontSize: 10 }} />
                    Custom
                  </button>
                </div>
                {bgMode === "templates" && filteredTemplates.length > visibleTemplates.length && (
                  <button type="button" onClick={() => setLibraryOpen(true)}
                    className="text-[11px] text-[#2563EB] font-medium hover:underline transition flex-shrink-0">
                    View all {filteredTemplates.length}
                  </button>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 flex flex-col px-4 pt-3 pb-2 min-h-0">
                {bgMode === "templates" ? (
                  <div className="flex-1 flex flex-col gap-2">
                    {/* Mini template grid */}
                    <div className="grid grid-cols-3 gap-2 flex-1">
                      {visibleTemplates.slice(0, 6).map((t) => (
                        <button key={t.id} type="button" onClick={() => setSelectedTemplate(t.id)}
                          className="relative aspect-square rounded-xl overflow-hidden transition-all"
                          style={{
                            border: selectedTemplate === t.id ? "2px solid #2563EB" : "2px solid #F3F4F6",
                            background: "#F3F4F6",
                          }}>
                          <img src={t.imageUrl} alt={t.name} className="w-full h-full object-cover" />
                          <div className="absolute inset-x-0 bottom-0 pb-1.5 pt-4 px-1.5"
                            style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)" }}>
                            <p className="text-[9px] font-semibold text-white truncate">{t.name}</p>
                          </div>
                          {selectedTemplate === t.id && (
                            <div className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#2563EB]">
                              <FontAwesomeIcon icon={faCheck} style={{ fontSize: 7, color: "#fff" }} />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                    {/* Category filter chips */}
                    <div className="flex gap-1.5 flex-wrap pt-1">
                      <button onClick={() => setCategoryFilter("all")}
                        className="rounded-full px-2.5 py-0.5 text-[10px] font-medium transition-all"
                        style={{
                          background: categoryFilter === "all" ? "#111111" : "#F3F4F6",
                          color: categoryFilter === "all" ? "#FFFFFF" : "#6B7280",
                          border: "1px solid",
                          borderColor: categoryFilter === "all" ? "#111111" : "#E5E7EB",
                        }}>
                        All
                      </button>
                      {templateCategories.map((c) => (
                        <button key={c.id} onClick={() => setCategoryFilter(c.id)}
                          className="rounded-full px-2.5 py-0.5 text-[10px] font-medium transition-all"
                          style={{
                            background: categoryFilter === c.id ? "#111111" : "#F3F4F6",
                            color: categoryFilter === c.id ? "#FFFFFF" : "#6B7280",
                            border: "1px solid",
                            borderColor: categoryFilter === c.id ? "#111111" : "#E5E7EB",
                          }}>
                          {c.name}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col">
                    <textarea
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="Describe the scene for your product...&#10;e.g. On a marble kitchen counter with soft morning light"
                      className="flex-1 w-full bg-transparent border-none outline-none text-[14px] leading-relaxed text-[#111111] placeholder-[#D1D5DB] resize-none"
                      style={{ minHeight: 0 }}
                      maxLength={2000}
                    />
                    <div className="flex justify-end pt-1">
                      <span className="text-[11px] text-[#D1D5DB]">{customPrompt.length} / 2000</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: product upload + generate */}
            <div className="w-[170px] flex-shrink-0 flex flex-col items-center justify-between p-5 gap-4"
              style={{ borderLeft: "1px solid #EFEFEF" }}>

              {/* Product image slot */}
              <div className="w-full flex flex-col items-center gap-2">
                <div className="relative w-full" style={{ aspectRatio: "1/1" }}>
                  {productImage ? (
                    <>
                      <div className="w-full h-full rounded-2xl overflow-hidden border-2 border-[#2563EB]">
                        <Image src={productImage} alt="Product" fill className="object-cover" sizes="150px" />
                      </div>
                      <button type="button" onClick={removeProduct}
                        className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/50 border border-white/30 z-10">
                        <FontAwesomeIcon icon={faXmark} style={{ fontSize: 8, color: "white" }} />
                      </button>
                    </>
                  ) : (
                    <div {...getRootProps()}
                      className="w-full h-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all"
                      style={{
                        borderColor: isDragActive ? "#2563EB" : "#D1D5DB",
                        background: isDragActive ? "rgba(37,99,235,0.04)" : "#FAFAFA",
                      }}>
                      <input {...getInputProps()} />
                      <div className="w-9 h-9 rounded-full bg-[#F3F4F6] flex items-center justify-center">
                        <FontAwesomeIcon icon={faUpload} style={{ fontSize: 14, color: "#9CA3AF" }} />
                      </div>
                      <span className="text-[10px] text-[#9CA3AF] font-medium text-center px-2 leading-tight">
                        {isDragActive ? "Drop here" : "Upload product"}
                      </span>
                    </div>
                  )}
                </div>
                {productImage && productName && (
                  <span className="text-[10px] text-[#9CA3AF] text-center truncate w-full px-1">{productName}</span>
                )}
              </div>

              {/* Generate button */}
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
                <span className="text-[11px] opacity-60">·1</span>
              </button>
            </div>
          </div>

          {/* Settings row */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <DropdownPill
              icon={<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>}
              label="Aspect  "
              value={aspectRatio}
              options={[
                { value: "1:1" as AspectRatio, label: "1:1", shape: <span className="inline-block rounded-[3px] border-[1.5px] border-current flex-shrink-0" style={{ width: 14, height: 14 }} /> },
                { value: "4:5" as AspectRatio, label: "4:5", shape: <span className="inline-block rounded-[3px] border-[1.5px] border-current flex-shrink-0" style={{ width: 12, height: 15 }} /> },
                { value: "9:16" as AspectRatio, label: "9:16", shape: <span className="inline-block rounded-[3px] border-[1.5px] border-current flex-shrink-0" style={{ width: 10, height: 17 }} /> },
                { value: "16:9" as AspectRatio, label: "16:9", shape: <span className="inline-block rounded-[3px] border-[1.5px] border-current flex-shrink-0" style={{ width: 20, height: 11 }} /> },
              ]}
              onChange={setAspectRatio}
            />
            <DropdownPill
              icon={<img src={IMAGE_MODELS.find(m => m.id === modelChoice)?.logo} alt="" className="w-3.5 h-3.5 rounded object-cover" />}
              label="Model  "
              value={modelChoice}
              options={IMAGE_MODELS.map(m => ({ value: m.id, label: m.name, tag: m.tag, imgSrc: m.logo }))}
              onChange={setModelChoice}
            />
          </div>

          {generationError && (
            <p className="mt-2 text-[12px] px-4 py-2 rounded-xl bg-red-50 text-red-500 border border-red-100">{generationError}</p>
          )}
        </div>

      </>)}

      {libraryOpen && (
        <LibraryModal
          templates={photoshootTemplates}
          categories={templateCategories}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          selectedId={selectedTemplate}
          onSelect={(id) => { setSelectedTemplate(id); setLibraryOpen(false); }}
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
