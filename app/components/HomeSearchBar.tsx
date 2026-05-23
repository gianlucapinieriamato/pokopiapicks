"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { POKEMON, POKEMON_LIST } from "@/app/lib/data";
import type { PokemonEntry } from "@/app/lib/types";
import SearchInput from "@/app/components/SearchInput";
import Shortcut from "@/app/components/Shortcut";
import { SuggestionDropdown } from "@/app/components/SuggestionDropdown";

function normalize(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

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

const LISTBOX_ID = "home-search-listbox";

export function HomeSearchBar() {
  const { push } = useRouter();
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<PokemonEntry[]>([]);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const blurTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleInput = (v: string) => {
    setQuery(v);
    const results = searchPokemon(v);
    setMatches(results);
    setActiveIdx(results.length > 0 ? 0 : -1);
    setShowSuggestions(results.length > 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || matches.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, matches.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selected = matches[activeIdx];
      if (activeIdx >= 0 && selected) push(`/pokemon/${selected.slug}`);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  function handleBlur() {
    blurTimerRef.current = setTimeout(() => setShowSuggestions(false), 150);
  }

  function handleFocus() {
    if (blurTimerRef.current) clearTimeout(blurTimerRef.current);
    if (matches.length > 0) setShowSuggestions(true);
  }

  const noResults = query.trim().length > 1 && matches.length === 0;
  const hasResults = showSuggestions && matches.length > 0;
  const activeDescendant =
    activeIdx >= 0 && matches[activeIdx] != null
      ? `${LISTBOX_ID}-opt-${matches[activeIdx]!.slug}`
      : undefined;

  return (
    <>
      <SearchInput
        value={query}
        onChange={(e) => handleInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder="Search Pokemon… (Lucario, Onix, Eevee…)"
        autoComplete="new-password"
        aria-expanded={hasResults}
        aria-controls={LISTBOX_ID}
        aria-activedescendant={activeDescendant}
      >
        {hasResults && (
          <SuggestionDropdown
            id={LISTBOX_ID}
            options={matches}
            activeIdx={activeIdx}
            onSelect={(opt) => push(`/pokemon/${opt.slug}`)}
          />
        )}
        {noResults && (
          <div className="absolute top-[calc(100%+6px)] left-0 right-0 bg-paper border border-[1.5px] border-paper-edge rounded-[14px] max-h-[360px] overflow-y-auto z-10 block shadow-[0_12px_28px_-8px_var(--shadow)]">
            <div className="flex items-center gap-3 px-4 py-2 cursor-pointer border-b border-surface-1 transition-colors hover:bg-surface-1 last:border-b-0 text-ink-fade italic cursor-default">
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
    </>
  );
}
