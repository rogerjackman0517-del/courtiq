import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/api/", "/billing", "/account"] },
    ],
    sitemap: "https://courtiq-mocha.vercel.app/sitemap.xml",
    host: "https://courtiq-mocha.vercel.app",
  };
}
