import type { Metadata } from "next";
import { POKEMON_LIST } from "@/app/lib/data";
import { SITE_URL } from "@/app/lib/config";
import JsonLd from "@/app/components/JsonLd";
import PokedexClient from "./PokedexClient";

export const metadata: Metadata = {
  title: "Pokémon Pokopia Pokédex — Filter by Habitat, Flavor & Specialty",
  description: `Browse all ${POKEMON_LIST.length} Pokemon in Pokemon Pokopia. Filter by habitat, flavor, specialty, favorite category, and location to find the perfect roommate.`,
};

export default function PokedexPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Pokémon Pokopia Pokédex",
          url: `${SITE_URL}/pokedex/`,
          numberOfItems: POKEMON_LIST.length,
          itemListElement: POKEMON_LIST.slice(0, 50).map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: `${SITE_URL}/pokemon/${p.slug}/`,
            name: p.name,
          })),
        }}
      />
      <PokedexClient />
    </>
  );
}
