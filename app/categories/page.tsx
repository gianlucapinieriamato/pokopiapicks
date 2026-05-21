"use client";
import Link from "next/link";
import { CATEGORIES, POKEMON } from "@/app/lib/data";
import { useLang } from "@/app/lib/lang";

const ALL_CATS = Object.values(CATEGORIES).sort((a, b) => a.name.localeCompare(b.name));

const pkmnCountByCat: Record<string, number> = {};
for (const p of Object.values(POKEMON)) {
  for (const cat of p.categories) {
    const slug = cat.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    pkmnCountByCat[slug] = (pkmnCountByCat[slug] ?? 0) + 1;
  }
}

const STRINGS = {
  en: { title: "Gift Categories", items: "items", pokemon: "Pokémon" },
  es: { title: "Categorías de regalos", items: "objetos", pokemon: "Pokémon" },
} as const;

export default function CategoriesPage() {
  const lang = useLang();
  const t = STRINGS[lang];

  return (
    <div className="detail-wrap">
      <div className="breadcrumb">
        <Link href="/">Home</Link><span>›</span><span>{t.title}</span>
      </div>
      <div className="detail-header">
        <div className="detail-title">{t.title}</div>
        <div className="detail-meta">{ALL_CATS.length}</div>
      </div>

      <div className="card">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-2">
          {ALL_CATS.map((cat) => (
            <Link key={cat.slug} href={`/category/${cat.slug}`} className="no-underline">
              <div className="hover-tile py-3 px-3.5">
                <div className="font-outfit font-bold text-sm text-ink mb-1">{cat.name}</div>
                <div className="font-mono text-[10px] text-ink-fade tracking-[0.04em]">
                  {cat.items.length} {t.items} · {pkmnCountByCat[cat.slug] ?? 0} {t.pokemon}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
