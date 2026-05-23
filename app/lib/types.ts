export type PokemonEntry = {
  name: string;
  num: number;
  habitat: string;
  categories: readonly string[];
  icon: string;
  slug: string;
  nationalDexNum: number | null;
  spriteHq: string | null;
  types?: readonly string[];
  specialties?: readonly string[];
  flavor?: string | null;
  primaryLocation?: string | null;
  habitatList?: HabitatListEntry[];
};

export type HabitatListEntry = {
  habitatSlug: string;
  locations: readonly string[];
  rarity: string | null;
  time: readonly string[] | null;
  weather: readonly string[] | null;
  isCloudIsland: boolean;
};

export type CategoryEntry = {
  slug: string;
  name: string;
  items: readonly string[];
};

export type ItemEntry = {
  slug: string;
  name: string;
  icon: string | null;
  categories: readonly string[];
};

export type ShopItem = {
  readonly name: string;
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
  materials: readonly string[];
  blocksAndPlants: readonly string[];
  itemsInArea?: readonly string[];
  itemsInPokeballs?: readonly string[];
  treasure?: readonly string[];
  shopItems?: ShopItem[];
};

export type HabitatRequirement = {
  name: string;
  qty: number;
};

export type CraftingIngredient = {
  name: string;
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
