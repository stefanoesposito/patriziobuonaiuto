import type { MetadataRoute } from "next";
import { getContent } from "@/lib/content";
import { siteUrl } from "@/lib/seo";
export const revalidate = 60;
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const result: MetadataRoute.Sitemap = [];
  for (const lang of ["it", "en"] as const) {
    const c = await getContent(lang);
    const routes = [
      `/${lang}`,
      `/${lang}/${lang === "it" ? "su-di-me" : "about-me"}`,
      `/${lang}/portfolio`,
      `/${lang}/contact`,
      ...c.artworks
        .filter((a) => !a.noIndex && !a.needsEditorialReview)
        .map((a) => `/${lang}/opere/${a.slug}`),
      ...c.processes.map((p) => `/${lang}/processi/${p.slug}`),
    ];
    result.push(...routes.map((route) => ({ url: siteUrl + route })));
  }
  return result;
}
