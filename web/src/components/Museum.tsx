"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import type { Artwork, Lang } from "@/lib/types";
import { setupMuseum } from "@/lib/museum-motion";
export function Museum({
  artworks,
  lang,
}: {
  artworks: Artwork[];
  lang: Lang;
}) {
  const ref = useRef<HTMLElement>(null);
  const it = lang === "it";
  useEffect(() => {
    if (ref.current) return setupMuseum(ref.current);
  }, [artworks, lang]);
  if (!artworks.length) return null;
  return (
    <section
      ref={ref}
      className="museum"
      id="sala-espositiva"
      aria-labelledby="museum-title"
    >
      <div className="museum-stage">
        <div className="museum-heading">
          <div className="eyebrow">
            {it
              ? "LA SALA ESPOSITIVA · CINQUE INCONTRI"
              : "THE EXHIBITION ROOM · FIVE ENCOUNTERS"}
          </div>
          <h2 id="museum-title">
            {it ? "Dentro la pittura." : "Inside the painting."}
          </h2>
          <p>
            {it
              ? "Una passeggiata tra i maestri, attraverso lo sguardo e la mano di Patrizio."
              : "A walk among the masters, through Patrizio’s eye and hand."}
          </p>
        </div>
        <div className="museum-tools">
          <button
            className="museum-toggle"
            type="button"
            aria-pressed="false"
            hidden
            data-still={it ? "Vista senza movimento" : "Visit without motion"}
            data-immersive={
              it ? "Attiva il percorso immersivo" : "Enable immersive visit"
            }
          >
            {it ? "Vista senza movimento" : "Visit without motion"}
          </button>
          <a href="#selezione">
            {it
              ? "Salta la sala e scopri le opere"
              : "Skip the room and explore the works"}{" "}
            ↗
          </a>
        </div>
        <div className="museum-room">
          <div className="museum-architecture" aria-hidden="true">
            <div className="museum-wall" />
            <div className="museum-wall museum-wall-right" />
            <div className="museum-ceiling" />
            <div className="museum-floor" />
          </div>
          <ol
            className="museum-exhibits"
            aria-label={
              it ? "Opere di Patrizio Buonaiuto" : "Works by Patrizio Buonaiuto"
            }
          >
            {artworks.map((a, i) => (
              <li className="museum-exhibit" key={a.id}>
                <figure>
                  <div className="museum-artwork">
                    <img
                      src={
                        a.image.startsWith("https://cdn.sanity.io/")
                          ? `${a.image}?w=900&auto=format`
                          : a.image
                      }
                      alt={a.alt}
                      loading={i === 0 ? "eager" : "lazy"}
                      decoding="async"
                    />
                  </div>
                  <figcaption>
                    <span className="museum-number">
                      {String(i + 1).padStart(2, "0")} · {a.sourceArtist}
                    </span>
                    <h3>{a.title}</h3>
                    <p>
                      {it
                        ? "Dipinto a mano da Patrizio Buonaiuto."
                        : "Hand-painted by Patrizio Buonaiuto."}
                    </p>
                    <Link href={`/${lang}/opere/${a.slug}`}>
                      {it ? "Scopri l’opera" : "Explore the work"}{" "}
                      <span aria-hidden="true">↗</span>
                    </Link>
                  </figcaption>
                </figure>
              </li>
            ))}
          </ol>
        </div>
        <div className="museum-controls" hidden>
          <div className="museum-hint">
            <span aria-hidden="true">↓</span>
            {it ? "Scorri per esplorare" : "Scroll to explore"}
            <div className="museum-progress" aria-hidden="true">
              <span />
            </div>
          </div>
          <nav
            className="museum-stops"
            aria-label={it ? "Scegli un’opera" : "Choose an artwork"}
          >
            {artworks.map((a, i) => (
              <button
                type="button"
                key={a.id}
                aria-label={`${it ? "Vai a" : "Go to"} ${a.title}`}
              >
                {String(i + 1).padStart(2, "0")}
              </button>
            ))}
          </nav>
          <div className="museum-status" role="status" aria-live="polite">
            01 / {String(artworks.length).padStart(2, "0")}
          </div>
        </div>
      </div>
    </section>
  );
}
