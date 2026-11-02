import Link from "next/link";
import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";
import { getContent } from "@/lib/content";
import { metadata } from "@/lib/seo";
import type { Lang } from "@/lib/types";
import { ArtworkImage } from "@/components/ArtworkImage";
type Props = {
  params: Promise<{ lang: Lang; page: string }>;
  searchParams: Promise<{ category?: string }>;
};
const labels: Record<string, { it: string; en: string }> = {
  "art-replicas": { it: "Copie d’autore", en: "Art replicas" },
  portraits: { it: "Ritratti", en: "Portraits" },
  "trompe-l-oeil": { it: "Trompe-l’œil", en: "Trompe-l’œil" },
  originals: { it: "Opere originali", en: "Original works" },
  process: { it: "Fasi di lavorazione", en: "Work in progress" },
};
function kindOf(lang: Lang, page: string) {
  return page === "portfolio"
    ? "portfolio"
    : page === "contact"
      ? "contact"
      : page === (lang === "it" ? "su-di-me" : "about-me")
        ? "about"
        : null;
}
export async function generateMetadata({ params }: Props) {
  const { lang, page } = await params;
  const kind = kindOf(lang, page);
  if (!kind) return {};
  const c = await getContent(lang);
  const p = c.pages[`${kind}-${lang}`];
  return metadata(
    lang,
    `/${lang}/${page}`,
    p?.seoTitle ||
      (kind === "portfolio"
        ? lang === "it"
          ? "Opere e lavorazioni"
          : "Artworks and process"
        : kind === "about"
          ? lang === "it"
            ? "Biografia e CV"
            : "Biography & CV"
          : p.title),
    p?.seoDescription ||
      p?.paragraphs?.[0] ||
      (lang === "it"
        ? "Esplora le opere dipinte a mano di Patrizio Buonaiuto."
        : "Explore hand-painted artworks by Patrizio Buonaiuto."),
    p?.images[0],
  );
}
export default async function ContentPage({ params, searchParams }: Props) {
  const { lang, page } = await params;
  const kind = kindOf(lang, page);
  if (!kind) notFound();
  const c = await getContent(lang);
  const it = lang === "it";
  const { category } = await searchParams;
  if (kind === "portfolio")
    return (
      <section className="section-pad page-content">
        <p className="eyebrow">{it ? "IL CATALOGO" : "THE COLLECTION"}</p>
        <h1>{it ? "Il mondo di Patrizio." : "Patrizio’s world."}</h1>
        <nav
          className="filters"
          aria-label={it ? "Categorie delle opere" : "Artwork categories"}
        >
          <Link
            href={`/${lang}/portfolio`}
            aria-current={!category ? "page" : undefined}
          >
            {it ? "Tutto" : "All"}
          </Link>
          {Object.entries(labels).map(([key, l]) => (
            <Link
              key={key}
              href={`/${lang}/portfolio?category=${key}`}
              aria-current={category === key ? "page" : undefined}
            >
              {l[lang]}
            </Link>
          ))}
        </nav>
        <div className="art-grid">
          {c.artworks
            .filter((a) => !category || a.categories.includes(category))
            .map((a) => (
              <Link
                className="art-card"
                key={a.id}
                href={`/${lang}/opere/${a.slug}`}
              >
                <div className="card-picture">
                  <ArtworkImage src={a.image} alt={a.alt} />
                </div>
                <p className="eyebrow">
                  {a.sourceArtist || "Patrizio Buonaiuto"}
                </p>
                <h2>{a.title}</h2>
              </Link>
            ))}
        </div>
        {(!category || category === "process") && (
          <section className="process-list">
            <h2>{labels.process[lang]}</h2>
            <div className="art-grid">
              {c.processes.map((p) => (
                <Link
                  key={p.slug}
                  className="art-card"
                  href={`/${lang}/processi/${p.slug}`}
                >
                  <div className="card-picture">
                    <ArtworkImage src={p.images[0]} alt={p.title} />
                  </div>
                  <h3>{p.title}</h3>
                  <p className="small">
                    {p.images.length}{" "}
                    {it
                      ? "fotografie del lavoro"
                      : "photographs of the process"}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </section>
    );
  const p = c.pages[`${kind}-${lang}`];
  if (!p) notFound();
  return (
    <section className="section-pad page-content">
      <p className="eyebrow">
        {kind === "about"
          ? it
            ? "BIOGRAFIA E PERCORSO PROFESSIONALE"
            : "BIOGRAPHY AND PROFESSIONAL JOURNEY"
          : it
            ? "PARLIAMO DEL TUO PROGETTO"
            : "LET’S TALK ABOUT YOUR PROJECT"}
      </p>
      <h1>{p.title}</h1>
      {p.images[0] && (
        <div className="bio-image">
          <ArtworkImage
            src={p.images[0]}
            alt={
              it
                ? "Patrizio Buonaiuto nel suo atelier"
                : "Patrizio Buonaiuto in his atelier"
            }
            priority
          />
        </div>
      )}
      <div className="prose">
        {p.body ? (
          <PortableText value={p.body} />
        ) : (
          p.paragraphs?.map((text, i) => <p key={i}>{text}</p>)
        )}
      </div>
      {p.cvPdf && (
        <a className="text-link" href={p.cvPdf}>
          {it ? "Scarica il CV in PDF" : "Download CV as PDF"} ↓
        </a>
      )}
      {p.images.slice(1).map((src) => (
        <div className="bio-image" key={src}>
          <ArtworkImage
            src={src}
            alt={
              it
                ? "Patrizio Buonaiuto alla Casina Pompeiana"
                : "Patrizio Buonaiuto at Casina Pompeiana"
            }
          />
        </div>
      ))}
      {kind === "contact" && (
        <address className="contact-details">
          <a href={`mailto:${c.settings.email}`}>{c.settings.email} ↗</a>
          <a href={`tel:${c.settings.mobile.replace(/\s/g, "")}`}>
            {c.settings.mobile}
          </a>
          <a href={`tel:${c.settings.phone.replace(/\s/g, "")}`}>
            {c.settings.phone}
          </a>
          <a href={c.settings.facebook}>Facebook ↗</a>
        </address>
      )}
    </section>
  );
}
