"use client";
import Link from "next/link";
import { useState, useMemo } from "react";
import { POKEMON_LIST, SPECIALTIES } from "@/app/lib/data";
import TcgCard from "@/app/components/TcgCard";
import NavBtn from "@/app/components/NavBtn";

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

export default function PokedexPage() {
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
        <Link href="/">Home</Link><span>›</span><span>Pokédex</span>
      </div>
      <div className="detail-header">
        <div className="detail-title">Pokédex</div>
        <div className="detail-meta">{filtered.length} / {POKEMON_LIST.length} Pokémon</div>
      </div>

      <div className="card mb-4">
        <input
          type="text"
          className="search-input mb-4"
          placeholder="Search Pokémon…"
          aria-label="Search Pokémon"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        <div className="flex flex-wrap gap-3">
          <div>
            <div className="stat-label mb-1.5">Ideal Habitat</div>
            <div className="flex flex-wrap gap-1.5">
              {HABITATS.map((h) => (
                <button key={h} className={`shortcut${habitatFilter.includes(h) ? " shortcut--on" : ""}`} onClick={() => toggle(habitatFilter, h, setHabitatFilter)}>
                  {h} <span className="opacity-55 text-[10px]">({HABITAT_COUNTS[h] ?? 0})</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="stat-label mb-1.5">Flavor</div>
            <div className="flex flex-wrap gap-1.5">
              {FLAVORS.map((f) => (
                <button key={f} className={`shortcut${flavorFilter.includes(f) ? " shortcut--on" : ""}`} onClick={() => toggle(flavorFilter, f, setFlavorFilter)}>
                  {f} <span className="opacity-55 text-[10px]">({FLAVOR_COUNTS[f] ?? 0})</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="stat-label mb-1.5">Specialty</div>
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
            Clear filters
          </button>
        ) : null}
      </div>

      <div className="card">
        {paginated.length === 0 ? (
          <p className="detail-meta">No Pokémon match your filters.</p>
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
            {page > 1 && <NavBtn onClick={() => setPage(page - 1)}>◀ Prev</NavBtn>}
            <span className="detail-meta self-center">Page {page} / {pages}</span>
            {page < pages && <NavBtn onClick={() => setPage(page + 1)}>Next ▶</NavBtn>}
          </div>
        )}
      </div>
    </div>
  );
}
