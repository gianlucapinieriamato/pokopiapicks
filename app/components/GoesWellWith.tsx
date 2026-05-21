"use client";
import Link from "next/link";
import { useMemo } from "react";
import { POKEMON_LIST, pkmnIconUrl, dexNum } from "@/app/lib/data";

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
    <div className="mt-4 pt-4 border-t border-paper-edge max-md:mt-3 max-md:pt-3">
      <div className="section-title">
        Goes well with <span className="pill">{habitat}</span>
        <span className="info-tip text-[11px]" data-tip="Pokémon with the same habitat can share a living space in Pokopia." aria-label="Pokémon with the same habitat can share a living space in Pokopia.">i</span>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] gap-3 mt-3 max-md:grid-cols-3">
        {picks.map((q) => (
          <Link
            key={q.slug}
            href={`/pokemon/${q.slug}`}
            className="bg-chrome border border-[1.5px] border-paper-edge rounded-[14px] py-3 px-2 text-center no-underline text-ink flex flex-col items-center gap-1 transition-all hover:bg-paper hover:border-accent hover:-translate-y-0.5 hover:shadow-[0_6px_16px_-6px_var(--shadow)]"
          >
            <div className="w-14 h-14 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={pkmnIconUrl(q)} alt={q.name} className="w-full h-full object-contain [image-rendering:pixelated]" />
            </div>
            <div className="font-mono text-[10px] text-ink-fade font-medium">#{dexNum(q)}</div>
            <div className="font-bold text-[12px] leading-tight">{q.name}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
