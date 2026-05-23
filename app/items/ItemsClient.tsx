"use client";
import Link from "next/link";
import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import type { ItemConst, CategoryConst } from "@/app/lib/const";
import { ITEM_GROUPS } from "@/app/lib/data/item-groups";
import Shortcut from "@/app/components/Shortcut";
import HoverTile from "@/app/components/HoverTile";
import ItemTile from "@/app/components/ItemTile";
import SearchInput from "@/app/components/SearchInput";
import NavBtn from "@/app/components/NavBtn";
import Card from "@/app/components/Card";

const PAGE_SIZE = 60;

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
  const groupItems = group ? new Set(ITEM_GROUPS[group] ?? []) : null;
  const [view, setView] = useState<"items" | "categories">("items");
  const [search, setSearch] = useState(() => searchParams.get("search") ?? "");
  const [catFilter, setCatFilter] = useState<string[]>([]);
  const [catOpen, setCatOpen] = useState(false);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let list = groupItems ? items.filter((i) => groupItems.has(i.slug)) : items;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((i) => i.label.toLowerCase().includes(q));
    }
    if (catFilter.length) {
      // Items are now in categories — look up reverse mapping
      const catItems = new Set(
        catFilter.flatMap((cs) => {
          const cat = categories.find((c) => c.slug === cs);
          return cat ? cat.items.map((i) => i.slug) : [];
        })
      );
      list = list.filter((i) => catItems.has(i.slug));
    }
    return list;
  }, [items, search, catFilter, categories, groupItems]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleCat = (slug: string) => {
    setCatFilter((prev) => prev.includes(slug) ? prev.filter((c) => c !== slug) : [...prev, slug]);
    setPage(1);
  };

  return (
    <>
      <div className="flex gap-2 mb-4">
        <Shortcut active={view === "items"} onClick={() => setView("items")}>Browse Items</Shortcut>
        <Shortcut active={view === "categories"} onClick={() => setView("categories")}>Browse by Category</Shortcut>
      </div>

      {view === "items" && (
        <>
          <div className="font-mono text-[12px] text-ink-soft tracking-[0.04em] font-medium mb-4">{filtered.length} / {items.length} items</div>

          <Card className="mb-4">
            <SearchInput
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search items…"
              className="mb-3.5"
            />
            <div className="bg-chrome rounded-xl border border-paper-edge px-3 py-2.5">
              <button type="button" className="w-full flex items-center justify-between cursor-pointer" onClick={() => setCatOpen((o) => !o)}>
                <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-soft font-semibold">Category</div>
                <div className="flex items-center gap-1.5">
                  {catFilter.length > 0 && <span className="font-mono text-[9px] bg-ink text-paper px-1.5 py-[2px] rounded-full">{catFilter.length}</span>}
                  <span className="font-mono text-[10px] text-ink-fade">{catOpen ? "▲" : "▼"}</span>
                </div>
              </button>
              {catOpen && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {categories.map((c) => (
                    <Shortcut key={c.slug} active={catFilter.includes(c.slug)} onClick={() => toggleCat(c.slug)}>
                      {c.label} <span className="opacity-55 text-[10px]">({c.items.length})</span>
                    </Shortcut>
                  ))}
                </div>
              )}
            </div>
            {(search || catFilter.length > 0) && (
              <Shortcut className="mt-2.5" onClick={() => { setSearch(""); setCatFilter([]); setPage(1); }}>
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
                {page > 1 && <NavBtn onClick={() => setPage((p) => p - 1)}>◀ Prev</NavBtn>}
                <span className="font-mono text-[12px] text-ink-soft tracking-[0.04em] font-medium self-center">Page {page} / {pages}</span>
                {page < pages && <NavBtn onClick={() => setPage((p) => p + 1)}>Next ▶</NavBtn>}
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
