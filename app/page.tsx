"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { POKEMON, POKEMON_LIST, pkmnIconUrl, dexNum } from "@/app/lib/data";
import type { PokemonEntry } from "@/app/lib/types";
import PkmnIcon from "@/app/components/PkmnIcon";
import TcgCard from "@/app/components/TcgCard";

// ── i18n ──────────────────────────────────────────────────────────────────────

type Lang = "en" | "es";

const STRINGS = {
  en: {
    eyebrow: "Gift finder · Pokopia",
    h1_1: "What each",
    h1_accent: "Pokémon likes",
    lede: "Search a Pokémon or browse the collection below. Click any card to see the full gift breakdown.",
    search_placeholder: "Search Pokémon… (Lucario, Onix, Eevee…)",
    try_label: "Try:",
    all_pokemon: "All Pokémon",
    lang_btn: "ES",
  },
  es: {
    eyebrow: "Buscador · Pokopia",
    h1_1: "Qué le gusta a",
    h1_accent: "cada Pokémon",
    lede: "Buscá un Pokémon o explorá la colección abajo. Hacé click en cualquier carta para ver el desglose de regalos.",
    search_placeholder: "Buscá un Pokémon… (Lucario, Onix, Eevee…)",
    try_label: "Prueba:",
    all_pokemon: "Todos los Pokémon",
    lang_btn: "EN",
  },
} as const;

// ── Helpers ───────────────────────────────────────────────────────────────────

function normalize(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Home() {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>("en");
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<PokemonEntry[]>([]);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const s = STRINGS[lang];

  useEffect(() => {
    const stored = localStorage.getItem("pokopia-lang");
    if (stored === "en" || stored === "es") setLang(stored as Lang);
  }, []);

  const doSearch = useCallback((q: string) => {
    const nq = normalize(q.trim());
    if (!nq) return [];
    const prefix: PokemonEntry[] = [], contains: PokemonEntry[] = [];
    for (const p of POKEMON_LIST) {
      const nName = normalize(p.name);
      if (nName.startsWith(nq)) prefix.push(p);
      else if (nName.includes(nq)) contains.push(p);
    }
    return [...prefix, ...contains].slice(0, 12);
  }, []);

  const navigateTo = useCallback((slug: string) => {
    router.push(`/pokemon/${slug}`);
  }, [router]);

  const handleInput = (v: string) => {
    setQuery(v);
    const results = doSearch(v);
    setMatches(results);
    setActiveIdx(results.length > 0 ? 0 : -1);
    setShowSuggestions(results.length > 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || matches.length === 0) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, matches.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); if (activeIdx >= 0 && matches[activeIdx]) navigateTo(matches[activeIdx].slug); }
    else if (e.key === "Escape") setShowSuggestions(false);
  };

  const noResults = query.trim().length > 1 && matches.length === 0;

  return (
    <div className="wrap">
      <header>
        <span className="eyebrow">{s.eyebrow}</span>
        <h1>{s.h1_1}<br /><span className="accent">{s.h1_accent}</span></h1>
        <p className="lede">{s.lede}</p>
      </header>

      <section className="card">
        <div className="search-wrap">
          <span className="search-icon">⚲</span>
          <input
            type="text"
            className="search-input"
            placeholder={s.search_placeholder}
            aria-label={s.search_placeholder}
            autoComplete="new-password"
            value={query}
            onChange={(e) => handleInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => { if (matches.length > 0) setShowSuggestions(true); }}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          />
          {showSuggestions && matches.length > 0 && (
            <div className="suggestions open">
              {matches.map((p, i) => (
                <div
                  key={p.slug}
                  className={`suggestion${i === activeIdx ? " active" : ""}`}
                  onMouseDown={(e) => { e.preventDefault(); navigateTo(p.slug); }}
                >
                  <PkmnIcon src={pkmnIconUrl(p)} alt={p.name} className="suggestion-icon" />
                  <span className="suggestion-num">#{dexNum(p)}</span>
                  <span className="suggestion-name">{p.name}</span>
                  <span className="suggestion-meta">{p.categories.length} cats</span>
                </div>
              ))}
            </div>
          )}
          {noResults && (
            <div className="suggestions open">
              <div className="suggestion" style={{ color: "var(--ink-fade)", fontStyle: "italic", cursor: "default" }}>
                No Pokémon found for &quot;{query}&quot;
              </div>
            </div>
          )}
        </div>
        <div className="shortcuts">
          <span className="shortcuts-label">{s.try_label}</span>
          {(["lucario", "onix", "eevee", "pikachu", "snorlax"] as const).map((slug) => (
            <Link key={slug} href={`/pokemon/${slug}`} className="shortcut" style={{ textDecoration: "none" }}>
              {POKEMON[slug]?.name ?? slug}
            </Link>
          ))}
        </div>
      </section>

      <div className="card">
        <div className="section-title" style={{ marginBottom: 20 }}>{s.all_pokemon}</div>
        <div className="pkmn-tcg-grid">
          {POKEMON_LIST.map((p) => (
            <Link key={p.slug} href={`/pokemon/${p.slug}`} className="tcg-card-wrap" aria-label={p.name}>
              <TcgCard p={p} size="sm" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
