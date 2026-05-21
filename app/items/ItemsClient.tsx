"use client";
import Link from "next/link";
import { useState, useMemo } from "react";
import type { ItemEntry, CategoryEntry } from "@/app/lib/types";

const PAGE_SIZE = 60;

export default function ItemsClient({
  items,
  categories,
}: {
  items: ItemEntry[];
  categories: CategoryEntry[];
}) {
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
      <div className="detail-meta" style={{ marginBottom: 16 }}>{filtered.length} / {items.length} items</div>

      <div className="card" style={{ marginBottom: 16 }}>
        <input
          type="text"
          className="search-input"
          placeholder="Search items…"
          aria-label="Search items"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          style={{ marginBottom: 14 }}
        />
        <div className="stat-label" style={{ marginBottom: 6 }}>Filter by category</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {categories.map((c) => (
            <button
              key={c.slug}
              className="shortcut"
              style={catFilter.includes(c.slug) ? { background: "var(--ink)", color: "var(--paper)", borderColor: "var(--ink)" } : {}}
              onClick={() => toggleCat(c.slug)}
            >
              {c.name} <span style={{ opacity: 0.55, fontSize: 10 }}>({c.items.length})</span>
            </button>
          ))}
        </div>
        {(search || catFilter.length > 0) && (
          <button className="shortcut" style={{ marginTop: 10 }} onClick={() => { setSearch(""); setCatFilter([]); setPage(1); }}>
            Clear filters
          </button>
        )}
      </div>

      <div className="card">
        {paginated.length === 0 ? (
          <p className="detail-meta">No items match your filters.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 8 }}>
            {paginated.map((item) => (
              <Link key={item.slug} href={`/item/${item.slug}`} style={{ textDecoration: "none" }}>
                <div className="hover-tile" style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px" }}>
                  {item.icon && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.icon} alt="" style={{ width: 28, height: 28, objectFit: "contain", imageRendering: "pixelated", flexShrink: 0 }} />
                  )}
                  <span style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontWeight: 600,
                    fontSize: 12,
                    color: "var(--ink)",
                    lineHeight: 1.3,
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}>{item.name}</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {pages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 20 }}>
            {page > 1 && <button className="pkmn-nav-btn" onClick={() => setPage(page - 1)}>◀ Prev</button>}
            <span className="detail-meta" style={{ alignSelf: "center" }}>Page {page} / {pages}</span>
            {page < pages && <button className="pkmn-nav-btn" onClick={() => setPage(page + 1)}>Next ▶</button>}
          </div>
        )}
      </div>
    </>
  );
}
