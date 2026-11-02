import type { PortableTextBlock } from "@portabletext/types";
export type Lang = "it" | "en";
export type Artwork = {
  id: string;
  slug: string;
  title: string;
  description: string;
  sourceArtist: string;
  categories: string[];
  image: string;
  alt: string;
  gallery?: string[];
  body?: PortableTextBlock[];
  technique?: string;
  dimensions?: string;
  beforeImage?: string;
  beforeCredit?: string;
  seoTitle?: string;
  seoDescription?: string;
  noIndex?: boolean;
  needsEditorialReview?: boolean;
};
export type Page = {
  kind: string;
  language: Lang;
  title: string;
  paragraphs?: string[];
  body?: PortableTextBlock[];
  images: string[];
  cvPdf?: string;
  seoTitle?: string;
  seoDescription?: string;
};
export type Process = {
  slug: string;
  title: string;
  description?: string;
  images: string[];
};
export type Settings = {
  name: string;
  email: string;
  mobile: string;
  phone: string;
  facebook: string;
  featuredSlugs: string[];
  comparisonSlug: string;
};
export type Content = {
  artworks: Artwork[];
  processes: Process[];
  pages: Record<string, Page>;
  settings: Settings;
};
