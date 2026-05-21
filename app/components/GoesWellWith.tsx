"use client";
import Link from "next/link";
import { useMemo } from "react";
import { POKEMON_LIST, pkmnIconUrl, dexNum } from "@/app/lib/data";
import type { PokemonEntry } from "@/app/lib/types";

export default function GoesWellWith({ slug, habitat }: { slug: string; habitat: string }) {
  const picks = useMemo(() => {
    const sameHabitat = POKEMON_LIST.filter((q) => q.habitat === habitat && q.slug !== slug);
    const seen = new Set<number>();
    const deduped = sameHabitat.filter((q) => {
      if (seen.has(q.num)) return false;
      seen.add(q.num);
      return true;
    });
    return deduped.sort(() => Math.random() - 0.5).slice(0, 6);
  }, [slug, habitat]);

  if (picks.length === 0) return null;

  return (
    <div className="gww-section">
      <div className="section-title" style={{ gap: 8 }}>
        Goes well with <span className="pill">{habitat}</span>
        <span className="info-tip" data-tip="Pokémon with the same habitat can share a living space in Pokopia." aria-label="Pokémon with the same habitat can share a living space in Pokopia." style={{ fontSize: 11 }}>i</span>
      </div>
      <div className="gww-grid">
        {picks.map((q) => (
          <Link key={q.slug} href={`/pokemon/${q.slug}`} className="gww-card" style={{ textDecoration: "none" }}>
            <div className="gww-icon">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={pkmnIconUrl(q)} alt={q.name} style={{ width: "100%", height: "100%", objectFit: "contain", imageRendering: "pixelated" }} />
            </div>
            <div className="gww-num">#{dexNum(q)}</div>
            <div className="gww-name">{q.name}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
