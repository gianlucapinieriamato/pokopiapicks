import type { CategorySlug, HabitatConfigSlug, LocationSlug, SpecialtySlug, PokemonHabitatSlug } from "./data/consts";

export type PokemonEntry = {
  name: string;
  num: number;
  habitat: string;                          // display name (e.g. "Dry")
  habitatSlug: PokemonHabitatSlug;          // typed slug (e.g. "dry")
  categories: readonly CategorySlug[];      // typed category slugs
  icon: string;
  slug: string;
  nationalDexNum: number | null;
  spriteHq: string | null;
  types?: readonly string[];
  specialties?: readonly SpecialtySlug[];   // typed specialty slugs
  flavor?: string | null;
  primaryLocation?: LocationSlug | null;    // typed location slug
  habitatList?: HabitatListEntry[];
};

export type HabitatListEntry = {
  habitatSlug: HabitatConfigSlug;           // typed habitat config slug
  locations: readonly LocationSlug[];       // typed location slugs
  rarity: string | null;
  time: readonly string[] | null;
  weather: readonly string[] | null;
  isCloudIsland: boolean;
};

export type CategoryEntry = {
  slug: string;
  name: string;
  items: readonly string[]; // item slugs (e.g. "antique-chest")
};

export type ItemEntry = {
  slug: string;
  name: string;
  icon: string | null;
  categories: readonly string[];
};

export type ShopItem = {
  readonly slug: string; // item slug
  readonly name: string; // display name (kept for UI)
  readonly level: number;
};

export type SpecialtyEntry = {
  slug: string;
  name: string;
  description: string;
  pokemon: readonly string[];
};

export type HabitatEntry = {
  slug: string;
  name: string;
  description: string;
  pokemon: readonly string[];
};

export type LocationEntry = {
  slug: string;
  name: string;
  description: string;
  objective: string;
  materials: readonly string[];       // item slugs
  blocksAndPlants: readonly string[]; // item slugs
  itemsInArea?: readonly string[];    // item slugs
  itemsInPokeballs?: readonly string[]; // item slugs
  treasure?: readonly string[];       // item slugs
  shopItems?: ShopItem[];
};

export type HabitatRequirement = {
  type: "item" | "group"; // "item" = specific item slug; "group" = item group key
  value: string;          // item slug OR group key (e.g. "bed", "seat")
  name: string;           // original display name (kept for UI, e.g. "Bed (any)")
  qty: number;
};

export type CraftingIngredient = {
  slug: string; // item slug (e.g. "lumber", "pokemetal")
  name: string; // display name (kept for UI)
  qty: number;
};

export type CraftingRecipe = {
  category: string;
  unlock: string;
  materials: readonly CraftingIngredient[];
};

export type ResolvedItem = {
  displayName: string;
  slug: string | undefined;
  icon: string | null;
};

export type PokemonRecommendation = {
  pokemon: PokemonEntry;
  score: number;
  shared: number;
};
