"use client";
import Link from "next/link";
import { useState, useMemo } from "react";
import { POKEMON_LIST, CATEGORIES, SPECIALTIES, LOCATIONS, pkmnIconUrl, dexNum } from "@/app/lib/data";

const HABITATS = ["Dry", "Bright", "Warm", "Cool", "Dark", "Humid"];
const FLAVORS = ["Dry", "Sour", "Spicy", "Sweet", "Bitter"];

export default function LookupPage() {
  const [habitatFilter, setHabitatFilter] = useState<string[]>([]);
  const [flavorFilter, setFlavorFilter] = useState<string[]>([]);
  const [specialtyFilter, setSpecialtyFilter] = useState<string[]>([]);
  const [catFilter, setCatFilter] = useState<string[]>([]);
  const [locFilter, setLocFilter] = useState<string[]>([]);

  const toggle = (arr: string[], val: string, set: (v: string[]) => void) => {
    set(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  };

  const results = useMemo(() => {
    return POKEMON_LIST.filter((p) => {
      if (habitatFilter.length && !habitatFilter.includes(p.habitat)) return false;
      if (flavorFilter.length && (!p.flavor || !flavorFilter.includes(p.flavor))) return false;
      if (specialtyFilter.length && !specialtyFilter.some((s) => p.specialties?.includes(s))) return false;
      if (catFilter.length && !catFilter.every((c) => p.categories.includes(c))) return false;
      if (locFilter.length && !locFilter.some((loc) => p.habitatList?.some((h) => h.locations.includes(loc)))) return false;
      return true;
    });
  }, [habitatFilter, flavorFilter, specialtyFilter, catFilter, locFilter]);

  const hasFilters = habitatFilter.length || flavorFilter.length || specialtyFilter.length || catFilter.length || locFilter.length;
  const clearAll = () => { setHabitatFilter([]); setFlavorFilter([]); setSpecialtyFilter([]); setCatFilter([]); setLocFilter([]); };

  const allSpecialties = Object.values(SPECIALTIES).sort((a, b) => a.name.localeCompare(b.name));
  const allCategories = Object.values(CATEGORIES).sort((a, b) => a.name.localeCompare(b.name));
  const allLocations = Object.values(LOCATIONS).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="detail-wrap">
      <div className="breadcrumb">
        <Link href="/">Home</Link><span>›</span><span>Filter</span>
      </div>
      <div className="detail-header">
        <div className="detail-title">Filter</div>
        <div className="detail-meta">Find Pokémon matching ALL selected criteria simultaneously — different from the Pokédex which just browses and searches by name.</div>
      </div>

      <div className="card">
        {[
          { label: "Ideal Habitat", vals: HABITATS, active: habitatFilter, set: setHabitatFilter },
          { label: "Flavor", vals: FLAVORS, active: flavorFilter, set: setFlavorFilter },
        ].map(({ label, vals, active, set }) => (
          <div key={label} className="mb-4">
            <div className="stat-label mb-1.5">{label}</div>
            <div className="flex flex-wrap gap-1.5">
              {vals.map((v) => (
                <button key={v} className={`shortcut${active.includes(v) ? " shortcut--on" : ""}`} onClick={() => toggle(active, v, set)}>{v}</button>
              ))}
            </div>
          </div>
        ))}

        <div className="mb-4">
          <div className="stat-label mb-1.5">Specialty</div>
          <div className="flex flex-wrap gap-1.5">
            {allSpecialties.map((s) => (
              <button key={s.slug} className={`shortcut${specialtyFilter.includes(s.slug) ? " shortcut--on" : ""}`} onClick={() => toggle(specialtyFilter, s.slug, setSpecialtyFilter)}>{s.name}</button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <div className="stat-label mb-1.5">Favorite category (all must match)</div>
          <div className="flex flex-wrap gap-1.5">
            {allCategories.map((c) => (
              <button key={c.slug} className={`shortcut${catFilter.includes(c.slug) ? " shortcut--on-accent" : ""}`} onClick={() => toggle(catFilter, c.slug, setCatFilter)}>{c.name}</button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <div className="stat-label mb-1.5">Location (any)</div>
          <div className="flex flex-wrap gap-1.5">
            {allLocations.map((l) => (
              <button key={l.slug} className={`shortcut${locFilter.includes(l.slug) ? " shortcut--on-leaf" : ""}`} onClick={() => toggle(locFilter, l.slug, setLocFilter)}>{l.name}</button>
            ))}
          </div>
        </div>

        {hasFilters && <button className="shortcut" onClick={clearAll}>Clear all filters</button>}
      </div>

      <div className="card">
        <div className="section-title">
          Results <span className="pill">{results.length} Pokémon</span>
        </div>
        {!hasFilters && <p className="section-sub">Select at least one filter above to narrow results.</p>}
        {hasFilters && results.length === 0 && <p className="detail-meta">No Pokémon match all selected filters.</p>}
        {results.length > 50 && <p className="section-sub text-accent">Showing {results.length} matches — add more filters to narrow down.</p>}
        {results.length > 0 && (
          <div className="pkmn-grid mt-3">
            {results.map((p) => (
              <Link key={p.slug} href={`/pokemon/${p.slug}`} className="pkmn-grid-card">
                <div className="pkmn-grid-icon">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={pkmnIconUrl(p)} alt={p.name} className="w-full h-full object-contain [image-rendering:pixelated]" />
                </div>
                <div className="pkmn-grid-num">#{dexNum(p)}</div>
                <div className="pkmn-grid-name">{p.name}</div>
                <div className="font-mono text-[10px] text-ink-fade">{p.habitat}</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
