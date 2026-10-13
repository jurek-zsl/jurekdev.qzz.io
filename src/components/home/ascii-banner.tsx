"use client";

import React, { useRef, useEffect, useMemo, useCallback } from "react";

export type WindMode = "calm" | "gust" | "still";

interface AsciiBannerProps {
  banner: string;
  windMode?: WindMode;
  className?: string;
  interactive?: boolean;
}

interface CharNodeInfo {
  el: HTMLSpanElement;
  r: number;
  c: number;
  origChar: string;
  heightFrac: number;
}

/**
 * Multi-stage smooth ASCII glyph wave morphing.
 * High-resolution directional characters cycle smoothly with the wind wave:
 *  - Vertical grass stems: | <-> / <-> ) (blowing right) and | <-> \ <-> ( (swaying left)
 *  - Slanted stalks: / <-> |, \ <-> |
 *  - Continuous 4-stage bar elevation: _ <-> - <-> ~ <-> ^
 *  - Structural elements: : <-> /, ( <-> |, ) <-> |
 * Only the very bottom root row stays 100% anchored for baseline stability.
 * Zero CSS transforms, rotation, or geometric curvature.
 */
function getMorphedChar(origChar: string, heightFrac: number, eff: number): string {
  // Only the bottom root row stays anchored
  if (heightFrac < 0.12) return origChar;

  const totalEff = heightFrac * eff;

  if (origChar === "|") {
    if (totalEff > 0.45) return ")";
    if (totalEff > 0.18) return "/";
    if (totalEff < -0.45) return "(";
    if (totalEff < -0.18) return "\\";
    return "|";
  }
  if (origChar === "/") {
    if (totalEff < -0.4) return "\\";
    if (totalEff < -0.15) return "|";
    if (totalEff > 0.45) return ")";
    return "/";
  }
  if (origChar === "\\") {
    if (totalEff > 0.4) return "/";
    if (totalEff > 0.15) return "|";
    if (totalEff < -0.45) return "(";
    return "\\";
  }
  if (origChar === "_") {
    if (totalEff > 0.48) return "^";
    if (totalEff > 0.28) return "~";
    if (totalEff > 0.14) return "-";
    return "_";
  }
  if (origChar === "-") {
    if (totalEff > 0.38) return "^";
    if (totalEff > 0.18) return "~";
    if (totalEff < -0.18) return "_";
    return "-";
  }
  if (origChar === "~") {
    if (totalEff > 0.35) return "^";
    if (totalEff < -0.2) return "-";
    return "~";
  }
  if (origChar === ":") {
    if (totalEff > 0.22) return "/";
    if (totalEff < -0.22) return "\\";
    return ":";
  }
  if (origChar === "(") {
    if (totalEff > 0.25) return "|";
    return "(";
  }
  if (origChar === ")") {
    if (totalEff < -0.25) return "|";
    return ")";
  }
  if (origChar === "=") {
    if (totalEff > 0.3) return "~";
    return "=";
  }
  return origChar;
}

export function AsciiBanner({
  banner,
  windMode = "calm",
  className = "",
  interactive = true,
}: AsciiBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const charNodesRef = useRef<CharNodeInfo[]>([]);
  const hoverColRef = useRef<number | null>(null);
  const rafIdRef = useRef<number | null>(null);

  // Parse ASCII banner into lines and determine grid dimensions
  const { lines, rowsCount, maxCols } = useMemo(() => {
    const rawLines = banner.split("\n");
    const filtered = rawLines.filter((_, idx, arr) => {
      if (idx === 0 && rawLines[0].trim() === "") return false;
      if (idx === arr.length - 1 && rawLines[arr.length - 1].trim() === "") return false;
      return true;
    });

    const rowsCount = filtered.length;
    const maxCols = Math.max(...filtered.map((l) => l.length), 1);
    return { lines: filtered, rowsCount, maxCols };
  }, [banner]);

  // Track pointer position for tactile "hand through grass" deflection
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!interactive || !containerRef.current || maxCols === 0) return;
      const rect = containerRef.current.getBoundingClientRect();
      const relX = e.clientX - rect.left;
      const colWidth = rect.width / maxCols;
      if (colWidth <= 0) return;
      const targetCol = Math.floor(relX / colWidth);
      hoverColRef.current = Math.max(0, Math.min(maxCols - 1, targetCol));
    },
    [interactive, maxCols]
  );

  const handleMouseLeave = useCallback(() => {
    hoverColRef.current = null;
  }, []);

  // Pure ASCII character animation loop (zero CSS transforms / zero curvature)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (windMode === "still" || prefersReducedMotion) {
      // Reset all characters to still resting symbols
      for (const node of charNodesRef.current) {
        if (node.el.textContent !== node.origChar) {
          node.el.textContent = node.origChar;
        }
      }
      return;
    }

    const startTime = performance.now();
    // Brisk, lively wind speed with rich momentum
    const speedMult = windMode === "gust" ? 2.5 : 1.75;
    const ampMult = windMode === "gust" ? 1.4 : 1.0;

    const tick = (now: number) => {
      const elapsed = ((now - startTime) / 1000) * speedMult;
      const hoverCol = hoverColRef.current;

      for (let i = 0; i < charNodesRef.current.length; i++) {
        const node = charNodesRef.current[i];

        // Primary rolling breeze swell (sweeps smoothly across columns)
        const phase1 = elapsed * 2.2 - node.c * 0.14;
        const wave1 = Math.sin(phase1);

        // Secondary subtle harmonic breeze
        const phase2 = elapsed * 1.15 - node.c * 0.07 + 1.2;
        const wave2 = Math.sin(phase2);

        // Combined wind force
        let eff = ((wave1 * 0.8 + wave2 * 0.35) / 1.15) * ampMult;

        // Interactive "hand brushing through grass" deflection
        if (hoverCol !== null && interactive) {
          const dist = node.c - hoverCol;
          const radius = 8;
          if (Math.abs(dist) <= radius && dist !== 0) {
            const factor = Math.cos((Math.abs(dist) / radius) * (Math.PI / 2));
            const dir = Math.sign(dist);
            eff += dir * factor * 1.1;
          }
        }

        // Pure ASCII symbol update (no DOM element transform/curvature)
        const nextChar = getMorphedChar(node.origChar, node.heightFrac, eff);
        if (node.el.textContent !== nextChar) {
          node.el.textContent = nextChar;
        }
      }

      rafIdRef.current = requestAnimationFrame(tick);
    };

    rafIdRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [windMode, interactive, lines]);

  // Callback to register character DOM elements
  const registerChar = useCallback(
    (el: HTMLSpanElement | null, r: number, c: number, ch: string) => {
      if (!el) return;
      // Gentle linear height gradient: wind propagates deeply down through ~85% of character height
      const heightFrac = Math.pow((rowsCount - 1 - r) / Math.max(rowsCount - 1, 1), 1.05);
      charNodesRef.current.push({
        el,
        r,
        c,
        origChar: ch,
        heightFrac,
      });
    },
    [rowsCount]
  );

  // Clear node references on each new banner layout render
  charNodesRef.current = [];

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-x-auto py-3 select-none font-mono ${className}`}
      aria-label="Jurek ASCII Banner"
    >
      {/* Subtle ambient back glow behind ASCII art */}
      <div
        className="absolute inset-0 pointer-events-none -z-10 overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="w-full h-full opacity-20 dark:opacity-20 light:opacity-0 blur-2xl"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 50%, color-mix(in srgb, var(--accent, #10b981) 70%, transparent) 0%, transparent 75%)",
          }}
        />
      </div>

      <span className="sr-only">JUREK</span>
      <pre
        className="text-[var(--accent,#10b981)] text-[10px] sm:text-xs md:text-sm lg:text-base tracking-normal leading-[1.15] select-none m-0 p-0 font-mono"
        aria-hidden="true"
      >
        {lines.map((line, r) => (
          <div key={r} className="whitespace-pre flex flex-row">
            {line.split("").map((ch, c) => {
              if (ch === " ") {
                return (
                  <span key={c} className="inline-block whitespace-pre" style={{ width: "1ch" }}>
                    {" "}
                  </span>
                );
              }
              return (
                <span
                  key={c}
                  ref={(el) => registerChar(el, r, c, ch)}
                  className="inline-block whitespace-pre select-none"
                  style={{ width: "1ch" }}
                >
                  {ch}
                </span>
              );
            })}
          </div>
        ))}
      </pre>
    </div>
  );
}
