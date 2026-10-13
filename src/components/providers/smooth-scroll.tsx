"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // 1. Reset any stale scroll lock attributes whenever the route changes
  useEffect(() => {
    if (typeof document === "undefined") return;

    // Remove any lingering Radix / modal scroll lock attributes
    document.body.removeAttribute("data-scroll-locked");
    document.documentElement.removeAttribute("data-scroll-locked");
    if (document.body.style.overflow === "hidden") {
      document.body.style.overflow = "";
    }
    if (document.documentElement.style.overflow === "hidden") {
      document.documentElement.style.overflow = "";
    }
    if (document.body.style.pointerEvents === "none") {
      document.body.style.pointerEvents = "";
    }
  }, [pathname]);

  // 2. Active safety guard: ensure body/html overflow is never stuck when no modal is open
  useEffect(() => {
    if (typeof document === "undefined") return;

    const releaseStuckScroll = () => {
      // Check if any modal or dialog is actively rendered
      const hasActiveDialog = Boolean(document.querySelector('[role="dialog"]'));
      if (!hasActiveDialog) {
        if (document.body.hasAttribute("data-scroll-locked")) {
          document.body.removeAttribute("data-scroll-locked");
        }
        if (document.documentElement.hasAttribute("data-scroll-locked")) {
          document.documentElement.removeAttribute("data-scroll-locked");
        }
        if (document.body.style.overflow === "hidden") {
          document.body.style.overflow = "";
        }
        if (document.documentElement.style.overflow === "hidden") {
          document.documentElement.style.overflow = "";
        }
        if (document.body.style.pointerEvents === "none") {
          document.body.style.pointerEvents = "";
        }
      }
    };

    const observer = new MutationObserver(releaseStuckScroll);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["data-scroll-locked", "style"],
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setTimeout(releaseStuckScroll, 50);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      observer.disconnect();
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return <>{children}</>;
}
