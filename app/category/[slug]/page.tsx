import Link from "next/link";
import type { Metadata } from "next";
import { CATEGORIES, ITEMS, POKEMON, pkmnIconUrl, catName } from "@/app/lib/data";

export function generateStaticParams() {
  return Object.keys(CATEGORIES).map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const c = CATEGORIES[params.slug];
  if (!c) return { title: "Not found" };
  return { title: `${c.name} category`, description: `${c.items.length} items in the ${c.name} favorite category.` };
}

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const cat = CATEGORIES[params.slug];
  if (!cat) return <div className="detail-wrap"><p>Category not found.</p></div>;

  const pokemonWhoLike = Object.values(POKEMON)
    .filter((p) => p.categories.includes(params.slug))
    .sort((a, b) => a.num - b.num);

  return (
    <div className="detail-wrap">
      <div className="breadcrumb">
        <Link href="/">Home</Link><span>›</span>
        <span>Categories</span><span>›</span>
        <span>{cat.name}</span>
      </div>
      <div className="detail-header">
        <div className="detail-title">{cat.name}</div>
        <div className="detail-meta">{cat.items.length} items · {pokemonWhoLike.length} Pokémon</div>
      </div>

      <div className="card">
        <div className="section-title">Items in this category</div>
        <div className="cat-items" style={{ marginTop: 12 }}>
          {cat.items.map((itemName) => {
            const item = ITEMS[itemName];
            return (
              <Link key={itemName} href={`/item/${item?.slug ?? encodeURIComponent(itemName)}`} style={{ textDecoration: "none" }}>
                <div className="cat-item">
                  <div className="cat-item-icon">
                    {item?.icon && <img src={item.icon} alt={itemName} style={{ width: "100%", height: "100%", objectFit: "contain", imageRendering: "pixelated" }} />}
                  </div>
                  <div className="cat-item-body">
                    <div className="cat-item-name">{itemName}</div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {pokemonWhoLike.length > 0 && (
        <div className="card">
          <div className="section-title">Pokémon that like this category</div>
          <div className="pkmn-grid" style={{ marginTop: 12 }}>
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
        </div>
      )}
    </div>
  );
}
