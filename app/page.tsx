"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import pokemonData from "@/data/pokemon.json";
import categoriesData from "@/data/favorite-categories.json";
import itemsData from "@/data/items.json";

// ── Types ─────────────────────────────────────────────────────────────────────

type PokemonEntry = {
  name: string;
  num: number;
  habitat: string;
  categories: string[];
  icon: string;
  slug: string;
  nationalDexNum: number | null;
  spriteHq: string | null;
};

type CategoryEntry = {
  slug: string;
  name: string;
  items: string[];
};

type ItemEntry = {
  slug: string;
  name: string;
  icon: string | null;
  categories: string[];
};

// ── Data ──────────────────────────────────────────────────────────────────────

const POKEMON = pokemonData as Record<string, PokemonEntry>;
const CATEGORIES = categoriesData as Record<string, CategoryEntry>;
const ITEMS = itemsData as Record<string, ItemEntry>;

const POKEMON_LIST: PokemonEntry[] = Object.entries(POKEMON)
  .map(([slug, p]) => ({ ...p, slug }))
  .sort((a, b) => a.num - b.num);

const CAT_ITEMS: Record<string, string[]> = {};
for (const [slug, cat] of Object.entries(CATEGORIES)) {
  CAT_ITEMS[slug] = cat.items;
}

// ── i18n ──────────────────────────────────────────────────────────────────────

type Lang = "en" | "es";

const STRINGS = {
  en: {
    eyebrow: "Pokémon Pokopia · Gift finder",
    h1_1: "What each",
    h1_accent: "Pokémon likes",
    lede: "Type a Pokémon's name and see all the items it likes, grouped by category. Items that appear in multiple categories at once make the perfect gifts.",
    search_placeholder: "Search Pokémon… (Lucario, Onix, Eevee…)",
    try_label: "Try:",
    items_total: "items total",
    multi_cat: "in 2+ categories",
    categories: "categories",
    best_gifts: "Best gifts",
    best_gifts_pill: "TOP GIFTS",
    best_gifts_sub: "These items appear in multiple categories at once, so they count double (or more).",
    all_by_cat: "All, by category",
    all_by_cat_sub: "Items marked with ★ appear in more than one of this Pokémon's liked categories.",
    habitat: "Ideal habitat:",
    goes_well_with: "Goes well with",
    placeholder_msg: "Choose a Pokémon above ✿",
    placeholder_sub: "308 Pokémon · 608 items · 43 categories",
    item: (n: number) => `${n} item${n === 1 ? "" : "s"}`,
    cats_x: (n: number) => `${n}× categories`,
    also_in: (cats: string) => `+ ${cats}`,
    lang_btn: "ES",
  },
  es: {
    eyebrow: "Pokémon Pokopia · Buscador",
    h1_1: "Qué le gusta a",
    h1_accent: "cada Pokémon",
    lede: "Escribí el nombre de un Pokémon y mirá todos los objetos que le gustan, agrupados por categoría. Los objetos que están en varias categorías a la vez son los regalos perfectos.",
    search_placeholder: "Buscá un Pokémon… (Lucario, Onix, Eevee…)",
    try_label: "Prueba:",
    items_total: "objetos en total",
    multi_cat: "en 2+ categorías",
    categories: "categorías",
    best_gifts: "Los mejores regalos",
    best_gifts_pill: "REGALOS TOP",
    best_gifts_sub: "Estos objetos aparecen en varias categorías a la vez, así que cuentan doble (o más).",
    all_by_cat: "Todo, por categoría",
    all_by_cat_sub: "Los objetos marcados con ★ están en más de una de las categorías que le gustan.",
    habitat: "Hábitat ideal:",
    goes_well_with: "Le cae bien con",
    placeholder_msg: "Elegí un Pokémon arriba ✿",
    placeholder_sub: "308 Pokémon · 608 objetos · 43 categorías",
    item: (n: number) => `${n} objeto${n === 1 ? "" : "s"}`,
    cats_x: (n: number) => `${n}× categorías`,
    also_in: (cats: string) => `+ ${cats}`,
    lang_btn: "EN",
  },
} as const;

// ── Helpers ───────────────────────────────────────────────────────────────────

function normalize(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function pkmnIconUrl(p: PokemonEntry) {
  return `/icons/pokemon/${p.icon}`;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function PkmnIcon({ src, alt, className }: { src: string | null; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return <div className={`flex items-center justify-center text-[var(--ink-fade)] ${className ?? ""}`}>·</div>;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={`img-icon ${className ?? ""}`} loading="lazy" onError={() => setFailed(true)} />
  );
}

function GoesWellWith({ slug, p, onSelect, s }: {
  slug: string;
  p: PokemonEntry;
  onSelect: (slug: string) => void;
  s: (typeof STRINGS)[Lang];
}) {
  const sameHabitat = POKEMON_LIST.filter((q) => q.habitat === p.habitat && q.slug !== slug);
  const seen = new Set<number>();
  const deduped = sameHabitat.filter((q) => {
    if (seen.has(q.num)) return false;
    seen.add(q.num);
    return true;
  });
  const picks = deduped.sort(() => Math.random() - 0.5).slice(0, 6);
  if (picks.length === 0) return null;
  return (
    <div className="gww-section">
      <div className="section-title">{s.goes_well_with} <span className="pill">{p.habitat}</span></div>
      <div className="gww-grid">
        {picks.map((q) => (
          <button key={q.slug} className="gww-card" onClick={() => onSelect(q.slug)}>
            <div className="gww-icon"><PkmnIcon src={pkmnIconUrl(q)} alt={q.name} /></div>
            <div className="gww-num">#{String(q.num).padStart(3, "0")}</div>
            <div className="gww-name">{q.name}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Home() {
  const [lang, setLang] = useState<Lang>("en");
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<PokemonEntry[]>([]);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);

  const s = STRINGS[lang];

  useEffect(() => {
    const stored = localStorage.getItem("pokopia-lang");
    if (stored === "en" || stored === "es") setLang(stored as Lang);
  }, []);

  const toggleLang = () => {
    const next: Lang = lang === "en" ? "es" : "en";
    setLang(next);
    localStorage.setItem("pokopia-lang", next);
  };

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

  const selectPokemon = useCallback((slug: string) => {
    const p = POKEMON[slug];
    if (!p) return;
    setSelectedSlug(slug);
    setQuery(p.name);
    setShowSuggestions(false);
    setMatches([]);
    setTimeout(() => outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }, []);

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
    else if (e.key === "Enter") { e.preventDefault(); if (activeIdx >= 0 && matches[activeIdx]) selectPokemon(matches[activeIdx].slug); }
    else if (e.key === "Escape") setShowSuggestions(false);
  };

  const catName = (slug: string) => CATEGORIES[slug]?.name ?? slug;

  const renderPokemon = (slug: string) => {
    const p = POKEMON[slug];
    if (!p) return null;

    const itemToCats: Record<string, string[]> = {};
    for (const catSlug of p.categories) {
      for (const item of CAT_ITEMS[catSlug] ?? []) {
        if (!itemToCats[item]) itemToCats[item] = [];
        itemToCats[item].push(catSlug);
      }
    }

    const allItems = Object.entries(itemToCats);
    const sharedItems = allItems
      .filter(([, cats]) => cats.length >= 2)
      .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));

    return (
      <div className="card">
        <div className="pkmn-head">
          <div className="pkmn-portrait">
            <PkmnIcon src={pkmnIconUrl(p)} alt={p.name} className="w-20 h-20 object-contain" />
          </div>
          <div className="pkmn-info">
            <div className="pkmn-num">N.º {String(p.num).padStart(3, "0")}</div>
            <div className="pkmn-name">{p.name}</div>
            <div className="pkmn-meta">{s.habitat} <span className="habitat-tag">{p.habitat}</span></div>
            <div className="pkmn-cats">
              {p.categories.map((c) => <span key={c} className="pkmn-cat-tag">{catName(c)}</span>)}
            </div>
          </div>
        </div>

        <div className="summary-strip">
          <div className="stat-box"><div className="stat-num">{allItems.length}</div><div className="stat-label">{s.items_total}</div></div>
          <div className="stat-box"><div className="stat-num">{sharedItems.length}</div><div className="stat-label">{s.multi_cat}</div></div>
          <div className="stat-box"><div className="stat-num">{p.categories.length}</div><div className="stat-label">{s.categories}</div></div>
        </div>

        {sharedItems.length > 0 && (
          <>
            <div className="section-title">{s.best_gifts} <span className="pill">{s.best_gifts_pill}</span></div>
            <p className="section-sub">{s.best_gifts_sub}</p>
            <div className="best-grid">
              {sharedItems.map(([item, cats]) => {
                const isElite = cats.length >= 3;
                const iconPath = ITEMS[item]?.icon ?? null;
                return (
                  <div key={item} className={`best-item${isElite ? " elite" : ""}`}>
                    <div className="best-item-badge">{s.cats_x(cats.length)}</div>
                    <div className="best-item-icon"><PkmnIcon src={iconPath} alt={item} /></div>
                    <div className="best-item-body">
                      <div className="best-item-name">{item}</div>
                      <div className="best-item-cats">{cats.map((c) => catName(c)).join(" · ")}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        <div className="section-title">{s.all_by_cat}</div>
        <p className="section-sub">{s.all_by_cat_sub}</p>
        {p.categories.map((catSlug) => {
          const items = CAT_ITEMS[catSlug] ?? [];
          return (
            <div key={catSlug} className="cat-block">
              <div className="cat-head">
                <span className="cat-name">{catName(catSlug)}</span>
                <span className="cat-count">{s.item(items.length)}</span>
              </div>
              <div className="cat-items">
                {items.map((item) => {
                  const cats = itemToCats[item] ?? [];
                  const isShared = cats.length >= 2;
                  const otherCats = cats.filter((c) => c !== catSlug);
                  const iconPath = ITEMS[item]?.icon ?? null;
                  return (
                    <div key={item} className={`cat-item${isShared ? " shared" : ""}`}>
                      <div className="cat-item-icon"><PkmnIcon src={iconPath} alt={item} /></div>
                      <div className="cat-item-body">
                        <div className="cat-item-name">{item}</div>
                        {isShared && <div className="cat-item-cats">{s.also_in(otherCats.map((c) => catName(c)).join(", "))}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        <GoesWellWith slug={slug} p={p} onSelect={selectPokemon} s={s} />
      </div>
    );
  };

  return (
    <>
      <button className="lang-toggle" onClick={toggleLang} aria-label="Toggle language">{s.lang_btn}</button>

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
              autoComplete="off"
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
                    onMouseDown={(e) => { e.preventDefault(); selectPokemon(p.slug); }}
                  >
                    <PkmnIcon src={pkmnIconUrl(p)} alt={p.name} className="suggestion-icon" />
                    <span className="suggestion-num">#{String(p.num).padStart(3, "0")}</span>
                    <span className="suggestion-name">{p.name}</span>
                    <span className="suggestion-meta">{p.categories.length} cats</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="shortcuts">
            <span className="shortcuts-label">{s.try_label}</span>
            {(["lucario", "onix", "eevee", "pikachu", "snorlax"] as const).map((slug) => (
              <button key={slug} className="shortcut" onClick={() => selectPokemon(slug)}>
                {POKEMON[slug]?.name ?? slug}
              </button>
            ))}
          </div>
        </section>

        <div ref={outputRef} id="output">
          {selectedSlug ? renderPokemon(selectedSlug) : (
            <div className="card">
              <div className="placeholder">
                {s.placeholder_msg}
                <small className="block mt-1 text-sm text-[var(--ink-fade)]">{s.placeholder_sub}</small>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
