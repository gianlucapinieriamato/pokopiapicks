import type { PokemonEntry, CategoryEntry } from "./types";
import { POKEMON } from "./data/pokemon";
import { CATEGORIES } from "./data/categories";
import { ITEMS } from "./data/items";
import { SPECIALTIES } from "./data/specialties";
import { HABITATS } from "./data/habitats";
import { LOCATIONS } from "./data/locations";

export { POKEMON, CATEGORIES, ITEMS, SPECIALTIES, HABITATS, LOCATIONS };

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

// pokemon.json stores categories as display names ("Complicated stuff"),
// but favorite-categories.json uses slugs as keys ("complicated-stuff").
// This map lets us look up by display name.
export const CAT_BY_NAME: Record<string, CategoryEntry & { slug: string }> = {};
for (const [slug, cat] of Object.entries(CATEGORIES)) {
  CAT_BY_NAME[cat.name] = { ...cat, slug };
}

/** Resolve a category reference (display name OR slug) → items list */
export function getCatItems(catRef: string): string[] {
  // Direct slug lookup
  if (CATEGORIES[catRef]) return CATEGORIES[catRef].items;
  // Display name lookup
  if (CAT_BY_NAME[catRef]) return CAT_BY_NAME[catRef].items;
  return [];
}

/** Resolve a category reference → display name */
export function catDisplayName(catRef: string): string {
  if (CATEGORIES[catRef]) return CATEGORIES[catRef].name;
  if (CAT_BY_NAME[catRef]) return catRef; // already a display name
  return catRef;
}

/** Resolve a category reference → slug (for URL linking) */
export function catSlug(catRef: string): string {
  if (CATEGORIES[catRef]) return catRef; // already a slug
  if (CAT_BY_NAME[catRef]) return CAT_BY_NAME[catRef].slug;
  return catRef.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function pkmnIconUrl(p: PokemonEntry): string {
  return `/icons/pokemon/${p.icon}`;
}

// Legendary/mythical national dex numbers (Gen 1–4 + select Gen 5+)
const LEGENDARY_NUMS = new Set([
  144, 145, 146, 150, 151,           // Gen 1: birds, Mewtwo, Mew
  243, 244, 245, 249, 250, 251,      // Gen 2: beasts, Lugia, Ho-Oh, Celebi
  377, 378, 379, 380, 381, 382, 383, 384, 385, 386, // Gen 3: Regis, lati, weather trio, Jirachi, Deoxys
  480, 481, 482, 483, 484, 485, 486, 487, 488, 489, 490, 491, 492, 493, // Gen 4
  494, 638, 639, 640, 641, 642, 643, 644, 645, 646, 647, 648, 649, // Gen 5
  716, 717, 718, 719, 720, 721, // Gen 6
  772, 773, 785, 786, 787, 788, 789, 790, 791, 792, 800, // Gen 7
]);

export function getRarity(p: PokemonEntry) {
  const isLegendary = p.nationalDexNum != null && LEGENDARY_NUMS.has(p.nationalDexNum);
  return {
    holoIntensity: isLegendary ? 100 : 25,
    sparkles: isLegendary,
    rarityLabel: isLegendary ? "LEGENDARY" : "COMMON",
  };
}
