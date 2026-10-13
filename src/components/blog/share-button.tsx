"use client";

import React, { useState } from "react";
import { toast } from "sonner";

export function ShareButton({ title, slug }: { title: string; slug: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = `https://jurekdev.qzz.io/blog/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("OK: Copied article permalink", {
        description: url,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("ERR: Failed to copy");
    }
  };

  return (
    <button
      onClick={handleShare}
      className="border border-[#e5e5e5] bg-[#000000] px-2.5 py-1 text-xs font-mono text-[#e5e5e5] hover:border-[#38bdf8] hover:text-[#38bdf8] cursor-pointer"
      title="Share article link"
    >
      {copied ? "[COPIED!]" : "[SHARE ↗]"}
    </button>
  );
}
