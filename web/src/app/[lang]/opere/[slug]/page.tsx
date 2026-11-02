import Link from "next/link";
import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";
import { getContent } from "@/lib/content";
import { metadata, jsonLd, siteUrl } from "@/lib/seo";
import type { Lang } from "@/lib/types";
import { ArtworkImage } from "@/components/ArtworkImage";
import { Comparison } from "@/components/Comparison";
type Props = { params: Promise<{ lang: Lang; slug: string }> };
export async function generateMetadata({ params }: Props) {
  const { lang, slug } = await params;
  const a = (await getContent(lang)).artworks.find((a) => a.slug === slug);
  if (!a) return {};
  return metadata(
    lang,
    `/${lang}/opere/${slug}`,
    a.seoTitle || a.title,
    a.seoDescription || a.description,
    a.image,
    a.noIndex || a.needsEditorialReview,
  );
}
export default async function ArtworkPage({ params }: Props) {
  const { lang, slug } = await params;
  const c = await getContent(lang);
  const a = c.artworks.find((a) => a.slug === slug);
  if (!a) notFound();
  const it = lang === "it";
  return (
    <>
      <article className="section-pad artwork-detail">
        <Link className="back-link" href={`/${lang}/portfolio`}>
          ← {it ? "Tutte le opere" : "All works"}
        </Link>
        <div className="detail-grid">
          <div className="detail-picture">
            <ArtworkImage src={a.image} alt={a.alt} priority />
          </div>
          <div className="detail-info">
            <p className="eyebrow">
              {a.sourceArtist
                ? it
                  ? "DIALOGHI CON I MAESTRI"
                  : "DIALOGUES WITH THE MASTERS"
                : "PATRIZIO BUONAIUTO"}
            </p>
            <h1>{a.title}</h1>
            <p className="artist-credit">
              {it ? "Dipinto da" : "Painted by"} Patrizio Buonaiuto
            </p>
            {a.sourceArtist && (
              <p className="small">
                {it ? "Maestro di riferimento" : "Master of reference"} ·{" "}
                {a.sourceArtist}
              </p>
            )}
            <p>{a.description}</p>
            {a.technique && (
              <p>
                {it ? "Tecnica" : "Technique"}: {a.technique}
              </p>
            )}
            {a.dimensions && (
              <p>
                {it ? "Dimensioni" : "Dimensions"}: {a.dimensions}
              </p>
            )}
            <a
              className="text-link"
              href={`mailto:${c.settings.email}?subject=${encodeURIComponent((it ? "Informazioni: " : "Enquiry: ") + a.title)}`}
            >
              {it ? "Richiedi informazioni" : "Enquire about this work"} ↗
            </a>
          </div>
        </div>
        {a.body && (
          <div className="prose">
            <PortableText value={a.body} />
          </div>
        )}
        {a.gallery?.map((src) => (
          <div className="bio-image" key={src}>
            <ArtworkImage src={src} alt={a.alt} />
          </div>
        ))}
      </article>
      {a.beforeImage && (
        <section className="feature">
          <p className="eyebrow">BECOME A MASTERPIECE</p>
          <h2>{it ? "Una storia personale." : "A personal story."}</h2>
          <Comparison
            original={a.beforeImage}
            after={a.image}
            credit={a.beforeCredit || "Gustav Klimt — Adele Bloch-Bauer I"}
            lang={lang}
          />
        </section>
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            "@context": "https://schema.org",
            "@type": "VisualArtwork",
            name: a.title,
            description: a.description,
            image: new URL(a.image, siteUrl).toString(),
            url: `${siteUrl}/${lang}/opere/${a.slug}`,
            creator: { "@type": "Person", name: "Patrizio Buonaiuto" },
            ...(a.sourceArtist
              ? {
                  isBasedOn: {
                    "@type": "VisualArtwork",
                    creator: { "@type": "Person", name: a.sourceArtist },
                  },
                }
              : {}),
          }),
        }}
      />
    </>
  );
}
