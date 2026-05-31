"use client";
import Link from "next/link";
import { useReducer, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import type { ItemConst, CategoryConst } from "@/app/lib/const";
import { ITEM_GROUPS, PASSIVE_DROPS } from "@/app/lib/const";

const PASSIVE_DROP_ITEM_SLUGS = new Set(Object.values(PASSIVE_DROPS).map((i) => i.slug));
import Shortcut from "@/app/components/Shortcut";
import HoverTile from "@/app/components/HoverTile";
import ItemTile from "@/app/components/ItemTile";
import SearchInput from "@/app/components/SearchInput";
import NavBtn from "@/app/components/NavBtn";
import Card from "@/app/components/Card";

const PAGE_SIZE = 60;

type State = {
  view: "items" | "categories";
  search: string;
  catFilter: string[];
  catOpen: boolean;
  passiveOnly: boolean;
  page: number;
};

type Action =
  | { type: "SET_VIEW"; view: "items" | "categories" }
  | { type: "SET_SEARCH"; search: string }
  | { type: "TOGGLE_CAT"; slug: string }
  | { type: "TOGGLE_CAT_OPEN" }
  | { type: "TOGGLE_PASSIVE" }
  | { type: "SET_PAGE"; page: number }
  | { type: "CLEAR_FILTERS" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_VIEW":       return { ...state, view: action.view };
    case "SET_SEARCH":     return { ...state, search: action.search, page: 1 };
    case "TOGGLE_CAT":     return {
      ...state,
      catFilter: state.catFilter.includes(action.slug)
        ? state.catFilter.filter((c) => c !== action.slug)
        : [...state.catFilter, action.slug],
      page: 1,
    };
    case "TOGGLE_CAT_OPEN": return { ...state, catOpen: !state.catOpen };
    case "TOGGLE_PASSIVE":  return { ...state, passiveOnly: !state.passiveOnly, page: 1 };
    case "SET_PAGE":        return { ...state, page: action.page };
    case "CLEAR_FILTERS":   return { ...state, search: "", catFilter: [], passiveOnly: false, page: 1 };
  }
}

export default function ItemsClient({
  items,
  categories,
  pkmnCountByCat,
}: {
  items: ItemConst[];
  categories: CategoryConst[];
  pkmnCountByCat: Record<string, number>;
}) {
  const searchParams = useSearchParams();
  const group = searchParams.get("group")?.toLowerCase() ?? null;

  const [state, dispatch] = useReducer(reducer, null, () => ({
    view: "items" as const,
    search: searchParams.get("search") ?? "",
    catFilter: [] as string[],
    catOpen: false,
    passiveOnly: false,
    page: 1,
  }));
  const { view, search, catFilter, catOpen, passiveOnly, page } = state;

  const filtered = useMemo(() => {
    const groupSlugs = group ? new Set((ITEM_GROUPS[group] ?? []).map((i) => i.slug)) : null;
    let list = groupSlugs ? items.filter((i) => groupSlugs.has(i.slug)) : items;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((i) => i.label.toLowerCase().includes(q));
    }
    if (catFilter.length) {
      const catSlugSet = new Set(catFilter);
      const catItemSlugs = new Set(
        categories
          .filter((c) => catSlugSet.has(c.slug))
          .flatMap((c) => c.items.map((i) => i.slug)),
      );
      list = list.filter((i) => catItemSlugs.has(i.slug));
    }
    if (passiveOnly) {
      list = list.filter((i) => PASSIVE_DROP_ITEM_SLUGS.has(i.slug));
    }
    return list;
  }, [items, search, catFilter, categories, group, passiveOnly]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      <div className="flex gap-2 mb-4">
        <Shortcut active={view === "items"} onClick={() => dispatch({ type: "SET_VIEW", view: "items" })}>Browse Items</Shortcut>
        <Shortcut active={view === "categories"} onClick={() => dispatch({ type: "SET_VIEW", view: "categories" })}>Browse by Category</Shortcut>
      </div>

      {view === "items" && (
        <>
          <div className="font-mono text-[12px] text-ink-soft tracking-[0.04em] font-medium mb-4">{filtered.length} / {items.length} items</div>

          <Card className="mb-4">
            <SearchInput
              value={search}
              onChange={(e) => dispatch({ type: "SET_SEARCH", search: e.target.value })}
              placeholder="Search items…"
              className="mb-3.5"
            />
            <div className="bg-chrome rounded-xl border border-paper-edge px-3 py-2.5">
              <button type="button" className="w-full flex items-center justify-between cursor-pointer" onClick={() => dispatch({ type: "TOGGLE_CAT_OPEN" })}>
                <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-soft font-semibold">Category</div>
                <div className="flex items-center gap-1.5">
                  {catFilter.length > 0 && <span className="font-mono text-[9px] bg-ink text-paper px-1.5 py-[2px] rounded-full">{catFilter.length}</span>}
                  <span className="font-mono text-[10px] text-ink-fade">{catOpen ? "▲" : "▼"}</span>
                </div>
              </button>
              {catOpen && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {categories.map((c) => (
                    <Shortcut key={c.slug} active={catFilter.includes(c.slug)} onClick={() => dispatch({ type: "TOGGLE_CAT", slug: c.slug })}>
                      {c.label} <span className="opacity-55 text-[10px]">({c.items.length})</span>
                    </Shortcut>
                  ))}
                </div>
              )}
            </div>
            <div className="mt-2.5">
              <Shortcut active={passiveOnly} onClick={() => dispatch({ type: "TOGGLE_PASSIVE" })}>
                Passive drops only
              </Shortcut>
            </div>
            {(search || catFilter.length > 0 || passiveOnly) && (
              <Shortcut className="mt-2" onClick={() => dispatch({ type: "CLEAR_FILTERS" })}>
                Clear filters
              </Shortcut>
            )}
          </Card>

          <Card>
            {paginated.length === 0 ? (
              <p className="font-mono text-[12px] text-ink-soft tracking-[0.04em] font-medium">No items match your filters.</p>
            ) : (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-2">
                {paginated.map((item) => (
                  <ItemTile key={item.slug} name={item.label} slug={item.slug} icon={item.icon} />
                ))}
              </div>
            )}
            {pages > 1 && (
              <div className="flex justify-center gap-2 mt-5">
                {page > 1 && <NavBtn onClick={() => dispatch({ type: "SET_PAGE", page: page - 1 })}>◀ Prev</NavBtn>}
                <span className="font-mono text-[12px] text-ink-soft tracking-[0.04em] font-medium self-center">Page {page} / {pages}</span>
                {page < pages && <NavBtn onClick={() => dispatch({ type: "SET_PAGE", page: page + 1 })}>Next ▶</NavBtn>}
              </div>
            )}
          </Card>
        </>
      )}

      {view === "categories" && (
        <Card>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-2">
            {categories.map((cat) => (
              <Link key={cat.slug} href={`/category/${cat.slug}`} className="no-underline">
                <HoverTile className="py-3 px-3.5">
                  <div className="font-outfit font-bold text-sm text-ink mb-1">{cat.label}</div>
                  <div className="font-mono text-[10px] text-ink-fade tracking-[0.04em]">
                    {cat.items.length} items · {pkmnCountByCat[cat.slug] ?? 0} Pokemon
                  </div>
                </HoverTile>
              </Link>
            ))}
          </div>
        </Card>
      )}
    </>
  );
}
