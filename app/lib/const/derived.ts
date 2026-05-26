// app/lib/const/derived.ts
import { Pokemon, type PokemonConst } from "./pokemon";
import type { CategoryConst } from "./categories";

/** Stable single-pass over all Pokemon values */
const ALL_POKEMON: PokemonConst[] = Object.values(Pokemon);

/** Generic grouping helper — avoids repeated reduce boilerplate */
function groupBy<T, K extends string>(
  items: readonly T[],
  keyFn: (item: T) => K[],
): Record<K, T[]> {
  const out = {} as Record<K, T[]>;
  for (const item of items) {
    for (const key of keyFn(item)) {
      (out[key] ??= []).push(item);
    }
  }
  return out;
}

/** All pokemon sorted by national dex number (game-exclusives last) */
export const POKEMON_LIST: PokemonConst[] = ALL_POKEMON.toSorted((a, b) => {
  const na = a.nationalDexNum ?? 99999;
  const nb = b.nationalDexNum ?? 99999;
  return na !== nb ? na - nb : a.num - b.num;
});

/** Pokemon keyed by slug for O(1) lookup */
export const POKEMON_BY_SLUG: Record<string, PokemonConst> = Object.fromEntries(
  POKEMON_LIST.map((p) => [p.slug, p]),
);

/** Pokemon grouped by specialty slug */
export const POKEMON_BY_SPECIALTY: Record<string, PokemonConst[]> = groupBy<PokemonConst, string>(
  POKEMON_LIST,
  (p) => p.specialties.map((s) => s.slug),
);

/** Pokemon grouped by type slug */
export const POKEMON_BY_TYPE: Record<string, PokemonConst[]> = groupBy<PokemonConst, string>(
  POKEMON_LIST,
  (p) => p.types.map((t) => t.slug),
);

/** Pokemon grouped by habitat config slug */
export const POKEMON_BY_HABITAT_CONFIG: Record<string, PokemonConst[]> = groupBy<PokemonConst, string>(
  POKEMON_LIST,
  (p) => p.habitatList.map((h) => h.habitat.slug),
);

/** Zero-padded dex number for display */
export function dexNum(p: { nationalDexNum: number | null; num: number }): string {
  return String(p.nationalDexNum ?? p.num).padStart(3, "0");
}

/** Icon URL for a pokemon */
export function pkmnIconUrl(p: PokemonConst): string {
  return `/icons/pokemon/${p.icon}`;
}

/** Categories per Pokemon sorted shortest-label-first — for chip row display */
export const POKEMON_CATEGORIES_SORTED: Record<string, readonly CategoryConst[]> =
  Object.fromEntries(
    POKEMON_LIST.map((p) => [
      p.slug,
      [...p.categories].sort((a, b) => a.label.length - b.label.length),
    ]),
  );

/** Icons matching `\d{3}-suffix.png` are variant forms */
const VARIANT_ICON_RE = /^\d{3}-.+\.png$/;

/**
 * Map from base-form slug → array of variant Pokemon.
 * Only populated for Pokemon that ARE base forms with at least one variant.
 */
export const POKEMON_VARIANTS_BY_BASE: Record<string, PokemonConst[]> = {};

/**
 * Map from variant slug → the base-form Pokemon.
 * Only populated for Pokemon that are variants.
 */
export const POKEMON_BASE_BY_VARIANT: Record<string, PokemonConst> = {};

// Build variant maps — two passes
// Pre-index base forms (non-variant icons) by nationalDexNum for O(1) lookup
const BASE_BY_DEX = new Map<number, PokemonConst>();
for (const p of POKEMON_LIST) {
  if (p.nationalDexNum != null && !VARIANT_ICON_RE.test(p.icon)) {
    BASE_BY_DEX.set(p.nationalDexNum, p);
  }
}

// Pass 1: variant icon with a plain-icon base (e.g. Mosslax → Snorlax)
for (const p of POKEMON_LIST) {
  if (!VARIANT_ICON_RE.test(p.icon)) continue;
  const dexNum_ = p.nationalDexNum;
  if (dexNum_ == null) continue;
  const base = BASE_BY_DEX.get(dexNum_);
  if (!base) continue;
  (POKEMON_VARIANTS_BY_BASE[base.slug] ??= []).push(p);
  POKEMON_BASE_BY_VARIANT[p.slug] = base;
}

// Pass 2: groups where ALL forms have variant icons and no base was found
// (e.g. Toxtricity Amped + Low Key, Tatsugiri Curly/Droopy/Stretchy)
// Group by nationalDexNum, skip any already linked
const orphanGroups = new Map<number, PokemonConst[]>();
for (const p of POKEMON_LIST) {
  if (!VARIANT_ICON_RE.test(p.icon)) continue;
  if (POKEMON_BASE_BY_VARIANT[p.slug]) continue; // already handled
  const dexNum_ = p.nationalDexNum;
  if (dexNum_ == null) continue;
  (orphanGroups.get(dexNum_) ?? (orphanGroups.set(dexNum_, []), orphanGroups.get(dexNum_)!)).push(p);
}
for (const group of orphanGroups.values()) {
  if (group.length < 2) continue;
  const pseudoBase = group[0]!;
  for (let i = 1; i < group.length; i++) {
    const v = group[i]!;
    (POKEMON_VARIANTS_BY_BASE[pseudoBase.slug] ??= []).push(v);
    POKEMON_BASE_BY_VARIANT[v.slug] = pseudoBase;
  }
}

Object.freeze(POKEMON_VARIANTS_BY_BASE);
Object.freeze(POKEMON_BASE_BY_VARIANT);
