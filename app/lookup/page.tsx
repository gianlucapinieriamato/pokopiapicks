"use client";
import Link from "next/link";
import { useState, useMemo } from "react";
import { POKEMON_LIST, CATEGORIES, SPECIALTIES, LOCATIONS, pkmnIconUrl, dexNum } from "@/app/lib/data";
import { useLang } from "@/app/lib/lang";

const HABITATS = ["Dry", "Bright", "Warm", "Cool", "Dark", "Humid"];
const FLAVORS = ["Dry", "Sour", "Spicy", "Sweet", "Bitter"];

const STRINGS = {
  en: {
    title: "Filter",
    description: "Find Pokémon matching ALL selected criteria simultaneously — different from the Pokédex which just browses and searches by name.",
    habitat: "Ideal Habitat",
    flavor: "Flavor",
    specialty: "Specialty",
    category: "Favorite category (all must match)",
    location: "Location (any)",
    clearAll: "Clear all filters",
    results: "Results",
    noFilter: "Select at least one filter above to narrow results.",
    noResults: "No Pokémon match all selected filters.",
    tooMany: (n: number) => `Showing ${n} matches — add more filters to narrow down.`,
  },
  es: {
    title: "Filtrar",
    description: "Encuentra Pokémon que coincidan con TODOS los criterios seleccionados — diferente al Pokédex que solo navega y busca por nombre.",
    habitat: "Hábitat ideal",
    flavor: "Sabor",
    specialty: "Especialidad",
    category: "Categoría favorita (todas deben coincidir)",
    location: "Ubicación (cualquiera)",
    clearAll: "Borrar todos los filtros",
    results: "Resultados",
    noFilter: "Selecciona al menos un filtro para filtrar los resultados.",
    noResults: "Ningún Pokémon coincide con todos los filtros seleccionados.",
    tooMany: (n: number) => `Mostrando ${n} coincidencias — agrega más filtros para reducir.`,
  },
} as const;

export default function LookupPage() {
  const lang = useLang();
  const t = STRINGS[lang];

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
        <Link href="/">Home</Link><span>›</span><span>{t.title}</span>
      </div>
      <div className="detail-header">
        <div className="detail-title">{t.title}</div>
        <div className="detail-meta">{t.description}</div>
      </div>

      <div className="card">
        {[
          { label: t.habitat, vals: HABITATS, active: habitatFilter, set: setHabitatFilter },
          { label: t.flavor, vals: FLAVORS, active: flavorFilter, set: setFlavorFilter },
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
          <div className="stat-label mb-1.5">{t.specialty}</div>
          <div className="flex flex-wrap gap-1.5">
            {allSpecialties.map((s) => (
              <button key={s.slug} className={`shortcut${specialtyFilter.includes(s.slug) ? " shortcut--on" : ""}`} onClick={() => toggle(specialtyFilter, s.slug, setSpecialtyFilter)}>{s.name}</button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <div className="stat-label mb-1.5">{t.category}</div>
          <div className="flex flex-wrap gap-1.5">
            {allCategories.map((c) => (
              <button key={c.slug} className={`shortcut${catFilter.includes(c.slug) ? " shortcut--on-accent" : ""}`} onClick={() => toggle(catFilter, c.slug, setCatFilter)}>{c.name}</button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <div className="stat-label mb-1.5">{t.location}</div>
          <div className="flex flex-wrap gap-1.5">
            {allLocations.map((l) => (
              <button key={l.slug} className={`shortcut${locFilter.includes(l.slug) ? " shortcut--on-leaf" : ""}`} onClick={() => toggle(locFilter, l.slug, setLocFilter)}>{l.name}</button>
            ))}
          </div>
        </div>

        {hasFilters && <button className="shortcut" onClick={clearAll}>{t.clearAll}</button>}
      </div>

      <div className="card">
        <div className="section-title">
          {t.results} <span className="pill">{results.length} Pokémon</span>
        </div>
        {!hasFilters && <p className="section-sub">{t.noFilter}</p>}
        {hasFilters && results.length === 0 && <p className="detail-meta">{t.noResults}</p>}
        {results.length > 50 && <p className="section-sub text-accent">{t.tooMany(results.length)}</p>}
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
