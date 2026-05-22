"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { POKEMON, POKEMON_LIST, pkmnIconUrl, dexNum } from "@/app/lib/data";
import type { PokemonEntry } from "@/app/lib/types";
import PkmnIcon from "@/app/components/PkmnIcon";
import TcgCard from "@/app/components/TcgCard";
import Shortcut from "@/app/components/Shortcut";
import SearchInput from "@/app/components/SearchInput";
import HoverTile from "@/app/components/HoverTile";
import Card from "@/app/components/Card";
import SectionTitle from "@/app/components/SectionTitle";

function normalize(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

const FEATURES = [
  { href: "/matchmaker", label: "Matchmaker", desc: "Find the best roommates for any Pokemon" },
  { href: "/items", label: "Item Explorer", desc: "Browse all items and gift categories" },
  { href: "/lookup", label: "Advanced Filter", desc: "Filter by habitat, flavor, specialty & more" },
  { href: "/habitats", label: "Habitats", desc: "Explore where each Pokemon lives" },
] as const;

const SUGGESTION_ROW = "flex items-center gap-3 px-4 py-2 cursor-pointer border-b border-surface-1 transition-colors hover:bg-surface-1 last:border-b-0";

function searchPokemon(q: string): PokemonEntry[] {
  const nq = normalize(q.trim());
  if (!nq) return [];
  const prefix: PokemonEntry[] = [], contains: PokemonEntry[] = [];
  for (const p of POKEMON_LIST) {
    const nName = normalize(p.name);
    if (nName.startsWith(nq)) prefix.push(p);
    else if (nName.includes(nq)) contains.push(p);
  }
  return [...prefix, ...contains].slice(0, 12);
}

export default function Home() {
  const { push } = useRouter();
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<PokemonEntry[]>([]);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleInput = (v: string) => {
    setQuery(v);
    const results = searchPokemon(v);
    setMatches(results);
    setActiveIdx(results.length > 0 ? 0 : -1);
    setShowSuggestions(results.length > 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || matches.length === 0) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, matches.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); if (activeIdx >= 0 && matches[activeIdx]) push(`/pokemon/${matches[activeIdx].slug}`); }
    else if (e.key === "Escape") setShowSuggestions(false);
  };

  const noResults = query.trim().length > 1 && matches.length === 0;

  return (
    <div className="max-w-[1080px] mx-auto px-5 pt-8 pb-20 relative z-[1]">
      <header className="text-center mb-5 pt-6 pb-2 px-5">
        <h1 className="font-outfit font-extrabold text-[clamp(2rem,5vw,3.4rem)] leading-none tracking-[-0.025em] mb-2 uppercase whitespace-nowrap">
          Pokopia <span className="italic text-accent-deep font-bold">Picks</span>
        </h1>
        <p className="max-w-[560px] mx-auto text-ink-soft text-[15px] leading-[1.55]">
          Search a Pokemon or browse the collection below. Click any card to see the full breakdown.
        </p>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
        {FEATURES.map((f) => (
          <Link key={f.href} href={f.href} className="no-underline">
            <HoverTile className="py-3 px-3.5 text-center h-full">
              <div className="font-outfit font-bold text-[13px] text-ink mb-1">{f.label}</div>
              <div className="font-mono text-[10px] text-ink-fade tracking-[0.02em] leading-snug">{f.desc}</div>
            </HoverTile>
          </Link>
        ))}
      </div>

      <Card>
        <SearchInput
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (matches.length > 0) setShowSuggestions(true); }}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder="Search Pokemon… (Lucario, Onix, Eevee…)"
          autoComplete="new-password"
        >
          {showSuggestions && matches.length > 0 && (
            <div className="absolute top-[calc(100%+6px)] left-0 right-0 bg-paper border border-[1.5px] border-paper-edge rounded-[14px] max-h-[360px] overflow-y-auto z-10 block shadow-[0_12px_28px_-8px_var(--shadow)]">
              {matches.map((p, i) => (
                <div
                  key={p.slug}
                  className={`${SUGGESTION_ROW}${i === activeIdx ? " bg-surface-1" : ""}`}
                  onMouseDown={(e) => { e.preventDefault(); push(`/pokemon/${p.slug}`); }}
                >
                  <PkmnIcon src={pkmnIconUrl(p)} alt={p.name} className="w-11 h-11 object-contain shrink-0 [image-rendering:pixelated]" />
                  <span className="font-mono text-[11px] text-ink-fade min-w-[38px] font-semibold">#{dexNum(p)}</span>
                  <span className="font-bold text-[15px]">{p.name}</span>
                  <span className="ml-auto font-mono text-[10px] text-ink-soft bg-surface-2 px-2 py-[3px] rounded-full font-semibold">{p.categories.length} cats</span>
                </div>
              ))}
            </div>
          )}
          {noResults && (
            <div className="absolute top-[calc(100%+6px)] left-0 right-0 bg-paper border border-[1.5px] border-paper-edge rounded-[14px] max-h-[360px] overflow-y-auto z-10 block shadow-[0_12px_28px_-8px_var(--shadow)]">
              <div className={`${SUGGESTION_ROW} text-ink-fade italic cursor-default`}>
                No Pokemon found for &quot;{query}&quot;
              </div>
            </div>
          )}
        </SearchInput>
        <div className="mt-4 flex gap-2 flex-wrap items-center">
          <span className="font-mono text-[11px] text-ink-fade tracking-[0.08em] font-semibold">Try:</span>
          {(["lucario", "onix", "eevee", "pikachu", "snorlax"] as const).map((slug) => (
            <Link key={slug} href={`/pokemon/${slug}`} className="no-underline">
              <Shortcut>{POKEMON[slug]?.name ?? slug}</Shortcut>
            </Link>
          ))}
        </div>
      </Card>

      <Card>
        <SectionTitle className="mb-5">All Pokemon</SectionTitle>
        <div className="grid grid-cols-1 min-[400px]:grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(175px,1fr))] gap-2 sm:gap-3 max-w-[220px] min-[400px]:max-w-none mx-auto min-[400px]:mx-0">
          {POKEMON_LIST.map((p) => (
            <Link key={p.slug} href={`/pokemon/${p.slug}`} className="group cursor-pointer border-none bg-transparent p-0 text-left flex no-underline text-inherit transition-transform duration-150 hover:-translate-y-1 hover:scale-[1.02]" aria-label={p.name}>
              <TcgCard p={p} size="sm" />
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
