import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://jurekdev.qzz.io/sitemap.xml",
    host: "https://jurekdev.qzz.io",
  };
}
