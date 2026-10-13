"use client";

import React, { useState, useMemo, useRef, useCallback } from "react";

export type WindMode = "calm" | "gust" | "still";

interface AsciiBannerProps {
  banner: string;
  windMode?: WindMode;
  className?: string;
  interactive?: boolean;
}

export function AsciiBanner({
  banner,
  windMode = "calm",
  className = "",
  interactive = true,
}: AsciiBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverCol, setHoverCol] = useState<number | null>(null);

  // Slice ASCII banner into vertical columns (blades of grass)
  const { columns, rowsCount, maxCols } = useMemo(() => {
    const rawLines = banner.split("\n");
    // Trim empty start/end lines
    const lines = rawLines.filter((_, idx, arr) => {
      if (idx === 0 && rawLines[0].trim() === "") return false;
      if (idx === arr.length - 1 && rawLines[arr.length - 1].trim() === "") return false;
      return true;
    });

    const rowsCount = lines.length;
    const maxCols = Math.max(...lines.map((l) => l.length), 1);

    const cols: string[][] = [];
    for (let c = 0; c < maxCols; c++) {
      const colChars: string[] = [];
      for (let r = 0; r < rowsCount; r++) {
        colChars.push(lines[r][c] || " ");
      }
      cols.push(colChars);
    }

    return { columns: cols, rowsCount, maxCols };
  }, [banner]);

  // Track cursor position to create a tactile "running hand through grass" brush deflection
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!interactive || !containerRef.current || maxCols === 0) return;
      const rect = containerRef.current.getBoundingClientRect();
      const relX = e.clientX - rect.left;
      const colWidth = rect.width / maxCols;
      if (colWidth <= 0) return;
      const targetCol = Math.floor(relX / colWidth);
      setHoverCol(Math.max(0, Math.min(maxCols - 1, targetCol)));
    },
    [interactive, maxCols]
  );

  const handleMouseLeave = useCallback(() => {
    setHoverCol(null);
  }, []);

  // Determine blade animation class
  const bladeAnimationClass =
    windMode === "calm"
      ? "animate-grass-blade-calm"
      : windMode === "gust"
      ? "animate-grass-blade-gust"
      : "";

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-x-auto py-2 select-none font-mono ${
        windMode !== "still" ? "animate-grass-field" : ""
      } ${className}`}
      aria-label="Jurek ASCII Banner"
    >
      <span className="sr-only">JUREK</span>
      <div
        className="inline-flex flex-row items-end tracking-normal text-[var(--accent,#38bdf8)] text-[10px] sm:text-xs md:text-sm"
        aria-hidden="true"
        style={{
          lineHeight: 1.15,
        }}
      >
        {columns.map((colChars, colIdx) => {
          // Interactive brush deflection when cursor is near this blade
          let brushTransform = "none";
          if (hoverCol !== null && interactive) {
            const dist = colIdx - hoverCol;
            const radius = 6;
            if (Math.abs(dist) <= radius) {
              const factor = Math.cos((Math.abs(dist) / radius) * (Math.PI / 2));
              const dir = dist === 0 ? 0.3 : Math.sign(dist);
              const angle = dir * factor * 2.8;
              const translateX = dir * factor * 3.5;
              brushTransform = `rotate(${angle}deg) translate3d(${translateX}px, -0.5px, 0)`;
            }
          }

          // Staggered horizontal phase wave: each blade lags slightly behind its left neighbor
          const waveDelay = (colIdx * -0.11).toFixed(2);

          return (
            <div
              key={colIdx}
              className="inline-flex flex-col shrink-0 origin-bottom transition-transform duration-300 ease-out"
              style={{
                transform: brushTransform,
                width: "1ch",
              }}
            >
              <div
                className={`inline-flex flex-col origin-bottom ${bladeAnimationClass}`}
                style={{
                  animationDelay: `${waveDelay}s`,
                }}
              >
                {colChars.map((char, rowIdx) => (
                  <span
                    key={rowIdx}
                    className="inline-block whitespace-pre select-none text-center"
                    style={{
                      height: "1.15em",
                      lineHeight: "1.15em",
                    }}
                  >
                    {char}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
