import Link from "next/link";
import type { Metadata } from "next";
import { SPECIALTIES, POKEMON, pkmnIconUrl } from "@/app/lib/data";

export function generateStaticParams() {
  return Object.keys(SPECIALTIES).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const s = SPECIALTIES[slug];
  if (!s) return { title: "Not found" };
  return { title: `${s.name} specialty`, description: s.description };
}

export default async function SpecialtyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = SPECIALTIES[slug];
  if (!s) return <div className="detail-wrap"><p>Specialty not found.</p></div>;

  const pokemonWith = s.pokemon
    .map((pSlug) => POKEMON[pSlug])
    .filter(Boolean)
    .sort((a, b) => a!.num - b!.num) as NonNullable<typeof POKEMON[string]>[];

  return (
    <div className="detail-wrap">
      <div className="breadcrumb">
        <Link href="/">Home</Link><span>›</span>
        <span>Specialties</span><span>›</span>
        <span>{s.name}</span>
      </div>
      <div className="detail-header">
        <div className="detail-title">{s.name}</div>
        {s.description && <p className="section-sub">{s.description}</p>}
        <div className="detail-meta">{pokemonWith.length} Pokémon</div>
      </div>
      <div className="card">
        {pokemonWith.length > 0 ? (
          <div className="pkmn-grid">
            {pokemonWith.map((p) => (
              <Link key={p.slug} href={`/pokemon/${p.slug}`} className="pkmn-grid-card">
                <div className="pkmn-grid-icon">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={pkmnIconUrl(p)} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "contain", imageRendering: "pixelated" }} />
                </div>
                <div className="pkmn-grid-num">#{p.nationalDexNum ?? p.num}</div>
                <div className="pkmn-grid-name">{p.name}</div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="detail-meta">No Pokémon data for this specialty yet.</p>
        )}
      </div>
    </div>
  );
}
