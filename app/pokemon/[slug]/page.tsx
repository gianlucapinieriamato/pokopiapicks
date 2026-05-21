import Link from "next/link";
import type { Metadata } from "next";
import { POKEMON, POKEMON_LIST, CATEGORIES, ITEMS, SPECIALTIES, HABITATS, LOCATIONS, pkmnIconUrl, catName } from "@/app/lib/data";
import ArrowKeyNav from "@/app/components/ArrowKeyNav";

export function generateStaticParams() {
  return Object.keys(POKEMON).map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const p = POKEMON[params.slug];
  if (!p) return { title: "Not found" };
  return {
    title: `${p.name} (#${String(p.num).padStart(3, "0")})`,
    description: `${p.name} — ${p.habitat} habitat, ${p.categories.length} favorite categories, ${p.specialties?.length ?? 0} specialties.`,
  };
}

export default function PokemonPage({ params }: { params: { slug: string } }) {
  const p = POKEMON[params.slug];
  if (!p) return <div className="detail-wrap"><p>Pokémon not found.</p></div>;

  const idx = POKEMON_LIST.findIndex((q) => q.slug === params.slug);
  const prev = idx > 0 ? POKEMON_LIST[idx - 1] : null;
  const next = idx < POKEMON_LIST.length - 1 ? POKEMON_LIST[idx + 1] : null;

  // item → categories map
  const itemToCats: Record<string, string[]> = {};
  for (const catSlug of p.categories) {
    for (const item of CATEGORIES[catSlug]?.items ?? []) {
      if (!itemToCats[item]) itemToCats[item] = [];
      itemToCats[item].push(catSlug);
    }
  }
  const allItems = Object.entries(itemToCats);
  const sharedItems = allItems
    .filter(([, cats]) => cats.length >= 2)
    .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));

  return (
    <div className="detail-wrap">
      <ArrowKeyNav prevSlug={prev?.slug ?? null} nextSlug={next?.slug ?? null} />
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link href="/">Home</Link>
        <span>›</span>
        <Link href="/pokedex">Pokédex</Link>
        <span>›</span>
        <span>{p.name}</span>
      </div>

      {/* Prev / Next navigation */}
      <div className="pkmn-nav">
        {prev ? (
          <Link href={`/pokemon/${prev.slug}`} className="pkmn-nav-btn">
            ◀ #{String(prev.num).padStart(3, "0")} {prev.name}
          </Link>
        ) : <span />}
        {next ? (
          <Link href={`/pokemon/${next.slug}`} className="pkmn-nav-btn">
            {next.name} #{String(next.num).padStart(3, "0")} ▶
          </Link>
        ) : <span />}
      </div>

      {/* Pokémon header */}
      <div className="card">
        <div className="pkmn-head">
          <div className="pkmn-portrait">
            {p.spriteHq ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.spriteHq} alt={p.name} className="w-full h-full object-contain" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={pkmnIconUrl(p)} alt={p.name} className="w-full h-full object-contain" style={{ imageRendering: "pixelated" }} />
            )}
          </div>
          <div className="pkmn-info">
            <div className="pkmn-num">N.º {String(p.num).padStart(3, "0")} · #{p.nationalDexNum ?? "?"} National</div>
            <div className="pkmn-name">{p.name}</div>
            <div className="pkmn-meta">
              Ideal habitat: <span className="habitat-tag">{p.habitat}</span>
              {p.flavor && <> · Flavor: <span style={{ color: "var(--leaf)" }}>{p.flavor}</span></>}
            </div>
            {/* Specialties */}
            {p.specialties && p.specialties.length > 0 && (
              <div className="pkmn-cats" style={{ marginTop: 8 }}>
                {p.specialties.map((s) => (
                  <Link key={s} href={`/specialty/${s}`} className="pkmn-cat-tag" style={{ textDecoration: "none", color: "var(--accent)" }}>
                    {SPECIALTIES[s]?.name ?? s}
                  </Link>
                ))}
              </div>
            )}
            {/* Favorite categories */}
            <div className="pkmn-cats">
              {p.categories.map((c) => (
                <Link key={c} href={`/category/${c}`} className="pkmn-cat-tag" style={{ textDecoration: "none" }}>
                  {catName(c)}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="summary-strip">
          <div className="stat-box"><div className="stat-num">{allItems.length}</div><div className="stat-label">items total</div></div>
          <div className="stat-box"><div className="stat-num">{sharedItems.length}</div><div className="stat-label">in 2+ categories</div></div>
          <div className="stat-box"><div className="stat-num">{p.categories.length}</div><div className="stat-label">categories</div></div>
        </div>

        {/* Best gifts */}
        {sharedItems.length > 0 && (
          <>
            <div className="section-title">Best gifts <span className="pill">TOP GIFTS</span></div>
            <p className="section-sub">These items appear in multiple categories — they count double (or more).</p>
            <div className="best-grid">
              {sharedItems.map(([item, cats]) => {
                const isElite = cats.length >= 3;
                return (
                  <Link key={item} href={`/item/${ITEMS[item]?.slug ?? encodeURIComponent(item)}`} style={{ textDecoration: "none" }}>
                    <div className={`best-item${isElite ? " elite" : ""}`}>
                      <div className="best-item-badge">{cats.length}× categories</div>
                      <div className="best-item-icon">
                        {ITEMS[item]?.icon && <img src={ITEMS[item].icon!} alt={item} style={{ width: "100%", height: "100%", objectFit: "contain", imageRendering: "pixelated" }} />}
                      </div>
                      <div className="best-item-body">
                        <div className="best-item-name">{item}</div>
                        <div className="best-item-cats">{cats.map((c) => catName(c)).join(" · ")}</div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}

        {/* All items by category */}
        <div className="section-title">All, by category</div>
        <p className="section-sub">Items marked with ★ appear in more than one of this Pokémon&apos;s liked categories.</p>
        {p.categories.map((catSlug) => {
          const items = CATEGORIES[catSlug]?.items ?? [];
          return (
            <div key={catSlug} className="cat-block">
              <div className="cat-head">
                <Link href={`/category/${catSlug}`} className="cat-name" style={{ textDecoration: "none", color: "inherit" }}>{catName(catSlug)}</Link>
                <span className="cat-count">{items.length} items</span>
              </div>
              <div className="cat-items">
                {items.map((item) => {
                  const cats = itemToCats[item] ?? [];
                  const isShared = cats.length >= 2;
                  const otherCats = cats.filter((c) => c !== catSlug);
                  return (
                    <Link key={item} href={`/item/${ITEMS[item]?.slug ?? encodeURIComponent(item)}`} style={{ textDecoration: "none" }}>
                      <div className={`cat-item${isShared ? " shared" : ""}`}>
                        <div className="cat-item-icon">
                          {ITEMS[item]?.icon && <img src={ITEMS[item].icon!} alt={item} style={{ width: "100%", height: "100%", objectFit: "contain", imageRendering: "pixelated" }} />}
                        </div>
                        <div className="cat-item-body">
                          <div className="cat-item-name">{item}</div>
                          {isShared && <div className="cat-item-cats">+ {otherCats.map((c) => catName(c)).join(", ")}</div>}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Habitat list */}
        {p.habitatList && p.habitatList.length > 0 && (
          <>
            <div className="section-title" style={{ marginTop: 24 }}>Where to find</div>
            {p.habitatList.map((entry, i) => (
              <div key={i} className="cat-block">
                <div className="cat-head">
                  <Link href={`/habitat/${entry.habitatSlug}`} className="cat-name" style={{ textDecoration: "none", color: "inherit" }}>
                    {HABITATS[entry.habitatSlug]?.name ?? entry.habitatSlug}
                  </Link>
                  {entry.rarity && <span className="cat-count">{entry.rarity}</span>}
                </div>
                <div style={{ padding: "0 4px 8px", fontSize: 12, fontFamily: "'DM Mono', monospace", color: "var(--ink-soft)" }}>
                  {entry.locations.length > 0 && (
                    <span>
                      {entry.locations.map((loc, j) => (
                        <span key={loc}>
                          {j > 0 && " · "}
                          <Link href={`/location/${loc}`} style={{ color: "var(--leaf)", textDecoration: "none" }}>
                            {LOCATIONS[loc]?.name ?? loc}
                          </Link>
                        </span>
                      ))}
                    </span>
                  )}
                  {entry.time && <span style={{ marginLeft: 12 }}>🕐 {entry.time.join(", ")}</span>}
                  {entry.weather && <span style={{ marginLeft: 12 }}>☁ {entry.weather.join(", ")}</span>}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
