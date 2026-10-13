import React from "react";
import { cn } from "@/lib/utils";

interface CalloutProps {
  type?: "tip" | "info" | "warning" | "note";
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Callout({ type = "info", title, children, className }: CalloutProps) {
  const isAccent = type === "tip" || type === "note";

  return (
    <div
      className={cn(
        "my-5 border bg-[#000000] p-3 text-xs font-mono",
        isAccent ? "border-[#38bdf8]" : "border-[#e5e5e5]",
        className
      )}
    >
      <div className="flex items-center gap-2 mb-2 pb-1 border-b border-[#e5e5e5]/40 font-bold">
        <span className={isAccent ? "text-[#38bdf8]" : "text-[#e5e5e5]"}>
          [!]
        </span>
        <span className={isAccent ? "text-[#38bdf8]" : "text-[#e5e5e5]"}>
          {title || type.toUpperCase()}
        </span>
      </div>
      <div className="text-xs text-[#e5e5e5] leading-relaxed [&>p]:m-0">
        {children}
      </div>
    </div>
  );
}
