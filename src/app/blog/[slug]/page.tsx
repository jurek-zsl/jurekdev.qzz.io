import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { POSTS } from "@/data/posts";
import { parseMarkdownToBlocks } from "@/lib/markdown";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { CodeBlock } from "@/components/ui/code-block";
import { Callout } from "@/components/blog/callout";
import { TableOfContents } from "@/components/blog/table-of-contents";
import { ReadingProgress } from "@/components/blog/reading-progress";
import { ShareButton } from "@/components/blog/share-button";

import { getSiteData } from "@/lib/store-server";

export const dynamicParams = true;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const { posts } = getSiteData();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { posts } = getSiteData();
  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    return { title: "Article Not Found | Jurek" };
  }

  const url = `https://jurekdev.qzz.io/blog/${post.slug}`;

  return {
    title: `${post.title} | Jurek`,
    description: post.description,
    authors: [{ name: post.author.name, url: "https://github.com/jurek-zsl" }],
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author.name],
      url,
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const { posts } = getSiteData();
  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  const blocks = await parseMarkdownToBlocks(post.content);

  const currentIndex = posts.findIndex((p) => p.slug === slug);
  const prevPost = currentIndex > 0 ? posts[currentIndex - 1] : null;
  const nextPost = currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null;

  return (
    <>
      <ReadingProgress />

      <article className="py-8 font-mono text-[#e5e5e5]">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between border-b border-[#e5e5e5] pb-2 text-xs">
          <Link
            href="/blog"
            className="text-[#e5e5e5] hover:text-[#38bdf8]"
          >
            [&lt;-- CD .. / ALL_ARTICLES]
          </Link>

          <ShareButton title={post.title} slug={post.slug} />
        </div>

        {/* Article Header */}
        <header className="mb-8 border-b border-[#e5e5e5] pb-6">
          <div className="flex flex-wrap items-center gap-2 mb-3 text-xs">
            <span className="bg-[#38bdf8] text-[#000000] px-1 font-bold">
              {post.category.toUpperCase()}
            </span>
            <span>[{formatDate(post.publishedAt)}]</span>
            <span className="text-[#38bdf8]">[{post.readingTime}]</span>
          </div>

          <h1 className="text-xl sm:text-3xl font-bold uppercase text-[#e5e5e5] leading-snug">
            {post.title}
          </h1>

          <p className="mt-3 text-xs sm:text-sm text-[#e5e5e5] leading-relaxed max-w-3xl opacity-90">
            {post.description}
          </p>

          {/* Author Badge */}
          <div className="mt-4 pt-3 border-t border-[#e5e5e5]/40 text-xs flex items-center gap-2">
            <span className="text-[#38bdf8]">AUTHOR:</span>
            <span>{post.author.name}</span>
            <a
              href="https://github.com/jurek-zsl"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#38bdf8] hover:underline"
            >
              ({post.author.handle} ↗)
            </a>
          </div>
        </header>

        {/* Content Layout with Sticky TOC */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Main Content Column */}
          <div className="flex-1 min-w-0 max-w-3xl">
            {blocks.map((block, index) => {
              if (block.type === "code") {
                return (
                  <CodeBlock
                    key={index}
                    html={block.content}
                    rawCode={block.rawCode}
                    lang={block.lang}
                  />
                );
              }

              if (block.type === "callout") {
                return (
                  <Callout
                    key={index}
                    type={block.calloutType}
                    title={block.title}
                  >
                    <div dangerouslySetInnerHTML={{ __html: block.content }} />
                  </Callout>
                );
              }

              return (
                <div
                  key={index}
                  className="leading-relaxed text-xs sm:text-sm"
                  dangerouslySetInnerHTML={{ __html: block.content }}
                />
              );
            })}

            {/* Tags footer */}
            <div className="mt-8 pt-4 border-t border-[#e5e5e5]">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-[#38bdf8]">TAGS:</span>
                {post.tags.map((tag) => (
                  <span key={tag} className="text-[#e5e5e5]">
                    [#{tag}]
                  </span>
                ))}
              </div>
            </div>

            {/* Author Box */}
            <div className="mt-6 border border-[#e5e5e5] p-4 text-xs space-y-2">
              <div className="text-[#38bdf8] font-bold">=== ABOUT THE AUTHOR ===</div>
              <p className="leading-relaxed">
                Jurek is a systems engineer researching distributed consensus, Linux kernel networking, and minimalist web applications.
              </p>
              <div className="pt-1 flex gap-3 text-xs">
                <a
                  href="https://github.com/jurek-zsl"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#38bdf8] hover:underline"
                >
                  [GITHUB: @jurek-zsl ↗]
                </a>
                <a
                  href="mailto:jurek@jurekdev.qzz.io"
                  className="text-[#e5e5e5] hover:text-[#38bdf8]"
                >
                  [EMAIL: jurek@jurekdev.qzz.io]
                </a>
              </div>
            </div>

            {/* Prev / Next Article Navigation */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {prevPost ? (
                <Link
                  href={`/blog/${prevPost.slug}`}
                  className="border border-[#e5e5e5] p-3 hover:border-[#38bdf8] hover:text-[#38bdf8] transition-colors"
                >
                  <div className="text-[#38bdf8] text-[10px]">&lt;-- PREV</div>
                  <div className="mt-1 font-bold line-clamp-1">{prevPost.title}</div>
                </Link>
              ) : <div />}

              {nextPost && (
                <Link
                  href={`/blog/${nextPost.slug}`}
                  className="border border-[#e5e5e5] p-3 hover:border-[#38bdf8] hover:text-[#38bdf8] transition-colors text-right"
                >
                  <div className="text-[#38bdf8] text-[10px]">NEXT --&gt;</div>
                  <div className="mt-1 font-bold line-clamp-1">{nextPost.title}</div>
                </Link>
              )}
            </div>
          </div>

          {/* Sticky Table of Contents Column */}
          <TableOfContents toc={post.toc} />
        </div>
      </article>
    </>
  );
}
