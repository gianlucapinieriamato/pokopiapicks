"use client";
import Link from "next/link";
import { useState, useMemo } from "react";
import type { ItemEntry, CategoryEntry } from "@/app/lib/types";
import NavBtn from "@/app/components/NavBtn";
import Card from "@/app/components/Card";

const PAGE_SIZE = 60;

export default function ItemsClient({ items, categories }: { items: ItemEntry[]; categories: CategoryEntry[] }) {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let list = items;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((i) => i.name.toLowerCase().includes(q));
    }
    if (catFilter.length) {
      list = list.filter((i) => catFilter.some((c) => i.categories.includes(c)));
    }
    return list;
  }, [items, search, catFilter]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleCat = (slug: string) => {
    setCatFilter((prev) => prev.includes(slug) ? prev.filter((c) => c !== slug) : [...prev, slug]);
    setPage(1);
  };

  return (
    <>
      <div className="font-mono text-[12px] text-ink-soft tracking-[0.04em] font-medium mb-4">{filtered.length} / {items.length} items</div>

      <Card className="mb-4">
        <input
          type="text"
          className="search-input mb-3.5"
          placeholder="Search items…"
          aria-label="Search items"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-soft font-semibold mb-1.5">Filter by category</div>
        <div className="flex flex-wrap gap-1.5">
          {categories.map((c) => (
            <button key={c.slug} className={`shortcut${catFilter.includes(c.slug) ? " shortcut--on" : ""}`} onClick={() => toggleCat(c.slug)}>
              {c.name} <span className="opacity-55 text-[10px]">({c.items.length})</span>
            </button>
          ))}
        </div>
        {(search || catFilter.length > 0) && (
          <button className="shortcut mt-2.5" onClick={() => { setSearch(""); setCatFilter([]); setPage(1); }}>
            Clear filters
          </button>
        )}
      </Card>

      <Card>
        {paginated.length === 0 ? (
          <p className="font-mono text-[12px] text-ink-soft tracking-[0.04em] font-medium">No items match your filters.</p>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-2">
            {paginated.map((item) => (
              <Link key={item.slug} href={`/item/${item.slug}`} className="no-underline">
                <div className="hover-tile flex items-center gap-2.5 py-2 px-2.5">
                  {item.icon && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.icon} alt="" className="size-7 object-contain [image-rendering:pixelated] shrink-0" />
                  )}
                  <span className="font-outfit font-semibold text-xs text-ink leading-[1.3] line-clamp-2">{item.name}</span>
                </div>
              </Link>
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
  );
}
