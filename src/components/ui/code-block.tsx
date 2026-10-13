"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  html: string;
  rawCode?: string;
  lang?: string;
  filename?: string;
  className?: string;
}

export function CodeBlock({ html, rawCode, lang = "code", filename, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!rawCode) return;
    try {
      await navigator.clipboard.writeText(rawCode);
      setCopied(true);
      toast.success("OK: Copied to clipboard", {
        description: `${lang.toUpperCase()} source buffer copied.`,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("ERR: Failed to copy");
    }
  };

  return (
    <div
      className={cn(
        "my-6 border border-[#e5e5e5] bg-[#000000] text-[#e5e5e5] font-mono",
        className
      )}
    >
      {/* ASCII Titlebar */}
      <div className="flex items-center justify-between border-b border-[#e5e5e5] bg-[#000000] px-3 py-1.5 text-xs text-[#e5e5e5]">
        <div className="flex items-center gap-2">
          <span className="text-[#38bdf8]">:::</span>
          <span>[{filename || lang.toUpperCase()}]</span>
        </div>

        {rawCode && (
          <button
            onClick={handleCopy}
            className="border border-[#e5e5e5] bg-[#000000] px-2 py-0.5 text-[11px] text-[#e5e5e5] hover:border-[#38bdf8] hover:text-[#38bdf8] cursor-pointer"
          >
            {copied ? "[COPIED!]" : "[COPY]"}
          </button>
        )}
      </div>

      {/* Code body */}
      <div
        className="overflow-x-auto p-4 text-[13px] leading-relaxed bg-[#000000] [&>pre]:bg-transparent! [&>pre]:p-0! [&>pre]:m-0! [&>pre]:outline-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
