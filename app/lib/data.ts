import type { PokemonEntry } from "./types";
import { POKEMON } from "./data/pokemon";
import { CATEGORIES } from "./data/categories";
import { ITEMS } from "./data/items";
import { SPECIALTIES } from "./data/specialties";
import { HABITATS } from "./data/habitats";
import { LOCATIONS } from "./data/locations";
import { HABITAT_REQUIREMENTS } from "./data/habitat-requirements";
import { ITEM_RECIPES } from "./data/crafting";

export {
  POKEMON,
  CATEGORIES,
  ITEMS,
  SPECIALTIES,
  HABITATS,
  LOCATIONS,
  HABITAT_REQUIREMENTS,
  ITEM_RECIPES,
};

// Sort by national dex number; game-exclusive Pokemon (null nationalDexNum) go last
export const POKEMON_LIST: PokemonEntry[] = Object.entries(POKEMON)
  .map(([slug, p]) => ({ ...p, slug }))
  .sort((a, b) => {
    const na = a.nationalDexNum ?? 99999;
    const nb = b.nationalDexNum ?? 99999;
    return na !== nb ? na - nb : a.num - b.num; // tiebreak by Pokopia num for alternate forms
  });

/** Zero-padded national dex number for display, e.g. "001" */
export function dexNum(p: PokemonEntry): string {
  return String(p.nationalDexNum ?? p.num).padStart(3, "0");
}

// All cross-references are now slug-keyed after migration.
// The helpers below operate directly on slug keys.

/** Get all item slugs in a category by its slug */
export function getCatItems(catSlugKey: string): readonly string[] {
  return CATEGORIES[catSlugKey]?.items ?? [];
}

/** Resolve a category slug → display name */
export function catDisplayName(catSlugKey: string): string {
  return CATEGORIES[catSlugKey]?.name ?? catSlugKey;
}

/** Identity — category references are already slugs after migration */
export function catSlug(catSlugKey: string): string {
  return catSlugKey;
}

export function pkmnIconUrl(p: PokemonEntry): string {
  return `/icons/pokemon/${p.icon}`;
}

// Legendary/mythical national dex numbers (Gen 1–4 + select Gen 5+)
const LEGENDARY_NUMS = new Set([
  144,
  145,
  146,
  150,
  151, // Gen 1: birds, Mewtwo, Mew
  243,
  244,
  245,
  249,
  250,
  251, // Gen 2: beasts, Lugia, Ho-Oh, Celebi
  377,
  378,
  379,
  380,
  381,
  382,
  383,
  384,
  385,
  386, // Gen 3: Regis, lati, weather trio, Jirachi, Deoxys
  480,
  481,
  482,
  483,
  484,
  485,
  486,
  487,
  488,
  489,
  490,
  491,
  492,
  493, // Gen 4
  494,
  638,
  639,
  640,
  641,
  642,
  643,
  644,
  645,
  646,
  647,
  648,
  649, // Gen 5
  716,
  717,
  718,
  719,
  720,
  721, // Gen 6
  772,
  773,
  785,
  786,
  787,
  788,
  789,
  790,
  791,
  792,
  800, // Gen 7
]);

export function getRarity(p: PokemonEntry) {
  const isLegendary =
    p.nationalDexNum != null && LEGENDARY_NUMS.has(p.nationalDexNum);
  return {
    holoIntensity: isLegendary ? 100 : 25,
    sparkles: isLegendary,
    rarityLabel: isLegendary ? "LEGENDARY" : "COMMON",
  };
}
