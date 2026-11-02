import type { Metadata } from "next";
import type { Lang } from "./types";
export const siteUrl =
  process.env.SITE_URL || "https://patriziobuonaiuto.vercel.app";
export const isProduction = process.env.VERCEL_ENV === "production";
export function metadata(
  lang: Lang,
  path: string,
  title: string,
  description: string,
  image?: string,
  noIndex = false,
): Metadata {
  const translated = path
    .replace(/^\/(it|en)/, lang === "it" ? "/en" : "/it")
    .replace("/su-di-me", "/about-me");
  const alternate =
    lang === "en" ? translated.replace("/about-me", "/su-di-me") : translated;
  const url = new URL(path, siteUrl).toString();
  return {
    title: `${title} | Patrizio Buonaiuto`,
    description,
    alternates: {
      canonical: url,
      languages: {
        [lang]: url,
        [lang === "it" ? "en" : "it"]: new URL(alternate, siteUrl).toString(),
      },
    },
    openGraph: {
      type: "website",
      title,
      description,
      url,
      siteName: "Patrizio Buonaiuto",
      locale: lang === "it" ? "it_IT" : "en_GB",
      images: image ? [{ url: new URL(image, siteUrl).toString() }] : undefined,
    },
    twitter: { card: "summary_large_image", title, description },
    robots: { index: isProduction && !noIndex, follow: true },
  };
}
export function jsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
