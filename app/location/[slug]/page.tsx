import Link from "next/link";
import type { Metadata } from "next";
import { LOCATIONS, POKEMON, pkmnIconUrl, dexNum } from "@/app/lib/data";

export function generateStaticParams() {
  return Object.keys(LOCATIONS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const loc = LOCATIONS[slug];
  if (!loc) return { title: "Not found" };
  return { title: loc.name, description: loc.description };
}

export default async function LocationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const loc = LOCATIONS[slug];
  if (!loc) return <div className="detail-wrap"><p>Location not found.</p></div>;

  const pokemonHere = Object.values(POKEMON)
    .filter((p) => p.habitatList?.some((h) => h.locations.includes(slug)))
    .sort((a, b) => (a.nationalDexNum ?? 99999) - (b.nationalDexNum ?? 99999));

  const ItemGrid = ({ items }: { items: string[] }) => (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-2 px-1 mt-3">
      {items.map((m) => (
        <div key={m} className="text-[13px] px-[10px] py-[6px] rounded-lg bg-paper border border-surface-2 text-ink flex items-center gap-2 min-h-[44px]">
          <div className="flex-1 min-w-0">{m}</div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="detail-wrap">
      <div className="breadcrumb">
        <Link href="/">Home</Link><span>›</span>
        <span>Locations</span><span>›</span>
        <span>{loc.name}</span>
      </div>
      <div className="detail-header">
        <div className="detail-title">{loc.name}</div>
        {loc.description && <p className="section-sub">{loc.description}</p>}
      </div>

      {loc.materials.length > 0 && (
        <div className="card">
          <div className="section-title">Naturally occurring materials</div>
          <ItemGrid items={loc.materials} />
        </div>
      )}

      {loc.blocksAndPlants.length > 0 && (
        <div className="card">
          <div className="section-title">Naturally occurring plants & blocks</div>
          <ItemGrid items={loc.blocksAndPlants} />
        </div>
      )}

      {pokemonHere.length > 0 && (
        <div className="card">
          <div className="section-title">Pokémon that appear here</div>
          <div className="pkmn-grid mt-3">
            {pokemonHere.map((p) => (
              <Link key={p.slug} href={`/pokemon/${p.slug}`} className="pkmn-grid-card">
                <div className="pkmn-grid-icon">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={pkmnIconUrl(p)} alt={p.name} className="w-full h-full object-contain [image-rendering:pixelated]" />
                </div>
                <div className="pkmn-grid-num">#{dexNum(p)}</div>
                <div className="pkmn-grid-name">{p.name}</div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
