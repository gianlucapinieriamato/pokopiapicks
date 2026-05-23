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
export const POKEMON_LIST: PokemonConst[] = ALL_POKEMON.sort((a, b) => {
  const na = a.nationalDexNum ?? 99999;
  const nb = b.nationalDexNum ?? 99999;
  return na !== nb ? na - nb : a.num - b.num;
});

/** Pokemon keyed by slug for O(1) lookup */
export const POKEMON_BY_SLUG: Record<string, PokemonConst> = Object.fromEntries(
  POKEMON_LIST.map((p) => [p.slug, p]),
);

/** Pokemon grouped by specialty slug */
export const POKEMON_BY_SPECIALTY: Record<string, PokemonConst[]> = groupBy(
  POKEMON_LIST,
  (p) => p.specialties.map((s) => s.slug as string),
);

/** Pokemon grouped by habitat config slug */
export const POKEMON_BY_HABITAT_CONFIG: Record<string, PokemonConst[]> = groupBy(
  POKEMON_LIST,
  (p) => p.habitatList.map((h) => h.habitat.slug as string),
);

/** Zero-padded dex number for display */
export function dexNum(p: { nationalDexNum: number | null; num: number }): string {
  return String(p.nationalDexNum ?? p.num).padStart(3, "0");
}

/** Icon URL for a pokemon */
export function pkmnIconUrl(p: PokemonConst): string {
  return `/icons/pokemon/${p.icon}`;
}
