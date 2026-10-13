"use client";

import React, { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { SpotlightButton } from "../ui/spotlight-button";

const ASCII_BANNER = `
     ██╗██╗   ██╗██████╗ ███████╗██╗  ██╗
     ██║██║   ██║██╔══██╗██╔════╝██║ ██╔╝
     ██║██║   ██║██████╔╝█████╗  █████╔╝ 
██   ██║██║   ██║██╔══██╗██╔══╝  ██╔═██╗ 
╚█████╔╝╚██████╔╝██║  ██║███████╗██║  ██╗
 ╚════╝  ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝
`.trim();

export function Hero() {
  const [copied, setCopied] = useState(false);

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
      {/* ASCII Art Title */}
      <pre className="text-[#38bdf8] text-[10px] sm:text-xs leading-none select-none overflow-x-auto py-2">
        {ASCII_BANNER}
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
