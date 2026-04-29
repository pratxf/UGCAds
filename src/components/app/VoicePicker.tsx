"use client";

import { useRef, useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faPause, faCheck } from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";
import { voices, type VoiceGender } from "@/lib/data/voices";

interface VoicePickerProps {
  voiceId: string;
  onChange: (voiceId: string) => void;
  gender: VoiceGender;
  onGenderChange: (gender: VoiceGender) => void;
}

export default function VoicePicker({ voiceId, onChange, gender, onGenderChange }: VoicePickerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const filtered = voices.filter((v) => v.gender === gender);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  const handlePreview = (e: React.MouseEvent, url: string, id: string) => {
    e.stopPropagation();
    if (playingId === id) {
      audioRef.current?.pause();
      audioRef.current = null;
      setPlayingId(null);
      return;
    }
    audioRef.current?.pause();
    const audio = new Audio(url);
    audioRef.current = audio;
    setPlayingId(id);
    audio.play().catch(() => setPlayingId(null));
    audio.onended = () => setPlayingId(null);
    audio.onerror = () => setPlayingId(null);
  };

  return (
    <div className="bento-highlight p-4">
      <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60 mb-3 block">03 · Voice</span>

      {/* Gender filter tabs */}
      <div className="flex gap-1.5 mb-3">
        {(["female", "male"] as const).map((g) => (
          <button
            key={g}
            onClick={() => onGenderChange(g)}
            className={cn(
              "flex-1 rounded-lg py-1.5 text-[11px] font-semibold capitalize transition-all",
              gender === g
                ? "bg-foreground text-background"
                : "bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10"
            )}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Voice list */}
      <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1">
        {filtered.map((v) => {
          const isSelected = voiceId === v.id;
          const isPlaying = playingId === v.id;
          return (
            <button
              key={v.id}
              onClick={() => onChange(v.id)}
              className={cn(
                "w-full flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all border text-left",
                isSelected
                  ? "border-primary/30 bg-primary/[0.06]"
                  : "border-[#2A2A35] bg-[#0E0E14] hover:bg-[#121218] hover:border-[#35354A]"
              )}
            >
              {/* Radio */}
              <div className={cn(
                "size-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                isSelected ? "border-primary bg-primary" : "border-[#3A3A4A]"
              )}>
                {isSelected && <FontAwesomeIcon icon={faCheck} className="text-primary-foreground" style={{ fontSize: 8 }} />}
              </div>

              {/* Name + desc */}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-foreground truncate">{v.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{v.description}</p>
              </div>

              {/* Preview */}
              <button
                type="button"
                onClick={(e) => handlePreview(e, v.previewUrl, v.id)}
                className={cn(
                  "size-7 shrink-0 rounded-lg flex items-center justify-center transition-all",
                  isPlaying
                    ? "bg-primary text-primary-foreground"
                    : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
                )}
                aria-label={isPlaying ? "Pause" : "Preview"}
              >
                <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} className={isPlaying ? "" : "ml-0.5"} style={{ fontSize: 11 }} />
              </button>
            </button>
          );
        })}
      </div>
    </div>
  );
}
