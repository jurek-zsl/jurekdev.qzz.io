import React from "react";

export function DigitalPlatBadge({ className = "" }: { className?: string }) {
  return (
    <a
      href="https://dashboard.digitalplat.org/signup?ref=YVWckicCR0"
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2.5 border border-[#e5e5e5] bg-[#000000] px-3 py-1.5 font-mono text-xs text-[#e5e5e5] transition-all hover:border-[#38bdf8] hover:text-[#38bdf8] cursor-pointer ${className}`}
    >
      <span className="bg-[#38bdf8] text-[#000000] px-1.5 py-0.2 font-bold text-[10px]">
        JUREKDEV
      </span>
      <span>This domain is powered by DigitalPlat</span>
      <span className="text-[#38bdf8] underline underline-offset-2">
        [Free Domain ↗]
      </span>
    </a>
  );
}
