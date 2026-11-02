import type { MetadataRoute } from "next";
import { siteUrl, isProduction } from "@/lib/seo";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: isProduction
      ? { userAgent: "*", allow: "/", disallow: ["/api/", "/concept/"] }
      : { userAgent: "*", disallow: "/" },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
