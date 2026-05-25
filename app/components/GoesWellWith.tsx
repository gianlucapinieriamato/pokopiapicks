"use client";
import Link from "next/link";
import { useState, useId, useMemo } from "react";
import { POKEMON_LIST, POKEMON_BY_SLUG } from "@/app/lib/const";
import type { PokemonHabitatConst } from "@/app/lib/const";
import InfoTip from "@/app/components/InfoTip";
import PokemonGridCard from "@/app/components/PokemonGridCard";
import { calcScore } from "@/app/lib/scoring";

export default function GoesWellWith({
  slug,
  habitat,
}: {
  slug: string;
  habitat: PokemonHabitatConst;
}) {
  const [open, setOpen] = useState(true);
  const contentId = useId();

  const { picks, total } = useMemo(() => {
    const anchor = POKEMON_BY_SLUG[slug];
    const sameHabitat = POKEMON_LIST.filter(
      (q) => q.habitat.slug === habitat.slug && q.slug !== slug,
    );
    const seen = new Set<number>();
    const deduped = sameHabitat.filter((q) => {
      if (seen.has(q.num)) return false;
      seen.add(q.num);
      return true;
    });
    const total = deduped.length;
    const withScore = anchor
      ? deduped.map((p) => ({ p, score: calcScore(anchor, p) }))
      : deduped.map((p) => ({ p, score: 0 }));
    const picks = withScore
      .sort((a, b) => b.score - a.score)
      .map((x) => x.p)
      .slice(0, 5);
    return { picks, total };
  }, [slug, habitat]);

  if (picks.length === 0) return null;

  return (
    <div className="bg-paper rounded-xl mb-5 shadow-[var(--shadow-card)] border border-paper-edge">
      <div
        className={`flex items-center bg-surface-1 border-b border-paper-edge rounded-t-xl transition-colors hover:bg-surface-2${!open ? " rounded-b-xl" : ""}`}
      >
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          aria-controls={contentId}
          className="flex-1 flex items-center gap-2 px-4 py-3 md:px-7 cursor-pointer text-left"
        >
          <span className="font-outfit font-bold text-[16px]">
            Goes well with
          </span>
          <span className="font-mono text-[11px] text-ink-soft ml-auto font-medium">
            {total}
          </span>
          <span
            className="font-mono text-[11px] text-ink-fade pl-1"
            aria-hidden="true"
          >
            {open ? "▲" : "▼"}
          </span>
        </button>
        <span className="flex items-center pr-4 shrink-0">
          <InfoTip
            tip="Pokemon with the same habitat can share a living space in Pokopia."
            align="right"
          />
        </span>
      </div>
      <div
        id={contentId}
        className={`grid transition-[grid-template-rows] duration-200 ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <div className="px-3 py-4 md:px-7 md:py-5">
            <div className="grid grid-cols-2 min-[360px]:grid-cols-3 sm:grid-cols-[repeat(auto-fill,minmax(110px,1fr))] gap-3">
              {picks.map((q) => (
                <PokemonGridCard key={q.slug} p={q} />
              ))}
              <Link
                href="/matchmaker"
                className="bg-accent-soft border border-[1.5px] border-accent rounded-[14px] py-3 px-2 text-center no-underline text-accent-deep flex flex-col items-center justify-center gap-1 transition-all hover:bg-accent hover:text-paper hover:-translate-y-0.5 hover:shadow-[0_6px_16px_-6px_var(--shadow)]"
              >
                <div className="size-14 flex items-center justify-center">
                  <span className="font-bold text-[26px] leading-none">→</span>
                </div>
                <div className="font-bold text-[11px] leading-tight text-center">
                  Find best
                  <br />
                  matches
                </div>
                <div className="font-mono text-[9px] opacity-60 text-center">
                  Matchmaker
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
