// Bridge layer: re-exports from @/app/lib/const + backward-compat shims.
// The canonical data is now in app/lib/const/. This file keeps old import
// paths working while the migration to direct const imports proceeds.

// ─── Direct re-exports from const ─────────────────────────────────────────

export {
  POKEMON_BY_SLUG,
  POKEMON_LIST,
  POKEMON_BY_SPECIALTY,
  POKEMON_BY_HABITAT_CONFIG,
  Item,
  Category,
  HabitatConfig,
  Location,
  Specialty,
  PokemonHabitat,
  Weather,
  Time,
  Rarity,
  Flavor,
  dexNum,
  pkmnIconUrl,
} from "@/app/lib/const";

export type {
  PokemonConst,
  CategoryConst,
  ItemConst,
  SpecialtyConst,
  HabitatConfigConst,
  LocationConst,
  HabitatListConst,
  PokemonHabitatConst,
  FlavorConst,
  RarityConst,
  TimeConst,
  WeatherConst,
} from "@/app/lib/const";

import {
  POKEMON_BY_SLUG,
  POKEMON_LIST,
  Category,
  Item,
  Specialty,
  HabitatConfig,
  Location,
} from "@/app/lib/const";
import type {
  PokemonConst,
  CategoryConst,
  ItemConst,
  SpecialtyConst,
  HabitatConfigConst,
  LocationConst,
} from "@/app/lib/const";

// Re-export PokemonConst as PokemonEntry so components using `PokemonEntry` still compile
export type PokemonEntry = PokemonConst;

// ─── POKEMON dict (slug → PokemonConst) ────────────────────────────────────
// Alias of POKEMON_BY_SLUG for backward compat
export const POKEMON = POKEMON_BY_SLUG;

// ─── CATEGORIES dict (slug → compat shape) ─────────────────────────────────
// Old code accessed: c.name, c.slug, c.items (as string[])
// New code uses CategoryConst: c.label, c.slug, c.items (as ItemConst[])
// We provide a compat shape with `name` aliased from `label` and `items` as slug strings.
export type LegacyCategoryEntry = {
  slug: string;
  name: string;
  label: string;
  items: readonly string[]; // item slugs — for code still using string items
  itemConsts: readonly ItemConst[]; // rich objects
};

export const CATEGORIES: Record<string, LegacyCategoryEntry> = Object.fromEntries(
  Object.values(Category).map((c) => [
    c.slug,
    {
      slug: c.slug,
      name: c.label,
      label: c.label,
      items: c.items.map((i) => i.slug),
      itemConsts: c.items,
    },
  ])
);

// ─── ITEMS dict (slug → compat shape) ──────────────────────────────────────
// Old code accessed: item.name, item.slug, item.icon
// New ItemConst has: item.label, item.slug, item.icon
export type LegacyItemEntry = ItemConst & { name: string };

export const ITEMS: Record<string, LegacyItemEntry> = Object.fromEntries(
  Object.values(Item).map((i) => [
    i.slug,
    { ...i, name: i.label },
  ])
);

// ─── SPECIALTIES dict (slug → compat shape) ────────────────────────────────
// Old code accessed: s.name, s.description, s.pokemon (string[])
// HabitatConfig const is acyclic — no pokemon list. Provide empty [] stub.
export type LegacySpecialtyEntry = SpecialtyConst & {
  name: string;
  pokemon: readonly string[];
};

export const SPECIALTIES: Record<string, LegacySpecialtyEntry> = Object.fromEntries(
  Object.values(Specialty).map((s) => [
    s.slug,
    { ...s, name: s.label, pokemon: [] as readonly string[] },
  ])
);

// ─── HABITATS dict (slug → compat shape) ───────────────────────────────────
// Old code accessed: h.name, h.description, h.pokemon (string[])
// HabitatConfig is acyclic — no pokemon list. Stub with [].
export type LegacyHabitatEntry = HabitatConfigConst & {
  name: string;
  pokemon: readonly string[];
};

export const HABITATS: Record<string, LegacyHabitatEntry> = Object.fromEntries(
  Object.values(HabitatConfig).map((h) => [
    h.slug,
    { ...h, name: h.label, pokemon: [] as readonly string[] },
  ])
);

// ─── LOCATIONS dict (slug → compat shape) ──────────────────────────────────
// Old code accessed: l.name, l.description, l.objective, l.materials, etc.
export type LegacyLocationEntry = LocationConst & { name: string };

export const LOCATIONS: Record<string, LegacyLocationEntry> = Object.fromEntries(
  Object.values(Location).map((l) => [
    l.slug,
    { ...l, name: l.label },
  ])
);

// ─── Still from old data layer ─────────────────────────────────────────────

// HABITAT_REQUIREMENTS used by habitats/[slug]/page.tsx
export { HABITAT_REQUIREMENTS } from "@/app/lib/data/habitat-requirements";

// ITEM_RECIPES still from old data layer
export { ITEM_RECIPES } from "@/app/lib/data/crafting";

// ─── label() utility ────────────────────────────────────────────────────────
export function label(slug: string): string {
  return slug.charAt(0).toUpperCase() + slug.slice(1);
}

// ─── Backward-compat helpers ────────────────────────────────────────────────

/** Get all item slugs in a category by its slug */
export function getCatItems(catSlug: string): readonly string[] {
  return CATEGORIES[catSlug]?.items ?? [];
}

/** Resolve a category slug → display name */
export function catDisplayName(catSlug: string): string {
  return CATEGORIES[catSlug]?.label ?? catSlug;
}

/** Identity — category references are already slugs */
export function catSlug(slug: string): string {
  return slug;
}

// ─── Legendary rarity helper ────────────────────────────────────────────────

const LEGENDARY_NUMS = new Set([
  144, 145, 146, 150, 151,
  243, 244, 245, 249, 250, 251,
  377, 378, 379, 380, 381, 382, 383, 384, 385, 386,
  480, 481, 482, 483, 484, 485, 486, 487, 488, 489, 490, 491, 492, 493,
  494, 638, 639, 640, 641, 642, 643, 644, 645, 646, 647, 648, 649,
  716, 717, 718, 719, 720, 721,
  772, 773, 785, 786, 787, 788, 789, 790, 791, 792, 800,
]);

export function getRarity(p: { nationalDexNum: number | null }) {
  const isLegendary =
    p.nationalDexNum != null && LEGENDARY_NUMS.has(p.nationalDexNum);
  return {
    holoIntensity: isLegendary ? 100 : 25,
    sparkles: isLegendary,
    rarityLabel: isLegendary ? "LEGENDARY" : "COMMON",
  };
}

// ─── Type re-exports for files still importing from @/app/lib/types ─────────
export type { HabitatRequirement, PokemonRecommendation } from "@/app/lib/types";
