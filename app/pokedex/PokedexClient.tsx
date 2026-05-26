"use client";
import Link from "next/link";
import { useMemo, useReducer, useState } from "react";
import {
  POKEMON_LIST,
  Specialty,
  Category,
  Location,
  PokemonHabitat,
  Flavor,
  PokemonType,
  POKEMON_BY_TYPE,
} from "@/app/lib/const";
import TcgCard from "@/app/components/TcgCard";
import Shortcut from "@/app/components/Shortcut";
import SearchInput from "@/app/components/SearchInput";
import NavBtn from "@/app/components/NavBtn";
import PageWrap from "@/app/components/PageWrap";
import Breadcrumb from "@/app/components/Breadcrumb";
import Card from "@/app/components/Card";
import PageHeader from "@/app/components/PageHeader";

const ALL_HABITATS = Object.values(PokemonHabitat);
const ALL_FLAVORS = Object.values(Flavor);
const ALL_TYPES = Object.values(PokemonType);
const ALL_SPECIALTIES = Object.values(Specialty);
const ALL_CATEGORIES = Object.values(Category);
const ALL_LOCATIONS = Object.values(Location);

const TYPE_COUNTS = Object.freeze(
  Object.fromEntries(ALL_TYPES.map((t) => [t.slug, (POKEMON_BY_TYPE[t.slug] ?? []).length])),
);
const PAGE_SIZE = 60;

const HABITAT_COUNTS = Object.freeze(
  POKEMON_LIST.reduce<Record<string, number>>((acc, p) => {
    acc[p.habitat.slug] = (acc[p.habitat.slug] ?? 0) + 1;
    return acc;
  }, {}),
);

const FLAVOR_COUNTS = Object.freeze(
  POKEMON_LIST.reduce<Record<string, number>>((acc, p) => {
    if (p.flavor) acc[p.flavor.slug] = (acc[p.flavor.slug] ?? 0) + 1;
    return acc;
  }, {}),
);

type FilterPanel = "habitat" | "flavor" | "type" | "specialty" | "location" | "category";

type FilterState = {
  habitatFilter: string[];
  flavorFilter: string[];
  typeFilter: string[];
  specialtyFilter: string[];
  catFilter: string[];
  locFilter: string[];
  search: string;
  page: number;
};

type FilterAction =
  | {
      type: "TOGGLE";
      key: "habitatFilter" | "flavorFilter" | "typeFilter" | "specialtyFilter" | "catFilter" | "locFilter";
      val: string;
    }
  | { type: "SET_SEARCH"; val: string }
  | { type: "SET_PAGE"; val: number }
  | { type: "CLEAR" };

const INIT_STATE: FilterState = {
  habitatFilter: [],
  flavorFilter: [],
  typeFilter: [],
  specialtyFilter: [],
  catFilter: [],
  locFilter: [],
  search: "",
  page: 1,
};

function filterReducer(state: FilterState, action: FilterAction): FilterState {
  switch (action.type) {
    case "TOGGLE": {
      const arr = state[action.key];
      const next = arr.includes(action.val)
        ? arr.filter((x) => x !== action.val)
        : [...arr, action.val];
      return { ...state, [action.key]: next, page: 1 };
    }
    case "SET_SEARCH":
      return { ...state, search: action.val, page: 1 };
    case "SET_PAGE":
      return { ...state, page: action.val };
    case "CLEAR":
      return INIT_STATE;
  }
}

export default function PokedexClient() {
  const [state, dispatch] = useReducer(filterReducer, INIT_STATE);
  const { habitatFilter, flavorFilter, typeFilter, specialtyFilter, catFilter, locFilter, search, page } = state;
  const [openPanel, setOpenPanel] = useState<FilterPanel | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return POKEMON_LIST.filter((p) => {
      if (q && !p.label.toLowerCase().includes(q)) return false;
      if (habitatFilter.length && !habitatFilter.includes(p.habitat.slug)) return false;
      if (flavorFilter.length && (!p.flavor || !flavorFilter.includes(p.flavor.slug))) return false;
      if (typeFilter.length && !typeFilter.some((ts) => p.types.some((t) => t.slug === ts))) return false;
      if (specialtyFilter.length && !p.specialties.some((s) => specialtyFilter.includes(s.slug))) return false;
      if (catFilter.length && !catFilter.every((cs) => p.categories.some((c) => c.slug === cs))) return false;
      if (locFilter.length && !locFilter.some((ls) => p.habitatList.some((h) => h.locations.some((l) => l.slug === ls)))) return false;
      return true;
    });
  }, [search, habitatFilter, flavorFilter, typeFilter, specialtyFilter, catFilter, locFilter]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const hasFilters = !!(
    search || habitatFilter.length || flavorFilter.length || typeFilter.length || specialtyFilter.length || catFilter.length || locFilter.length
  );

  return (
    <PageWrap>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Pokedex" }]} />
      <PageHeader
        title="Pokedex"
        meta={`${filtered.length} / ${POKEMON_LIST.length} Pokemon`}
      />

      <Card className="mb-4">
        <SearchInput
          value={search}
          onChange={(e) => dispatch({ type: "SET_SEARCH", val: e.target.value })}
          placeholder="Search Pokemon…"
          className="mb-3"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          {(
            [
              {
                id: "habitat",
                label: "Ideal Habitat",
                vals: ALL_HABITATS,
                active: habitatFilter,
                key: "habitatFilter" as const,
                counts: HABITAT_COUNTS,
              },
              {
                id: "flavor",
                label: "Flavor",
                vals: ALL_FLAVORS,
                active: flavorFilter,
                key: "flavorFilter" as const,
                counts: FLAVOR_COUNTS,
              },
            ] as const
          ).map(({ id, label, vals, active, key, counts }) => (
            <div
              key={id}
              className="bg-chrome rounded-xl border border-paper-edge px-3 py-2.5"
            >
              <button
                type="button"
                aria-expanded={openPanel === id}
                aria-controls={`filter-panel-${id}`}
                className="w-full flex items-center justify-between cursor-pointer"
                onClick={() => setOpenPanel(openPanel === id ? null : id)}
              >
                <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-soft font-semibold">
                  {label}
                </div>
                <div className="flex items-center gap-1.5">
                  {active.length > 0 && (
                    <span className="font-mono text-[9px] bg-ink text-paper px-1.5 py-[2px] rounded-full">
                      {active.length}
                    </span>
                  )}
                  <span className="font-mono text-[10px] text-ink-fade">
                    {openPanel === id ? "▲" : "▼"}
                  </span>
                </div>
              </button>
              {openPanel === id && (
                <div id={`filter-panel-${id}`} className="flex flex-wrap gap-1.5 mt-3">
                  {vals.map((v) => (
                    <Shortcut
                      key={v.slug}
                      active={active.includes(v.slug)}
                      onClick={() => dispatch({ type: "TOGGLE", key, val: v.slug })}
                    >
                      {v.label}{" "}
                      <span className="opacity-55 text-[10px]">({counts[v.slug] ?? 0})</span>
                    </Shortcut>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="bg-chrome rounded-xl border border-paper-edge px-3 py-2.5 mb-3">
          <button
            type="button"
            aria-expanded={openPanel === "type"}
            aria-controls="filter-panel-type"
            className="w-full flex items-center justify-between cursor-pointer"
            onClick={() => setOpenPanel(openPanel === "type" ? null : "type")}
          >
            <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-soft font-semibold">
              Type
            </div>
            <div className="flex items-center gap-1.5">
              {typeFilter.length > 0 && (
                <span className="font-mono text-[9px] bg-accent text-paper px-1.5 py-[2px] rounded-full">
                  {typeFilter.length}
                </span>
              )}
              <span className="font-mono text-[10px] text-ink-fade">
                {openPanel === "type" ? "▲" : "▼"}
              </span>
            </div>
          </button>
          {openPanel === "type" && (
            <div id="filter-panel-type" className="flex flex-wrap gap-1.5 mt-3">
              {ALL_TYPES.map((t) => (
                <Shortcut
                  key={t.slug}
                  active={typeFilter.includes(t.slug)}
                  onClick={() => dispatch({ type: "TOGGLE", key: "typeFilter", val: t.slug })}
                >
                  {t.label}{" "}
                  <span className="opacity-55 text-[10px]">({TYPE_COUNTS[t.slug] ?? 0})</span>
                </Shortcut>
              ))}
            </div>
          )}
        </div>

        {(
          [
            {
              id: "specialty",
              label: "Specialty",
              active: specialtyFilter,
              key: "specialtyFilter" as const,
              badge: "bg-ink",
              items: ALL_SPECIALTIES.map((s) => ({ val: s.slug, label: s.label })),
            },
            {
              id: "location",
              label: "Location",
              active: locFilter,
              key: "locFilter" as const,
              badge: "bg-leaf",
              items: ALL_LOCATIONS.map((l) => ({ val: l.slug, label: l.label })),
            },
          ] as const
        ).map(({ id, label, active, key, badge, items }) => (
          <div
            key={id}
            className="bg-chrome rounded-xl border border-paper-edge px-3 py-2.5 mb-3"
          >
            <button
              type="button"
              aria-expanded={openPanel === id}
              aria-controls={`filter-panel-${id}`}
              className="w-full flex items-center justify-between cursor-pointer"
              onClick={() => setOpenPanel(openPanel === id ? null : id)}
            >
              <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-soft font-semibold">
                {label}
              </div>
              <div className="flex items-center gap-1.5">
                {active.length > 0 && (
                  <span className={`font-mono text-[9px] ${badge} text-paper px-1.5 py-[2px] rounded-full`}>
                    {active.length}
                  </span>
                )}
                <span className="font-mono text-[10px] text-ink-fade">
                  {openPanel === id ? "▲" : "▼"}
                </span>
              </div>
            </button>
            {openPanel === id && (
              <div id={`filter-panel-${id}`} className="flex flex-wrap gap-1.5 mt-3">
                {items.map((item) => (
                  <Shortcut
                    key={item.val}
                    active={active.includes(item.val)}
                    onClick={() => dispatch({ type: "TOGGLE", key, val: item.val })}
                  >
                    {item.label}
                  </Shortcut>
                ))}
              </div>
            )}
          </div>
        ))}

        <div className="bg-chrome rounded-xl border border-paper-edge px-3 py-2.5 mb-3">
          <button
            type="button"
            aria-expanded={openPanel === "category"}
            aria-controls="filter-panel-category"
            className="w-full flex items-center justify-between cursor-pointer"
            onClick={() => setOpenPanel(openPanel === "category" ? null : "category")}
          >
            <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-soft font-semibold">
              Favorite category{" "}
              <span className="normal-case font-normal opacity-60">(all must match)</span>
            </div>
            <div className="flex items-center gap-1.5">
              {catFilter.length > 0 && (
                <span className="font-mono text-[9px] bg-accent text-paper px-1.5 py-[2px] rounded-full">
                  {catFilter.length}
                </span>
              )}
              <span className="font-mono text-[10px] text-ink-fade">
                {openPanel === "category" ? "▲" : "▼"}
              </span>
            </div>
          </button>
          {openPanel === "category" && (
            <div id="filter-panel-category" className="flex flex-wrap gap-1.5 mt-3">
              {ALL_CATEGORIES.map((c) => (
                <Shortcut
                  key={c.slug}
                  active={catFilter.includes(c.slug)}
                  variant="on-accent"
                  onClick={() => dispatch({ type: "TOGGLE", key: "catFilter", val: c.slug })}
                >
                  {c.label}
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
          <p className="font-mono text-[12px] text-ink-soft tracking-[0.04em] font-medium">
            No Pokemon match your filters.
          </p>
        ) : (
          <div className="grid grid-cols-1 min-[400px]:grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(175px,1fr))] gap-2 sm:gap-3 max-w-[220px] min-[400px]:max-w-none mx-auto min-[400px]:mx-0">
            {paginated.map((p) => (
              <Link
                key={p.slug}
                href={`/pokemon/${p.slug}`}
                className="group cursor-pointer border-none bg-transparent p-0 text-left flex no-underline text-inherit transition-transform duration-150 hover:-translate-y-1 hover:scale-[1.02] min-h-[300px]"
                aria-label={p.label}
              >
                <TcgCard p={p} size="sm" />
              </Link>
            ))}
          </div>
        )}
        {pages > 1 && (
          <div className="flex justify-center gap-2 mt-5">
            {page > 1 && (
              <NavBtn
                onClick={() => {
                  dispatch({ type: "SET_PAGE", val: page - 1 });
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                ◀ Prev
              </NavBtn>
            )}
            <span className="font-mono text-[12px] text-ink-soft tracking-[0.04em] font-medium self-center">
              Page {page} / {pages}
            </span>
            {page < pages && (
              <NavBtn
                onClick={() => {
                  dispatch({ type: "SET_PAGE", val: page + 1 });
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                Next ▶
              </NavBtn>
            )}
          </div>
        )}
      </Card>
    </PageWrap>
  );
}
