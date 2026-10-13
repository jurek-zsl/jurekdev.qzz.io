"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { POSTS } from "@/data/posts";
import { formatDate } from "@/lib/utils";

import { BlogPost } from "@/types/blog";

interface BlogListProps {
  initialPosts?: BlogPost[];
}

export function BlogList({ initialPosts = [] }: BlogListProps) {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const allPosts = initialPosts;

  const categories = useMemo(() => {
    const set = new Set(allPosts.map((p) => p.category));
    return ["All", ...Array.from(set)];
  }, [allPosts]);

  const filteredPosts = useMemo(() => {
    return allPosts.filter((post) => {
      const matchesCategory =
        activeCategory === "All" ||
        post.category.toLowerCase() === activeCategory.toLowerCase();

      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        post.title.toLowerCase().includes(query) ||
        post.description.toLowerCase().includes(query) ||
        post.tags?.some((tag) => tag.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery, allPosts]);

  return (
    <div className="py-8 font-mono text-[#e5e5e5]">
      {/* Blog Header */}
      <div className="mb-6 border-b border-[#e5e5e5] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold uppercase text-[#38bdf8]">
            === RESEARCH PAPERS &amp; ARCHITECTURE NOTES ===
          </h1>
          <p className="mt-1 text-xs text-[#e5e5e5]">
            Engineering notes on Raft consensus, Linux kernel I/O, and low-latency Go systems.
          </p>
        </div>

        <a
          href="/feed.xml"
          target="_blank"
          rel="noopener noreferrer"
          className="border border-[#e5e5e5] px-2.5 py-1 text-xs text-[#e5e5e5] hover:border-[#38bdf8] hover:text-[#38bdf8] self-start sm:self-auto"
        >
          [FEED.XML / RSS ↗]
        </a>
      </div>

      {/* Filter and Search Bar */}
      <div className="mb-6 space-y-3">
        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`border px-2.5 py-1 text-xs font-mono transition-colors cursor-pointer ${
                activeCategory === cat
                  ? "border-[#38bdf8] bg-[#38bdf8] text-[#000000] font-bold"
                  : "border-[#e5e5e5] bg-[#000000] text-[#e5e5e5] hover:border-[#38bdf8]"
              }`}
            >
              [{activeCategory === cat ? "•" : " "} {cat.toUpperCase()}]
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="flex items-center border border-[#e5e5e5] bg-[#000000] px-3 py-1.5 text-xs">
          <span className="text-[#38bdf8] mr-2">GREP_TOPIC&gt;</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search keywords (Raft, io_uring, Go, Memory)..."
            className="w-full bg-transparent text-xs text-[#e5e5e5] placeholder:text-[#e5e5e5]/50 outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs text-[#e5e5e5] hover:text-[#38bdf8]"
            >
              [CLEAR]
            </button>
          )}
        </div>
      </div>

      {/* Posts List */}
      {allPosts.length === 0 ? (
        <div className="border border-[#e5e5e5] p-8 text-center text-xs">
          <div className="text-[#38bdf8] font-bold">[00: NO_ARTICLES_IN_DATABASE]</div>
          <p className="mt-2 text-[#e5e5e5]">
            No technical articles or research notes have been published yet.
          </p>
          <div className="mt-4">
            <Link
              href="/admin"
              className="border border-[#38bdf8] px-3 py-1.5 text-xs text-[#38bdf8] hover:bg-[#38bdf8] hover:text-[#000000]"
            >
              [OPEN ADMIN TO PUBLISH ↵]
            </Link>
          </div>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="border border-[#e5e5e5] p-8 text-center text-xs">
          <div className="text-[#38bdf8]">[0 ENTRIES MATCHED]</div>
          <div className="mt-1 text-[#e5e5e5]">
            No records match query &quot;{searchQuery}&quot;.
          </div>
          <button
            onClick={() => {
              setActiveCategory("All");
              setSearchQuery("");
            }}
            className="mt-3 border border-[#38bdf8] px-2 py-1 text-xs text-[#38bdf8]"
          >
            [RESET FILTER]
          </button>
        </div>
      ) : (
        <div className="border border-[#e5e5e5] bg-[#000000] divide-y divide-[#e5e5e5]">
          {filteredPosts.map((post, idx) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="block p-4 hover:bg-[#38bdf8] hover:text-[#000000] transition-colors group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold">
                      {idx === filteredPosts.length - 1 ? "└──" : "├──"}
                    </span>
                    <span className="text-[#38bdf8] group-hover:text-[#000000]">
                      [{formatDate(post.publishedAt)}]
                    </span>
                    <span>[{post.category.toUpperCase()}]</span>
                  </div>

                  <h2 className="text-sm sm:text-base font-bold pl-6">
                    {post.title}
                  </h2>

                  <p className="text-xs pl-6 opacity-80 line-clamp-2">
                    {post.description}
                  </p>

                  <div className="pl-6 pt-1 flex flex-wrap gap-1 text-[11px]">
                    {post.tags.map((t) => (
                      <span key={t}>#{t}</span>
                    ))}
                  </div>
                </div>

                <div className="pl-6 sm:pl-0 text-xs shrink-0 font-bold self-start sm:self-center">
                  [{post.readingTime}] [READ ↗]
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
