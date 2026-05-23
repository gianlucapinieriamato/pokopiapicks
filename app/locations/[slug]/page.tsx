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
import { existsSync } from "fs";
import { join } from "path";

export function generateStaticParams() {
  return Object.keys(LOCATIONS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const loc = LOCATIONS[slug];
  if (!loc) return { title: "Not found" };
  return {
    title: `${loc.name} — Location`,
    description: `${loc.name} in Pokemon Pokopia — items, materials, shop items and Pokemon found in this location. ${loc.description ? loc.description.slice(0, 100) : ""}`.trim(),
  };
}

// Scraped names that differ from canonical ITEMS keys or correct display names
const NAME_FIXES: Record<string, string> = {
  "Beautiful flower seeds": "Beautiful flower",
  "Elegant flower seed": "Elegant flower",
  "Wooden chair": "Wooden stool",
  "Grubby rag": "Grubby rags",
  "Speakers": "Speaker",
  "Public chair": "Public Seat",
};

// Items whose icon filename on Serebii differs from the name-derived path
const ICON_OVERRIDES: Record<string, string> = {
  "Pecha tree seed": "/icons/items/pechaseeds.png",
  "Public chair": "/icons/items/publicseat.png",
  "Speakers": "/icons/items/speaker.png",
  "PP Up": "/icons/items/ppup.png",
};

function resolveItem(name: string): { icon: string | null; slug: string | undefined; displayName: string } {
  const displayName = NAME_FIXES[name] ?? name;
  if (ICON_OVERRIDES[name]) return { icon: ICON_OVERRIDES[name], slug: undefined, displayName };

  const canonical = NAME_FIXES[name] ?? name;
  const entry = ITEMS[canonical] ?? ITEMS[name];
  if (entry) return { icon: entry.icon, slug: entry.slug, displayName };

  const baseName = name.endsWith(" Recipe") ? name.slice(0, -7) : name;
  const baseEntry = ITEMS[baseName];
  if (baseEntry) return { icon: baseEntry.icon, slug: baseEntry.slug, displayName };

  const derivedPath = `/icons/items/${baseName.toLowerCase().replace(/\s+/g, "")}.png`;
  if (existsSync(join(process.cwd(), "public", derivedPath))) return { icon: derivedPath, slug: undefined, displayName };

  return { icon: null, slug: undefined, displayName };
}

function ItemGrid({ items }: { items: string[] }) {
  const unique = [...new Set(items)];
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-2 mt-3">
      {unique.map((name) => {
        const { icon, slug, displayName } = resolveItem(name);
        return <ItemTile key={name} name={displayName} slug={slug} icon={icon} />;
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
  const uniqueItemsInArea = [...new Set(loc.itemsInArea ?? [])];
  const uniqueItemsInPokeballs = [...new Set(loc.itemsInPokeballs ?? [])];
  const uniqueTreasure = [...new Set(loc.treasure ?? [])];
  const shopItems = loc.shopItems ?? [];

  return (
    <PageWrap>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Locations", item: `${SITE_URL}/locations` },
          { "@type": "ListItem", position: 3, name: loc.name, item: `${SITE_URL}/locations/${slug}` },
        ],
      }} />
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Locations", href: "/locations" }, { label: loc.name }]} />
      <PageHeader title={loc.name}>
        {loc.description && <p className="text-[13px] text-ink-soft mb-4 leading-relaxed">{loc.description}</p>}
      </PageHeader>

      {(uniqueMaterials.length > 0 || uniquePlants.length > 0) && (
        <Card>
          {uniqueMaterials.length > 0 && (
            <CollapsibleSection title="Materials found here" count={`${uniqueMaterials.length}`}>
              <ItemGrid items={uniqueMaterials} />
            </CollapsibleSection>
          )}
          {uniquePlants.length > 0 && (
            <CollapsibleSection title="Plants & blocks found here" count={`${uniquePlants.length}`}>
              <ItemGrid items={uniquePlants} />
            </CollapsibleSection>
          )}
        </Card>
      )}

      {(uniqueItemsInArea.length > 0 || uniqueItemsInPokeballs.length > 0 || uniqueTreasure.length > 0) && (
        <Card>
          {uniqueItemsInArea.length > 0 && (
            <CollapsibleSection title="Items found in area" count={`${uniqueItemsInArea.length}`}>
              <ItemGrid items={uniqueItemsInArea} />
            </CollapsibleSection>
          )}
          {uniqueItemsInPokeballs.length > 0 && (
            <CollapsibleSection title="Items in Pokeballs" count={`${uniqueItemsInPokeballs.length}`}>
              <ItemGrid items={uniqueItemsInPokeballs} />
            </CollapsibleSection>
          )}
          {uniqueTreasure.length > 0 && (
            <CollapsibleSection title="Treasure" count={`${uniqueTreasure.length}`}>
              <ItemGrid items={uniqueTreasure} />
            </CollapsibleSection>
          )}
        </Card>
      )}

      {shopItems.length > 0 && (
        <Card>
          <CollapsibleSection title="Shop items" count={`${shopItems.length}`}>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-2 mt-3">
              {shopItems.map((s) => {
                const { icon, slug, displayName } = resolveItem(s.name);
                return (
                  <div key={s.name} className="relative">
                    <ItemTile name={displayName} slug={slug} icon={icon} />
                    <span className="absolute top-1 right-1 font-mono text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-accent text-paper leading-none">Lv.{s.level}</span>
                  </div>
                );
              })}
            </div>
          </CollapsibleSection>
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
