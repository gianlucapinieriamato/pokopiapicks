export type PokemonEntry = {
  name: string;
  num: number;
  habitat: string;
  categories: string[];
  icon: string;
  slug: string;
  nationalDexNum: number | null;
  spriteHq: string | null;
  types?: string[];
  specialties?: string[];
  flavor?: string | null;
  primaryLocation?: string | null;
  habitatList?: HabitatListEntry[];
};

export type HabitatListEntry = {
  habitatSlug: string;
  locations: string[];
  rarity: string | null;
  time: string[] | null;
  weather: string[] | null;
  isCloudIsland: boolean;
};

export type CategoryEntry = {
  slug: string;
  name: string;
  items: string[];
};

export type ItemEntry = {
  slug: string;
  name: string;
  icon: string | null;
  categories: string[];
};

export type SpecialtyEntry = {
  slug: string;
  name: string;
  description: string;
  pokemon: string[];
};

export type HabitatEntry = {
  slug: string;
  name: string;
  description: string;
  pokemon: string[];
};

export type LocationEntry = {
  slug: string;
  name: string;
  description: string;
  objective: string;
  materials: string[];
  blocksAndPlants: string[];
};
