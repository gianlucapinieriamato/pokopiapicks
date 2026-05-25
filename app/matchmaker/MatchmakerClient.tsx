"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  POKEMON_BY_SLUG,
  POKEMON_LIST,
  POKEMON_CATEGORIES_SORTED,
  pkmnIconUrl,
  dexNum,
} from "@/app/lib/const";
import type { PokemonConst } from "@/app/lib/const";
import PokemonGrid from "@/app/components/PokemonGrid";
import SearchInput from "@/app/components/SearchInput";
import { SuggestionDropdown } from "@/app/components/SuggestionDropdown";
import PageWrap from "@/app/components/PageWrap";
import Breadcrumb from "@/app/components/Breadcrumb";
import Card from "@/app/components/Card";
import PageHeader from "@/app/components/PageHeader";
import SectionTitle from "@/app/components/SectionTitle";
import { sharedItemCount, calcScore } from "@/app/lib/scoring";

function buildGroup(initialAnchors: PokemonConst[], size: number): PokemonConst[] {
  if (initialAnchors.length === 0) return [];
  const first = initialAnchors[0];
  if (!first) return [];
  const habitatSlug = first.habitat.slug;
  const anchorSlugSet = new Set(initialAnchors.map((a) => a.slug));
  const group: PokemonConst[] = [...initialAnchors];
  const candidates = POKEMON_LIST.filter(
    (p) => !anchorSlugSet.has(p.slug) && p.habitat.slug === habitatSlug
  );
  const target = Math.max(size, initialAnchors.length + 1);
  while (group.length < target && candidates.length > 0) {
    let bestIdx = 0, bestScore = -1;
    for (let i = 0; i < candidates.length; i++) {
      const c = candidates[i];
      if (!c) continue;
      const s = group.reduce((sum, m) => sum + sharedItemCount(m, c), 0);
      if (s > bestScore) { bestScore = s; bestIdx = i; }
    }
    const picked = candidates.splice(bestIdx, 1)[0];
    if (picked) group.push(picked);
  }
  return group;
}

function resolveSlugs(slugs: string[]): PokemonConst[] {
  return slugs.flatMap((s) => { const p = POKEMON_BY_SLUG[s]; return p ? [p] : []; });
}

const MAX_ANCHORS = 3;
const GROUP_SIZE = 4;

type PokemonRecommendation = {
  pokemon: PokemonConst;
  score: number;
  shared: number;
};

// ─── Component ────────────────────────────────────────────────────────────

export default function MatchmakerClient() {
  const [anchorSlugs, setAnchorSlugs] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);

  const blurTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const timerRef = blurTimerRef;
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const TOP_STARTERS = useMemo(() => {
    const scored = POKEMON_LIST.map((p) => {
      const peers = POKEMON_LIST.filter(
        (q) => q.slug !== p.slug && q.habitat.slug === p.habitat.slug
      );
      if (peers.length === 0) return { p, avg: 0 };
      const total = peers.reduce((sum, q) => sum + Math.max(0, calcScore(p, q)), 0);
      return { p, avg: total / peers.length };
    });
    return scored.sort((a, b) => b.avg - a.avg).slice(0, 6).map((x) => x.p);
  }, []);

  const EXAMPLE_ANCHOR = useMemo(
    () => POKEMON_LIST.find((p) => p.slug === "bulbasaur") ?? TOP_STARTERS[0] ?? null,
    [TOP_STARTERS],
  );
  const EXAMPLE_GROUP = useMemo(
    () => (EXAMPLE_ANCHOR ? buildGroup([EXAMPLE_ANCHOR], GROUP_SIZE) : []),
    [EXAMPLE_ANCHOR],
  );

  const anchors = useMemo(() => resolveSlugs(anchorSlugs), [anchorSlugs]);
  const primaryAnchor = anchors[0] ?? null;
  const anchorHabitat = primaryAnchor?.habitat.label ?? null;

  const searchMatches = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    return POKEMON_LIST.filter((p) => p.label.toLowerCase().includes(q)).slice(0, 10);
  }, [query]);

  const selectAnchor = useCallback((slug: string) => {
    setAnchorSlugs((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);
      if (prev.length >= MAX_ANCHORS) return prev;
      return [...prev, slug];
    });
    setQuery("");
    setShowSuggestions(false);
    setActiveIdx(-1);
  }, []);

  const removeAnchor = useCallback((slug: string) => {
    setAnchorSlugs((prev) => prev.filter((s) => s !== slug));
  }, []);

  const recommendations = useMemo<PokemonRecommendation[]>(() => {
    if (anchorSlugs.length === 0) return [];
    const anchorSet = new Set(anchorSlugs);
    const habitatSlug = anchors[0]?.habitat.slug ?? null;
    if (!habitatSlug) return [];
    const scored: PokemonRecommendation[] = [];
    for (const p of POKEMON_LIST) {
      if (anchorSet.has(p.slug) || p.habitat.slug !== habitatSlug) continue;
      const scores = anchors.map((a) => calcScore(a, p));
      const avg = scores.reduce((acc, v) => acc + v, 0) / scores.length;
      const shared = anchors.reduce((sum, a) => sum + sharedItemCount(a, p), 0);
      const pts = Math.round(avg);
      if (pts < 0) continue;
      scored.push({ pokemon: p, score: pts, shared });
    }
    return scored.sort((a, b) => b.score - a.score).slice(0, 10);
  }, [anchors, anchorSlugs]);

  const group = useMemo(() => {
    if (anchorSlugs.length === 0) return [];
    return buildGroup(resolveSlugs(anchorSlugs), GROUP_SIZE);
  }, [anchorSlugs]);

  return (
    <PageWrap>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Matchmaker" }]} />
      <PageHeader title="Matchmaker">
        <p className="text-[13px] text-ink-soft mb-4 leading-relaxed">
          Pick up to {MAX_ANCHORS} anchor Pokemon to find the best roommates. Same habitat required; shared items are bonus points.
        </p>
      </PageHeader>

      <Card>
        {anchorSlugs.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {anchors.map((a) => (
              <div key={a.slug} className="flex items-center gap-1.5 bg-accent-soft border border-[1.5px] border-accent rounded-full px-2 py-[4px]">
                <div className="relative size-5 shrink-0">
                  <Image fill src={pkmnIconUrl(a)} alt={a.label} className="object-contain" sizes="20px" />
                </div>
                <span className="font-outfit font-bold text-[12px] text-ink-deep">{a.label}</span>
                <button
                  type="button"
                  onClick={() => removeAnchor(a.slug)}
                  className="ml-0.5 text-ink-soft hover:text-ink font-mono text-[11px] leading-none"
                  aria-label={`Remove ${a.label}`}
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
            onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); setActiveIdx(-1); }}
            onFocus={() => { if (blurTimerRef.current) clearTimeout(blurTimerRef.current); }}
            onBlur={() => {
              blurTimerRef.current = setTimeout(() => setShowSuggestions(false), 150);
            }}
            placeholder={anchorSlugs.length === 0 ? "Search Pokemon to add as anchor…" : "Add another anchor…"}
            aria-expanded={showSuggestions && searchMatches.length > 0}
            aria-controls="matchmaker-search-listbox"
            aria-activedescendant={
              activeIdx >= 0 && searchMatches[activeIdx] != null
                ? `matchmaker-search-listbox-opt-${searchMatches[activeIdx]!.slug}`
                : undefined
            }
          >
            {showSuggestions && (
              <SuggestionDropdown
                id="matchmaker-search-listbox"
                options={searchMatches}
                activeIdx={activeIdx}
                onSelect={(opt) => selectAnchor(opt.slug)}
              />
            )}
          </SearchInput>
        )}

        {anchors.length > 0 && (
          <div className="flex flex-wrap gap-5 mt-5">
            {anchors.map((anchor, i) => (
              <div key={anchor.slug} className="flex items-start gap-3">
                <div className="size-[72px] shrink-0 bg-[var(--portrait-bg)] rounded-[12px] border-2 border-paper-edge p-1.5 shadow-[0_4px_12px_-4px_var(--shadow)]">
                  <div className="relative w-full h-full">
                    <Image fill src={anchor.spriteHq ?? pkmnIconUrl(anchor)} alt={anchor.label} className="object-contain" sizes="72px" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-[11px] text-accent-deep font-semibold tracking-[0.1em] mb-[2px]">
                    {i === 0 ? "Anchor" : `Anchor ${i + 1}`} · #{dexNum(anchor)}
                  </div>
                  <div className="font-outfit font-extrabold text-[20px] tracking-[-0.02em] leading-[1.05] mb-1">{anchor.label}</div>
                  <div className="font-mono text-[11px] text-leaf font-semibold tracking-[0.04em]">{anchor.habitat.label}</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(POKEMON_CATEGORIES_SORTED[anchor.slug] ?? anchor.categories).map((c) => (
                      <span key={c.slug} className="font-outfit text-[11px] font-bold px-[10px] py-1 rounded-full bg-surface-1 text-ink border border-[1.5px] border-paper-edge tracking-[0.04em]">
                        {c.label}
                      </span>
                    ))}
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
              Search for a Pokemon above to find its best housing group: Pokemon that share the most item preferences and have complementary specialties. You can add up to {MAX_ANCHORS} anchors to narrow it down further.
            </p>
          </div>

          {EXAMPLE_GROUP.length > 0 && EXAMPLE_ANCHOR && (
            <>
              <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-soft font-semibold mb-3">
                Example · {EXAMPLE_ANCHOR.label}&apos;s best group
              </div>
              <PokemonGrid className="mb-5">
                {EXAMPLE_GROUP.map((p) => (
                  <button
                    key={p.slug}
                    type="button"
                    onClick={() => selectAnchor(p.slug)}
                    className="bg-chrome border border-[1.5px] border-paper-edge rounded-[14px] p-3 text-center text-ink flex flex-col items-center gap-1 transition-all hover:bg-paper hover:border-accent hover:-translate-y-0.5 hover:shadow-[0_6px_16px_-6px_var(--shadow)] w-full cursor-pointer"
                  >
                    {EXAMPLE_ANCHOR && p.slug === EXAMPLE_ANCHOR.slug && (
                      <div className="font-mono text-[10px] text-accent mb-1">ANCHOR</div>
                    )}
                    <div className="relative size-16">
                      <Image fill src={pkmnIconUrl(p)} alt={p.label} className="object-contain" sizes="64px" />
                    </div>
                    <div className="font-mono text-[10px] text-ink-fade font-medium">#{dexNum(p)}</div>
                    <div className="font-bold text-[12px] leading-tight">{p.label}</div>
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
                  type="button"
                  onClick={() => selectAnchor(p.slug)}
                  className="flex items-center gap-1.5 bg-chrome border border-[1.5px] border-paper-edge rounded-full px-2.5 py-[5px] text-ink transition-all hover:bg-paper hover:border-accent cursor-pointer"
                >
                  <div className="relative size-5 shrink-0">
                    <Image fill src={pkmnIconUrl(p)} alt={p.label} className="object-contain" sizes="20px" />
                  </div>
                  <span className="font-outfit font-bold text-[12px]">{p.label}</span>
                </button>
              ))}
            </div>
          </div>
        </Card>
      )}

      {anchorSlugs.length > 0 && recommendations.length === 0 && (
        <Card>
          <div className="text-center py-6">
            <p className="text-ink-soft mb-3 text-[13px]">
              No Pokemon found in the same habitat{anchorHabitat ? ` (${anchorHabitat})` : ""}.
            </p>
            <button
              type="button"
              onClick={() => setAnchorSlugs([])}
              className="px-4 py-2 rounded-lg bg-accent text-paper font-outfit font-semibold text-[14px]"
            >
              Clear anchors and try again
            </button>
          </div>
        </Card>
      )}

      {recommendations.length > 0 && (
        <Card>
          <SectionTitle pill="BEST MATCH">Top roommates</SectionTitle>
          <p className="text-[13px] text-ink-soft mb-4 leading-relaxed">
            Ranked by shared items{anchors.length > 1 ? ` across ${anchors.length} anchors` : ""}. Complementary specialties add a 50% bonus.
          </p>
          {(() => {
            const allAnchorSpecs = new Set(anchors.flatMap((a) => a.specialties.map((s) => s.slug)));
            return recommendations.map(({ pokemon: p, score: s, shared }) => {
              const candSpecs = p.specialties;
              const isComplementary =
                candSpecs.length > 0 && !candSpecs.some((sp) => allAnchorSpecs.has(sp.slug));
              return (
                <div
                  key={p.slug}
                  role="button"
                  tabIndex={0}
                  onClick={() => selectAnchor(p.slug)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); selectAnchor(p.slug); } }}
                  className="relative flex gap-3 items-center rounded-[14px] p-[14px] border border-[1.5px] border-accent bg-gradient-to-br from-accent-soft to-surface-1 mb-2.5 cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_8px_18px_-6px_var(--shadow)] transition-all w-full text-left"
                >
                  <div className="absolute -top-2 right-3 flex items-center gap-1">
                    {isComplementary && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-leaf text-paper uppercase tracking-wide">
                        COMPLEMENT
                      </span>
                    )}
                    <span className="font-mono text-[10px] font-semibold px-2 py-[3px] rounded-full bg-accent text-paper tracking-[0.06em]">
                      {s} pts
                    </span>
                  </div>
                  <div className="size-14 shrink-0 bg-paper rounded-[10px] p-1">
                    <div className="relative w-full h-full">
                      <Image fill src={pkmnIconUrl(p)} alt={p.label} className="object-contain" sizes="56px" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-extrabold text-[14px] text-ink leading-tight">{p.label}</span>
                      <Link
                        href={`/pokemon/${p.slug}`}
                        className="font-mono text-[10px] text-ink-soft no-underline hover:text-accent shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        view →
                      </Link>
                    </div>
                    <div className="font-mono text-[10px] text-ink-soft tracking-[0.02em] leading-snug">
                      {shared} shared items · {p.specialties.map((sp) => sp.label).join(", ") || "no specialty"}
                    </div>
                  </div>
                </div>
              );
            });
          })()}
        </Card>
      )}

      {group.length > 1 && (
        <Card>
          <SectionTitle pill="TEAM">Best group of {group.length}</SectionTitle>
          <p className="text-[13px] text-ink-soft mb-4 leading-relaxed">
            Greedy algorithm: each Pokemon maximizes shared items with the current group.
          </p>
          <PokemonGrid>
            {group.map((p) => {
              const isAnchor = anchorSlugs.includes(p.slug);
              return (
                <div
                  key={p.slug}
                  role="button"
                  tabIndex={0}
                  onClick={() => selectAnchor(p.slug)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); selectAnchor(p.slug); } }}
                  className={`border border-[1.5px] rounded-[14px] p-3 text-center text-ink flex flex-col items-center gap-1 transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_16px_-6px_var(--shadow)] w-full cursor-pointer ${isAnchor ? "bg-accent-soft border-accent" : "bg-chrome border-paper-edge hover:bg-paper hover:border-accent"}`}
                >
                  {isAnchor && <div className="font-mono text-[10px] text-accent mb-1">ANCHOR</div>}
                  <div className="relative size-16">
                    <Image fill src={pkmnIconUrl(p)} alt={p.label} className="object-contain" sizes="64px" />
                  </div>
                  <div className="font-mono text-[10px] text-ink-fade font-medium">#{dexNum(p)}</div>
                  <div className="font-bold text-[12px] leading-tight">{p.label}</div>
                  <Link
                    href={`/pokemon/${p.slug}`}
                    className="font-mono text-[10px] text-ink-soft no-underline hover:text-accent mt-0.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    view →
                  </Link>
                </div>
              );
            })}
          </PokemonGrid>
        </Card>
      )}
    </PageWrap>
  );
}
