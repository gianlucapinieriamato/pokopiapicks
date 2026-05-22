import Link from "next/link";
import type { Metadata } from "next";
import { ITEMS, CATEGORIES, POKEMON, pkmnIconUrl, dexNum, catDisplayName } from "@/app/lib/data";

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
      return item.categories.some((catSlug) => {
        const catDisplay = CATEGORIES[catSlug]?.name ?? catSlug;
        return p.categories.includes(catDisplay) || p.categories.includes(catSlug);
      });
    })
    .sort((a, b) => (a.nationalDexNum ?? 99999) - (b.nationalDexNum ?? 99999));

  return (
    <div className="detail-wrap">
      <div className="breadcrumb">
        <Link href="/">Home</Link><span>›</span>
        <span>Items</span><span>›</span>
        <span>{item.name}</span>
      </div>
      <div className="detail-header">
        <div className="flex items-center gap-4 mb-2">
          {item.icon && (
            <div className="w-16 h-16 bg-surface-1 rounded-[10px] flex items-center justify-center p-[6px] shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.icon} alt={item.name} className="w-full h-full object-contain [image-rendering:pixelated]" />
            </div>
          )}
          <div className="detail-title">{item.name}</div>
        </div>
      </div>

      <div className="card">
        <div className="section-title">Favorite categories</div>
        <div className="flex flex-wrap gap-2 mt-2 mb-4">
          {item.categories.map((c) => (
            <Link key={c} href={`/category/${c}`} className="pkmn-cat-tag no-underline">{catDisplayName(c)}</Link>
          ))}
        </div>

        <div className="section-title">Pokémon that like this item</div>
        <div className="detail-meta mb-3">{pokemonWhoLike.length} Pokémon</div>
        {pokemonWhoLike.length > 0 && (
          <div className="pkmn-grid">
            {pokemonWhoLike.map((p) => (
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
        )}
      </div>
    </div>
  );
}
