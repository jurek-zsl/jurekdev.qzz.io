"use client";

import React, { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { SpotlightButton } from "../ui/spotlight-button";
import { ProfileData, DEFAULT_PROFILE } from "@/lib/store";
import { AsciiBanner, WindMode } from "./ascii-banner";

const stripNewlines = (str: string) => str.replace(/^\n+|\n+$/g, "");

const BANNERS = {
  isometric: stripNewlines(`
       ___         ___           ___           ___           ___     
      /\\  \\       /\\__\\         /\\  \\         /\\  \\         /\\__\\    
      \\:\\  \\     /:/  /        /::\\  \\       /::\\  \\       /:/  /    
  ___ /::\\__\\   /:/  /        /:/\\:\\  \\     /:/\\:\\  \\     /:/__/     
 /\\  /:/\\/__/  /:/  /  ___   /::\\~\\:\\  \\   /::\\~\\:\\  \\   /::\\__\\____ 
 \\:\\/:/  /    /:/__/  /\\__\\ /:/\\:\\ \\:\\__\\ /:/\\:\\ \\:\\__\\ /:/\\:::::\\__\\
  \\::/  /     \\:\\  \\ /:/  / \\/_|::\\/:/  / \\:\\~\\:\\ \\/__/ \\/_|:|~~|~   
   \\/__/       \\:\\  /:/  /     |:|::/  /   \\:\\ \\:\\__\\      |:|  |    
                \\:\\/:/  /      |:|\/__/     \\:\\ \\/__/      |:|  |    
                 \\::/  /       |:|  |        \\:\\__\\        |:|  |    
                  \\/__/         \\|__|         \\/__/         \\|__|    
`),
  epic: stripNewlines(`
_________          _______  _______  _       
\\__    _/|\\     /|(  ____ )(  ____ \\| \\    /\\
   )  (  | )   ( || (    )|| (    \\/|  \\  / /
   |  |  | |   | || (____)|| (__    |  (_/ / 
   |  |  | |   | ||     __)|  __)   |   _ (  
   |  |  | |   | || (\\ (   | (      |  ( \\ \\ 
|\\_)  )  | (___) || ) \\ \\__| (____/\\|  /  \\ \\
(____/   (_______)|/   \\__/(_______/|_/    \\/
`),
  larry3d: stripNewlines(`
 _____  __  __  ____    ____    __  __     
/\\___ \\/\\ \\/\\ \\/\\  _\`\\ /\\  _\`\\ /\\ \\/\\ \\    
\\/__/\\ \\ \\ \\ \\ \\ \\ \\L\\ \\ \\ \\L\\_\\ \\ \\/'/'   
   _\\ \\ \\ \\ \\ \\ \\ \\ ,  /\\ \\  _\\L\\ \\ , <    
  /\\ \\_\\ \\ \\ \\_\\ \\ \\ \\\\ \\\\ \\ \\L\\ \\ \\ \\\\\`\\  
  \\ \\____/\\ \\_____\\ \\_\\ \\_\\ \\____/\\ \\_\\ \\_\\
   \\/___/  \\/_____/\\/_/\\/ /\\/___/  \\/_/\\/_/
`),
  starwars: stripNewlines(`
       __   __    __  .______       _______  __  ___ 
      |  | |  |  |  | |   _  \\     |   ____||  |/  / 
      |  | |  |  |  | |  |_)  |    |  |__   |  '  /  
.--.  |  | |  |  |  | |      /     |   __|  |    <   
|  \`--'  | |  \`--'  | |  |\\  \\----.|  |____ |  .  \\  
 \\______/   \\______/  | _| \`._____||_______||__|\\__\\ 
`),
  doom: stripNewlines(`
   ___ _   _______ _____ _   __
  |_  | | | | ___ \\  ___| | / /
    | | | | | |_/ / |__ | |/ / 
    | | | | |    /|  __||    \\ 
/\\__/ / |_| | |\\ \\| |___| |\\  \\
\\____/ \\___/\\_| \\_\\____/\\_| \\_/
`),
};

const BANNER_KEYS = ["isometric", "epic", "larry3d", "starwars", "doom"] as const;
type BannerKey = typeof BANNER_KEYS[number];

interface HeroProps {
  profile?: ProfileData;
}

export function Hero({ profile = DEFAULT_PROFILE }: HeroProps) {
  const [copied, setCopied] = useState(false);
  const [bannerStyle, setBannerStyle] = useState<BannerKey>("isometric");
  const [windMode, setWindMode] = useState<WindMode>("calm");

  const cycleBanner = () => {
    const nextIndex = (BANNER_KEYS.indexOf(bannerStyle) + 1) % BANNER_KEYS.length;
    setBannerStyle(BANNER_KEYS[nextIndex]);
  };

  const cycleWind = () => {
    const modes: WindMode[] = ["calm", "gust", "still"];
    const next = modes[(modes.indexOf(windMode) + 1) % modes.length];
    setWindMode(next);
  };

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email || "george@otcsoft.com");
      setCopied(true);
      toast.success("OK: Copied email address", {
        description: profile.email || "george@otcsoft.com",
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
        <div className="flex items-center gap-1.5">
          <button
            onClick={cycleWind}
            className="text-[10px] border border-[#e5e5e5] px-1.5 py-0.5 text-[#e5e5e5] hover:border-[#38bdf8] hover:text-[#38bdf8] cursor-pointer"
            title="Toggle grass wind animation (calm breeze, brisk gust, or still)"
          >
            [WIND: {windMode === "calm" ? "CALM 🌾" : windMode === "gust" ? "GUST 🍃" : "STILL ⏸"}]
          </button>
          <button
            onClick={cycleBanner}
            className="text-[10px] border border-[#e5e5e5] px-1.5 py-0.5 text-[#e5e5e5] hover:border-[#38bdf8] hover:text-[#38bdf8] cursor-pointer"
            title="Cycle ASCII banner typography"
          >
            [FONT: {bannerStyle.toUpperCase()} ⟳]
          </button>
        </div>
      </div>

      {/* ASCII Art Title with Grass-in-the-Wind Idle Animation */}
      <AsciiBanner
        banner={BANNERS[bannerStyle]}
        windMode={windMode}
        interactive={true}
      />

      <div className="mt-4 border-b border-[#e5e5e5] pb-2 text-xs flex items-center justify-between">
        <span className="text-[#38bdf8]">SYS_ID: JUREK_ZSL // DOMAIN: {profile.host}</span>
        <span className="text-[#e5e5e5]">[VER 1.0.0]</span>
      </div>

      {/* Neofetch-style system info table */}
      <div className="mt-6 border border-[#e5e5e5] bg-[#000000] p-4 text-xs space-y-2 tui-glow-pane">
        <div className="text-[#38bdf8] font-bold pb-2 border-b border-[#e5e5e5] flex justify-between">
          <span>--- SYSTEM DIAGNOSTICS &amp; PROFILE ---</span>
          <span className="text-[#e5e5e5]">LOC: {profile.location}</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 pt-1">
          <div><span className="text-[#38bdf8]">USER:</span> {profile.name}</div>
          <div><span className="text-[#38bdf8]">HOST:</span> {profile.host}</div>
          <div><span className="text-[#38bdf8]">ROLE:</span> {profile.role}</div>
          <div><span className="text-[#38bdf8]">ECOSYSTEM:</span> {profile.ecosystem}</div>
          <div><span className="text-[#38bdf8]">FLAGSHIPS:</span> {profile.flagships}</div>
          <div><span className="text-[#38bdf8]">STATUS:</span> <span className="bg-[#38bdf8] text-[#000000] px-1 font-bold">{profile.status}</span></div>
        </div>
        <div className="pt-2 border-t border-[#e5e5e5] text-xs leading-relaxed">
          &gt; {profile.bio}
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

        <SpotlightButton onClick={handleCopyEmail} variant="secondary" size="md">
          {copied ? "COPIED!" : "3: COPY_EMAIL"}
        </SpotlightButton>

        <a href="https://github.com/jurek-zsl" target="_blank" rel="noopener noreferrer">
          <SpotlightButton variant="primary" size="md">
            4: GITHUB_PROFILE ↗
          </SpotlightButton>
        </a>
      </div>
    </section>
  );
}
