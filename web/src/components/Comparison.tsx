"use client";
import { useState } from "react";
import type { Lang } from "@/lib/types";
export function Comparison({
  original,
  after,
  credit,
  lang,
}: {
  original: string;
  after: string;
  credit: string;
  lang: Lang;
}) {
  const [split, setSplit] = useState(63);
  const it = lang === "it";
  return (
    <>
      <div
        className="compare"
        style={{ "--split": `${split}%` } as React.CSSProperties}
      >
        <div className="compare-layer compare-original">
          <img src={original} alt={credit} loading="lazy" />
        </div>
        <div className="compare-layer after">
          <img
            src={after}
            alt={
              it
                ? "Ritratto personalizzato dipinto da Patrizio Buonaiuto"
                : "Personalised portrait painted by Patrizio Buonaiuto"
            }
            loading="lazy"
          />
        </div>
        <div className="compare-line" aria-hidden="true">
          <span>↔</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={split}
          onChange={(e) => setSplit(Number(e.target.value))}
          aria-label={
            it
              ? "Confronta Adele Bloch-Bauer I e la personalizzazione di Patrizio"
              : "Compare Adele Bloch-Bauer I and Patrizio’s personalised portrait"
          }
        />
      </div>
      <div className="compare-labels">
        <span>
          {it ? "Originale · Gustav Klimt" : "Original · Gustav Klimt"}
        </span>
        <span>
          {it ? "Personalizzazione · Patrizio" : "Personalised · Patrizio"}
        </span>
      </div>
    </>
  );
}
