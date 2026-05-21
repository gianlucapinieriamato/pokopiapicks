import Link from "next/link";
import type { Metadata } from "next";
import { LOCATIONS, POKEMON, pkmnIconUrl } from "@/app/lib/data";

export function generateStaticParams() {
  return Object.keys(LOCATIONS).map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const loc = LOCATIONS[params.slug];
  if (!loc) return { title: "Not found" };
  return { title: loc.name, description: loc.description };
}

export default function LocationPage({ params }: { params: { slug: string } }) {
  const loc = LOCATIONS[params.slug];
  if (!loc) return <div className="detail-wrap"><p>Location not found.</p></div>;

  const pokemonHere = Object.values(POKEMON)
    .filter((p) => p.habitatList?.some((h) => h.locations.includes(params.slug)))
    .sort((a, b) => a.num - b.num);

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
          <div className="cat-items" style={{ marginTop: 10 }}>
            {loc.materials.map((m) => (
              <div key={m} className="cat-item"><div className="cat-item-body"><div className="cat-item-name">{m}</div></div></div>
            ))}
          </div>
        </div>
      )}

      {loc.blocksAndPlants.length > 0 && (
        <div className="card">
          <div className="section-title">Naturally occurring plants & blocks</div>
          <div className="cat-items" style={{ marginTop: 10 }}>
            {loc.blocksAndPlants.map((b) => (
              <div key={b} className="cat-item"><div className="cat-item-body"><div className="cat-item-name">{b}</div></div></div>
            ))}
          </div>
        </div>
      )}

      {pokemonHere.length > 0 && (
        <div className="card">
          <div className="section-title">Pokémon that appear here</div>
          <div className="pkmn-grid" style={{ marginTop: 12 }}>
            {pokemonHere.map((p) => (
              <Link key={p.slug} href={`/pokemon/${p.slug}`} className="pkmn-grid-card">
                <div className="pkmn-grid-icon">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={pkmnIconUrl(p)} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "contain", imageRendering: "pixelated" }} />
                </div>
                <div className="pkmn-grid-num">#{String(p.num).padStart(3, "0")}</div>
                <div className="pkmn-grid-name">{p.name}</div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
