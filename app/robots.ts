import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/monitoring"],
    },
    sitemap: `${siteUrl}/sitemap.xml`, // Le fichier XML est générée automatiquement par Next //
    host: siteUrl,
  };
}
