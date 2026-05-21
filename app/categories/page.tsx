import Link from "next/link";
import { CATEGORIES, POKEMON } from "@/app/lib/data";

const ALL_CATS = Object.values(CATEGORIES).sort((a, b) => a.name.localeCompare(b.name));

// Pre-compute Pokémon count per category
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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8 }}>
          {ALL_CATS.map((cat) => (
            <Link key={cat.slug} href={`/category/${cat.slug}`} style={{ textDecoration: "none" }}>
              <div style={{
                padding: "12px 14px",
                borderRadius: 8,
                border: "1px solid var(--paper-edge)",
                background: "var(--bg-1)",
                transition: "background 0.1s",
                cursor: "pointer",
              }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-2)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "var(--bg-1)")}
              >
                <div style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 700,
                  fontSize: 14,
                  color: "var(--ink)",
                  marginBottom: 4,
                }}>{cat.name}</div>
                <div style={{
                  fontFamily: "'JetBrains Mono', 'DM Mono', monospace",
                  fontSize: 10,
                  color: "var(--ink-fade)",
                  letterSpacing: "0.04em",
                }}>
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
