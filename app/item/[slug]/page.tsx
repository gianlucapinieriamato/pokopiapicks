import Link from "next/link";
import type { Metadata } from "next";
import { ITEMS, CATEGORIES, POKEMON, pkmnIconUrl, catDisplayName } from "@/app/lib/data";

export function generateStaticParams() {
  return Object.values(ITEMS).map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = Object.values(ITEMS).find((i) => i.slug === slug);
  if (!item) return { title: "Not found" };
  return { title: item.name, description: `${item.name} — appears in ${item.categories.length} favorite categories.` };
}

export default async function ItemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = Object.values(ITEMS).find((i) => i.slug === slug);
  if (!item) return <div className="detail-wrap"><p>Item not found.</p></div>;


  const pokemonWhoLike = Object.values(POKEMON)
    .filter((p) => {
      // categories in pokemon.json are display names; convert to slugs for comparison
      return item.categories.some((catSlug) => {
        const catDisplayName = CATEGORIES[catSlug]?.name ?? catSlug;
        return p.categories.includes(catDisplayName) || p.categories.includes(catSlug);
      });
    })
    .sort((a, b) => a.num - b.num);

  return (
    <div className="detail-wrap">
      <div className="breadcrumb">
        <Link href="/">Home</Link><span>›</span>
        <span>Items</span><span>›</span>
        <span>{item.name}</span>
      </div>
      <div className="detail-header">
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
          {item.icon && (
            <div style={{ width: 64, height: 64, background: "var(--bg-1)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", padding: 6 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.icon} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "contain", imageRendering: "pixelated" }} />
            </div>
          )}
          <div className="detail-title">{item.name}</div>
        </div>
      </div>

      <div className="card">
        <div className="section-title">Favorite categories</div>
        <div className="pkmn-cats" style={{ marginTop: 10, marginBottom: 16 }}>
          {item.categories.map((c) => (
            <Link key={c} href={`/category/${c}`} className="pkmn-cat-tag" style={{ textDecoration: "none" }}>{catDisplayName(c)}</Link>
          ))}
        </div>

        <div className="section-title">Pokémon that like this item</div>
        <div className="detail-meta" style={{ marginBottom: 12 }}>{pokemonWhoLike.length} Pokémon</div>
        {pokemonWhoLike.length > 0 && (
          <div className="pkmn-grid">
            {pokemonWhoLike.map((p) => (
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
        )}
      </div>
    </div>
  );
}
