"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useMemo, useCallback } from "react";
import { POKEMON, POKEMON_LIST, SPECIALTIES, pkmnIconUrl, dexNum, getCatItems, catDisplayName } from "@/app/lib/data";
import PokemonGrid from "@/app/components/PokemonGrid";
import SearchInput from "@/app/components/SearchInput";
import PageWrap from "@/app/components/PageWrap";
import Breadcrumb from "@/app/components/Breadcrumb";
import Card from "@/app/components/Card";
import PageHeader from "@/app/components/PageHeader";
import SectionTitle from "@/app/components/SectionTitle";

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

function buildGroup(initialAnchors: typeof POKEMON_LIST, size: number): typeof POKEMON_LIST {
  if (initialAnchors.length === 0) return [];
  const habitat = initialAnchors[0].habitat;
  const anchorSlugSet = new Set(initialAnchors.map((a) => a.slug));
  const group = [...initialAnchors];
  const candidates = POKEMON_LIST.filter((p) => !anchorSlugSet.has(p.slug) && p.habitat === habitat);
  const target = Math.max(size, initialAnchors.length + 1);
  while (group.length < target && candidates.length > 0) {
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

const TOP_STARTERS = (() => {
  const scored = POKEMON_LIST.map((p) => {
    const peers = POKEMON_LIST.filter((q) => q.slug !== p.slug && q.habitat === p.habitat);
    if (peers.length === 0) return { p, avg: 0 };
    const total = peers.reduce((sum, q) => sum + Math.max(0, score(p, q)), 0);
    return { p, avg: total / peers.length };
  });
  return scored
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 6)
    .map((x) => x.p);
})();

const EXAMPLE_ANCHOR = POKEMON_LIST.find((p) => p.slug === "bulbasaur") ?? TOP_STARTERS[0];
const EXAMPLE_GROUP = EXAMPLE_ANCHOR ? buildGroup([EXAMPLE_ANCHOR], 4) : [];

const MAX_ANCHORS = 3;

export default function MatchmakerPage() {
  const [anchorSlugs, setAnchorSlugs] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [groupSize] = useState(4);

  const anchors = anchorSlugs.map((s) => POKEMON[s]).filter(Boolean);
  const primaryAnchor = anchors[0] ?? null;
  const anchorHabitat = primaryAnchor?.habitat ?? null;

  const searchMatches = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    return POKEMON_LIST.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 10);
  }, [query]);

  const selectAnchor = useCallback((slug: string) => {
    setAnchorSlugs((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);
      if (prev.length >= MAX_ANCHORS) return prev;
      return [...prev, slug];
    });
    setQuery("");
    setShowSuggestions(false);
  }, []);

  const removeAnchor = useCallback((slug: string) => {
    setAnchorSlugs((prev) => prev.filter((s) => s !== slug));
  }, []);

  const recommendations = useMemo(() => {
    if (anchorSlugs.length === 0) return [];
    const anchorList = anchorSlugs.map((s) => POKEMON[s]).filter(Boolean);
    const habitat = anchorList[0]?.habitat ?? null;
    if (!habitat) return [];
    return POKEMON_LIST
      .filter((p) => !anchorSlugs.includes(p.slug) && p.habitat === habitat)
      .map((p) => {
        const scores = anchorList.map((a) => score(a, p));
        const avg = scores.reduce((s, v) => s + v, 0) / scores.length;
        const shared = anchorList.reduce((sum, a) => sum + sharedItemCount(a.categories, p.categories), 0);
        return { pokemon: p, score: Math.round(avg), shared };
      })
      .filter((r) => r.score >= 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }, [anchorSlugs]);

  const group = useMemo(() => {
    if (anchorSlugs.length === 0) return [];
    const anchorList = anchorSlugs.map((s) => POKEMON[s]).filter(Boolean);
    return buildGroup(anchorList, groupSize);
  }, [anchorSlugs, groupSize]);

  return (
    <PageWrap>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Matchmaker" }]} />
      <PageHeader title="Matchmaker">
        <p className="text-[13px] text-ink-soft mb-4 leading-relaxed">
          Pick up to {MAX_ANCHORS} anchor Pokemon to find the best roommates. Same habitat required — shared items are bonus points.
        </p>
      </PageHeader>

      <Card>
        {anchorSlugs.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {anchors.map((a) => (
              <div key={a.slug} className="flex items-center gap-1.5 bg-accent-soft border border-[1.5px] border-accent rounded-full px-2 py-[4px]">
                <div className="relative size-5 shrink-0">
                  <Image fill src={pkmnIconUrl(a)} alt={a.name} className="object-contain [image-rendering:pixelated]" sizes="20px" />
                </div>
                <span className="font-outfit font-bold text-[12px] text-ink-deep">{a.name}</span>
                <button
                  onClick={() => removeAnchor(a.slug)}
                  className="ml-0.5 text-ink-soft hover:text-ink font-mono text-[11px] leading-none"
                  aria-label={`Remove ${a.name}`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {anchorSlugs.length < MAX_ANCHORS && (
          <SearchInput
            value={query}
            onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); }}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            placeholder={anchorSlugs.length === 0 ? "Search Pokemon to add as anchor…" : "Add another anchor…"}
          >
            {showSuggestions && searchMatches.length > 0 && (
              <div className="absolute top-[calc(100%+6px)] left-0 right-0 bg-paper border border-[1.5px] border-paper-edge rounded-[14px] max-h-[360px] overflow-y-auto z-10 block shadow-[0_12px_28px_-8px_var(--shadow)]">
                {searchMatches.map((p) => (
                  <div key={p.slug} className={`flex items-center gap-3 px-4 py-2 cursor-pointer border-b border-surface-1 transition-colors hover:bg-surface-1 last:border-b-0${anchorSlugs.includes(p.slug) ? " opacity-40" : ""}`} onMouseDown={(e) => { e.preventDefault(); selectAnchor(p.slug); }}>
                    <div className="relative size-11 shrink-0">
                      <Image fill src={pkmnIconUrl(p)} alt={p.name} className="object-contain [image-rendering:pixelated]" sizes="44px" />
                    </div>
                    <span className="font-mono text-[11px] text-ink-fade min-w-[38px] font-semibold">#{dexNum(p)}</span>
                    <span className="font-bold text-[15px]">{p.name}</span>
                    <span className="ml-auto font-mono text-[10px] text-ink-soft bg-surface-2 px-2 py-[3px] rounded-full font-semibold">{p.habitat}</span>
                  </div>
                ))}
              </div>
            )}
          </SearchInput>
        )}

        {anchors.length > 0 && (
          <div className="flex flex-wrap gap-5 mt-5">
            {anchors.map((anchor, i) => (
              <div key={anchor.slug} className="flex items-start gap-3">
                <div className="size-[72px] shrink-0 bg-[var(--portrait-bg)] rounded-[12px] border-2 border-paper-edge p-1.5 shadow-[0_4px_12px_-4px_var(--shadow)]">
                  <div className="relative w-full h-full">
                    <Image fill src={anchor.spriteHq ?? pkmnIconUrl(anchor)} alt={anchor.name} className="object-contain [image-rendering:pixelated]" sizes="72px" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-[11px] text-accent-deep font-semibold tracking-[0.1em] mb-[2px]">
                    {i === 0 ? "Anchor" : `Anchor ${i + 1}`} · #{dexNum(anchor)}
                  </div>
                  <div className="font-outfit font-extrabold text-[20px] tracking-[-0.02em] leading-[1.05] mb-1">{anchor.name}</div>
                  <div className="font-mono text-[11px] text-leaf font-semibold tracking-[0.04em]">{anchor.habitat}</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {anchor.categories.map((c) => <span key={c} className="font-outfit text-[11px] font-bold px-[10px] py-1 rounded-full bg-surface-1 text-ink border border-[1.5px] border-paper-edge tracking-[0.04em]">{catDisplayName(c)}</span>)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {anchors.length === 0 && (
        <Card>
          <div className="mb-5">
            <SectionTitle>How it works</SectionTitle>
            <p className="text-[13px] text-ink-soft leading-relaxed">
              Search for a Pokemon above to find its best housing group — Pokemon that share the most item preferences and have complementary specialties. You can add up to {MAX_ANCHORS} anchors to narrow it down further.
            </p>
          </div>

          {EXAMPLE_GROUP.length > 0 && EXAMPLE_ANCHOR && (
            <>
              <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-soft font-semibold mb-3">
                Example · {EXAMPLE_ANCHOR.name}&apos;s best group
              </div>
              <PokemonGrid className="mb-5">
                {EXAMPLE_GROUP.map((p) => (
                  <button
                    key={p.slug}
                    onClick={() => selectAnchor(p.slug)}
                    className="bg-chrome border border-[1.5px] border-paper-edge rounded-[14px] p-3 text-center text-ink flex flex-col items-center gap-1 transition-all hover:bg-paper hover:border-accent hover:-translate-y-0.5 hover:shadow-[0_6px_16px_-6px_var(--shadow)] w-full cursor-pointer"
                  >
                    {p.slug === EXAMPLE_ANCHOR.slug && (
                      <div className="font-mono text-[10px] text-accent mb-1">ANCHOR</div>
                    )}
                    <div className="relative size-16">
                      <Image fill src={pkmnIconUrl(p)} alt={p.name} className="object-contain [image-rendering:pixelated]" sizes="64px" />
                    </div>
                    <div className="font-mono text-[10px] text-ink-fade font-medium">#{dexNum(p)}</div>
                    <div className="font-bold text-[12px] leading-tight">{p.name}</div>
                  </button>
                ))}
              </PokemonGrid>
            </>
          )}

          <div className="border-t border-paper-edge pt-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-soft font-semibold mb-2">Quick picks</div>
            <div className="flex flex-wrap gap-2">
              {TOP_STARTERS.map((p) => (
                <button
                  key={p.slug}
                  onClick={() => selectAnchor(p.slug)}
                  className="flex items-center gap-1.5 bg-chrome border border-[1.5px] border-paper-edge rounded-full px-2.5 py-[5px] text-ink transition-all hover:bg-paper hover:border-accent cursor-pointer"
                >
                  <div className="relative size-5 shrink-0">
                    <Image fill src={pkmnIconUrl(p)} alt={p.name} className="object-contain [image-rendering:pixelated]" sizes="20px" />
                  </div>
                  <span className="font-outfit font-bold text-[12px]">{p.name}</span>
                </button>
              ))}
            </div>
          </div>
        </Card>
      )}

      {anchors.length > 0 && recommendations.length === 0 && (
        <Card><p className="font-mono text-[12px] text-ink-soft tracking-[0.04em] font-medium">No Pokemon found in the same habitat ({anchorHabitat}).</p></Card>
      )}

      {recommendations.length > 0 && (
        <Card>
          <SectionTitle pill="BEST MATCH">Top roommates</SectionTitle>
          <p className="text-[13px] text-ink-soft mb-4 leading-relaxed">
            Ranked by shared items{anchors.length > 1 ? ` across ${anchors.length} anchors` : ""}. Complementary specialties add a 50% bonus.
          </p>
          {recommendations.map(({ pokemon: p, score: s, shared }) => {
            const allAnchorSpecs = new Set(anchors.flatMap((a) => a.specialties ?? []));
            const candSpecs = p.specialties ?? [];
            const isComplementary = candSpecs.length > 0 && !candSpecs.some((sp) => allAnchorSpecs.has(sp));
            return (
              <div
                key={p.slug}
                role="button"
                tabIndex={0}
                onClick={() => selectAnchor(p.slug)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") selectAnchor(p.slug); }}
                className="relative flex gap-3 items-center rounded-[14px] p-[14px] border border-[1.5px] border-accent bg-gradient-to-br from-accent-soft to-surface-1 mb-2.5 cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_8px_18px_-6px_var(--shadow)] transition-all"
              >
                <div className="absolute -top-2 right-3 font-mono text-[10px] font-semibold px-2 py-[3px] rounded-full bg-accent text-paper tracking-[0.06em]">
                  {s} pts{isComplementary ? " ⚡" : ""}
                </div>
                <div className="size-14 shrink-0 bg-white/70 rounded-[10px] p-1">
                  <div className="relative w-full h-full">
                    <Image fill src={pkmnIconUrl(p)} alt={p.name} className="object-contain [image-rendering:pixelated]" sizes="56px" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-extrabold text-[14px] text-ink leading-tight">{p.name}</span>
                    <Link
                      href={`/pokemon/${p.slug}`}
                      className="font-mono text-[10px] text-ink-soft no-underline hover:text-accent shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      view →
                    </Link>
                  </div>
                  <div className="font-mono text-[10px] text-ink-soft tracking-[0.02em] leading-snug">
                    {shared} shared items · {p.specialties?.map((sp) => SPECIALTIES[sp]?.name ?? sp).join(", ") || "no specialty"}
                    {isComplementary && " · complementary ⚡"}
                  </div>
                </div>
              </div>
            );
          })}
        </Card>
      )}

      {group.length > 1 && (
        <Card>
          <SectionTitle pill="TEAM">Best group of {group.length}</SectionTitle>
          <p className="text-[13px] text-ink-soft mb-4 leading-relaxed">Greedy algorithm: each Pokemon maximizes shared items with the current group.</p>
          <PokemonGrid>
            {group.map((p) => {
              const isAnchor = anchorSlugs.includes(p.slug);
              return (
                <button
                  key={p.slug}
                  onClick={() => selectAnchor(p.slug)}
                  className={`border border-[1.5px] rounded-[14px] p-3 text-center text-ink flex flex-col items-center gap-1 transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_16px_-6px_var(--shadow)] w-full cursor-pointer ${isAnchor ? "bg-accent-soft border-accent" : "bg-chrome border-paper-edge hover:bg-paper hover:border-accent"}`}
                >
                  {isAnchor && <div className="font-mono text-[10px] text-accent mb-1">ANCHOR</div>}
                  <div className="relative size-16">
                    <Image fill src={pkmnIconUrl(p)} alt={p.name} className="object-contain [image-rendering:pixelated]" sizes="64px" />
                  </div>
                  <div className="font-mono text-[10px] text-ink-fade font-medium">#{dexNum(p)}</div>
                  <div className="font-bold text-[12px] leading-tight">{p.name}</div>
                  <Link
                    href={`/pokemon/${p.slug}`}
                    className="font-mono text-[10px] text-ink-soft no-underline hover:text-accent mt-0.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    view →
                  </Link>
                </button>
              );
            })}
          </PokemonGrid>
        </Card>
      )}
    </PageWrap>
  );
}
