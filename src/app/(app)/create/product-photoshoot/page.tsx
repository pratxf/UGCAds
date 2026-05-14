"use client";

import { useState, useEffect, useRef } from "react";
import { preload } from "react-dom";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWandMagicSparkles,
  faDownload,
  faArrowsRotate,
  faXmark,
  faCircleNotch,
  faCheck,
  faChevronDown,
  faTableCellsLarge,
  faMagnifyingGlass,
  faPaperclip,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { usePhotoshootTemplates, type LibraryItem } from "@/lib/hooks/use-library";
import { addActiveGeneration } from "@/lib/active-generations";
import type { FalModel } from "@/lib/fal-generation";

type AspectRatio = "1:1" | "4:5" | "9:16" | "16:9";

const PHOTOSHOOT_MODELS: FalModel[] = [
  { id: "fal-ai/bytedance/seedream/v4.5/edit",   name: "Seedream 4.5",   tag: "ByteDance · 4K",     logo: "/models/seedance-2.webp",    credits: 5 },
  { id: "fal-ai/bytedance/seedream/v5/lite/edit", name: "Seedream 5 Lite", tag: "ByteDance · 2K",    logo: "/models/seedance-2.webp",    credits: 5 },
  { id: "fal-ai/nano-banana-2/edit",              name: "Nano Banana 2",  tag: "Gemini · 1K",        logo: "/models/nano-banana-2.webp", credits: 5 },
  { id: "openai/gpt-image-2/edit",                name: "GPT Image 2",    tag: "OpenAI · Photoreal", logo: "/models/gpt-image-2.webp",   credits: 3 },
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

// ── Template Modal ───────────────────────────────────────────────

function TemplateModal({
  open, onClose, selected, onSelect, items, categories,
}: {
  open: boolean;
  onClose: () => void;
  selected: string | null;
  onSelect: (id: string) => void;
  items: LibraryItem[];
  categories: { id: string; name: string }[];
}) {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");

  const filtered = items.filter((item) =>
    (catFilter === "all" || item.categoryId === catFilter) &&
    (!search || item.name.toLowerCase().includes(search.toLowerCase()))
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 lg:pl-[256px] lg:pr-3">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 flex w-full max-w-[1120px] h-[720px] rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "#FFFFFF", border: "1px solid #E5E7EB" }}>

        {/* Sidebar */}
        <div className="w-[185px] shrink-0 flex flex-col p-4 gap-0.5 overflow-y-auto" style={{ borderRight: "1px solid #E5E7EB", scrollbarWidth: "none" }}>
          <p className="text-[14px] font-semibold text-[#111111] mb-3">Scene Templates</p>
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
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search templates..."
                className="flex-1 bg-transparent text-[13px] text-[#111111] outline-none" />
            </div>
            <button onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E5E7EB] text-[#6B7280] transition hover:bg-[#F3F4F6]">
              <FontAwesomeIcon icon={faXmark} style={{ fontSize: 14 }} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-5">
            <div className="grid grid-cols-5 gap-3">
              {filtered.map((t) => (
                <button key={t.id} type="button" onClick={() => { onSelect(t.id); onClose(); }}
                  className="relative aspect-square rounded-xl overflow-hidden transition-all"
                  style={{ border: selected === t.id ? "2px solid #2563EB" : "2px solid transparent" }}>
                  <img src={t.imageUrl} alt={t.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 pb-2 pt-6 px-2"
                    style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75), transparent)" }}>
                    <p className="text-[10px] font-semibold text-white truncate">{t.name}</p>
                  </div>
                  {selected === t.id && (
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
  preload("/images/photoshoot-samples/ps-1.avif", { as: "image" });
  preload("/images/photoshoot-samples/ps-2.avif", { as: "image" });
  preload("/images/photoshoot-samples/ps-3.avif", { as: "image" });
  preload("/images/photoshoot-samples/ps-4.avif", { as: "image" });
  preload("/images/photoshoot-samples/ps-5.avif", { as: "image" });

  const productFileRef = useRef<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [productImage, setProductImage] = useState<string | null>(null);
  const [productName, setProductName] = useState<string | null>(null);

  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  useEffect(() => {
    window.dispatchEvent(new CustomEvent(templateModalOpen ? "app:modal-open" : "app:modal-close"));
  }, [templateModalOpen]);

  const [categoryFilter, setCategoryFilter] = useState("all");
  const [customPrompt, setCustomPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1");
  const [modelChoice, setModelChoice] = useState(PHOTOSHOOT_MODELS[0].id);

  const [isWritingPrompt, setIsWritingPrompt] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [genStatus, setGenStatus] = useState<string | null>(null);
  const [finalImageUrl, setFinalImageUrl] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const { items: photoshootTemplates, categories: templateCategories } = usePhotoshootTemplates();
  const selectedTemplateObj = photoshootTemplates.find((t) => t.id === selectedTemplate);

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

  function handleProductFile(file: File) {
    productFileRef.current = file;
    if (productImage) URL.revokeObjectURL(productImage);
    setProductImage(URL.createObjectURL(file));
    setProductName(file.name);
  }

  function removeProduct() {
    if (productImage) URL.revokeObjectURL(productImage);
    setProductImage(null);
    setProductName(null);
    productFileRef.current = null;
  }

  async function handleWritePrompt() {
    if (!customPrompt.trim() || isWritingPrompt) return;
    setIsWritingPrompt(true);
    try {
      const res = await fetch("/api/ai-assist/photoshoot-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ existing: customPrompt.trim() }),
      });
      const data = await res.json() as { prompt?: string; error?: string };
      if (res.ok && data.prompt) setCustomPrompt(data.prompt);
    } catch { /* silent */ } finally { setIsWritingPrompt(false); }
  }

  const hasBackground = !!selectedTemplate || customPrompt.trim().length > 0;
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
    if (selectedTemplate && !selectedTemplate.startsWith("custom-")) {
      fd.append("templateId", selectedTemplate);
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
      addActiveGeneration({ id: data.id, type: "Product Photoshoot", status: "GENERATING_SCENE", thumbnailUrl: productImage });
      // Reset inputs — orb tracks progress
      setIsGenerating(false);
      removeProduct();
      setSelectedTemplate(null);
      setCustomPrompt("");
    } catch {
      setGenerationError("Generation failed. Your credit has been refunded.");
      setIsGenerating(false);
    }
  }

  function reset() {
    removeProduct();
    setIsGenerating(false); setGenerationId(null); setGenStatus(null);
    setFinalImageUrl(null); setGenerationError(null);
  }

  const creditCost = 1;
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center gap-6" style={{ minHeight: "calc(100vh - 80px)" }}>

      {/* ── Generating state ─── */}
      {isGenerating && !finalImageUrl && (
        <div className="flex flex-col items-center gap-6">
          <div className="text-center">
            <p className="text-[22px] font-bold text-[#111111]" style={{ letterSpacing: "-0.02em" }}>
              {genStatus === "GENERATING_SCENE" ? "Compositing your scene" : "Preparing photoshoot"}
            </p>
            <p className="text-[13px] text-[#9CA3AF] mt-1">Usually 20 to 60 seconds</p>
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
              New
            </button>
          </div>
        </div>
      )}

      {/* ── Idle state ─── */}
      {!isGenerating && !finalImageUrl && (<>

        {/* Hero samples fan */}
        <div className="relative flex items-center justify-center flex-shrink-0 gap-3" style={{ height: 200 }}>
          {[
            { src: "/images/photoshoot-samples/ps-1.avif", w: 150, h: 150, rotate: "-6deg", z: 1, opacity: 1 },
            { src: "/images/photoshoot-samples/ps-2.avif", w: 170, h: 170, rotate: "-2deg", z: 2, opacity: 1 },
            { src: "/images/photoshoot-samples/ps-3.avif", w: 190, h: 190, rotate: "0deg",  z: 3, opacity: 1 },
            { src: "/images/photoshoot-samples/ps-4.avif", w: 170, h: 170, rotate: "2deg",  z: 2, opacity: 1 },
            { src: "/images/photoshoot-samples/ps-5.avif", w: 150, h: 150, rotate: "6deg",  z: 1, opacity: 1 },
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
          Turn Products Into{" "}
          <span style={{ background: "linear-gradient(135deg, #2563EB 0%, #06B6D4 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Studio Photos
          </span>
        </h2>

        {/* ── Input card ─── */}
        <div className="w-full flex-shrink-0" style={{ maxWidth: 720 }}>

          <div className="rounded-2xl border bg-white flex overflow-hidden"
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false); }}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); const file = e.dataTransfer.files[0]; if (file && file.type.startsWith("image/")) handleProductFile(file); }}
            style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06)", borderColor: isDragging ? "#2563EB" : "#E5E7EB", outline: isDragging ? "2px dashed #2563EB" : "none", outlineOffset: 2 }}>

            {/* Left: scene prompt */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Top bar: Add file + product thumbnail */}
              <div className="flex items-center justify-between px-4 pt-3 pb-2 gap-3 border-b border-[#F3F4F6]">
                <div className="flex items-center gap-2">
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleProductFile(e.target.files[0])} />
                  {!productImage && (
                    <button type="button" onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-all"
                      style={{ color: "#374151", background: "#F3F4F6", border: "1px solid #D1D5DB" }}>
                      <FontAwesomeIcon icon={faPaperclip} style={{ fontSize: 11 }} />
                      Add file
                    </button>
                  )}
                  {productImage && (
                    <div className="relative rounded-lg overflow-hidden border border-[#E5E7EB] flex-shrink-0"
                      style={{ width: 36, height: 36 }}>
                      <img src={productImage} alt="Product" className="w-full h-full object-cover" />
                      <button type="button" onClick={removeProduct}
                        className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-black/60">
                        <FontAwesomeIcon icon={faXmark} style={{ fontSize: 7, color: "white" }} />
                      </button>
                    </div>
                  )}
                </div>
                <button type="button" onClick={handleWritePrompt}
                  disabled={!customPrompt.trim() || isWritingPrompt}
                  className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold flex-shrink-0 transition-all"
                  style={{
                    background: customPrompt.trim() && !isWritingPrompt ? "rgba(37,99,235,0.07)" : "transparent",
                    color: customPrompt.trim() && !isWritingPrompt ? "#2563EB" : "#D1D5DB",
                    border: "1px solid",
                    borderColor: customPrompt.trim() && !isWritingPrompt ? "rgba(37,99,235,0.18)" : "#F3F4F6",
                    cursor: !customPrompt.trim() || isWritingPrompt ? "not-allowed" : "pointer",
                  }}>
                  {isWritingPrompt
                    ? <FontAwesomeIcon icon={faCircleNotch} className="animate-spin" style={{ fontSize: 10 }} />
                    : <FontAwesomeIcon icon={faWandMagicSparkles} style={{ fontSize: 10 }} />}
                  AI Assist
                </button>
              </div>

              {/* Scene prompt textarea */}
              <div className="flex-1 flex flex-col px-4 pt-3 pb-2 min-h-0">
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Describe the scene for your product..."
                  className="flex-1 w-full bg-transparent border-none outline-none text-[15px] leading-relaxed text-[#111111] placeholder-[#D1D5DB] resize-none"
                  style={{ minHeight: 0 }}
                  maxLength={2000}
                />
                <div className="flex justify-end pt-1">
                  <span className="text-[11px] text-[#D1D5DB]">{customPrompt.length} / 2000</span>
                </div>
              </div>
            </div>

            {/* Right: template picker + generate */}
            <div className="w-[170px] flex-shrink-0 flex flex-col items-center justify-between p-5 gap-4"
              style={{ borderLeft: "1px solid #EFEFEF" }}>

              {/* Template picker — same style as avatar picker */}
              <div className="flex flex-col items-center gap-2 w-full">
                <button type="button" onClick={() => setTemplateModalOpen(true)}
                  className="relative w-full transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{ aspectRatio: "3/4" }}>
                  {selectedTemplateObj ? (
                    <>
                      <div className="w-full h-full rounded-2xl overflow-hidden border-2 border-[#2563EB]">
                        <img src={selectedTemplateObj.imageUrl} alt={selectedTemplateObj.name}
                          className="w-full h-full object-cover" />
                      </div>
                      <button type="button" onClick={(e) => { e.stopPropagation(); setSelectedTemplate(null); }}
                        className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/50 border border-white/30 z-10">
                        <FontAwesomeIcon icon={faXmark} style={{ fontSize: 8, color: "white" }} />
                      </button>
                    </>
                  ) : (
                    <div className="w-full h-full rounded-2xl border-2 border-dashed border-[#D1D5DB] flex flex-col items-center justify-center gap-2 hover:border-[#2563EB] hover:bg-blue-50/40 transition-all bg-[#FAFAFA]">
                      <div className="w-9 h-9 rounded-full bg-[#F3F4F6] flex items-center justify-center">
                        <FontAwesomeIcon icon={faPlus} style={{ fontSize: 14, color: "#9CA3AF" }} />
                      </div>
                      <span className="text-[11px] text-[#9CA3AF] font-medium text-center px-2 leading-tight">Choose template</span>
                    </div>
                  )}
                </button>
                {selectedTemplateObj && (
                  <span className="text-[11px] text-[#9CA3AF] text-center">
                    {selectedTemplateObj.name} · <button type="button" onClick={() => setTemplateModalOpen(true)} className="text-[#2563EB] hover:underline">Change</button>
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
              icon={<img src={PHOTOSHOOT_MODELS.find(m => m.id === modelChoice)?.logo} alt="" className="w-3.5 h-3.5 rounded object-cover" />}
              label="Model  "
              value={modelChoice}
              options={PHOTOSHOOT_MODELS.map(m => ({ value: m.id, label: m.name, tag: m.tag, imgSrc: m.logo }))}
              onChange={setModelChoice}
            />
          </div>

          {generationError && (
            <p className="mt-2 text-[12px] px-4 py-2 rounded-xl bg-red-50 text-red-500 border border-red-100">{generationError}</p>
          )}
        </div>

      </>)}

      <TemplateModal
        open={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        selected={selectedTemplate}
        onSelect={setSelectedTemplate}
        items={photoshootTemplates}
        categories={templateCategories}
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
