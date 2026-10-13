"use client";

import React, { useRef, useEffect, useState, useMemo, useCallback } from "react";

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

// Glyph morphing dictionaries when wind bends symbols
const MORPH_RIGHT: Record<string, string> = {
  "|": "/",
  "_": "~",
  "-": "~",
};

const MORPH_LEFT: Record<string, string> = {
  "|": "\\",
  "_": "-",
  "~": "-",
};

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

  // Real ASCII character-level physics loop
  useEffect(() => {
    if (typeof window === "undefined") return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (windMode === "still" || prefersReducedMotion) {
      // Reset all characters to still resting positions
      for (const node of charNodesRef.current) {
        node.el.style.transform = "none";
        node.el.textContent = node.origChar;
      }
      return;
    }

    let startTime = performance.now();
    const speedMult = windMode === "gust" ? 1.45 : 0.95;
    const ampMult = windMode === "gust" ? 1.4 : 1.0;

    const tick = (now: number) => {
      const elapsed = ((now - startTime) / 1000) * speedMult;
      const hoverCol = hoverColRef.current;

      for (let i = 0; i < charNodesRef.current.length; i++) {
        const node = charNodesRef.current[i];
        const h = node.heightFrac;

        // Primary rolling breeze swell (long wavelength ~32 cols)
        const phase1 = elapsed * 1.8 - node.c * 0.082;
        const wave1 = Math.sin(phase1);

        // Secondary harmonic breeze (~55 cols)
        const phase2 = elapsed * 0.95 - node.c * 0.042;
        const wave2 = Math.sin(phase2);

        // Combined horizontal wind sway (tip deflects most, ground is anchored)
        let dx = h * (wave1 * 3.4 + wave2 * 1.5) * ampMult;

        // Organic Pythagorean stem arc: tips dip slightly downward as they lean
        let dy = h * (Math.abs(wave1) * 0.75 + Math.abs(wave2) * 0.3) * ampMult;

        // Subtle individual character micro-rotation
        let rot = h * (wave1 * 2.2 + wave2 * 0.8) * ampMult;

        // Interactive "hand brushing through grass" parting deflection
        if (hoverCol !== null && interactive) {
          const dist = node.c - hoverCol;
          const radius = 7;
          if (Math.abs(dist) <= radius) {
            const factor = Math.cos((Math.abs(dist) / radius) * (Math.PI / 2));
            const dir = dist === 0 ? 0.3 : Math.sign(dist);
            dx += h * dir * factor * 4.2;
            dy += h * factor * 1.2;
            rot += h * dir * factor * 3.0;
          }
        }

        // Apply hardware-accelerated transform to the individual ASCII character
        node.el.style.transform = `translate3d(${dx.toFixed(2)}px, ${dy.toFixed(
          2
        )}px, 0) rotate(${rot.toFixed(1)}deg)`;

        // Real ASCII glyph morphing: symbols flutter and lean with the wind crest
        if (h > 0.35 && Math.abs(wave1) > 0.82) {
          if (wave1 > 0 && MORPH_RIGHT[node.origChar]) {
            node.el.textContent = MORPH_RIGHT[node.origChar];
          } else if (wave1 < 0 && MORPH_LEFT[node.origChar]) {
            node.el.textContent = MORPH_LEFT[node.origChar];
          } else {
            node.el.textContent = node.origChar;
          }
        } else if (node.el.textContent !== node.origChar) {
          node.el.textContent = node.origChar;
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

  // Callback to register character DOM elements into the physics array
  const registerChar = useCallback(
    (el: HTMLSpanElement | null, r: number, c: number, ch: string) => {
      if (!el) return;
      const heightFrac = Math.pow((rowsCount - 1 - r) / Math.max(rowsCount - 1, 1), 1.35);
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
      <span className="sr-only">JUREK</span>
      <pre
        className="text-[var(--accent,#10b981)] text-[10px] sm:text-xs md:text-sm tracking-normal leading-[1.15] select-none m-0 p-0 font-mono"
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
                  className="inline-block whitespace-pre select-none origin-bottom will-change-transform"
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
