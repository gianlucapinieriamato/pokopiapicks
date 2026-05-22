"use client";
import Link from "next/link";
import { useMemo, useReducer } from "react";
import { POKEMON_LIST, SPECIALTIES } from "@/app/lib/data";
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
const PAGE_SIZE = 60;

const HABITAT_COUNTS: Record<string, number> = {};
const FLAVOR_COUNTS: Record<string, number> = {};
for (const p of POKEMON_LIST) {
  HABITAT_COUNTS[p.habitat] = (HABITAT_COUNTS[p.habitat] ?? 0) + 1;
  if (p.flavor) FLAVOR_COUNTS[p.flavor] = (FLAVOR_COUNTS[p.flavor] ?? 0) + 1;
}

type FilterState = {
  habitatFilter: string[];
  flavorFilter: string[];
  specialtyFilter: string[];
  search: string;
  page: number;
};

type FilterAction =
  | { type: "TOGGLE"; key: "habitatFilter" | "flavorFilter" | "specialtyFilter"; val: string }
  | { type: "SET_SEARCH"; val: string }
  | { type: "SET_PAGE"; val: number }
  | { type: "CLEAR" };

const INIT_STATE: FilterState = { habitatFilter: [], flavorFilter: [], specialtyFilter: [], search: "", page: 1 };

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

export default function PokedexPage() {
  const [state, dispatch] = useReducer(filterReducer, INIT_STATE);
  const { habitatFilter, flavorFilter, specialtyFilter, search, page } = state;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return POKEMON_LIST.filter((p) => {
      if (q && !p.name.toLowerCase().includes(q)) return false;
      if (habitatFilter.length && !habitatFilter.includes(p.habitat)) return false;
      if (flavorFilter.length && (!p.flavor || !flavorFilter.includes(p.flavor))) return false;
      if (specialtyFilter.length && !p.specialties?.some((s) => specialtyFilter.includes(s))) return false;
      return true;
    });
  }, [search, habitatFilter, flavorFilter, specialtyFilter]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <PageWrap>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Pokédex" }]} />
      <PageHeader title="Pokédex" meta={`${filtered.length} / ${POKEMON_LIST.length} Pokemon`} />

      <Card className="mb-4">
        <SearchInput
          value={search}
          onChange={(e) => dispatch({ type: "SET_SEARCH", val: e.target.value })}
          placeholder="Search Pokemon…"
          className="mb-4"
        />
        <div className="flex flex-wrap gap-3">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-soft font-semibold mb-1.5">Ideal Habitat</div>
            <div className="flex flex-wrap gap-1.5">
              {HABITATS.map((h) => (
                <Shortcut key={h} active={habitatFilter.includes(h)} onClick={() => dispatch({ type: "TOGGLE", key: "habitatFilter", val: h })}>
                  {h} <span className="opacity-55 text-[10px]">({HABITAT_COUNTS[h] ?? 0})</span>
                </Shortcut>
              ))}
            </div>
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-soft font-semibold mb-1.5">Flavor</div>
            <div className="flex flex-wrap gap-1.5">
              {FLAVORS.map((f) => (
                <Shortcut key={f} active={flavorFilter.includes(f)} onClick={() => dispatch({ type: "TOGGLE", key: "flavorFilter", val: f })}>
                  {f} <span className="opacity-55 text-[10px]">({FLAVOR_COUNTS[f] ?? 0})</span>
                </Shortcut>
              ))}
            </div>
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-soft font-semibold mb-1.5">Specialty</div>
            <div className="flex flex-wrap gap-1.5">
              {ALL_SPECIALTIES.map((s) => (
                <Shortcut key={s.slug} active={specialtyFilter.includes(s.slug)} onClick={() => dispatch({ type: "TOGGLE", key: "specialtyFilter", val: s.slug })}>
                  {s.name}
                </Shortcut>
              ))}
            </div>
          </div>
        </div>
        {(habitatFilter.length || flavorFilter.length || specialtyFilter.length || search) ? (
          <Shortcut className="mt-3" onClick={() => dispatch({ type: "CLEAR" })}>
            Clear filters
          </Shortcut>
        ) : null}
      </Card>

      <Card>
        {paginated.length === 0 ? (
          <p className="font-mono text-[12px] text-ink-soft tracking-[0.04em] font-medium">No Pokemon match your filters.</p>
        ) : (
          <div className="grid grid-cols-1 min-[400px]:grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(175px,1fr))] gap-2 sm:gap-3 max-w-[220px] min-[400px]:max-w-none mx-auto min-[400px]:mx-0">
            {paginated.map((p) => (
              <Link key={p.slug} href={`/pokemon/${p.slug}`} className="group cursor-pointer border-none bg-transparent p-0 text-left flex no-underline text-inherit transition-transform duration-150 hover:-translate-y-1 hover:scale-[1.02]" aria-label={p.name}>
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
