import Link from "next/link";
import { CATEGORIES, POKEMON } from "@/app/lib/data";

const ALL_CATS = Object.values(CATEGORIES).sort((a, b) => a.name.localeCompare(b.name));

const pkmnCountByCat: Record<string, number> = {};
for (const p of Object.values(POKEMON)) {
  for (const cat of p.categories) {
    const slug = cat.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    pkmnCountByCat[slug] = (pkmnCountByCat[slug] ?? 0) + 1;
  }
}

export default function CategoriesPage() {
  return (
    <div className="detail-wrap">
      <div className="breadcrumb">
        <Link href="/">Home</Link><span>›</span><span>Categories</span>
      </div>
      <div className="detail-header">
        <div className="detail-title">Gift Categories</div>
        <div className="detail-meta">{ALL_CATS.length} categories</div>
      </div>

      <div className="card">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-2">
          {ALL_CATS.map((cat) => (
            <Link key={cat.slug} href={`/category/${cat.slug}`} className="no-underline">
              <div className="hover-tile py-3 px-3.5">
                <div className="font-outfit font-bold text-sm text-ink mb-1">{cat.name}</div>
                <div className="font-mono text-[10px] text-ink-fade tracking-[0.04em]">
                  {cat.items.length} items · {pkmnCountByCat[cat.slug] ?? 0} Pokémon
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
