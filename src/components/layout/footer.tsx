"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { DigitalPlatBadge } from "@/components/ui/digitalplat-badge";

export function Footer() {
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="mt-20 border-t border-[#e5e5e5] bg-[#000000] py-8 text-xs text-[#e5e5e5] font-mono">
      <div className="mx-auto max-w-5xl px-3 sm:px-6 space-y-6">
        {/* Tmux / Vim Statusline */}
        <div className="border border-[#e5e5e5] bg-[#000000] p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-[#38bdf8] text-[#000000] px-1.5 py-0.5 font-bold">
              [NORMAL]
            </span>
            <span className="text-[#e5e5e5]">jurekdev.qzz.io</span>
            <span>|</span>
            <span className="text-[#38bdf8]">UTF-8</span>
            <span>|</span>
            <span className="text-[#38bdf8]">● NOMINAL</span>
          </div>

          <div className="flex items-center gap-3">
            {currentTime && (
              <span className="text-[#e5e5e5]">TIME: {currentTime} UTC</span>
            )}
            <button
              onClick={scrollToTop}
              className="border border-[#e5e5e5] px-2 py-0.5 text-[#e5e5e5] hover:border-[#38bdf8] hover:text-[#38bdf8] cursor-pointer"
            >
              [^ TOP]
            </button>
          </div>
        </div>

        {/* DigitalPlat Domain Attribution Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <DigitalPlatBadge />

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <a
              href="https://github.com/jurek-zsl"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#38bdf8]"
            >
              [GITHUB ↗]
            </a>
            <a href="mailto:jurek@jurekdev.qzz.io" className="hover:text-[#38bdf8]">
              [EMAIL]
            </a>
            <a href="/feed.xml" target="_blank" className="hover:text-[#38bdf8]">
              [RSS]
            </a>
            <Link href="/sitemap.xml" className="hover:text-[#38bdf8]">
              [SITEMAP]
            </Link>
          </div>
        </div>

        {/* Copyright notice */}
        <div className="text-[11px] text-[#e5e5e5] opacity-70 border-t border-[#e5e5e5]/40 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>(C) {new Date().getFullYear()} JUREK // SYSTEMS, MULTIPLAYER &amp; WEB ENGINEERING</span>
          <span className="text-[#38bdf8]">HOST: jurekdev.qzz.io</span>
        </div>
      </div>
    </footer>
  );
}
