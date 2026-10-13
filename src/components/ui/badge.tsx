import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "violet" | "cyan" | "emerald" | "outline";
  size?: "sm" | "md";
}

export function Badge({
  children,
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  const isAccent = variant === "emerald" || variant === "violet" || variant === "cyan";

  return (
    <span
      className={cn(
        "inline-flex items-center font-mono text-xs select-none tracking-wider",
        isAccent ? "text-[#38bdf8]" : "text-[#e5e5e5]",
        className
      )}
      {...props}
    >
      [{children}]
    </span>
  );
}
