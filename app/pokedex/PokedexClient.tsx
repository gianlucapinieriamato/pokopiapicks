"use client";
import Link from "next/link";
import { useMemo, useReducer, useState } from "react";
import { POKEMON_LIST, SPECIALTIES, CATEGORIES, LOCATIONS } from "@/app/lib/data";
import TcgCard from "@/app/components/TcgCard";
import Shortcut from "@/app/components/Shortcut";
import SearchInput from "@/app/components/SearchInput";
import NavBtn from "@/app/components/NavBtn";
import PageWrap from "@/app/components/PageWrap";
import Breadcrumb from "@/app/components/Breadcrumb";
import Card from "@/app/components/Card";
import PageHeader from "@/app/components/PageHeader";

const HABITATS = ["Dry", "Bright", "Warm", "Cool", "Dark", "Humid"];
const FLAVORS = ["Dry", "Sour", "Spicy", "Sweet", "Bitter"];
const ALL_SPECIALTIES = Object.values(SPECIALTIES);
const ALL_CATEGORIES = Object.values(CATEGORIES);
const ALL_LOCATIONS = Object.values(LOCATIONS);
const PAGE_SIZE = 60;

const HABITAT_COUNTS = (() => {
  const counts: Record<string, number> = {};
  for (const p of POKEMON_LIST) {
    counts[p.habitat] = (counts[p.habitat] ?? 0) + 1;
  }
  return counts;
})() as Readonly<Record<string, number>>;

const FLAVOR_COUNTS = (() => {
  const counts: Record<string, number> = {};
  for (const p of POKEMON_LIST) {
    if (p.flavor) counts[p.flavor] = (counts[p.flavor] ?? 0) + 1;
  }
  return counts;
})() as Readonly<Record<string, number>>;

type FilterState = {
  habitatFilter: string[];
  flavorFilter: string[];
  specialtyFilter: string[];
  catFilter: string[];
  locFilter: string[];
  search: string;
  page: number;
};

type FilterAction =
  | { type: "TOGGLE"; key: "habitatFilter" | "flavorFilter" | "specialtyFilter" | "catFilter" | "locFilter"; val: string }
  | { type: "SET_SEARCH"; val: string }
  | { type: "SET_PAGE"; val: number }
  | { type: "CLEAR" };

const INIT_STATE: FilterState = {
  habitatFilter: [], flavorFilter: [], specialtyFilter: [],
  catFilter: [], locFilter: [], search: "", page: 1,
};

function filterReducer(state: FilterState, action: FilterAction): FilterState {
  switch (action.type) {
    case "TOGGLE": {
      const arr = state[action.key];
      const next = arr.includes(action.val) ? arr.filter((x) => x !== action.val) : [...arr, action.val];
      return { ...state, [action.key]: next, page: 1 };
    }
    case "SET_SEARCH": return { ...state, search: action.val, page: 1 };
    case "SET_PAGE": return { ...state, page: action.val };
    case "CLEAR": return INIT_STATE;
  }
}

export default function PokedexClient() {
  const [state, dispatch] = useReducer(filterReducer, INIT_STATE);
  const { habitatFilter, flavorFilter, specialtyFilter, catFilter, locFilter, search, page } = state;
  const [openPanel, setOpenPanel] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return POKEMON_LIST.filter((p) => {
      if (q && !p.name.toLowerCase().includes(q)) return false;
      if (habitatFilter.length && !habitatFilter.includes(p.habitat)) return false;
      if (flavorFilter.length && (!p.flavor || !flavorFilter.includes(p.flavor))) return false;
      if (specialtyFilter.length && !p.specialties?.some((s) => specialtyFilter.includes(s))) return false;
      if (catFilter.length && !catFilter.every((c) => p.categories.includes(c))) return false;
      if (locFilter.length && !locFilter.some((loc) => p.habitatList?.some((h) => h.locations.includes(loc)))) return false;
      return true;
    });
  }, [search, habitatFilter, flavorFilter, specialtyFilter, catFilter, locFilter]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const hasFilters = !!(search || habitatFilter.length || flavorFilter.length || specialtyFilter.length || catFilter.length || locFilter.length);

  return (
    <PageWrap>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Pokédex" }]} />
      <PageHeader title="Pokédex" meta={`${filtered.length} / ${POKEMON_LIST.length} Pokemon`} />

      <Card className="mb-4">
        <SearchInput
          value={search}
          onChange={(e) => dispatch({ type: "SET_SEARCH", val: e.target.value })}
          placeholder="Search Pokemon…"
          className="mb-3"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          {([
            { id: "habitat", label: "Ideal Habitat", vals: HABITATS, active: habitatFilter, key: "habitatFilter" as const, counts: HABITAT_COUNTS },
            { id: "flavor", label: "Flavor", vals: FLAVORS, active: flavorFilter, key: "flavorFilter" as const, counts: FLAVOR_COUNTS },
          ] as const).map(({ id, label, vals, active, key, counts }) => (
            <div key={id} className="bg-chrome rounded-xl border border-paper-edge px-3 py-2.5">
              <button type="button" className="w-full flex items-center justify-between cursor-pointer" onClick={() => setOpenPanel(openPanel === id ? null : id)}>
                <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-soft font-semibold">{label}</div>
                <div className="flex items-center gap-1.5">
                  {active.length > 0 && <span className="font-mono text-[9px] bg-ink text-paper px-1.5 py-[2px] rounded-full">{active.length}</span>}
                  <span className="font-mono text-[10px] text-ink-fade">{openPanel === id ? "▲" : "▼"}</span>
                </div>
              </button>
              {openPanel === id && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {vals.map((v) => (
                    <Shortcut key={v} active={active.includes(v)} onClick={() => dispatch({ type: "TOGGLE", key, val: v })}>
                      {v} <span className="opacity-55 text-[10px]">({counts[v] ?? 0})</span>
                    </Shortcut>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {([
          { id: "specialty", label: "Specialty", active: specialtyFilter, key: "specialtyFilter" as const, badge: "bg-ink", items: ALL_SPECIALTIES.map((s) => ({ val: s.slug, label: s.name })) },
          { id: "location", label: "Location", active: locFilter, key: "locFilter" as const, badge: "bg-leaf", items: ALL_LOCATIONS.map((l) => ({ val: l.slug, label: l.name })) },
        ] as const).map(({ id, label, active, key, badge, items }) => (
          <div key={id} className="bg-chrome rounded-xl border border-paper-edge px-3 py-2.5 mb-3">
            <button type="button" className="w-full flex items-center justify-between cursor-pointer" onClick={() => setOpenPanel(openPanel === id ? null : id)}>
              <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-soft font-semibold">{label}</div>
              <div className="flex items-center gap-1.5">
                {active.length > 0 && <span className={`font-mono text-[9px] ${badge} text-paper px-1.5 py-[2px] rounded-full`}>{active.length}</span>}
                <span className="font-mono text-[10px] text-ink-fade">{openPanel === id ? "▲" : "▼"}</span>
              </div>
            </button>
            {openPanel === id && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {items.map((item) => (
                  <Shortcut key={item.val} active={active.includes(item.val)} onClick={() => dispatch({ type: "TOGGLE", key, val: item.val })}>
                    {item.label}
                  </Shortcut>
                ))}
              </div>
            )}
          </div>
        ))}

        <div className="bg-chrome rounded-xl border border-paper-edge px-3 py-2.5 mb-3">
          <button type="button" className="w-full flex items-center justify-between cursor-pointer" onClick={() => setOpenPanel(openPanel === "category" ? null : "category")}>
            <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-soft font-semibold">
              Favorite category <span className="normal-case font-normal opacity-60">(all must match)</span>
            </div>
            <div className="flex items-center gap-1.5">
              {catFilter.length > 0 && <span className="font-mono text-[9px] bg-accent text-paper px-1.5 py-[2px] rounded-full">{catFilter.length}</span>}
              <span className="font-mono text-[10px] text-ink-fade">{openPanel === "category" ? "▲" : "▼"}</span>
            </div>
          </button>
          {openPanel === "category" && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {ALL_CATEGORIES.map((c) => (
                <Shortcut key={c.slug} active={catFilter.includes(c.slug)} variant="on-accent" onClick={() => dispatch({ type: "TOGGLE", key: "catFilter", val: c.slug })}>
                  {c.name}
                </Shortcut>
              ))}
            </div>
          )}
        </div>

        {hasFilters && (
          <Shortcut onClick={() => dispatch({ type: "CLEAR" })}>Clear filters</Shortcut>
        )}
      </Card>

      <Card>
        {paginated.length === 0 ? (
          <p className="font-mono text-[12px] text-ink-soft tracking-[0.04em] font-medium">No Pokemon match your filters.</p>
        ) : (
          <div className="grid grid-cols-1 min-[400px]:grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(175px,1fr))] gap-2 sm:gap-3 max-w-[220px] min-[400px]:max-w-none mx-auto min-[400px]:mx-0">
            {paginated.map((p) => (
              <Link key={p.slug} href={`/pokemon/${p.slug}`} className="group cursor-pointer border-none bg-transparent p-0 text-left flex no-underline text-inherit transition-transform duration-150 hover:-translate-y-1 hover:scale-[1.02] min-h-[300px]" aria-label={p.name}>
                <TcgCard p={p} size="sm" />
              </Link>
            ))}
          </div>
        )}
        {pages > 1 && (
          <div className="flex justify-center gap-2 mt-5">
            {page > 1 && <NavBtn onClick={() => dispatch({ type: "SET_PAGE", val: page - 1 })}>◀ Prev</NavBtn>}
            <span className="font-mono text-[12px] text-ink-soft tracking-[0.04em] font-medium self-center">Page {page} / {pages}</span>
            {page < pages && <NavBtn onClick={() => dispatch({ type: "SET_PAGE", val: page + 1 })}>Next ▶</NavBtn>}
          </div>
        )}
      </Card>
    </PageWrap>
  );
}
