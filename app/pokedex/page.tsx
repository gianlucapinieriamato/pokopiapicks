import type { Metadata } from "next";
import { POKEMON_LIST } from "@/app/lib/data";
import PokedexClient from "./PokedexClient";

export const metadata: Metadata = {
  title: "Pokédex",
  description: `Browse all ${POKEMON_LIST.length} Pokemon in Pokemon Pokopia. Filter by habitat, flavor, specialty, favorite category, and location to find the perfect roommate.`,
};

export default function PokedexPage() {
  return <PokedexClient />;
}
