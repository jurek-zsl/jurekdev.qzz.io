"use client";

import React from "react";
import Link from "next/link";
import { BlogPost } from "@/types/blog";
import { formatDate } from "@/lib/utils";

interface LatestArticlesProps {
  posts?: BlogPost[];
}

export function LatestArticles({ posts = [] }: LatestArticlesProps) {
  const latestPosts = posts.slice(0, 3);

  return (
    <section className="py-8 font-mono text-[#e5e5e5]">
      <div className="mb-4 border-b border-[#e5e5e5] pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#38bdf8]">
            === TECHNICAL ESSAYS &amp; RESEARCH LOGS ===
          </h2>
          <div className="text-xs text-[#e5e5e5]">
            Engineering notes on systems programming, kernel I/O, and modern frontend craft
          </div>
        </div>

        <Link
          href="/blog"
          className="border border-[#e5e5e5] px-2.5 py-1 text-xs text-[#e5e5e5] hover:border-[#38bdf8] hover:text-[#38bdf8] self-start sm:self-auto"
        >
          [ALL ARTICLES ({posts.length}) ↗]
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="border border-[#e5e5e5] bg-[#000000] p-6 text-center text-xs text-[#e5e5e5]">
          <div className="text-[#38bdf8] font-bold">[00: NO_ARTICLES_FOUND]</div>
          <p className="mt-1 opacity-80">
            No technical essays published yet. Articles can be drafted, authored, and published via{" "}
            <Link href="/admin" className="text-[#38bdf8] underline hover:text-[#e5e5e5]">
              [ADMIN]
            </Link>.
          </p>
        </div>
      ) : (
        <div className="border border-[#e5e5e5] bg-[#000000] divide-y divide-[#e5e5e5] tui-glow-pane">
          {latestPosts.map((post, idx) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="block p-4 hover:bg-[#38bdf8] hover:text-[#000000] transition-colors group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold">
                      {idx === latestPosts.length - 1 ? "└──" : "├──"}
                    </span>
                    <span className="text-[#38bdf8] group-hover:text-[#000000]">
                      [{formatDate(post.publishedAt)}]
                    </span>
                    <span>[{post.category.toUpperCase()}]</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold pl-6">
                    {post.title}
                  </h3>
                  <p className="text-xs pl-6 opacity-80 line-clamp-1">
                    {post.description}
                  </p>
                </div>

                <div className="pl-6 sm:pl-0 text-xs shrink-0 font-bold">
                  [{post.readingTime}] [READ ↗]
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
