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
      <div className="section-title gap-2">
        Goes well with <span className="pill">{habitat}</span>
        <span className="info-tip text-[11px]" data-tip="Pokémon with the same habitat can share a living space in Pokopia." aria-label="Pokémon with the same habitat can share a living space in Pokopia.">i</span>
      </div>
      <div className="gww-grid">
        {picks.map((q) => (
          <Link key={q.slug} href={`/pokemon/${q.slug}`} className="gww-card no-underline">
            <div className="gww-icon">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={pkmnIconUrl(q)} alt={q.name} className="w-full h-full object-contain [image-rendering:pixelated]" />
            </div>
            <div className="gww-num">#{dexNum(q)}</div>
            <div className="gww-name">{q.name}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
