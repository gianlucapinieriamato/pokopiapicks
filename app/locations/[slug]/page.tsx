import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Location, POKEMON_LIST } from "@/app/lib/const";
import type { ItemConst } from "@/app/lib/const";
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

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.values(Location).map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const loc = Object.values(Location).find((l) => l.slug === slug);
  if (!loc) return { title: "Not found" };
  const desc =
    `${loc.label} in Pokemon Pokopia — items, materials, shop items and Pokemon found in this location. ${loc.description ?? ""}`.trim();
  return {
    title: `${loc.label} — Items & Pokemon | Pokopia Picks`,
    description: desc.slice(0, 155),
    openGraph: {
      url: `${SITE_URL}/locations/${slug}/`,
    },
  };
}

function ItemGrid({ items }: { items: readonly ItemConst[] }) {
  const seen = new Set<string>();
  const unique = items.filter((i) => {
    if (seen.has(i.slug)) return false;
    seen.add(i.slug);
    return true;
  });
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-2 mt-3">
      {unique.map((item) => (
        <ItemTile key={item.slug} name={item.label} slug={item.slug} icon={item.icon ?? undefined} />
      ))}
    </div>
  );
}

export default async function LocationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const loc = Object.values(Location).find((l) => l.slug === slug);
  if (!loc) notFound();

  const pokemonHere = POKEMON_LIST.filter((p) =>
    p.habitatList.some((h) => h.locations.some((l) => l.slug === slug))
  ).sort((a, b) => (a.nationalDexNum ?? 99999) - (b.nationalDexNum ?? 99999));

  return (
    <PageWrap>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: "Locations", item: `${SITE_URL}/locations` },
            { "@type": "ListItem", position: 3, name: loc.label, item: `${SITE_URL}/locations/${slug}` },
          ],
        }}
      />
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Locations", href: "/locations" },
          { label: loc.label },
        ]}
      />
      <PageHeader title={loc.label}>
        {loc.description && (
          <p className="text-[13px] text-ink-soft mb-4 leading-relaxed">
            {loc.description}
          </p>
        )}
      </PageHeader>

      {(loc.materials.length > 0 || loc.blocksAndPlants.length > 0) && (
        <Card>
          {loc.materials.length > 0 && (
            <CollapsibleSection
              title="Materials found here"
              count={`${loc.materials.length}`}
              defaultOpen={true}
            >
              <ItemGrid items={loc.materials} />
            </CollapsibleSection>
          )}
          {loc.blocksAndPlants.length > 0 && (
            <CollapsibleSection
              title="Plants & blocks found here"
              count={`${loc.blocksAndPlants.length}`}
            >
              <ItemGrid items={loc.blocksAndPlants} />
            </CollapsibleSection>
          )}
        </Card>
      )}

      {(loc.itemsInArea.length > 0 || loc.itemsInPokeballs.length > 0 || loc.treasure.length > 0) && (
        <Card>
          {loc.itemsInArea.length > 0 && (
            <CollapsibleSection
              title="Items found in area"
              count={`${loc.itemsInArea.length}`}
            >
              <ItemGrid items={loc.itemsInArea} />
            </CollapsibleSection>
          )}
          {loc.itemsInPokeballs.length > 0 && (
            <CollapsibleSection
              title="Items in Pokeballs"
              count={`${loc.itemsInPokeballs.length}`}
            >
              <ItemGrid items={loc.itemsInPokeballs} />
            </CollapsibleSection>
          )}
          {loc.treasure.length > 0 && (
            <CollapsibleSection
              title="Treasure"
              count={`${loc.treasure.length}`}
            >
              <ItemGrid items={loc.treasure} />
            </CollapsibleSection>
          )}
        </Card>
      )}

      {loc.shopItems.length > 0 && (
        <Card>
          <CollapsibleSection title="Shop items" count={`${loc.shopItems.length}`}>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-2 mt-3">
              {loc.shopItems.map((s) => (
                <div key={s.item.slug} className="relative">
                  <ItemTile name={s.item.label} slug={s.item.slug} icon={s.item.icon ?? undefined} />
                  <span className="absolute top-1 right-1 font-mono text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-accent text-paper leading-none">
                    Lv.{s.level}
                  </span>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        </Card>
      )}

      {pokemonHere.length > 0 && (
        <Card>
          <div className="font-outfit font-extrabold text-xl tracking-[-0.01em] mb-2 flex items-center gap-2">
            Pokemon that appear here
            <span className="ml-auto font-mono text-[10px] font-semibold px-2 py-[3px] rounded-full tracking-[0.06em] bg-accent text-paper">
              {pokemonHere.length}
            </span>
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
