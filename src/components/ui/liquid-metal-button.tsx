"use client";

import { liquidMetalFragmentShader, ShaderMount } from "@paper-design/shaders";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";

interface LiquidMetalButtonProps {
  label?: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  width?: number;
  height?: number;
}

export function LiquidMetalButton({
  label = "Get Started",
  onClick,
  disabled = false,
  width = 300,
  height = 48,
}: LiquidMetalButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);
  const shaderRef = useRef<HTMLDivElement>(null);
  const shaderMount = useRef<any>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const rippleId = useRef(0);

  const innerWidth = width - 4;
  const innerHeight = height - 4;

  useEffect(() => {
    const styleId = "shader-canvas-style";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        .shader-container canvas {
          width: 100% !important;
          height: 100% !important;
          display: block !important;
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          border-radius: 100px !important;
        }
        @keyframes ripple-anim {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 0.6; }
          100% { transform: translate(-50%, -50%) scale(4); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }

    const loadShader = async () => {
      try {
        if (shaderRef.current) {
          if (shaderMount.current?.destroy) shaderMount.current.destroy();
          shaderMount.current = new ShaderMount(
            shaderRef.current,
            liquidMetalFragmentShader,
            { u_repetition: 3, u_softness: 0.4, u_shiftRed: 0.5, u_shiftBlue: 0.5, u_distortion: 0.1, u_contour: 0.1, u_angle: 45, u_scale: 6, u_shape: 1, u_offsetX: 0.1, u_offsetY: -0.1 },
            undefined,
            0.8,
          );
        }
      } catch (error) {
        console.error("Failed to load shader:", error);
      }
    };

    loadShader();
    return () => { if (shaderMount.current?.destroy) { shaderMount.current.destroy(); shaderMount.current = null; } };
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (shaderMount.current?.setSpeed) {
      shaderMount.current.setSpeed(2.4);
      setTimeout(() => { shaderMount.current?.setSpeed?.(isHovered ? 1 : 0.6); }, 300);
    }
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const ripple = { x: e.clientX - rect.left, y: e.clientY - rect.top, id: rippleId.current++ };
      setRipples((prev) => [...prev, ripple]);
      setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== ripple.id)), 600);
    }
    onClick?.();
  };

  return (
    <div className={`relative inline-block ${disabled ? "opacity-40 pointer-events-none" : ""}`} style={{ perspective: "1000px" }}>
      <div style={{ position: "relative", width, height, transformStyle: "preserve-3d" }}>
        {/* Label */}
        <div style={{ position: "absolute", top: 0, left: 0, width, height, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transform: "translateZ(20px)", zIndex: 30, pointerEvents: "none" }}>
          <span style={{ fontSize: 14, color: "#FAFAFA", fontWeight: 600, textShadow: "0px 1px 3px rgba(0,0,0,0.8)", whiteSpace: "nowrap", letterSpacing: "0.02em" }}>{label}</span>
        </div>

        {/* Inner dark pill */}
        <div style={{ position: "absolute", top: 0, left: 0, width, height, transform: `translateZ(10px) ${isPressed ? "translateY(1px) scale(0.98)" : "scale(1)"}`, zIndex: 20, transition: "transform 0.15s ease" }}>
          <div style={{ width: innerWidth, height: innerHeight, margin: 2, borderRadius: 100, background: "linear-gradient(180deg, #202020 0%, #000 100%)", boxShadow: isPressed ? "inset 0 2px 4px rgba(0,0,0,0.4)" : "none" }} />
        </div>

        {/* Shader border */}
        <div style={{ position: "absolute", top: 0, left: 0, width, height, transform: `translateZ(0) ${isPressed ? "translateY(1px) scale(0.98)" : "scale(1)"}`, zIndex: 10, transition: "transform 0.15s ease" }}>
          <div style={{ height, width, borderRadius: 100, boxShadow: isHovered ? "0 0 0 1px rgba(0,0,0,0.4), 0 8px 5px rgba(0,0,0,0.1)" : "0 0 0 1px rgba(0,0,0,0.3), 0 9px 9px rgba(0,0,0,0.12)" }}>
            <div ref={shaderRef} className="shader-container" style={{ borderRadius: 100, overflow: "hidden", position: "relative", width, height }} />
          </div>
        </div>

        {/* Hit area */}
        <button
          ref={buttonRef}
          onClick={handleClick}
          onMouseEnter={() => { setIsHovered(true); shaderMount.current?.setSpeed?.(1); }}
          onMouseLeave={() => { setIsHovered(false); setIsPressed(false); shaderMount.current?.setSpeed?.(0.6); }}
          onMouseDown={() => setIsPressed(true)}
          onMouseUp={() => setIsPressed(false)}
          disabled={disabled}
          style={{ position: "absolute", top: 0, left: 0, width, height, background: "transparent", border: "none", cursor: disabled ? "not-allowed" : "pointer", outline: "none", zIndex: 40, transform: "translateZ(25px)", overflow: "hidden", borderRadius: 100 }}
          aria-label={label}
        >
          {ripples.map((r) => (
            <span key={r.id} style={{ position: "absolute", left: r.x, top: r.y, width: 20, height: 20, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)", pointerEvents: "none", animation: "ripple-anim 0.6s ease-out" }} />
          ))}
        </button>
      </div>
    </div>
  );
}
