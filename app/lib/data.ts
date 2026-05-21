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

export const POKEMON_LIST: PokemonEntry[] = Object.entries(POKEMON)
  .map(([slug, p]) => ({ ...p, slug }))
  .sort((a, b) => a.num - b.num);

export function catName(slug: string): string {
  return CATEGORIES[slug]?.name ?? slug;
}

export function pkmnIconUrl(p: PokemonEntry): string {
  return `/icons/pokemon/${p.icon}`;
}
