import Link from "next/link";
import type { Metadata } from "next";
import { HABITATS, POKEMON, pkmnIconUrl, dexNum } from "@/app/lib/data";

export function generateStaticParams() {
  return Object.keys(HABITATS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const h = HABITATS[slug];
  if (!h) return { title: "Not found" };
  return { title: h.name, description: h.description };
}

export default async function HabitatPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const h = HABITATS[slug];
  if (!h) return <div className="detail-wrap"><p>Habitat not found.</p></div>;

  const pokemonHere = h.pokemon
    .map((s) => POKEMON[s])
    .filter(Boolean)
    .sort((a, b) => (a!.nationalDexNum ?? 99999) - (b!.nationalDexNum ?? 99999)) as NonNullable<typeof POKEMON[string]>[];

  return (
    <div className="detail-wrap">
      <div className="breadcrumb">
        <Link href="/">Home</Link><span>›</span>
        <span>Habitats</span><span>›</span>
        <span>{h.name}</span>
      </div>
      <div className="detail-header">
        <div className="detail-title">{h.name}</div>
        {h.description && <p className="section-sub">{h.description}</p>}
        <div className="detail-meta">{pokemonHere.length} Pokémon spawn here</div>
      </div>
      {pokemonHere.length > 0 ? (
        <div className="card">
          <div className="pkmn-grid">
            {pokemonHere.map((p) => (
              <Link key={p.slug} href={`/pokemon/${p.slug}`} className="pkmn-grid-card">
                <div className="pkmn-grid-icon">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={pkmnIconUrl(p)} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "contain", imageRendering: "pixelated" }} />
                </div>
                <div className="pkmn-grid-num">#{dexNum(p)}</div>
                <div className="pkmn-grid-name">{p.name}</div>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="card"><p className="detail-meta">No Pokémon data for this habitat yet.</p></div>
      )}
    </div>
  );
}
