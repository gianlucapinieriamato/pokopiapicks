import type {
  PokemonEntry, CategoryEntry, ItemEntry,
  SpecialtyEntry, HabitatEntry, LocationEntry,
} from "./types";

import pokemonRaw from "@/data/pokemon.json";
import categoriesRaw from "@/data/favorite-categories.json";
import itemsRaw from "@/data/items.json";
import specialtiesRaw from "@/data/specialties.json";
import habitatsRaw from "@/data/habitats.json";
import locationsRaw from "@/data/locations.json";

export const POKEMON = pokemonRaw as Record<string, PokemonEntry>;
export const CATEGORIES = categoriesRaw as Record<string, CategoryEntry>;
export const ITEMS = itemsRaw as Record<string, ItemEntry>;
export const SPECIALTIES = specialtiesRaw as Record<string, SpecialtyEntry>;
export const HABITATS = habitatsRaw as Record<string, HabitatEntry>;
export const LOCATIONS = locationsRaw as Record<string, LocationEntry>;

// Sort by national dex number; game-exclusive Pokémon (null nationalDexNum) go last
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
