"use client";
import Link from "next/link";
import { useState, useMemo } from "react";
import { POKEMON_LIST, SPECIALTIES, dexNum } from "@/app/lib/data";
import { useLang } from "@/app/lib/lang";
import TcgCard from "@/app/components/TcgCard";

const HABITATS = ["Dry", "Bright", "Warm", "Cool", "Dark", "Humid"];
const FLAVORS = ["Dry", "Sour", "Spicy", "Sweet", "Bitter"];
const ALL_SPECIALTIES = Object.values(SPECIALTIES).sort((a, b) => a.name.localeCompare(b.name));
const PAGE_SIZE = 60;

const HABITAT_COUNTS: Record<string, number> = {};
const FLAVOR_COUNTS: Record<string, number> = {};
for (const p of POKEMON_LIST) {
  HABITAT_COUNTS[p.habitat] = (HABITAT_COUNTS[p.habitat] ?? 0) + 1;
  if (p.flavor) FLAVOR_COUNTS[p.flavor] = (FLAVOR_COUNTS[p.flavor] ?? 0) + 1;
}

const STRINGS = {
  en: {
    title: "Pokédex",
    searchPlaceholder: "Search Pokémon…",
    habitat: "Ideal Habitat",
    flavor: "Flavor",
    specialty: "Specialty",
    clearFilters: "Clear filters",
    noResults: "No Pokémon match your filters.",
    prev: "Prev",
    next: "Next",
    page: "Page",
    of: "/",
  },
  es: {
    title: "Pokédex",
    searchPlaceholder: "Buscar Pokémon…",
    habitat: "Hábitat ideal",
    flavor: "Sabor",
    specialty: "Especialidad",
    clearFilters: "Borrar filtros",
    noResults: "Ningún Pokémon coincide con tus filtros.",
    prev: "Ant.",
    next: "Sig.",
    page: "Página",
    of: "/",
  },
} as const;

export default function PokedexPage() {
  const lang = useLang();
  const t = STRINGS[lang];

  const [habitatFilter, setHabitatFilter] = useState<string[]>([]);
  const [flavorFilter, setFlavorFilter] = useState<string[]>([]);
  const [specialtyFilter, setSpecialtyFilter] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let list = POKEMON_LIST;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }
    if (habitatFilter.length) list = list.filter((p) => habitatFilter.includes(p.habitat));
    if (flavorFilter.length) list = list.filter((p) => p.flavor && flavorFilter.includes(p.flavor));
    if (specialtyFilter.length) list = list.filter((p) =>
      p.specialties?.some((s) => specialtyFilter.includes(s))
    );
    return list;
  }, [search, habitatFilter, flavorFilter, specialtyFilter]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggle = (arr: string[], val: string, set: (v: string[]) => void) => {
    set(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
    setPage(1);
  };

  return (
    <div className="detail-wrap">
      <div className="breadcrumb">
        <Link href="/">Home</Link><span>›</span><span>{t.title}</span>
      </div>
      <div className="detail-header">
        <div className="detail-title">{t.title}</div>
        <div className="detail-meta">{filtered.length} / {POKEMON_LIST.length} Pokémon</div>
      </div>

      <div className="card mb-4">
        <input
          type="text"
          className="search-input mb-4"
          placeholder={t.searchPlaceholder}
          aria-label={t.searchPlaceholder}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />

        <div className="flex flex-wrap gap-3">
          <div>
            <div className="stat-label mb-1.5">{t.habitat}</div>
            <div className="flex flex-wrap gap-1.5">
              {HABITATS.map((h) => (
                <button key={h} className={`shortcut${habitatFilter.includes(h) ? " shortcut--on" : ""}`} onClick={() => toggle(habitatFilter, h, setHabitatFilter)}>
                  {h} <span className="opacity-55 text-[10px]">({HABITAT_COUNTS[h] ?? 0})</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="stat-label mb-1.5">{t.flavor}</div>
            <div className="flex flex-wrap gap-1.5">
              {FLAVORS.map((f) => (
                <button key={f} className={`shortcut${flavorFilter.includes(f) ? " shortcut--on" : ""}`} onClick={() => toggle(flavorFilter, f, setFlavorFilter)}>
                  {f} <span className="opacity-55 text-[10px]">({FLAVOR_COUNTS[f] ?? 0})</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="stat-label mb-1.5">{t.specialty}</div>
            <div className="flex flex-wrap gap-1.5">
              {ALL_SPECIALTIES.map((s) => (
                <button key={s.slug} className={`shortcut${specialtyFilter.includes(s.slug) ? " shortcut--on" : ""}`} onClick={() => toggle(specialtyFilter, s.slug, setSpecialtyFilter)}>
                  {s.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {(habitatFilter.length || flavorFilter.length || specialtyFilter.length || search) ? (
          <button className="shortcut mt-3" onClick={() => { setHabitatFilter([]); setFlavorFilter([]); setSpecialtyFilter([]); setSearch(""); setPage(1); }}>
            {t.clearFilters}
          </button>
        ) : null}
      </div>

      <div className="card">
        {paginated.length === 0 ? (
          <p className="detail-meta">{t.noResults}</p>
        ) : (
          <div className="pkmn-tcg-grid">
            {paginated.map((p) => (
              <Link key={p.slug} href={`/pokemon/${p.slug}`} className="tcg-card-wrap" aria-label={p.name}>
                <TcgCard p={p} size="sm" />
              </Link>
            ))}
          </div>
        )}
        {pages > 1 && (
          <div className="flex justify-center gap-2 mt-5">
            {page > 1 && <button className="pkmn-nav-btn" onClick={() => setPage(page - 1)}>◀ {t.prev}</button>}
            <span className="detail-meta self-center">{t.page} {page} {t.of} {pages}</span>
            {page < pages && <button className="pkmn-nav-btn" onClick={() => setPage(page + 1)}>{t.next} ▶</button>}
          </div>
        )}
      </div>
    </div>
  );
}
