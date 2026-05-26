import type { Metadata } from "next";
import { Location, POKEMON_LIST } from "@/app/lib/const";
import JsonLd from "@/app/components/JsonLd";
import { SITE_URL } from "@/app/lib/config";
import PageWrap from "@/app/components/PageWrap";
import Breadcrumb from "@/app/components/Breadcrumb";
import Card from "@/app/components/Card";
import PageHeader from "@/app/components/PageHeader";
import { FilterableGrid } from "@/app/components/FilterableGrid";

export const metadata: Metadata = {
  title: "Locations",
  description: "Browse all Pokemon Pokopia locations, materials, and which Pokemon appear there.",
};

const ALL_LOCATIONS = Object.values(Location);

const pkmnCountByLocation: Record<string, number> = {};
for (const p of POKEMON_LIST) {
  for (const h of p.habitatList) {
    for (const loc of h.locations) {
      pkmnCountByLocation[loc.slug] = (pkmnCountByLocation[loc.slug] ?? 0) + 1;
    }
  }
}

export default function LocationsPage() {
  return (
    <PageWrap>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Pokopia Locations",
        description: "Browse all Pokemon Pokopia locations, materials, and which Pokemon appear there.",
        url: `${SITE_URL}/locations`,
      }} />
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Locations" }]} />
      <PageHeader title="Locations" meta={`${ALL_LOCATIONS.length} locations`} />

      <Card>
        <FilterableGrid
          searchPlaceholder="Search locations…"
          items={ALL_LOCATIONS.map((loc) => {
            const pkmnCount = pkmnCountByLocation[loc.slug] ?? 0;
            const matCount = loc.materials.length + loc.blocksAndPlants.length;
            return {
              slug: loc.slug,
              href: `/locations/${loc.slug}`,
              label: loc.label,
              description: loc.description ?? null,
              meta: [
                matCount > 0 ? `${matCount} materials` : "no materials",
                pkmnCount > 0 ? `${pkmnCount} Pokemon` : null,
              ].filter(Boolean).join(" · "),
            };
          })}
        />
      </Card>
    </PageWrap>
  );
}
