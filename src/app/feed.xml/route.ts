import { POSTS } from "@/data/posts";

export async function GET() {
  const baseUrl = "https://jurekdev.qzz.io";

  const rssItems = POSTS.map((post) => {
    return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${baseUrl}/blog/${post.slug}</link>
      <guid isPermaLink="true">${baseUrl}/blog/${post.slug}</guid>
      <description><![CDATA[${post.description}]]></description>
      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
      <author><![CDATA[jurek@jurekdev.qzz.io (${post.author.name})]]></author>
      <category><![CDATA[${post.category}]]></category>
    </item>`;
  }).join("\n");

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title><![CDATA[Jurek · Systems, Tools & Engineering Blog]]></title>
    <link>${baseUrl}</link>
    <description><![CDATA[Technical journal on systems programming, Go CLI/TUIs, macOS tools, multiplayer game engines, and modern web applications.]]></description>
    <language>en-US</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    ${rssItems}
  </channel>
</rss>`;

  return new Response(rssXml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=18000",
    },
  });
}
