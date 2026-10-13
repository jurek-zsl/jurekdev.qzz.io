"use client";

import React, { useEffect, useState } from "react";
import { TocItem } from "@/types/blog";
import { cn } from "@/lib/utils";

interface TableOfContentsProps {
  toc: TocItem[];
}

export function TableOfContents({ toc }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (toc.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-80px 0px -60% 0px",
        threshold: 0.1,
      }
    );

    toc.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [toc]);

  if (toc.length === 0) return null;

  return (
    <aside className="sticky top-20 hidden lg:block w-64 shrink-0 border border-[#e5e5e5] bg-[#000000] p-3 text-xs font-mono">
      <div className="border-b border-[#e5e5e5] pb-1.5 text-xs font-bold text-[#38bdf8] mb-2">
        === CONTENTS_TREE ===
      </div>

      <nav className="space-y-1">
        {toc.map((item, idx) => {
          const isActive = activeId === item.id;
          const isLast = idx === toc.length - 1;
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={cn(
                "block py-0.5 text-xs transition-colors line-clamp-1 select-none",
                item.level === 3 ? "pl-4 text-[11px]" : "pl-1",
                isActive
                  ? "text-[#38bdf8] font-bold"
                  : "text-[#e5e5e5] hover:text-[#38bdf8]"
              )}
            >
              <span>
                {item.level === 3 ? "└── " : isLast ? "└── " : "├── "}
                {item.text}
              </span>
            </a>
          );
        })}
      </nav>
    </aside>
  );
}
