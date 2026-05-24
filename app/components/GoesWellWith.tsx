"use client";
import Link from "next/link";
import Image from "next/image";
import { useMemo } from "react";
import { POKEMON_LIST, pkmnIconUrl, dexNum } from "@/app/lib/const";
import type { PokemonHabitatConst } from "@/app/lib/const";
import SectionTitle from "@/app/components/SectionTitle";
import InfoTip from "@/app/components/InfoTip";

export default function GoesWellWith({
  slug,
  habitat,
}: {
  slug: string;
  habitat: PokemonHabitatConst;
}) {
  const picks = useMemo(() => {
    const sameHabitat = POKEMON_LIST.filter(
      (q) => q.habitat.slug === habitat.slug && q.slug !== slug
    );
    const seen = new Set<number>();
    const deduped = sameHabitat.filter((q) => {
      if (seen.has(q.num)) return false;
      seen.add(q.num);
      return true;
    });
    // Deterministic pseudo-shuffle
    const seed = deduped.reduce((s, p) => s + p.num, 0);
    const withKey = deduped.map((p) => ({ p, key: (p.num * 1009 + seed) % 307 }));
    return withKey.sort((a, b) => a.key - b.key).map((x) => x.p).slice(0, 6);
  }, [slug, habitat]);

  if (picks.length === 0) return null;

  return (
    <div className="mt-4 pt-4 border-t border-paper-edge max-md:mt-3 max-md:pt-3">
      <SectionTitle pill={habitat.label}>
        Goes well with
        <InfoTip tip="Pokemon with the same habitat can share a living space in Pokopia." />
      </SectionTitle>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] gap-3 mt-3 max-md:grid-cols-3">
        {picks.map((q) => (
          <Link
            key={q.slug}
            href={`/pokemon/${q.slug}`}
            className="bg-chrome border border-[1.5px] border-paper-edge rounded-[14px] py-3 px-2 text-center no-underline text-ink flex flex-col items-center gap-1 transition-all hover:bg-paper hover:border-accent hover:-translate-y-0.5 hover:shadow-[0_6px_16px_-6px_var(--shadow)]"
          >
            <div className="relative size-14">
              <Image
                fill
                src={pkmnIconUrl(q)}
                alt={q.label}
                className="object-contain [image-rendering:pixelated]"
                sizes="56px"
              />
            </div>
            <div className="font-mono text-[10px] text-ink-fade font-medium">
              #{dexNum(q)}
            </div>
            <div className="font-bold text-[12px] leading-tight">{q.label}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
