"use client";
import Link from "next/link";
import { useState, useMemo, useCallback } from "react";
import { POKEMON, POKEMON_LIST, SPECIALTIES, pkmnIconUrl, dexNum, getCatItems, catDisplayName } from "@/app/lib/data";
import PageWrap from "@/app/components/PageWrap";
import Breadcrumb from "@/app/components/Breadcrumb";
import Card from "@/app/components/Card";
import PageHeader from "@/app/components/PageHeader";
import SectionTitle from "@/app/components/SectionTitle";
import PokemonGridCard from "@/app/components/PokemonGridCard";

function sharedItemCount(a: string[], b: string[]): number {
  const setA = new Set<string>();
  for (const cat of a) for (const item of getCatItems(cat)) setA.add(item);
  let count = 0;
  for (const cat of b) for (const item of getCatItems(cat)) { if (setA.has(item)) count++; }
  return count;
}

function score(anchor: typeof POKEMON_LIST[0], candidate: typeof POKEMON_LIST[0]): number {
  if (anchor.habitat !== candidate.habitat) return -1;
  const shared = sharedItemCount(anchor.categories, candidate.categories);
  const anchorSpecs = new Set(anchor.specialties ?? []);
  const candSpecs = new Set(candidate.specialties ?? []);
  const hasOverlap = [...candSpecs].some((s) => anchorSpecs.has(s));
  const multiplier = (!hasOverlap && candSpecs.size > 0 && anchorSpecs.size > 0) ? 1.5 : 1.0;
  return Math.round(shared * multiplier);
}

function buildGroup(anchor: typeof POKEMON_LIST[0], size: number): typeof POKEMON_LIST {
  const group: typeof POKEMON_LIST = [anchor];
  const candidates = POKEMON_LIST.filter((p) => p.slug !== anchor.slug && p.habitat === anchor.habitat);
  while (group.length < size && candidates.length > 0) {
    const groupCats = [...new Set(group.flatMap((m) => m.categories))];
    let bestIdx = 0, bestScore = -1;
    for (let i = 0; i < candidates.length; i++) {
      const s = sharedItemCount(groupCats, candidates[i].categories);
      if (s > bestScore) { bestScore = s; bestIdx = i; }
    }
    group.push(candidates.splice(bestIdx, 1)[0]);
  }
  return group;
}

export default function MatchmakerPage() {
  const [anchorSlug, setAnchorSlug] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [compareSlug, setCompareSlug] = useState<string | null>(null);
  const [groupSize] = useState(4);

  const anchor = anchorSlug ? POKEMON[anchorSlug] : null;

  const searchMatches = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    return POKEMON_LIST.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 10);
  }, [query]);

  const selectAnchor = useCallback((slug: string) => {
    setAnchorSlug(slug);
    setQuery(POKEMON[slug]?.name ?? slug);
    setShowSuggestions(false);
    setCompareSlug(null);
  }, []);

  const recommendations = useMemo(() => {
    if (!anchor) return [];
    return POKEMON_LIST
      .filter((p) => p.slug !== anchorSlug && p.habitat === anchor.habitat)
      .map((p) => ({ pokemon: p, score: score(anchor, p), shared: sharedItemCount(anchor.categories, p.categories) }))
      .filter((r) => r.score >= 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }, [anchor, anchorSlug]);

  const group = useMemo(() => {
    if (!anchor) return [];
    return buildGroup(anchor, groupSize);
  }, [anchor, groupSize]);

  const compareTarget = compareSlug ? POKEMON[compareSlug] : null;
  const compareShared = anchor && compareTarget
    ? (() => {
        const setA = new Set<string>();
        for (const cat of anchor.categories) for (const item of getCatItems(cat)) setA.add(item);
        const shared: string[] = [];
        for (const cat of compareTarget.categories) for (const item of getCatItems(cat)) { if (setA.has(item)) shared.push(item); }
        return [...new Set(shared)];
      })()
    : [];

  return (
    <PageWrap>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Matchmaker" }]} />
      <PageHeader title="Matchmaker">
        <p className="text-[13px] text-ink-soft mb-4 leading-relaxed">Pick an anchor Pokémon to find the best roommates. Same habitat required — shared items are bonus points.</p>
      </PageHeader>

      <Card>
        <div className="search-wrap">
          <span className="search-icon">⚲</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search anchor Pokémon…"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); }}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          />
          {showSuggestions && searchMatches.length > 0 && (
            <div className="suggestions open">
              {searchMatches.map((p) => (
                <div key={p.slug} className="suggestion" onMouseDown={(e) => { e.preventDefault(); selectAnchor(p.slug); }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={pkmnIconUrl(p)} alt={p.name} className="suggestion-icon" />
                  <span className="suggestion-num">#{dexNum(p)}</span>
                  <span className="suggestion-name">{p.name}</span>
                  <span className="suggestion-meta">{p.habitat}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {anchor && (
          <div className="flex items-start gap-7 mt-5">
            <div className="size-[110px] shrink-0 bg-[var(--portrait-bg)] rounded-[14px] border-2 border-paper-edge flex items-center justify-center p-2 shadow-[0_4px_12px_-4px_var(--shadow)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={anchor.spriteHq ?? pkmnIconUrl(anchor)} alt={anchor.name} className="w-full h-full object-contain [image-rendering:pixelated]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-mono text-[12px] text-accent-deep font-semibold tracking-[0.1em] mb-[2px]">Anchor · #{dexNum(anchor)}</div>
              <div className="font-outfit font-extrabold text-[36px] tracking-[-0.02em] leading-[1.05] mb-2">{anchor.name}</div>
              <div className="font-mono text-[12px] text-ink-soft tracking-[0.04em]">Habitat: <span className="text-leaf font-semibold">{anchor.habitat}</span></div>
              <div className="flex flex-wrap gap-2 mt-2">
                {anchor.categories.map((c) => <span key={c} className="pkmn-cat-tag">{catDisplayName(c)}</span>)}
              </div>
            </div>
          </div>
        )}
      </Card>

      {anchor && recommendations.length === 0 && (
        <Card><p className="font-mono text-[12px] text-ink-soft tracking-[0.04em] font-medium">No Pokémon found in the same habitat ({anchor.habitat}).</p></Card>
      )}

      {recommendations.length > 0 && (
        <Card>
          <SectionTitle pill="BEST MATCH">Top roommates</SectionTitle>
          <p className="text-[13px] text-ink-soft mb-4 leading-relaxed">Ranked by shared items. Complementary specialties add a 50% bonus.</p>
          {recommendations.map(({ pokemon: p, score: s, shared }) => {
            const anchorSpecs = new Set(anchor!.specialties ?? []);
            const candSpecs = p.specialties ?? [];
            const isComplementary = candSpecs.length > 0 && !candSpecs.some((sp) => anchorSpecs.has(sp));
            return (
              <div
                key={p.slug}
                role="button"
                tabIndex={0}
                className="relative flex gap-3 items-center rounded-[14px] p-[14px] border border-[1.5px] border-accent bg-gradient-to-br from-accent-soft to-surface-1 transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_18px_-6px_var(--shadow)] mb-2.5 cursor-pointer"
                onClick={() => setCompareSlug(compareSlug === p.slug ? null : p.slug)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setCompareSlug(compareSlug === p.slug ? null : p.slug); }}
              >
                <div className="absolute -top-2 right-3 font-mono text-[10px] font-semibold px-2 py-[3px] rounded-full bg-accent text-paper tracking-[0.06em]">
                  {s} pts{isComplementary ? " ⚡" : ""}
                </div>
                <div className="size-14 shrink-0 bg-white/70 rounded-[10px] flex items-center justify-center p-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={pkmnIconUrl(p)} alt={p.name} className="w-full h-full object-contain [image-rendering:pixelated]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-extrabold text-[14px] mb-1 text-ink leading-tight">
                    <Link href={`/pokemon/${p.slug}`} className="text-inherit no-underline" onClick={(e) => e.stopPropagation()}>{p.name}</Link>
                  </div>
                  <div className="font-mono text-[10px] text-ink-soft tracking-[0.02em] leading-snug">
                    {shared} shared items · {p.specialties?.map((s) => SPECIALTIES[s]?.name ?? s).join(", ") || "no specialty"}
                    {isComplementary && " · complementary ⚡"}
                  </div>
                </div>
              </div>
            );
          })}
        </Card>
      )}

      {anchor && compareTarget && (
        <Card>
          <SectionTitle>Side-by-side: {anchor.name} vs {compareTarget.name}</SectionTitle>
          <p className="text-[13px] text-ink-soft mb-4 leading-relaxed">{compareShared.length} items in common</p>
          <div className="grid grid-cols-2 gap-4">
            {[{ p: anchor, label: "Anchor" }, { p: compareTarget, label: "Candidate" }].map(({ p, label }) => (
              <div key={p.slug}>
                <div className="font-mono text-[12px] text-ink-soft tracking-[0.04em] font-medium mb-2">{label}: {p.name}</div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {p.categories.map((c) => (
                    <span
                      key={c}
                      className={`pkmn-cat-tag ${compareTarget.categories.includes(c) && anchor!.categories.includes(c) ? "bg-accent-soft border-accent" : ""}`}
                    >
                      {catDisplayName(c)}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {compareShared.length > 0 && (
            <div className="mt-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-soft font-semibold mb-2">Shared items</div>
              <div className="flex flex-wrap gap-1.5">
                {compareShared.map((item) => (
                  <span key={item} className="pkmn-cat-tag bg-accent-soft border-accent">{item}</span>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {anchor && group.length > 1 && (
        <Card>
          <SectionTitle pill="TEAM">Best group of 4</SectionTitle>
          <p className="text-[13px] text-ink-soft mb-4 leading-relaxed">Greedy algorithm: each Pokémon maximizes shared items with the current group.</p>
          <div className="pkmn-grid">
            {group.map((p, i) => (
              <PokemonGridCard
                key={p.slug}
                p={p}
                prefix={i === 0 ? <div className="font-mono text-[10px] text-accent mb-1">ANCHOR</div> : undefined}
              />
            ))}
          </div>
        </Card>
      )}
    </PageWrap>
  );
}
