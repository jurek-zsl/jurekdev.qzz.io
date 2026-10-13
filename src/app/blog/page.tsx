import { Metadata } from "next";
import { BlogList } from "@/components/blog/blog-list";

export const metadata: Metadata = {
  title: "Technical Blog & Architecture Notes | Jurek",
  description:
    "Engineering research and architectural essays on distributed systems, Go concurrency, Linux kernel event loops, and modern web application craft.",
  openGraph: {
    title: "Technical Blog & Architecture Notes | Jurek",
    description:
      "Engineering research and architectural essays on distributed systems, Go concurrency, Linux kernel event loops, and modern web application craft.",
    url: "https://jurekdev.qzz.io/blog",
  },
};

export const dynamic = "force-dynamic";

import { getSiteData } from "@/lib/store-server";

export default function BlogIndexPage() {
  const { posts } = getSiteData();
  return <BlogList initialPosts={posts} />;
}
