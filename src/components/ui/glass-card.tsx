"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  enableSpotlight?: boolean;
  spotlightColor?: string;
  tilt?: boolean;
}

export function GlassCard({
  children,
  className,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(
        "relative border border-[#e5e5e5] bg-[#000000] text-[#e5e5e5] p-5 tui-glow-card",
        "hover:border-[#38bdf8]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
