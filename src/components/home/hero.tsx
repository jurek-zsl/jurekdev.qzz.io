"use client";

import React, { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { SpotlightButton } from "../ui/spotlight-button";

const stripNewlines = (str: string) => str.replace(/^\n+|\n+$/g, "");

const BANNERS = {
  slant: stripNewlines(`
       __  __  __   ____    ______ __ __
      / / / / / /  / __ \\  / ____// //_/
 __  / / / / / /  / /_/ / / __/  / ,<   
/ /_/ / / /_/ /  / _, _/ / /___ / /| |  
\\____/  \\____/  /_/ |_| /_____//_/ |_|  
`),
  blocks: stripNewlines(`
     ██  ██    ██  ██████   ███████  ██   ██
     ██  ██    ██  ██   ██  ██       ██  ██ 
     ██  ██    ██  ██████   █████    █████  
██   ██  ██    ██  ██   ██  ██       ██  ██ 
 █████    ██████   ██   ██  ███████  ██   ██
`),
  doom: stripNewlines(`
   ___ _   _ _____  _____ _   __
  |_  | | | | ___ \\  ___| | / / 
    | | | | | |_/ / |__ | |/ /  
    | | | | |    /|  __||    \\  
/\\__/ / |_| | |\\ \\| |___| |\\  \\ 
\\____/ \\___/\\_| \\_\\____/\\_| \\_/ 
`),
  standard: stripNewlines(`
     _ _   _  ____   _____ _  __
    | | | | | |  _ \\ | ____| |/ /
 _  | | | | | | |_) ||  _| | ' / 
| |_| | |_| | |  _ < | |___| . \\ 
 \\___/ \\___/  |_| \\_\\|_____|_|\\_\\
`),
};

const BANNER_KEYS = ["slant", "blocks", "doom", "standard"] as const;
type BannerKey = typeof BANNER_KEYS[number];

export function Hero() {
  const [copied, setCopied] = useState(false);
  const [bannerStyle, setBannerStyle] = useState<BannerKey>("slant");

  const cycleBanner = () => {
    const nextIndex = (BANNER_KEYS.indexOf(bannerStyle) + 1) % BANNER_KEYS.length;
    setBannerStyle(BANNER_KEYS[nextIndex]);
  };

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText("jurek@jurekdev.qzz.io");
      setCopied(true);
      toast.success("OK: Copied email address", {
        description: "jurek@jurekdev.qzz.io",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("ERR: Failed to copy");
    }
  };

  return (
    <section className="pt-8 pb-12 font-mono text-[#e5e5e5]">
      {/* ASCII Art Title Header */}
      <div className="flex items-center justify-between pb-1 text-xs">
        <span className="text-[10px] text-[#e5e5e5]/60 select-none">// HERO_IDENTITY_BANNER</span>
        <button
          onClick={cycleBanner}
          className="text-[10px] border border-[#e5e5e5] px-1.5 py-0.5 text-[#e5e5e5] hover:border-[#38bdf8] hover:text-[#38bdf8] cursor-pointer"
          title="Cycle ASCII banner typography"
        >
          [FONT: {bannerStyle.toUpperCase()} ⟳]
        </button>
      </div>

      {/* ASCII Art Title */}
      <pre className="text-[#38bdf8] text-[10px] sm:text-xs md:text-sm leading-snug tracking-normal select-none overflow-x-auto py-2 font-mono">
        {BANNERS[bannerStyle]}
      </pre>

      <div className="mt-4 border-b border-[#e5e5e5] pb-2 text-xs flex items-center justify-between">
        <span className="text-[#38bdf8]">SYS_ID: JUREK_ZSL // DOMAIN: jurekdev.qzz.io</span>
        <span className="text-[#e5e5e5]">[VER 1.0.0]</span>
      </div>

      {/* Neofetch-style system info table */}
      <div className="mt-6 border border-[#e5e5e5] bg-[#000000] p-4 text-xs space-y-2">
        <div className="text-[#38bdf8] font-bold pb-2 border-b border-[#e5e5e5] flex justify-between">
          <span>--- SYSTEM DIAGNOSTICS &amp; PROFILE ---</span>
          <span className="text-[#e5e5e5]">LOC: Málaga, Spain</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 pt-1">
          <div><span className="text-[#38bdf8]">USER:</span> Lishafai Heorhii (Jurek)</div>
          <div><span className="text-[#38bdf8]">HOST:</span> jurekdev.qzz.io</div>
          <div><span className="text-[#38bdf8]">ROLE:</span> Systems · Game Dev · Extensions · Desktop Mods</div>
          <div><span className="text-[#38bdf8]">ECOSYSTEM:</span> ohiofiles.cloud · Homebrew · Jellyfin</div>
          <div><span className="text-[#38bdf8]">FLAGSHIPS:</span> ohio-cli · antiQuarantine · openclock · MumbleMica</div>
          <div><span className="text-[#38bdf8]">STATUS:</span> <span className="bg-[#38bdf8] text-[#000000] px-1 font-bold">AVAILABLE FOR PROJECTS</span></div>
        </div>
        <div className="pt-2 border-t border-[#e5e5e5] text-xs leading-relaxed">
          &gt; High-speed Go CLIs &amp; TUIs, native macOS system tools, real-time LAN multiplayer games, browser extensions, desktop app mods, and pure monospace web apps.
        </div>
      </div>


      {/* TUI Action buttons */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Link href="/projects">
          <SpotlightButton variant="primary" size="md">
            1: EXPLORE_PROJECTS
          </SpotlightButton>
        </Link>

        <Link href="/blog">
          <SpotlightButton variant="secondary" size="md">
            2: READ_ARTICLES
          </SpotlightButton>
        </Link>

        <button onClick={handleCopyEmail}>
          <SpotlightButton variant="secondary" size="md">
            {copied ? "COPIED!" : "3: COPY_EMAIL"}
          </SpotlightButton>
        </button>

        <a href="https://github.com/jurek-zsl" target="_blank" rel="noopener noreferrer">
          <SpotlightButton variant="ghost" size="md">
            4: GITHUB_PROFILE ↗
          </SpotlightButton>
        </a>
      </div>
    </section>
  );
}
