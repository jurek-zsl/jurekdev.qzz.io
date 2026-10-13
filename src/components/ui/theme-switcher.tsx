"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { ThemeMode, getInitialThemeMode, toggleThemeWithAnimation } from "@/lib/theme-mode";

interface ThemeSwitcherProps {
  className?: string;
}

export function ThemeSwitcher({ className = "" }: ThemeSwitcherProps) {
  const [mode, setMode] = useState<ThemeMode>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setMode(getInitialThemeMode());

    const handleModeChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ mode: ThemeMode }>;
      if (customEvent.detail?.mode) {
        setMode(customEvent.detail.mode);
      }
    };

    window.addEventListener("theme-mode-change", handleModeChange);
    return () => window.removeEventListener("theme-mode-change", handleModeChange);
  }, []);

  const handleToggle = (e: React.MouseEvent) => {
    const nextMode = toggleThemeWithAnimation(e);
    setMode(nextMode);
    toast.success(`THEME: ${nextMode.toUpperCase()} MODE ACTIVE`, {
      description: "Toggled with hardware-accelerated circular View Transition reveal.",
    });
  };

  if (!mounted) {
    return (
      <button
        className={`border border-[#e5e5e5] bg-[#000000] px-2.5 py-1 text-xs text-[#e5e5e5] font-mono cursor-pointer ${className}`}
        aria-label="Theme mode switcher"
      >
        <span>[MODE: DARK ☽]</span>
      </button>
    );
  }

  const isDark = mode === "dark";

  return (
    <button
      onClick={handleToggle}
      className={`border border-[#e5e5e5] bg-[#000000] px-2.5 py-1 text-xs text-[#e5e5e5] hover:border-[#38bdf8] hover:text-[#38bdf8] cursor-pointer font-mono inline-flex items-center gap-1.5 transition-colors select-none ${className}`}
      title={`Toggle to ${isDark ? "Light" : "Dark"} Mode (View Transition Reveal)`}
      aria-label={`Current theme is ${mode}. Click to toggle.`}
    >
      <span className="text-[10px] text-[#38bdf8] font-bold">
        {isDark ? "●" : "○"}
      </span>
      <span>{isDark ? "MODE: DARK" : "MODE: LIGHT"}</span>
      <span className="text-[11px] opacity-80">
        {isDark ? "☽" : "☼"}
      </span>
    </button>
  );
}
