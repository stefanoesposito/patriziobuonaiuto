import Link from "next/link";
import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";
import { getContent } from "@/lib/content";
import { metadata, jsonLd } from "@/lib/seo";
import type { Lang } from "@/lib/types";
import { Museum } from "@/components/Museum";
import { Comparison } from "@/components/Comparison";
import { ArtworkImage } from "@/components/ArtworkImage";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Lang }>;
}) {
  const { lang } = await params;
  return metadata(
    lang,
    `/${lang}`,
    lang === "it"
      ? "Copie d’autore e dipinti personalizzati"
      : "Art replicas and personalised paintings",
    lang === "it"
      ? "Le opere di Patrizio Buonaiuto: copie d’autore dipinte a mano, ritratti, trompe-l’œil e opere originali."
      : "Discover hand-painted art replicas, portraits, trompe-l’œil and original works by Patrizio Buonaiuto.",
  );
}
export default async function Home({
  params,
}: {
  params: Promise<{ lang: Lang }>;
}) {
  const { lang } = await params;
  const { artworks, pages, settings } = await getContent(lang);
  const it = lang === "it";
  const featured = settings.featuredSlugs
    .map((s) => artworks.find((a) => a.slug === s))
    .filter((a) => a !== undefined);
  const comparison = artworks.find((a) => a.slug === settings.comparisonSlug);
  const copy = pages[`home-${lang}`];
  if (!copy) notFound();
  return (
    <>
      <section className="hero" id="home">
        <div className="eyebrow">
          {it ? "L’arte attraversa il tempo" : "Art transcends time"}
        </div>
        <h1>
          Old Masters.
          <br />
          <em>New Stories.</em>
        </h1>
        <p>
          {it
            ? "Riproduzioni pittoriche e capolavori reinterpretati a mano."
            : "Hand-painted art replicas and reimagined masterpieces."}
        </p>
        <a className="scroll" href="#sala-espositiva">
          ↓ &nbsp; {it ? "SCORRI PER ENTRARE" : "SCROLL TO ENTER"}
        </a>
      </section>
      <Museum artworks={featured} lang={lang} />
      {comparison?.beforeImage && (
        <section className="feature" id="personalizzazioni">
          <div className="eyebrow">BECOME A MASTERPIECE</div>
          <h2>
            {it ? "Entra nel capolavoro." : "Become part of a masterpiece."}
          </h2>
          <p>
            {it
              ? "Un’opera classica, una storia personale. Da Adele Bloch-Bauer I (1907) alla reinterpretazione personalizzata di Patrizio. Trascina il cursore per confrontarle."
              : "A classic painting, a personal story. From Adele Bloch-Bauer I (1907) to Patrizio’s personalised interpretation. Drag the slider to compare."}
          </p>
          <Comparison
            original={comparison.beforeImage}
            after={comparison.image}
            credit={
              comparison.beforeCredit ||
              "Gustav Klimt — Adele Bloch-Bauer I (1907)"
            }
            lang={lang}
          />
        </section>
      )}
      <section className="selection section-pad" id="selezione">
        <div className="section-title">
          <div>
            <p className="eyebrow">
              {it ? "DAL MUSEO ALL’ATELIER" : "FROM MUSEUM TO ATELIER"}
            </p>
            <h2>{it ? "L’incontro continua." : "The encounter continues."}</h2>
          </div>
          <Link className="text-link" href={`/${lang}/portfolio`}>
            {it ? "Tutte le opere" : "All works"} ↗
          </Link>
        </div>
        <div className="art-grid">
          {featured.map((a) => (
            <Link
              key={a.id}
              className="art-card"
              href={`/${lang}/opere/${a.slug}`}
            >
              <div className="card-picture">
                <ArtworkImage src={a.image} alt={a.alt} />
              </div>
              <p className="eyebrow">{a.sourceArtist}</p>
              <h3>{a.title}</h3>
            </Link>
          ))}
        </div>
      </section>
      <section className="story section-pad">
        <p className="eyebrow">
          {it ? "IL MESTIERE DELLA PITTURA" : "THE CRAFT OF PAINTING"}
        </p>
        <h2>{copy.title}</h2>
        <div className="prose">
          {copy.body ? (
            <PortableText value={copy.body} />
          ) : (
            copy.paragraphs?.map((p, i) => <p key={i}>{p}</p>)
          )}
        </div>
        <Link
          className="text-link"
          href={`/${lang}/${it ? "su-di-me" : "about-me"}`}
        >
          {it
            ? "Conosci Patrizio · biografia e CV"
            : "Meet Patrizio · biography & CV"}{" "}
          ↗
        </Link>
      </section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            "@context": "https://schema.org",
            "@type": "Person",
            name: settings.name,
            jobTitle: it ? "Pittore" : "Painter",
            url: `/${lang}`,
            sameAs: [settings.facebook],
          }),
        }}
      />
    </>
  );
}
