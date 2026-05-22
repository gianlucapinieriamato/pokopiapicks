import type { Metadata } from "next";
import Link from "next/link";
import { LOCATIONS, POKEMON_LIST } from "@/app/lib/data";
import JsonLd from "@/app/components/JsonLd";
import { SITE_URL } from "@/app/lib/config";
import PageWrap from "@/app/components/PageWrap";
import Breadcrumb from "@/app/components/Breadcrumb";
import Card from "@/app/components/Card";
import PageHeader from "@/app/components/PageHeader";
import HoverTile from "@/app/components/HoverTile";

export const metadata: Metadata = {
  title: "Locations",
  description: "Browse all Pokemon Pokopia locations, materials, and which Pokemon appear there.",
};

const ALL_LOCATIONS = Object.values(LOCATIONS);

const pkmnCountByLocation: Record<string, number> = {};
for (const loc of POKEMON_LIST.flatMap(p => p.habitatList?.flatMap(h => h.locations) ?? [])) {
  pkmnCountByLocation[loc] = (pkmnCountByLocation[loc] ?? 0) + 1;
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
        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-2">
          {ALL_LOCATIONS.map((loc) => {
            const pkmnCount = pkmnCountByLocation[loc.slug] ?? 0;
            const matCount = loc.materials.length + loc.blocksAndPlants.length;
            return (
              <Link key={loc.slug} href={`/location/${loc.slug}`} className="no-underline">
                <HoverTile className="py-3 px-3.5">
                  <div className="font-outfit font-bold text-sm text-ink mb-1">{loc.name}</div>
                  {loc.description && (
                    <div className="font-mono text-[10px] text-ink-soft tracking-[0.02em] leading-snug mb-1 line-clamp-2">{loc.description}</div>
                  )}
                  <div className="font-mono text-[10px] text-ink-fade tracking-[0.04em]">
                    {matCount > 0 ? `${matCount} materials` : "no materials"}
                    {pkmnCount > 0 ? ` · ${pkmnCount} Pokemon` : ""}
                  </div>
                </HoverTile>
              </Link>
            );
          })}
        </div>
      </Card>
    </PageWrap>
  );
}
