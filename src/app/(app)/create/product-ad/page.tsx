"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faChevronRight,
  faChevronLeft,
  faWandMagicSparkles,
  faMicrophone,
  faPlay,
  faPause,
  faDownload,
  faArrowsRotate,
  faCrop,
  faShareNodes,
  faXmark,
  faPlus,
  faCircleNotch,
  faUpload,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";
import { useProductAdAvatars, useVoices, type LibraryItem, type LibraryCategory, type Voice } from "@/lib/hooks/use-library";

type VoiceGender = "female" | "male";

const aspectChoices: Array<{
  value: "9:16" | "1:1" | "16:9";
  hint: string;
  px: string;
  boxClass: string;
}> = [
  { value: "9:16", hint: "TikTok / Reels", px: "1080x1920", boxClass: "w-4 h-7" },
  { value: "1:1", hint: "Instagram", px: "1080x1080", boxClass: "w-6 h-6" },
  { value: "16:9", hint: "YouTube", px: "1920x1080", boxClass: "w-7 h-4" },
];

const checklistLabels = [
  "Compositing scene",
  "Generating voiceover",
  "Creating video",
  "Syncing lip movements",
  "Finalizing render",
];

export default function ProductAdCreator() {
  // Preserved state
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const [productImage, setProductImage] = useState<string | null>(null);
  const [productName, setProductName] = useState<string>("");
  const [script, setScript] = useState("");
  const [voiceId, setVoiceId] = useState<string>("");
  const [voiceGender, setVoiceGender] = useState<VoiceGender>("female");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [aspectRatio, setAspectRatio] = useState<"9:16" | "1:1" | "16:9">("9:16");
  const [quality, setQuality] = useState<"1080p" | "720p">("1080p");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [generationComplete, setGenerationComplete] = useState(false);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [finalVideoUrl, setFinalVideoUrl] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Wizard state
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Local UI
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const productFileRef = useRef<File | null>(null);

  const { items: dbCharacters } = useProductAdAvatars();
  const characterCategories: LibraryCategory[] = [
    { id: "female", name: "Women", slug: "female" },
    { id: "male", name: "Men", slug: "male" },
  ];
  const [customAvatar, setCustomAvatar] = useState<{ id: string; name: string; imageUrl: string; categoryId: null } | null>(null);
  const characters = customAvatar ? [customAvatar, ...dbCharacters] : dbCharacters;
  const charData = characters.find((c) => c.id === selectedCharacter);
  const filteredCharacters = characters.filter(
    (c) => categoryFilter === "all" || c.categoryId === categoryFilter || c.id === customAvatar?.id,
  );
  const { voices: allVoices } = useVoices();
  const filteredVoices = allVoices.filter((v) => v.gender === voiceGender);

  useEffect(() => {
    if (!voiceId && filteredVoices.length > 0) {
      setVoiceId(filteredVoices[0].voiceId);
    }
  }, [voiceId, filteredVoices]);

  const statusToStep: Record<string, number> = {
    PENDING: 0,
    GENERATING_AUDIO: 1,
    GENERATING_SCENE: 2,
    GENERATING_VIDEO: 3,
    SYNCING_LIPS: 4,
    UPSCALING: 5,
    COMPLETED: 6,
    FAILED: -1,
  };

  // Real polling: every 3s while generating
  useEffect(() => {
    if (!generationId || generationComplete) return;
    let cancelled = false;
    const tick = async () => {
      try {
        const res = await fetch(`/api/generations/${generationId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        const step = statusToStep[data.status] ?? 0;
        setGenerationStep(step);
        if (data.status === "COMPLETED" && data.finalVideoUrl) {
          setFinalVideoUrl(data.finalVideoUrl);
          setGenerationComplete(true);
        } else if (data.status === "FAILED") {
          setGenerationError(data.errorMessage || "Generation failed. Your credits have been refunded.");
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
  }, [generationId, generationComplete, statusToStep]);

  // Auto-advance to step 4 when generation completes
  useEffect(() => {
    if (generationComplete && finalVideoUrl) {
      setCurrentStep(4);
      setIsGenerating(false);
    }
  }, [generationComplete, finalVideoUrl]);

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
    noClick: false,
  });

  const handleGenerate = async () => {
    if (!charData || !productFileRef.current || !script.trim() || !voiceId) return;
    setGenerationError(null);
    setFinalVideoUrl(null);
    setIsGenerating(true);
    setGenerationStep(0);
    setGenerationComplete(false);

    const isCustom = !!customAvatar && customAvatar.id === selectedCharacter;

    const fd = new FormData();
    fd.append("productImage", productFileRef.current);
    if (isCustom) {
      fd.append("isCustomAvatar", "true");
      fd.append("customAvatarUrl", customAvatar.imageUrl);
    } else if (selectedCharacter) {
      fd.append("characterId", selectedCharacter);
    }
    fd.append("script", script);
    fd.append("voiceId", voiceId);
    fd.append(
      "aspectRatio",
      aspectRatio === "9:16" ? "NINE_SIXTEEN" : aspectRatio === "16:9" ? "SIXTEEN_NINE" : "ONE_ONE",
    );
    fd.append("quality", quality === "1080p" ? "HD" : "SD");

    try {
      const res = await fetch("/api/generate/product-ad", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setGenerationError(data?.error || "Generation failed");
        setIsGenerating(false);
        return;
      }
      setGenerationId(data.id);
    } catch {
      setGenerationError("Generation failed. Please try again.");
      setIsGenerating(false);
    }
  };

  const resetGeneration = () => {
    setIsGenerating(false);
    setGenerationStep(0);
    setGenerationComplete(false);
    setSelectedCharacter(null);
    setProductImage(null);
    setProductName("");
    setScript("");
    setGenerationId(null);
    setFinalVideoUrl(null);
    setGenerationError(null);
    productFileRef.current = null;
    setCurrentStep(1);
  };

  const playVoicePreview = (id: string, url: string) => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current = null;
    }
    if (playingVoice === id) {
      setPlayingVoice(null);
      return;
    }
    const audio = new Audio(url);
    previewAudioRef.current = audio;
    setPlayingVoice(id);
    audio.onended = () => setPlayingVoice(null);
    audio.play().catch(() => setPlayingVoice(null));
  };

  const wordCount = useMemo(
    () => script.trim().split(/\s+/).filter(Boolean).length,
    [script]
  );
  const progressPct =
    generationStep <= 0
      ? 12
      : generationStep === 1
      ? 28
      : generationStep === 2
      ? 50
      : generationStep === 3
      ? 72
      : generationStep === 4
      ? 90
      : 100;
  const currentStepLabel =
    checklistLabels[Math.min(Math.max(generationStep, 0), checklistLabels.length - 1)];

  const canAdvanceFromStep1 = !!selectedCharacter && !!voiceId;
  const canAdvanceFromStep2 = script.trim().length > 0 && !!productImage;

  const canAdvance =
    currentStep === 1
      ? canAdvanceFromStep1
      : currentStep === 2
      ? canAdvanceFromStep2
      : false;

  const handleNext = () => {
    if (currentStep === 1 && canAdvance) {
      setCurrentStep(2);
    } else if (currentStep === 2 && canAdvance) {
      setCurrentStep(3);
      handleGenerate();
    }
  };

  const removeProduct = () => {
    setProductImage(null);
    setProductName("");
    productFileRef.current = null;
  };

  return (
    <div className="mx-auto w-full max-w-[1400px]">
      <div className="flex flex-col gap-4">

      {/* Step content */}
      {currentStep === 1 && (
        <Step1
          selectedCharacter={selectedCharacter}
          setSelectedCharacter={setSelectedCharacter}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          filteredCharacters={filteredCharacters}
          characterCategories={characterCategories}
          onCustomAvatarUploaded={(av) => {
            setCustomAvatar(av);
            setSelectedCharacter(av.id);
          }}
          voiceGender={voiceGender}
          setVoiceGender={setVoiceGender}
          voiceId={voiceId}
          setVoiceId={setVoiceId}
          filteredVoices={filteredVoices}
          allVoices={allVoices}
          playingVoice={playingVoice}
          playVoicePreview={playVoicePreview}
        />
      )}

      {currentStep === 2 && (
        <Step2
          script={script}
          setScript={setScript}
          aspectRatio={aspectRatio}
          setAspectRatio={setAspectRatio}
          quality={quality}
          setQuality={setQuality}
          wordCount={wordCount}
          productImage={productImage}
          getRootProps={getRootProps}
          getInputProps={getInputProps}
          isDragActive={isDragActive}
          removeProduct={removeProduct}
        />
      )}

      {currentStep === 3 && (
        <Step3
          generationStep={generationStep}
          progressPct={progressPct}
          currentStepLabel={currentStepLabel}
          generationError={generationError}
          onRetry={() => {
            setGenerationError(null);
            setCurrentStep(2);
          }}
        />
      )}

      {currentStep === 4 && (
        <Step4
          finalVideoUrl={finalVideoUrl}
          charData={charData}
          aspectRatio={aspectRatio}
          quality={quality}
          wordCount={wordCount}
          videoRef={videoRef}
          onReset={resetGeneration}
        />
      )}

      </div>

      {/* Bottom action bar (steps 1 and 2) — shrink-0 sticks at bottom of flex column */}
      {(currentStep === 1 || currentStep === 2) && (
        <div className="sticky bottom-4 z-20 mt-4 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/60 backdrop-blur-md px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_8px_32px_rgba(0,0,0,0.5)]">
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white/60 hover:text-foreground hover:bg-white/5 transition disabled:opacity-30 disabled:cursor-not-allowed"
            onClick={() => setCurrentStep((currentStep - 1) as 1 | 2)}
            disabled={currentStep === 1}
          >
            <FontAwesomeIcon icon={faChevronLeft} style={{ fontSize: 11 }} />
            Back
          </button>
          <button
            type="button"
            className="flex items-center gap-2 px-7 py-2.5 rounded-xl bg-primary text-black ring-1 ring-inset ring-black/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_1px_2px_rgba(0,0,0,0.35)] text-sm font-bold transition-all hover:brightness-105 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={handleNext}
            disabled={!canAdvance}
          >
            {currentStep === 1 ? "Next: Script & Product" : "Generate Product Ad"}
            <FontAwesomeIcon
              icon={currentStep === 1 ? faChevronRight : faWandMagicSparkles}
              style={{ fontSize: 12 }}
            />
          </button>
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────── */
/*  Section header helper                                                 */
/* ────────────────────────────────────────────────────────────────────── */

function SectionHeader({
  icon,
  title,
  subtitle,
}: {
  icon?: typeof faMicrophone;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/5">
      <div className="flex items-center gap-2.5">
        {icon && (
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary">
            <FontAwesomeIcon icon={icon} style={{ fontSize: 12 }} />
          </span>
        )}
        <div>
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          {subtitle && (
            <p className="text-[11px] text-white/45 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────── */
/*  Step 1                                                                */
/* ────────────────────────────────────────────────────────────────────── */

function Step1({
  selectedCharacter,
  setSelectedCharacter,
  categoryFilter,
  setCategoryFilter,
  filteredCharacters,
  characterCategories,
  onCustomAvatarUploaded,
  voiceGender,
  setVoiceGender,
  voiceId,
  setVoiceId,
  filteredVoices,
  allVoices,
  playingVoice,
  playVoicePreview,
}: {
  selectedCharacter: string | null;
  setSelectedCharacter: (id: string) => void;
  categoryFilter: string;
  setCategoryFilter: (c: string) => void;
  filteredCharacters: LibraryItem[];
  characterCategories: LibraryCategory[];
  onCustomAvatarUploaded: (av: { id: string; name: string; imageUrl: string; categoryId: null }) => void;
  voiceGender: VoiceGender;
  setVoiceGender: (g: VoiceGender) => void;
  voiceId: string;
  setVoiceId: (id: string) => void;
  filteredVoices: Voice[];
  allVoices: Voice[];
  playingVoice: string | null;
  playVoicePreview: (id: string, url: string) => void;
}) {
  const [libraryOpen, setLibraryOpen] = useState(false);

  // Ensure selected character is always visible in the small grid
  const visibleCharacters = (() => {
    const first4 = filteredCharacters.slice(0, 4);
    if (!selectedCharacter) return first4;
    const sel = filteredCharacters.find((c) => c.id === selectedCharacter);
    if (!sel) return first4;
    if (first4.some((c) => c.id === selectedCharacter)) return first4;
    return [sel, ...first4.slice(0, 3)];
  })();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Visual Avatar */}
      <section className="lg:col-span-7 rounded-2xl border border-white/10 bg-white/[0.025] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
        <SectionHeader title="Choose Character" />

        <div className="flex flex-wrap gap-1.5 mb-4">
          {[{ id: "all", name: "All" }, ...characterCategories].map((cat) => {
            const active = categoryFilter === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryFilter(cat.id)}
                className={cn(
                  "rounded-full px-3 py-1 text-[11px] font-medium transition border",
                  active
                    ? "bg-primary/15 border-primary/30 text-primary"
                    : "bg-white/5 border-white/10 text-white/55 hover:bg-white/10"
                )}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* Upload your own avatar (always first) */}
          <CustomAvatarTile onUploaded={onCustomAvatarUploaded} />


          {visibleCharacters.map((char) => {
            const isSel = selectedCharacter === char.id;
            return (
              <button
                key={char.id}
                type="button"
                onClick={() => setSelectedCharacter(char.id)}
                className={cn(
                  "relative rounded-2xl overflow-hidden border cursor-pointer aspect-[3/4] group transition",
                  isSel
                    ? "border-primary shadow-[0_0_0_3px_rgba(57,255,20,0.18)]"
                    : "border-white/10 hover:border-white/20"
                )}
              >
                <Image
                  src={char.imageUrl}
                  alt={char.name}
                  fill
                  sizes="220px"
                  className="object-cover object-top transition group-hover:scale-[1.03]"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent p-2.5">
                  <p className="truncate text-left text-[11px] font-medium text-white">
                    {char.name}
                  </p>
                </div>
                {isSel && (
                  <div className="absolute right-2 top-2 flex size-5 items-center justify-center rounded-full bg-primary">
                    <FontAwesomeIcon
                      icon={faCheck}
                      className="text-black"
                      style={{ fontSize: 9 }}
                    />
                  </div>
                )}
              </button>
            );
          })}

          {/* View more — opens library modal */}
          {filteredCharacters.length > 4 && (
            <button
              type="button"
              onClick={() => setLibraryOpen(true)}
              className="flex aspect-[3/4] flex-col items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.05] transition text-center"
            >
              <span className="flex size-9 items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/70">
                <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: 11 }} />
              </span>
              <span className="text-[11px] font-semibold text-white/70 leading-tight px-2">
                View {filteredCharacters.length - 4} more
              </span>
            </button>
          )}
        </div>
      </section>

      {/* Character library modal */}
      {libraryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-6" onClick={() => setLibraryOpen(false)}>
          <div className="w-full max-w-5xl max-h-[85vh] overflow-hidden rounded-3xl border border-white/10 bg-[#0c0c10] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h3 className="text-lg font-bold tracking-tight">Character library</h3>
              <button
                type="button"
                onClick={() => setLibraryOpen(false)}
                className="flex size-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/60 hover:text-foreground hover:bg-white/10 transition"
              >
                <FontAwesomeIcon icon={faXmark} style={{ fontSize: 13 }} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 px-6 py-3 border-b border-white/10">
              {[{ id: "all", name: "All" }, ...characterCategories].map((cat) => {
                const active = categoryFilter === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryFilter(cat.id)}
                    className={cn(
                      "rounded-full px-3 py-1 text-[11px] font-medium transition border",
                      active
                        ? "bg-primary/15 border-primary/30 text-primary"
                        : "bg-white/5 border-white/10 text-white/55 hover:bg-white/10"
                    )}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
            <div className="overflow-y-auto p-6">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                {filteredCharacters.map((char) => {
                  const isSel = selectedCharacter === char.id;
                  return (
                    <button
                      key={char.id}
                      type="button"
                      onClick={() => {
                        setSelectedCharacter(char.id);
                        setLibraryOpen(false);
                      }}
                      className={cn(
                        "relative rounded-2xl overflow-hidden border cursor-pointer aspect-[3/4] group transition",
                        isSel
                          ? "border-primary shadow-[0_0_0_3px_rgba(57,255,20,0.18)]"
                          : "border-white/10 hover:border-white/20"
                      )}
                    >
                      <Image
                        src={char.imageUrl}
                        alt={char.name}
                        fill
                        sizes="200px"
                        className="object-cover object-top transition group-hover:scale-[1.03]"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent p-2">
                        <p className="truncate text-left text-[11px] font-medium text-white">{char.name}</p>
                      </div>
                      {isSel && (
                        <div className="absolute right-2 top-2 flex size-5 items-center justify-center rounded-full bg-primary">
                          <FontAwesomeIcon icon={faCheck} className="text-black" style={{ fontSize: 9 }} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Voice Persona */}
      <section className="lg:col-span-5 rounded-2xl border border-white/10 bg-white/[0.025] p-5 flex flex-col shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
        <SectionHeader icon={faMicrophone} title="Choose Voice" />

        <div className="flex justify-start mb-4">
          <div className="inline-flex p-0.5 rounded-full bg-white/5 border border-white/10">
            {(["female", "male"] as const).map((g) => {
              const active = voiceGender === g;
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => {
                    setVoiceGender(g);
                    const first = allVoices.find((v) => v.gender === g);
                    if (first) setVoiceId(first.voiceId);
                  }}
                  className={cn(
                    "capitalize transition",
                    active
                      ? "bg-primary text-black rounded-full px-4 py-1 text-xs font-bold"
                      : "text-white/60 px-4 py-1 text-xs hover:text-foreground"
                  )}
                >
                  {g}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-2 overflow-y-auto pr-1">
          {filteredVoices.map((v) => {
            const isSel = voiceId === v.voiceId;
            const isPlay = playingVoice === v.voiceId;
            return (
              <div
                key={v.id}
                onClick={() => setVoiceId(v.voiceId)}
                className={cn(
                  "flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition",
                  isSel
                    ? "border-primary bg-primary/[0.06]"
                    : "border-white/10 bg-white/[0.02] hover:border-white/20"
                )}
              >
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg border",
                    isSel
                      ? "bg-primary/10 border-primary/30 text-primary"
                      : "bg-white/5 border-white/10 text-white/60"
                  )}
                >
                  <FontAwesomeIcon icon={faMicrophone} style={{ fontSize: 13 }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-foreground">
                    {v.name}
                  </p>
                  <p className="truncate text-[11px] text-white/45">
                    {v.descriptor}
                  </p>
                </div>
                {isPlay && <AudioBars />}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setVoiceId(v.voiceId);
                    playVoicePreview(v.voiceId, v.previewUrl);
                  }}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg border transition",
                    isPlay
                      ? "border-primary bg-primary text-black hover:brightness-110"
                      : "border-white/10 bg-white/5 text-white/60 hover:text-foreground hover:bg-white/10",
                  )}
                  aria-label={isPlay ? "Pause voice" : "Play voice preview"}
                >
                  <FontAwesomeIcon
                    icon={isPlay ? faPause : faPlay}
                    style={{ fontSize: 11 }}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────── */
/*  Step 2                                                                */
/* ────────────────────────────────────────────────────────────────────── */

type DropzoneRootProps = ReturnType<ReturnType<typeof useDropzone>["getRootProps"]>;
type DropzoneInputProps = ReturnType<ReturnType<typeof useDropzone>["getInputProps"]>;

function Step2({
  script,
  setScript,
  aspectRatio,
  setAspectRatio,
  quality,
  setQuality,
  wordCount,
  productImage,
  getRootProps,
  getInputProps,
  isDragActive,
  removeProduct,
}: {
  script: string;
  setScript: (s: string) => void;
  aspectRatio: "9:16" | "1:1" | "16:9";
  setAspectRatio: (a: "9:16" | "1:1" | "16:9") => void;
  quality: "1080p" | "720p";
  setQuality: (q: "1080p" | "720p") => void;
  wordCount: number;
  productImage: string | null;
  getRootProps: () => DropzoneRootProps;
  getInputProps: () => DropzoneInputProps;
  isDragActive: boolean;
  removeProduct: () => void;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:items-start">
      {/* Script editor */}
      <div className="lg:col-span-8 flex flex-col gap-4">
        <ScriptEditor script={script} setScript={setScript} height={460} />

        <div className="flex items-center gap-2 px-1 text-[11px] text-white/55">
          <span className="h-1.5 w-1.5 rounded-full bg-primary/80" />
          <span>{wordCount} words</span>
        </div>
      </div>

      {/* Right column: Product Image + Output Configuration */}
      <aside className="lg:col-span-4 flex flex-col gap-4">
        {/* Product image card */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/5">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Product image</h2>
              <p className="text-[11px] text-white/45 mt-0.5">Upload your product photo</p>
            </div>
          </div>

          {!productImage ? (
            <div {...getRootProps()} className={cn(
              "rounded-2xl border-2 border-dashed cursor-pointer transition flex flex-col items-center justify-center gap-3 aspect-[2/1] text-center p-4",
              isDragActive ? "border-primary bg-primary/5" : "border-white/15 bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.04]"
            )}>
              <input {...getInputProps()} />
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 via-violet/20 to-amber/20 text-primary">
                <FontAwesomeIcon icon={faUpload} style={{ fontSize: 18 }} />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">{isDragActive ? "Drop here" : "Drop product image or click to upload"}</p>
                <p className="mt-1 text-[11px] text-white/45">PNG, JPG, WEBP up to 10MB</p>
              </div>
            </div>
          ) : (
            <div className="relative rounded-2xl border border-primary/30 bg-primary/[0.04] overflow-hidden aspect-[2/1]">
              <Image src={productImage} alt="Product" fill className="object-contain p-3" sizes="400px" />
              <button
                type="button"
                onClick={removeProduct}
                className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-lg bg-black/60 backdrop-blur text-white hover:bg-destructive transition"
                aria-label="Remove product"
              >
                <FontAwesomeIcon icon={faTrash} style={{ fontSize: 11 }} />
              </button>
            </div>
          )}
        </div>

        {/* Output Configuration */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 flex flex-col shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
        <SectionHeader title="Output Configuration" />

        <div className="space-y-4">
          {/* Aspect Ratio */}
          <div className="flex flex-col gap-2.5">
            <label className="text-[10px] uppercase tracking-widest text-white/40 flex items-center gap-1.5">
              <FontAwesomeIcon icon={faCrop} style={{ fontSize: 10 }} />
              Aspect Ratio
            </label>
            <div className="grid grid-cols-3 gap-2">
              {aspectChoices.map((a) => {
                const isSel = aspectRatio === a.value;
                return (
                  <button
                    key={a.value}
                    type="button"
                    onClick={() => setAspectRatio(a.value)}
                    className={cn(
                      "rounded-xl border p-3 flex flex-col items-center gap-1.5 transition",
                      isSel
                        ? "border-primary bg-primary/[0.06] text-primary"
                        : "border-white/10 bg-white/[0.03] text-white/60 hover:border-white/20"
                    )}
                  >
                    <span
                      className={cn(
                        "rounded-sm border",
                        a.boxClass,
                        isSel ? "border-primary" : "border-white/40"
                      )}
                    />
                    <span className="text-[12px] font-semibold">{a.value}</span>
                    <span className="text-[9px] text-white/40 leading-tight">
                      {a.px.replace("x", "×")}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Video Quality */}
          <div className="flex flex-col gap-2.5">
            <label className="text-[10px] uppercase tracking-widest text-white/40">
              Video Quality
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(["1080p", "720p"] as const).map((q) => {
                const active = quality === q;
                return (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setQuality(q)}
                    className={cn(
                      "rounded-xl border px-3 py-2.5 text-center transition",
                      active
                        ? "border-primary/40 bg-primary/[0.08] text-primary"
                        : "border-white/10 bg-white/[0.03] text-white/60 hover:border-white/20 hover:text-foreground"
                    )}
                  >
                    <div className="text-[13px] font-semibold">
                      {q === "1080p" ? "1080p" : "720p"}
                    </div>
                    <div className={cn("text-[10px] mt-0.5", active ? "text-primary/70" : "text-white/40")}>
                      {q === "1080p" ? "HD" : "Standard"}
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-white/55">
              This generation will use{" "}
              <span className="text-primary font-semibold">
                {quality === "1080p" ? 25 : 20}
              </span>{" "}
              credits
            </p>
          </div>

        </div>
        </div>
      </aside>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────── */
/*  Step 3                                                                */
/* ────────────────────────────────────────────────────────────────────── */

function Step3({
  generationStep,
  progressPct,
  currentStepLabel,
  generationError,
  onRetry,
}: {
  generationStep: number;
  progressPct: number;
  currentStepLabel: string;
  generationError: string | null;
  onRetry: () => void;
}) {
  if (generationError) {
    return (
      <div className="max-w-md mx-auto py-12">
        <div className="rounded-2xl border border-destructive/30 bg-destructive/[0.06] p-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/15 border border-destructive/30">
            <FontAwesomeIcon
              icon={faXmark}
              className="text-destructive"
              style={{ fontSize: 22 }}
            />
          </div>
          <h2 className="mt-5 text-xl font-bold text-foreground">
            Generation failed
          </h2>
          <p className="mt-2 text-sm text-white/60">{generationError}</p>
          <p className="mt-1 text-[11px] text-primary">
            Your credits have been refunded
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-6 rounded-xl bg-primary text-black ring-1 ring-inset ring-black/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_1px_2px_rgba(0,0,0,0.35)] px-6 py-2.5 text-sm font-bold transition hover:brightness-105"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-6 text-center">
      {/* Polished spinner */}
      <div className="relative size-16 mx-auto">
        <div className="absolute inset-0 rounded-full border-2 border-white/10" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary border-r-primary animate-spin" />
        <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-primary/60 animate-spin-reverse" />
        <div className="absolute inset-0 flex items-center justify-center">
          <FontAwesomeIcon
            icon={faWandMagicSparkles}
            className="text-primary"
            style={{ fontSize: 16 }}
          />
        </div>
      </div>

      <h2 className="text-lg font-bold mt-5 text-foreground">
        Generating product ad
      </h2>

      {/* Progress bar */}
      <div className="mt-6">
        <div className="h-1 rounded-full bg-white/[0.08] overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary via-primary to-primary/70 transition-all duration-700"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="mt-1.5 flex justify-between text-[10px]">
          <span className="text-white/60 font-medium">{currentStepLabel}</span>
          <span className="text-white/40">{progressPct}%</span>
        </div>
      </div>

      {/* Checklist */}
      <div className="mt-5 text-left space-y-1.5">
        {checklistLabels.map((label, i) => {
          const done = i < generationStep;
          const active = i === generationStep;
          return (
            <div
              key={label}
              className={cn(
                "flex items-center gap-2.5 rounded-lg border px-3 py-2 transition",
                done && "border-primary/30 bg-primary/[0.04] text-foreground",
                active && "border-primary/40 bg-primary/[0.08] text-foreground",
                !done &&
                  !active &&
                  "border-white/[0.08] bg-white/[0.02] text-white/35"
              )}
            >
              <span
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold",
                  done && "bg-primary text-black",
                  active &&
                    "border border-primary text-primary animate-pulse",
                  !done && !active && "border border-white/10 text-white/40"
                )}
              >
                {done ? (
                  <FontAwesomeIcon icon={faCheck} style={{ fontSize: 8 }} />
                ) : (
                  i + 1
                )}
              </span>
              <span className="text-xs">{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────── */
/*  Step 4                                                                */
/* ────────────────────────────────────────────────────────────────────── */

function Step4({
  finalVideoUrl,
  charData,
  aspectRatio,
  quality,
  wordCount,
  videoRef,
  onReset,
}: {
  finalVideoUrl: string | null;
  charData: { id: string; name: string; imageUrl: string } | undefined;
  aspectRatio: "9:16" | "1:1" | "16:9";
  quality: "1080p" | "720p";
  wordCount: number;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onReset: () => void;
}) {
  const stageAspectClass =
    aspectRatio === "16:9"
      ? "aspect-video w-full"
      : aspectRatio === "1:1"
      ? "aspect-square max-h-[480px] max-w-[480px] w-full mx-auto"
      : "aspect-[9/16] max-h-[480px] max-w-[270px] w-full mx-auto";

  const isPortrait = aspectRatio === "9:16";

  const durationSec = Math.max(1, Math.round((wordCount / 160) * 60));
  const mm = String(Math.floor(durationSec / 60)).padStart(2, "0");
  const ss = String(durationSec % 60).padStart(2, "0");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* Video player */}
      <div className="lg:col-span-8 flex flex-col gap-3">
        <div className="relative rounded-2xl border border-white/10 overflow-hidden bg-black shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
          <div className="absolute top-3 left-3 z-10">
            <span className="inline-flex items-center gap-2 rounded-full bg-black/60 backdrop-blur border border-white/10 px-3 py-1 text-[10px] font-mono text-white/70">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Final_Render.mp4
            </span>
          </div>
          {finalVideoUrl ? (
            <video
              ref={videoRef}
              src={finalVideoUrl}
              autoPlay
              loop
              muted
              playsInline
              controls
              poster={charData?.imageUrl}
              className={cn(
                "w-full object-cover bg-black",
                stageAspectClass,
                isPortrait && "mx-auto"
              )}
            />
          ) : (
            <div
              className={cn(
                "w-full bg-black",
                stageAspectClass,
                isPortrait && "mx-auto"
              )}
            />
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {finalVideoUrl && (
            <a
              href={finalVideoUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-primary text-black ring-1 ring-inset ring-black/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_1px_2px_rgba(0,0,0,0.35)] px-5 py-2.5 text-sm font-bold transition hover:brightness-105 flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faDownload} style={{ fontSize: 12 }} />
              Download
            </a>
          )}
          <button
            type="button"
            className="rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] text-white/70 hover:text-foreground px-5 py-2.5 text-sm font-semibold transition flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faShareNodes} style={{ fontSize: 12 }} />
            Share
          </button>
          <button
            type="button"
            onClick={onReset}
            className="rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] text-white/70 hover:text-foreground px-5 py-2.5 text-sm font-semibold transition flex items-center gap-2"
          >
            <FontAwesomeIcon icon={faArrowsRotate} style={{ fontSize: 12 }} />
            Generate another
          </button>
        </div>
      </div>

      {/* Side meta panel */}
      <aside className="lg:col-span-4 flex flex-col gap-5">
        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            Generation details
          </h3>
          <dl>
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <dt className="text-[12px] text-white/45">Resolution</dt>
              <dd>
                <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                  {quality}
                </span>
              </dd>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <dt className="text-[12px] text-white/45">Aspect</dt>
              <dd className="text-[12px] font-medium text-foreground">
                {aspectRatio}
              </dd>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <dt className="text-[12px] text-white/45">Duration</dt>
              <dd className="text-[12px] font-medium text-foreground">
                {mm}:{ss}
              </dd>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/5">
              <dt className="text-[12px] text-white/45">Format</dt>
              <dd className="text-[12px] font-medium text-foreground">
                MP4 / H.264
              </dd>
            </div>
            <div className="flex items-center justify-between py-2 last:border-0">
              <dt className="text-[12px] text-white/45">AI Model</dt>
              <dd className="text-[12px] font-medium text-foreground">
                Product Gen v4.2
              </dd>
            </div>
          </dl>
        </div>

      </aside>
    </div>
  );
}

function CustomAvatarTile({
  onUploaded,
}: {
  onUploaded: (av: { id: string; name: string; imageUrl: string; categoryId: null }) => void;
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
        name: data.name || "Custom Avatar",
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
    <label className="relative flex aspect-[3/4] cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/15 bg-white/[0.02] hover:border-primary/40 hover:bg-primary/[0.03] transition text-center">
      <input
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleFile}
        disabled={uploading}
      />
      <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 border border-primary/30 text-primary">
        <FontAwesomeIcon icon={uploading ? faCircleNotch : faPlus} className={uploading ? "animate-spin" : ""} style={{ fontSize: 12 }} />
      </span>
      <span className="text-[11px] font-semibold text-white/70 leading-tight px-2">
        {uploading ? "Uploading..." : <>Upload your<br />avatar</>}
      </span>
    </label>
  );
}

function ScriptEditor({
  script,
  setScript,
  height = 300,
}: {
  script: string;
  setScript: (s: string) => void;
  height?: number;
}) {
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<{ kind: "info" | "error"; msg: string } | null>(null);

  function showNotice(kind: "info" | "error", msg: string) {
    setNotice({ kind, msg });
    setTimeout(() => setNotice(null), 4000);
  }

  async function handleAssist() {
    if (!script.trim()) {
      showNotice("info", "Write a short idea first, then click AI Assist to expand it");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/ai-assist/script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ existingScript: script }),
      });
      const data = await res.json();
      if (!res.ok || !data?.script) {
        showNotice("error", "AI Assist failed, please try again");
        return;
      }
      setScript(data.script);
    } catch {
      showNotice("error", "AI Assist failed, please try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="group relative rounded-2xl border border-white/10 bg-white/[0.025] flex flex-col overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
      style={{ height }}
    >
      <div className="px-5 py-3 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-primary/80">
            Script Content
          </h2>
        </div>
        <button
          type="button"
          onClick={handleAssist}
          disabled={loading}
          className="rounded-lg bg-primary/10 border border-primary/25 text-primary px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition hover:bg-primary/15 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <FontAwesomeIcon
            icon={loading ? faCircleNotch : faWandMagicSparkles}
            className={loading ? "animate-spin" : ""}
            style={{ fontSize: 11 }}
          />
          {loading ? "Writing..." : "AI Assist"}
        </button>
      </div>
      {notice && (
        <div
          className={cn(
            "px-5 py-2 text-[11px] border-b border-white/5",
            notice.kind === "error"
              ? "bg-destructive/10 text-destructive"
              : "bg-primary/10 text-primary",
          )}
        >
          {notice.msg}
        </div>
      )}
      <textarea
        value={script}
        onChange={(e) => setScript(e.target.value)}
        placeholder={
          "Stop scrolling, this changed how I work.\n\nI used to spend hours on something so simple.\n\nThen I tried this, and now it takes minutes."
        }
        className="flex-1 px-5 py-4 bg-transparent border-0 outline-none resize-none text-[14px] leading-relaxed text-foreground placeholder:text-white/25"
      />
      <ScriptMeter script={script} />
    </div>
  );
}

function ScriptMeter({ script }: { script: string }) {
  const words = script.trim() ? script.trim().split(/\s+/).length : 0;
  const over = words > 42;
  return (
    <div className="px-5 py-2 border-t border-white/5 flex items-center justify-between text-[11px]">
      <span className="text-white/50">
        Keep it under ~42 words for a 15s video
      </span>
      <span className={cn("font-mono tabular-nums", over ? "text-amber" : "text-white/60")}>
        {words}/42 words
      </span>
    </div>
  );
}

function AudioBars() {
  return (
    <div className="flex items-end gap-[3px] h-5" aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className="w-[3px] rounded-full bg-primary animate-audio-bar"
          style={{
            animationDelay: `${i * 0.15}s`,
            animationDuration: "0.9s",
          }}
        />
      ))}
    </div>
  );
}
