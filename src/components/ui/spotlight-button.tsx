"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SpotlightButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "cyan";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
}

export const SpotlightButton = React.forwardRef<HTMLButtonElement, SpotlightButtonProps>(
  ({ children, className, variant = "primary", size = "md", icon, ...props }, ref) => {
    const baseStyles =
      "relative inline-flex items-center justify-center gap-2 font-mono font-medium tracking-tight transition-all duration-100 disabled:pointer-events-none disabled:opacity-40 select-none cursor-pointer border";

    const sizeStyles = {
      sm: "px-2.5 py-1 text-xs",
      md: "px-3.5 py-1.5 text-xs",
      lg: "px-4.5 py-2 text-sm",
    };

    const variantStyles = {
      primary:
        "border-[var(--accent)] bg-[#000000] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-[#000000]",
      secondary:
        "border-[#e5e5e5] bg-[#000000] text-[#e5e5e5] hover:bg-[#e5e5e5] hover:text-[#000000]",
      cyan:
        "border-[var(--accent)] bg-[var(--accent)] text-[#000000] hover:bg-[#000000] hover:text-[var(--accent)]",
      ghost:
        "border-transparent bg-transparent text-[#e5e5e5] hover:text-[var(--accent)] hover:border-[var(--accent)]",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        {...props}
      >
        {icon && <span className="shrink-0">{icon}</span>}
        <span>[{children}]</span>
      </button>
    );
  }
);

SpotlightButton.displayName = "SpotlightButton";
