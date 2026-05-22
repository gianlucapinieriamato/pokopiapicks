import type { Metadata } from "next";
import { LOCATIONS, POKEMON } from "@/app/lib/data";
import PageWrap from "@/app/components/PageWrap";
import Breadcrumb from "@/app/components/Breadcrumb";
import Card from "@/app/components/Card";
import PageHeader from "@/app/components/PageHeader";
import SectionTitle from "@/app/components/SectionTitle";
import PokemonGridCard from "@/app/components/PokemonGridCard";

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
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-2 px-1 mt-3">
      {items.map((m) => (
        <div key={m} className="text-[13px] px-[10px] py-[6px] rounded-lg bg-paper border border-surface-2 text-ink flex items-center gap-2 min-h-[44px]">
          <div className="flex-1 min-w-0">{m}</div>
        </div>
      ))}
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

  return (
    <PageWrap>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Locations", href: "/locations" }, { label: loc.name }]} />
      <PageHeader title={loc.name}>
        {loc.description && <p className="text-[13px] text-ink-soft mb-4 leading-relaxed">{loc.description}</p>}
      </PageHeader>

      {loc.materials.length > 0 && (
        <Card>
          <SectionTitle>Naturally occurring materials</SectionTitle>
          <ItemGrid items={loc.materials} />
        </Card>
      )}

      {loc.blocksAndPlants.length > 0 && (
        <Card>
          <SectionTitle>Naturally occurring plants & blocks</SectionTitle>
          <ItemGrid items={loc.blocksAndPlants} />
        </Card>
      )}

      {pokemonHere.length > 0 && (
        <Card>
          <SectionTitle>Pokémon that appear here</SectionTitle>
          <div className="pkmn-grid mt-3">
            {pokemonHere.map((p) => (
              <PokemonGridCard key={p.slug} p={p} />
            ))}
          </div>
        </Card>
      )}
    </PageWrap>
  );
}
