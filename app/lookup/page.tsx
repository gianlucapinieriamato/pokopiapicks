"use client";
import { useState, useMemo, type Dispatch, type SetStateAction } from "react";
import { POKEMON_LIST, CATEGORIES, SPECIALTIES, LOCATIONS } from "@/app/lib/data";
import PageWrap from "@/app/components/PageWrap";
import Breadcrumb from "@/app/components/Breadcrumb";
import Card from "@/app/components/Card";
import PageHeader from "@/app/components/PageHeader";
import SectionTitle from "@/app/components/SectionTitle";
import PokemonGridCard from "@/app/components/PokemonGridCard";
import PokemonGrid from "@/app/components/PokemonGrid";
import Shortcut from "@/app/components/Shortcut";

const HABITATS = ["Dry", "Bright", "Warm", "Cool", "Dark", "Humid"];
const FLAVORS = ["Dry", "Sour", "Spicy", "Sweet", "Bitter"];
const ALL_SPECIALTIES = Object.values(SPECIALTIES);
const ALL_CATEGORIES = Object.values(CATEGORIES);
const ALL_LOCATIONS = Object.values(LOCATIONS);

export default function LookupPage() {
  const [habitatFilter, setHabitatFilter] = useState<string[]>([]);
  const [flavorFilter, setFlavorFilter] = useState<string[]>([]);
  const [specialtyFilter, setSpecialtyFilter] = useState<string[]>([]);
  const [catFilter, setCatFilter] = useState<string[]>([]);
  const [locFilter, setLocFilter] = useState<string[]>([]);

  const toggle = (val: string, set: Dispatch<SetStateAction<string[]>>) => {
    set((prev) => prev.includes(val) ? prev.filter((x) => x !== val) : [...prev, val]);
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

  const hasFilters = !!(habitatFilter.length || flavorFilter.length || specialtyFilter.length || catFilter.length || locFilter.length);
  const clearAll = () => { setHabitatFilter([]); setFlavorFilter([]); setSpecialtyFilter([]); setCatFilter([]); setLocFilter([]); };

  return (
    <PageWrap>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Filter" }]} />
      <PageHeader title="Filter" meta="Find Pokemon matching ALL selected criteria simultaneously — different from the Pokédex which just browses and searches by name." />

      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          {[
            { label: "Ideal Habitat", vals: HABITATS, active: habitatFilter, set: setHabitatFilter, variant: "on" as const },
            { label: "Flavor", vals: FLAVORS, active: flavorFilter, set: setFlavorFilter, variant: "on" as const },
          ].map(({ label, vals, active, set, variant }) => (
            <div key={label} className="bg-chrome rounded-xl border border-paper-edge px-3 py-2.5">
              <div className="flex items-center justify-between mb-2">
                <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-soft font-semibold">{label}</div>
                {active.length > 0 && <span className="font-mono text-[9px] bg-ink text-paper px-1.5 py-[2px] rounded-full">{active.length}</span>}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {vals.map((v) => (
                  <Shortcut key={v} active={active.includes(v)} variant={variant} onClick={() => toggle(v, set)}>{v}</Shortcut>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-chrome rounded-xl border border-paper-edge px-3 py-2.5 mb-3">
          <div className="flex items-center justify-between mb-2">
            <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-soft font-semibold">Specialty</div>
            {specialtyFilter.length > 0 && <span className="font-mono text-[9px] bg-ink text-paper px-1.5 py-[2px] rounded-full">{specialtyFilter.length}</span>}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {ALL_SPECIALTIES.map((s) => (
              <Shortcut key={s.slug} active={specialtyFilter.includes(s.slug)} onClick={() => toggle(s.slug, setSpecialtyFilter)}>{s.name}</Shortcut>
            ))}
          </div>
        </div>

        <div className="bg-chrome rounded-xl border border-paper-edge px-3 py-2.5 mb-3">
          <div className="flex items-center justify-between mb-2">
            <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-soft font-semibold">
              Favorite category <span className="normal-case font-normal opacity-60">(all must match)</span>
            </div>
            {catFilter.length > 0 && <span className="font-mono text-[9px] bg-accent text-paper px-1.5 py-[2px] rounded-full">{catFilter.length}</span>}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {ALL_CATEGORIES.map((c) => (
              <Shortcut key={c.slug} active={catFilter.includes(c.slug)} variant="on-accent" onClick={() => toggle(c.slug, setCatFilter)}>{c.name}</Shortcut>
            ))}
          </div>
        </div>

        <div className="bg-chrome rounded-xl border border-paper-edge px-3 py-2.5 mb-3">
          <div className="flex items-center justify-between mb-2">
            <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-soft font-semibold">
              Location <span className="normal-case font-normal opacity-60">(any)</span>
            </div>
            {locFilter.length > 0 && <span className="font-mono text-[9px] bg-leaf text-paper px-1.5 py-[2px] rounded-full">{locFilter.length}</span>}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {ALL_LOCATIONS.map((l) => (
              <Shortcut key={l.slug} active={locFilter.includes(l.slug)} variant="on-leaf" onClick={() => toggle(l.slug, setLocFilter)}>{l.name}</Shortcut>
            ))}
          </div>
        </div>

        {hasFilters && <Shortcut onClick={clearAll}>Clear all filters</Shortcut>}
      </Card>

      <Card>
        <SectionTitle pill={results.length + " Pokemon"}>Results</SectionTitle>
        {!hasFilters && <p className="text-[13px] text-ink-soft mb-4 leading-relaxed">Select at least one filter above to narrow results.</p>}
        {hasFilters && results.length === 0 && <p className="font-mono text-[12px] text-ink-soft tracking-[0.04em] font-medium">No Pokemon match all selected filters.</p>}
        {results.length > 50 && <p className="text-[13px] text-ink-soft mb-4 leading-relaxed text-accent">Showing {results.length} matches — add more filters to narrow down.</p>}
        {results.length > 0 && (
          <PokemonGrid className="mt-3">
            {results.map((p) => (
              <PokemonGridCard key={p.slug} p={p}>
                <div className="font-mono text-[10px] text-ink-fade">{p.habitat}</div>
              </PokemonGridCard>
            ))}
          </PokemonGrid>
        )}
      </Card>
    </PageWrap>
  );
}
