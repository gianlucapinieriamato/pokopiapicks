import type { Metadata } from "next";
import { LOCATIONS, POKEMON, ITEMS } from "@/app/lib/data";
import ItemTile from "@/app/components/ItemTile";
import JsonLd from "@/app/components/JsonLd";
import { SITE_URL } from "@/app/lib/config";
import PageWrap from "@/app/components/PageWrap";
import Breadcrumb from "@/app/components/Breadcrumb";
import Card from "@/app/components/Card";
import PageHeader from "@/app/components/PageHeader";
import CollapsibleSection from "@/app/components/CollapsibleSection";
import PokemonGridCard from "@/app/components/PokemonGridCard";
import PokemonGrid from "@/app/components/PokemonGrid";

export function generateStaticParams() {
  return Object.keys(LOCATIONS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const loc = LOCATIONS[slug];
  if (!loc) return { title: "Not found" };
  return { title: loc.name, description: loc.description };
}

function ItemGrid({ items }: { items: string[] }) {
  const unique = [...new Set(items)];
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-2 mt-3">
      {unique.map((m) => {
        const entry = ITEMS[m];
        return <ItemTile key={m} name={m} slug={entry?.slug} icon={entry?.icon} />;
      })}
    </div>
  );
}

export default async function LocationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const loc = LOCATIONS[slug];
  if (!loc) return <PageWrap><p>Location not found.</p></PageWrap>;

  const pokemonHere = Object.values(POKEMON)
    .filter((p) => p.habitatList?.some((h) => h.locations.includes(slug)))
    .sort((a, b) => (a.nationalDexNum ?? 99999) - (b.nationalDexNum ?? 99999));

  const uniqueMaterials = [...new Set(loc.materials)];
  const uniquePlants = [...new Set(loc.blocksAndPlants)];

  return (
    <PageWrap>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Locations", item: `${SITE_URL}/locations` },
          { "@type": "ListItem", position: 3, name: loc.name, item: `${SITE_URL}/location/${slug}` },
        ],
      }} />
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Locations", href: "/locations" }, { label: loc.name }]} />
      <PageHeader title={loc.name}>
        {loc.description && <p className="text-[13px] text-ink-soft mb-4 leading-relaxed">{loc.description}</p>}
      </PageHeader>

      {(uniqueMaterials.length > 0 || uniquePlants.length > 0) && (
        <Card>
          {uniqueMaterials.length > 0 && (
            <CollapsibleSection title="Naturally occurring materials" count={`${uniqueMaterials.length}`}>
              <ItemGrid items={uniqueMaterials} />
            </CollapsibleSection>
          )}
          {uniquePlants.length > 0 && (
            <CollapsibleSection title="Naturally occurring plants & blocks" count={`${uniquePlants.length}`}>
              <ItemGrid items={uniquePlants} />
            </CollapsibleSection>
          )}
        </Card>
      )}

      {pokemonHere.length > 0 && (
        <Card>
          <div className="font-outfit font-extrabold text-xl tracking-[-0.01em] mb-2 flex items-center gap-2">
            Pokemon that appear here
            <span className="ml-auto font-mono text-[10px] font-semibold px-2 py-[3px] rounded-full tracking-[0.06em] bg-accent text-paper">{pokemonHere.length}</span>
          </div>
          <PokemonGrid className="mt-3">
            {pokemonHere.map((p) => (
              <PokemonGridCard key={p.slug} p={p} />
            ))}
          </PokemonGrid>
        </Card>
      )}
    </PageWrap>
  );
}
