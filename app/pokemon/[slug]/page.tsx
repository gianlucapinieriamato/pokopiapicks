import Link from "next/link";
import type { Metadata } from "next";
import { POKEMON, POKEMON_LIST, CATEGORIES, ITEMS, SPECIALTIES, HABITATS, LOCATIONS, pkmnIconUrl, dexNum, getCatItems, catDisplayName, catSlug as toCatSlug } from "@/app/lib/data";
import CollapsibleSection from "@/app/components/CollapsibleSection";
import GoesWellWith from "@/app/components/GoesWellWith";
import ArrowKeyNav from "@/app/components/ArrowKeyNav";
import TcgCard from "@/app/components/TcgCard";

export function generateStaticParams() {
  return Object.keys(POKEMON).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = POKEMON[slug];
  if (!p) return { title: "Not found" };
  return {
    title: `${p.name} (#${dexNum(p)})`,
    description: `${p.name} — ${p.habitat} habitat, ${p.categories.length} favorite categories.`,
  };
}


export default async function PokemonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = POKEMON[slug];
  if (!p) return <div className="detail-wrap"><p>Pokémon not found.</p></div>;

  const idx = POKEMON_LIST.findIndex((q) => q.slug === slug);
  const prev = idx > 0 ? POKEMON_LIST[idx - 1] : null;
  const next = idx < POKEMON_LIST.length - 1 ? POKEMON_LIST[idx + 1] : null;

  // item → categories map
  const itemToCats: Record<string, string[]> = {};
  for (const catRef of p.categories) {
    for (const item of getCatItems(catRef)) {
      if (!itemToCats[item]) itemToCats[item] = [];
      itemToCats[item].push(catRef);
    }
  }
  const allItems = Object.entries(itemToCats);
  const sharedItems = allItems
    .filter(([, cats]) => cats.length >= 2)
    .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));

  // Category slug for linking
  const catSlug = (catRef: string) => {
    if (CATEGORIES[catRef]) return catRef;
    return catRef.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  };

  return (
    <div className="detail-wrap">
      <ArrowKeyNav prevSlug={prev?.slug ?? null} nextSlug={next?.slug ?? null} />
      <div className="breadcrumb">
        <Link href="/">Home</Link><span>›</span>
        <Link href="/pokedex">Pokédex</Link><span>›</span>
        <span>{p.name}</span>
      </div>

      <div className="pkmn-nav">
        {prev ? (
          <Link href={`/pokemon/${prev.slug}`} className="pkmn-nav-btn" title="Previous Pokémon (← key)">◀ #{dexNum(prev)} {prev.name}</Link>
        ) : <span />}
        {next ? (
          <Link href={`/pokemon/${next.slug}`} className="pkmn-nav-btn" title="Next Pokémon (→ key)">{next.name} #{dexNum(next)} ▶</Link>
        ) : <span />}
      </div>

      <div className="pkmn-head">
        {/* TCG card hero — standalone, not nested inside a card */}
        <div style={{ flexShrink: 0 }}>
          <TcgCard p={{ ...p, slug }} size="md" giftCount={sharedItems.length > 0 ? sharedItems.length : null} />
        </div>
        <div className="pkmn-info">
          <div className="pkmn-num">#{dexNum(p)}</div>
          <div className="pkmn-name">{p.name}</div>
          <div className="pkmn-meta">
            Ideal habitat: <span className="habitat-tag">{p.habitat}</span>
            {p.flavor && <> · Flavor: <span style={{ color: "var(--accent2)" }}>{p.flavor}</span></>}
          </div>
          <p className="detail-meta" style={{ fontSize: 11, marginTop: 4 }}>
            Same habitat = can share a room in Pokopia.
          </p>
          {p.specialties && p.specialties.length > 0 && (
            <div className="pkmn-cats" style={{ marginTop: 8 }}>
              {p.specialties.map((s) => (
                <Link key={s} href={`/specialty/${s}`} className="pkmn-cat-tag" style={{ textDecoration: "none", color: "var(--accent-deep)", borderColor: "var(--accent)" }}>
                  {SPECIALTIES[s]?.name ?? s}
                </Link>
              ))}
            </div>
          )}
          <div className="pkmn-cats">
            {p.categories.map((c) => (
              <Link key={c} href={`/category/${toCatSlug(c)}`} className="pkmn-cat-tag" style={{ textDecoration: "none" }}>
                {catDisplayName(c)}
              </Link>
            ))}
          </div>
          <p className="detail-meta" style={{ marginTop: 8, fontSize: 11, fontStyle: "italic" }}>
            Gift items in each category below will earn extra happiness with {p.name}.
          </p>
        </div>
      </div>

      <div className="card">
        <div className="summary-strip">
          <div className="stat-box"><div className="stat-num">{allItems.length}</div><div className="stat-label">items total</div></div>
          <div className="stat-box"><div className="stat-num">{sharedItems.length}</div><div className="stat-label">in 2+ categories</div></div>
          <div className="stat-box"><div className="stat-num">{p.categories.length}</div><div className="stat-label">categories</div></div>
        </div>

        {sharedItems.length > 0 && (
          <>
            <div className="section-title">Best gifts <span className="pill">TOP GIFTS</span></div>
            <p className="section-sub">These items appear in multiple categories — they count double (or more).</p>
            <div className="best-grid">
              {sharedItems.map(([item, cats]) => {
                const isElite = cats.length >= 3;
                const itemEntry = ITEMS[item];
                return (
                  <Link key={item} href={`/item/${itemEntry?.slug ?? item.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} style={{ textDecoration: "none" }}>
                    <div className={`best-item${isElite ? " elite" : ""}`}>
                      <div className="best-item-badge">{cats.length}× categories</div>
                      <div className="best-item-icon">
                        {itemEntry?.icon && <img src={itemEntry.icon} alt={item} style={{ width: "100%", height: "100%", objectFit: "contain", imageRendering: "pixelated" }} />}
                      </div>
                      <div className="best-item-body">
                        <div className="best-item-name">{item}</div>
                        <div className="best-item-cats">{cats.map((c) => catDisplayName(c)).join(" · ")}</div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}

        <div className="section-title">All, by category</div>
        <p className="section-sub">Items marked with ★ appear in more than one of this Pokémon&apos;s liked categories. Click a category name to collapse it.</p>
        {p.categories.map((catRef) => {
          const items = getCatItems(catRef);
          return (
            <CollapsibleSection key={catRef} title={catDisplayName(catRef)} count={`${items.length} items`} defaultOpen={true}>
              <div className="cat-items">
                {items.map((item) => {
                  const cats = itemToCats[item] ?? [];
                  const isShared = cats.length >= 2;
                  const otherCats = cats.filter((c) => c !== catRef);
                  const itemEntry = ITEMS[item];
                  return (
                    <Link key={item} href={`/item/${itemEntry?.slug ?? item.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} style={{ textDecoration: "none" }}>
                      <div className={`cat-item${isShared ? " shared" : ""}`}>
                        <div className="cat-item-icon">
                          {itemEntry?.icon && <img src={itemEntry.icon} alt={item} style={{ width: "100%", height: "100%", objectFit: "contain", imageRendering: "pixelated" }} />}
                        </div>
                        <div className="cat-item-body">
                          <div className="cat-item-name">{item}</div>
                          {isShared && <div className="cat-item-cats">+ {otherCats.map((c) => catDisplayName(c)).join(", ")}</div>}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </CollapsibleSection>
          );
        })}

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
                <div style={{ padding: "0 4px 8px", fontSize: 12, fontFamily: "'JetBrains Mono', 'DM Mono', monospace", color: "var(--ink-soft)" }}>
                  {entry.locations.map((loc, j) => (
                    <span key={loc}>
                      {j > 0 && " · "}
                      <Link href={`/location/${loc}`} style={{ color: "var(--accent2)", textDecoration: "none" }}>
                        {LOCATIONS[loc]?.name ?? loc}
                      </Link>
                    </span>
                  ))}
                  {entry.time && <span style={{ marginLeft: 12 }}>🕐 {entry.time.join(", ")}</span>}
                  {entry.weather && <span style={{ marginLeft: 12 }}>☁ {entry.weather.join(", ")}</span>}
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      <GoesWellWith slug={slug} habitat={p.habitat} />
    </div>
  );
}
