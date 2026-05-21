"use client";
import Link from "next/link";
import { useState, useMemo, useCallback } from "react";
import { POKEMON, POKEMON_LIST, CATEGORIES, SPECIALTIES, pkmnIconUrl, dexNum, getCatItems, catDisplayName } from "@/app/lib/data";

function sharedItemCount(a: string[], b: string[]): number {
  const setA = new Set<string>();
  for (const cat of a) {
    for (const item of getCatItems(cat)) setA.add(item);
  }
  let count = 0;
  for (const cat of b) {
    for (const item of getCatItems(cat)) {
      if (setA.has(item)) count++;
    }
  }
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
  const candidates = POKEMON_LIST.filter(
    (p) => p.slug !== anchor.slug && p.habitat === anchor.habitat
  );
  while (group.length < size && candidates.length > 0) {
    const groupCats = [...new Set(group.flatMap((m) => m.categories))];
    let bestIdx = 0;
    let bestScore = -1;
    for (let i = 0; i < candidates.length; i++) {
      const s = sharedItemCount(groupCats, candidates[i].categories);
      if (s > bestScore) { bestScore = s; bestIdx = i; }
    }
    const chosen = candidates.splice(bestIdx, 1)[0];
    group.push(chosen);
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
        for (const cat of anchor.categories) {
          for (const item of getCatItems(cat)) setA.add(item);
        }
        const shared: string[] = [];
        for (const cat of compareTarget.categories) {
          for (const item of getCatItems(cat)) {
            if (setA.has(item)) shared.push(item);
          }
        }
        return [...new Set(shared)];
      })()
    : [];

  return (
    <div className="detail-wrap">
      <div className="breadcrumb">
        <Link href="/">Home</Link><span>›</span><span>Matchmaker</span>
      </div>
      <div className="detail-header">
        <div className="detail-title">Matchmaker</div>
        <p className="section-sub">Pick an anchor Pokémon to find the best roommates. Same habitat required — shared items are bonus points.</p>
      </div>

      <div className="card">
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
                <div
                  key={p.slug}
                  className="suggestion"
                  onMouseDown={(e) => { e.preventDefault(); selectAnchor(p.slug); }}
                >
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
          <div className="pkmn-head mt-5" style={{ borderBottom: "none", paddingBottom: 0 }}>
            <div className="pkmn-portrait">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={anchor.spriteHq ?? pkmnIconUrl(anchor)} alt={anchor.name} className="w-full h-full object-contain" />
            </div>
            <div className="pkmn-info">
              <div className="pkmn-num">Anchor · #{dexNum(anchor)}</div>
              <div className="pkmn-name">{anchor.name}</div>
              <div className="pkmn-meta">Habitat: <span className="habitat-tag">{anchor.habitat}</span></div>
              <div className="pkmn-cats mt-2">
                {anchor.categories.map((c) => <span key={c} className="pkmn-cat-tag">{catDisplayName(c)}</span>)}
              </div>
            </div>
          </div>
        )}
      </div>

      {anchor && recommendations.length === 0 && (
        <div className="card"><p className="detail-meta">No Pokémon found in the same habitat ({anchor.habitat}).</p></div>
      )}

      {recommendations.length > 0 && (
        <div className="card">
          <div className="section-title">Top roommates <span className="pill">BEST MATCH</span></div>
          <p className="section-sub">Ranked by shared items. Complementary specialties add a 50% bonus.</p>
          {recommendations.map(({ pokemon: p, score: s, shared }) => {
            const anchorSpecs = new Set(anchor!.specialties ?? []);
            const candSpecs = p.specialties ?? [];
            const isComplementary = candSpecs.length > 0 && !candSpecs.some((sp) => anchorSpecs.has(sp));
            return (
              <div
                key={p.slug}
                className="best-item mb-2.5 cursor-pointer"
                onClick={() => setCompareSlug(compareSlug === p.slug ? null : p.slug)}
              >
                <div className="best-item-badge">{s} pts{isComplementary ? " ⚡" : ""}</div>
                <div className="best-item-icon">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={pkmnIconUrl(p)} alt={p.name} className="w-full h-full object-contain [image-rendering:pixelated]" />
                </div>
                <div className="best-item-body">
                  <div className="best-item-name">
                    <Link href={`/pokemon/${p.slug}`} className="text-inherit no-underline" onClick={(e) => e.stopPropagation()}>
                      {p.name}
                    </Link>
                  </div>
                  <div className="best-item-cats">
                    {shared} shared items · {p.specialties?.map((s) => SPECIALTIES[s]?.name ?? s).join(", ") || "no specialty"}
                    {isComplementary && " · complementary ⚡"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {anchor && compareTarget && (
        <div className="card">
          <div className="section-title">Side-by-side: {anchor.name} vs {compareTarget.name}</div>
          <p className="section-sub">{compareShared.length} items in common</p>
          <div className="grid grid-cols-2 gap-4">
            {[{ p: anchor, label: "Anchor" }, { p: compareTarget, label: "Candidate" }].map(({ p, label }) => (
              <div key={p.slug}>
                <div className="detail-meta mb-2">{label}: {p.name}</div>
                <div className="pkmn-cats">
                  {p.categories.map((c) => (
                    <span
                      key={c}
                      className="pkmn-cat-tag"
                      style={compareTarget.categories.includes(c) && anchor!.categories.includes(c)
                        ? { background: "var(--sun-soft)", borderColor: "var(--sun)" }
                        : {}}
                    >{catDisplayName(c)}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {compareShared.length > 0 && (
            <div className="mt-4">
              <div className="stat-label mb-2">Shared items</div>
              <div className="flex flex-wrap gap-1.5">
                {compareShared.map((item) => (
                  <span key={item} className="pkmn-cat-tag" style={{ background: "var(--sun-soft)", borderColor: "var(--sun)" }}>{item}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {anchor && group.length > 1 && (
        <div className="card">
          <div className="section-title">Best group of 4 <span className="pill">TEAM</span></div>
          <p className="section-sub">Greedy algorithm: each Pokémon maximizes shared items with the current group.</p>
          <div className="pkmn-grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))]">
            {group.map((p, i) => (
              <Link key={p.slug} href={`/pokemon/${p.slug}`} className="pkmn-grid-card">
                {i === 0 && <div className="font-mono text-[10px] text-accent mb-1">ANCHOR</div>}
                <div className="pkmn-grid-icon">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={pkmnIconUrl(p)} alt={p.name} className="w-full h-full object-contain [image-rendering:pixelated]" />
                </div>
                <div className="pkmn-grid-num">#{dexNum(p)}</div>
                <div className="pkmn-grid-name">{p.name}</div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
