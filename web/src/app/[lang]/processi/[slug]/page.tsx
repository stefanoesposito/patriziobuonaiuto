import Link from "next/link";
import { notFound } from "next/navigation";
import { getContent } from "@/lib/content";
import { metadata } from "@/lib/seo";
import type { Lang } from "@/lib/types";
import { ArtworkImage } from "@/components/ArtworkImage";
type Props = { params: Promise<{ lang: Lang; slug: string }> };
export async function generateMetadata({ params }: Props) {
  const { lang, slug } = await params;
  const p = (await getContent(lang)).processes.find((p) => p.slug === slug);
  if (!p) return {};
  return metadata(
    lang,
    `/${lang}/processi/${slug}`,
    p.title,
    lang === "it"
      ? "Le fasi di lavorazione documentate da Patrizio Buonaiuto."
      : "The painting process documented by Patrizio Buonaiuto.",
    p.images[0],
  );
}
export default async function ProcessPage({ params }: Props) {
  const { lang, slug } = await params;
  const p = (await getContent(lang)).processes.find((p) => p.slug === slug);
  if (!p) notFound();
  return (
    <section className="section-pad page-content">
      <Link className="back-link" href={`/${lang}/portfolio?category=process`}>
        ← {lang === "it" ? "Le lavorazioni" : "Painting processes"}
      </Link>
      <p className="eyebrow">
        {lang === "it"
          ? "DAL PRIMO SEGNO ALL’OPERA"
          : "FROM THE FIRST MARK TO THE PAINTING"}
      </p>
      <h1>{p.title}</h1>
      {p.description && <p>{p.description}</p>}
      <div className="process-steps">
        {p.images.map((src, i) => (
          <figure key={src}>
            <ArtworkImage
              src={src}
              alt={`${p.title} — ${lang === "it" ? "fase" : "step"} ${i + 1}`}
              priority={i === 0}
            />
            <figcaption>
              {String(i + 1).padStart(2, "0")} /{" "}
              {String(p.images.length).padStart(2, "0")}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
