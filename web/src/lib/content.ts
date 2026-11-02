import "server-only";
import { cache } from "react";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { createClient, defineQuery } from "next-sanity";
import snapshot from "./legacy-content.json";
import type { Content, Lang, Page } from "./types";
export const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "abnzzs23";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const client = createClient({
  projectId,
  dataset,
  apiVersion: "2026-02-01",
  useCdn: true,
  perspective: "published",
  stega: false,
});
// A single request per locale, shared across layout, metadata and page rendering.
// Time-based revalidation bounds Free-plan API usage without requiring a paid service.
export const CONTENT_QUERY = defineQuery(`{
 "artworks": *[_type == "artwork"] | order(_createdAt asc){
  "id":_id,"slug":slug.current,"title":title[language == $lang][0].value,
  "description":description[language == $lang][0].value,sourceArtist,categories,
  "image":mainImage.asset->url,"alt":mainImage.alt[language == $lang][0].value,
  "gallery":gallery[].asset->url,"body":body[language == $lang][0].value,
  technique,dimensions,"beforeImage":beforeImage.asset->url,beforeCredit,
  "seoTitle":seo.title[language == $lang][0].value,
  "seoDescription":seo.description[language == $lang][0].value,
  "noIndex":seo.noIndex,needsEditorialReview
 },
 "processes":*[_type == "process"]{"slug":slug.current,"title":title[language == $lang][0].value,"description":description[language == $lang][0].value,"images":images[].asset->url},
 "pages":*[_type == "page" && language == $lang]{kind,language,title,body,"images":images[].asset->url,"cvPdf":cvPdf.asset->url,seoTitle,seoDescription},
 "settings":*[_id == "siteSettings"][0]{name,email,mobile,phone,facebook,"featuredSlugs":featuredArtworks[]->slug.current,"comparisonSlug":comparisonArtwork->slug.current}
}`);
export const getContent = cache(async (lang: Lang): Promise<Content> => {
  if (lang !== "it" && lang !== "en") notFound();
  if (process.env.CONTENT_SOURCE !== "legacy") {
    const draft = (await draftMode()).isEnabled;
    const source = client.withConfig({
      perspective: draft ? "drafts" : "published",
      useCdn: !draft,
      token: draft ? process.env.SANITY_API_READ_TOKEN : undefined,
    });
    const result = await source.fetch(
      CONTENT_QUERY,
      { lang },
      { next: { revalidate: draft ? 0 : 60, tags: ["content"] } },
    );
    if (!result.settings)
      throw new Error(
        "Sanity content is not initialized; import reviewed content before enabling CONTENT_SOURCE=sanity.",
      );
    const pages: Record<string, Page> = {};
    for (const p of result.pages) {
      if (!p.kind || !p.language || !p.title) continue;
      pages[`${p.kind}-${p.language}`] = {
        kind: p.kind,
        language: p.language,
        title: p.title,
        body: p.body as Page["body"],
        images: (p.images || []).filter((x): x is string => Boolean(x)),
        cvPdf: p.cvPdf || undefined,
        seoTitle: p.seoTitle || undefined,
        seoDescription: p.seoDescription || undefined,
      };
    }
    return {
      pages,
      artworks: result.artworks.flatMap((a) =>
        !a.slug || !a.title || !a.image
          ? []
          : [
              {
                id: a.id,
                slug: a.slug,
                title: a.title,
                description: a.description || "",
                sourceArtist: a.sourceArtist || "",
                categories: a.categories || [],
                image: a.image,
                alt: a.alt || a.title,
                gallery: (a.gallery || []).filter((x): x is string =>
                  Boolean(x),
                ),
                body: a.body as Content["artworks"][number]["body"],
                technique: a.technique || undefined,
                dimensions: a.dimensions || undefined,
                beforeImage: a.beforeImage || undefined,
                beforeCredit: a.beforeCredit || undefined,
                seoTitle: a.seoTitle || undefined,
                seoDescription: a.seoDescription || undefined,
                noIndex: Boolean(a.noIndex),
                needsEditorialReview: Boolean(a.needsEditorialReview),
              },
            ],
      ),
      processes: result.processes.flatMap((p) =>
        !p.slug || !p.title
          ? []
          : [
              {
                slug: p.slug,
                title: p.title,
                description: p.description || undefined,
                images: (p.images || []).filter((x): x is string => Boolean(x)),
              },
            ],
      ),
      settings: {
        name: result.settings.name || "Patrizio Buonaiuto",
        email: result.settings.email || "",
        mobile: result.settings.mobile || "",
        phone: result.settings.phone || "",
        facebook: result.settings.facebook || "",
        featuredSlugs: (result.settings.featuredSlugs || []).filter(
          (x): x is string => Boolean(x),
        ),
        comparisonSlug: result.settings.comparisonSlug || "",
      },
    };
  }
  const pages = Object.fromEntries(
    Object.entries(snapshot.pages).map(([k, p]) => [
      k,
      { ...p, language: p.language as Lang },
    ]),
  );
  return {
    artworks: snapshot.artworks.map((a) => ({
      id: a.sourceKey,
      slug: a.slug,
      title: a.title[lang],
      description: a.description[lang],
      sourceArtist: a.sourceArtist,
      categories: a.categories,
      image: a.image,
      gallery: a.gallery,
      alt: `${a.title[lang]} — Patrizio Buonaiuto`,
      needsEditorialReview: a.needsEditorialReview,
      ...(a.slug === snapshot.comparison.artworkSlug
        ? {
            beforeImage: snapshot.comparison.originalImage,
            beforeCredit: snapshot.comparison.originalTitle,
          }
        : {}),
    })),
    processes: snapshot.processes.map((p) => ({ ...p, title: p.title[lang] })),
    pages,
    settings: {
      ...snapshot.settings,
      featuredSlugs: snapshot.featured,
      comparisonSlug: snapshot.comparison.artworkSlug,
    },
  };
});
