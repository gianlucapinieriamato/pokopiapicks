"use client";
import { useState } from "react";
import Link from "next/link";
import SearchInput from "@/app/components/SearchInput";
import HoverTile from "@/app/components/HoverTile";

export type GridItem = {
  slug: string;
  href: string;
  label: string;
  description?: string | null;
  meta?: string | null;
};

export function FilterableGrid({
  items,
  searchPlaceholder = "Filter…",
  colMin = "220px",
}: {
  items: GridItem[];
  searchPlaceholder?: string;
  colMin?: string;
}) {
  const [query, setQuery] = useState("");
  const nq = query.trim().toLowerCase();
  const filtered = nq
    ? items.filter(
        (it) =>
          it.label.toLowerCase().includes(nq) ||
          it.description?.toLowerCase().includes(nq),
      )
    : items;

  return (
    <>
      <SearchInput
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={searchPlaceholder}
        className="mb-4"
      />
      {nq && (
        <div className="font-mono text-[11px] text-ink-soft tracking-[0.04em] font-medium mb-3">
          {filtered.length} / {items.length}
        </div>
      )}
      {filtered.length > 0 ? (
        <div
          className="grid gap-2"
          style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${colMin}, 1fr))` }}
        >
          {filtered.map((item) => (
            <Link key={item.slug} href={item.href} className="no-underline">
              <HoverTile className="py-3 px-3.5">
                <div className="font-outfit font-bold text-sm text-ink mb-1">
                  {item.label}
                </div>
                {item.description && (
                  <div className="font-mono text-[10px] text-ink-soft tracking-[0.02em] leading-snug mb-1 line-clamp-2">
                    {item.description}
                  </div>
                )}
                {item.meta && (
                  <div className="font-mono text-[10px] text-ink-fade tracking-[0.04em]">
                    {item.meta}
                  </div>
                )}
              </HoverTile>
            </Link>
          ))}
        </div>
      ) : (
        <p className="font-mono text-[12px] text-ink-soft tracking-[0.04em] font-medium">
          No results for &ldquo;{query}&rdquo;.
        </p>
      )}
    </>
  );
}
