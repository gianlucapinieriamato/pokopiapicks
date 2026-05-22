import Link from "next/link";
import type { Metadata } from "next";
import { POKEMON, POKEMON_LIST, CATEGORIES, ITEMS, SPECIALTIES, HABITATS, LOCATIONS, pkmnIconUrl, dexNum, getCatItems, catDisplayName, catSlug as toCatSlug } from "@/app/lib/data";
import CollapsibleSection from "@/app/components/CollapsibleSection";
import GoesWellWith from "@/app/components/GoesWellWith";
import ArrowKeyNav from "@/app/components/ArrowKeyNav";
import TcgCard from "@/app/components/TcgCard";
import StatBox from "@/app/components/StatBox";
import BestGiftItem from "@/app/components/BestGiftItem";
import NavBtn from "@/app/components/NavBtn";
import PageWrap from "@/app/components/PageWrap";
import Breadcrumb from "@/app/components/Breadcrumb";
import Card from "@/app/components/Card";
import SectionTitle from "@/app/components/SectionTitle";

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
  if (!p) return <PageWrap><p>Pokémon not found.</p></PageWrap>;

  const idx = POKEMON_LIST.findIndex((q) => q.slug === slug);
  const prev = idx > 0 ? POKEMON_LIST[idx - 1] : null;
  const next = idx < POKEMON_LIST.length - 1 ? POKEMON_LIST[idx + 1] : null;

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

  const catSlug = (catRef: string) => {
    if (CATEGORIES[catRef]) return catRef;
    return catRef.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  };

  return (
    <PageWrap>
      <ArrowKeyNav prevSlug={prev?.slug ?? null} nextSlug={next?.slug ?? null} />
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Pokédex", href: "/pokedex" }, { label: p.name }]} />

      <div className="flex justify-between mb-5 max-md:gap-2">
        {prev ? (
          <NavBtn href={`/pokemon/${prev.slug}`} title="Previous Pokémon (← key)">◀ #{dexNum(prev)} {prev.name}</NavBtn>
        ) : <span />}
        {next ? (
          <NavBtn href={`/pokemon/${next.slug}`} title="Next Pokémon (→ key)">{next.name} #{dexNum(next)} ▶</NavBtn>
        ) : <span />}
      </div>

      {/* ── Hero: card + info ── */}
      <div className="flex items-start gap-7 mb-5 pb-5 border-b border-paper-edge max-md:flex-col max-md:items-center max-md:text-center max-md:gap-4">
        <div className="shrink-0 w-[260px]">
          <TcgCard p={{ ...p, slug }} size="md" giftCount={sharedItems.length > 0 ? sharedItems.length : null} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-mono text-[12px] text-accent-deep font-semibold tracking-[0.1em] mb-[2px]">#{dexNum(p)}</div>
          <div className="font-outfit font-extrabold text-[36px] tracking-[-0.02em] leading-[1.05] mb-2 max-md:text-[26px]">{p.name}</div>
          <div className="font-mono text-[12px] text-ink-soft tracking-[0.04em]">
            Ideal habitat: <span className="text-leaf font-semibold">{p.habitat}</span>
            {" "}<span className="info-tip" data-tip="Pokémon with the same habitat can share a living space in Pokopia." aria-label="Pokémon with the same habitat can share a living space in Pokopia.">i</span>
            {p.flavor && <>
              {" · "}Flavor: <span className="text-leaf font-semibold">{p.flavor}</span>
              {" "}<span className="info-tip" data-tip="The berry flavor this Pokémon prefers. Pokémon that share a flavor tend to like the same gift items." aria-label="The berry flavor this Pokémon prefers.">i</span>
            </>}
          </div>
          {p.specialties && p.specialties.length > 0 && (
            <div className="mt-3">
              <p className="font-mono text-[11px] text-ink-soft tracking-[0.04em] font-medium mb-1 flex items-center gap-1.5">
                Specialty
                {" "}<span className="info-tip" data-tip="Specialties determine bonus effects when this Pokémon helps with certain Pokopia activities." aria-label="Specialty bonus activities.">i</span>
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {p.specialties.map((s) => (
                  <Link key={s} href={`/specialty/${s}`} className="pkmn-cat-tag no-underline text-accent-deep border-accent">
                    {SPECIALTIES[s]?.name ?? s}
                  </Link>
                ))}
              </div>
            </div>
          )}
          <div className="mt-3">
            <p className="font-mono text-[11px] text-ink-soft tracking-[0.04em] font-medium mb-1 flex items-center gap-1.5">
              Favorite categories
              {" "}<span className="info-tip" data-tip={`Gift items in these categories will earn extra happiness with ${p.name}.`} aria-label={`Gift items in these categories earn extra happiness with ${p.name}.`}>i</span>
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {p.categories.map((c) => (
                <Link key={c} href={`/category/${toCatSlug(c)}`} className="pkmn-cat-tag no-underline">
                  {catDisplayName(c)}
                </Link>
              ))}
            </div>
          </div>

          <GoesWellWith slug={slug} habitat={p.habitat} />
        </div>
      </div>

      {/* ── Gift data ── */}
      <Card>
        <div className="flex gap-3 mb-6 flex-wrap">
          <StatBox value={allItems.length} label="items total" />
          <StatBox value={sharedItems.length} label="in 2+ categories" />
        </div>

        {sharedItems.length > 0 && (
          <>
            <SectionTitle pill="TOP GIFTS">Best gifts</SectionTitle>
            <p className="text-[13px] text-ink-soft mb-4 leading-relaxed">These items appear in multiple categories — they count double (or more).</p>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3 mb-7 max-md:grid-cols-1">
              {sharedItems.map(([item, cats]) => {
                const itemEntry = ITEMS[item];
                return (
                  <BestGiftItem
                    key={item}
                    item={item}
                    cats={cats.map((c) => catDisplayName(c))}
                    href={`/item/${itemEntry?.slug ?? item.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                    iconSrc={itemEntry?.icon ?? undefined}
                  />
                );
              })}
            </div>
          </>
        )}

        <SectionTitle>All, by category</SectionTitle>
        <p className="text-[13px] text-ink-soft mb-4 leading-relaxed">Items marked with ★ appear in more than one of this Pokémon&apos;s liked categories. Click a category name to collapse it.</p>
        {p.categories.map((catRef) => {
          const items = getCatItems(catRef);
          return (
            <CollapsibleSection key={catRef} title={catDisplayName(catRef)} count={`${items.length} items`} defaultOpen={true}>
              {/* Items grid */}
              <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-2 px-1 mb-2 max-md:grid-cols-1">
                {items.map((item) => {
                  const cats = itemToCats[item] ?? [];
                  const isShared = cats.length >= 2;
                  const otherCats = cats.filter((c) => c !== catRef);
                  const itemEntry = ITEMS[item];
                  return (
                    <Link key={item} href={`/item/${itemEntry?.slug ?? item.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} className="no-underline">
                      <div className={`text-[13px] px-[10px] py-[6px] rounded-lg border transition-all flex items-center gap-2 min-h-[44px] hover:border-accent hover:bg-surface-1 ${isShared ? "bg-accent-soft border-accent font-bold" : "bg-paper border-surface-2 text-ink"}`}>
                        <div className="size-8 shrink-0 flex items-center justify-center">
                          {itemEntry?.icon && <img src={itemEntry.icon} alt={item} className="w-full h-full object-contain [image-rendering:pixelated]" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            {isShared && <span className="text-accent text-[11px]">★</span>}
                            <span>{item}</span>
                          </div>
                          {isShared && <div className="font-mono text-[9px] text-ink-soft mt-[2px] leading-tight">+ {otherCats.map((c) => catDisplayName(c)).join(", ")}</div>}
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
            <SectionTitle className="mt-6">Where to find</SectionTitle>
            {p.habitatList.map((entry) => (
              <div key={entry.habitatSlug} className="mb-4">
                <div className="flex items-baseline gap-2 mb-2 px-[14px] py-2 bg-chrome rounded-[10px] border border-paper-edge">
                  <Link href={`/habitat/${entry.habitatSlug}`} className="font-outfit font-bold text-[16px] no-underline text-inherit">
                    {HABITATS[entry.habitatSlug]?.name ?? entry.habitatSlug}
                  </Link>
                  {entry.rarity && <span className="font-mono text-[11px] text-ink-soft ml-auto font-medium">{entry.rarity}</span>}
                </div>
                <div className="px-1 pb-2 text-xs font-mono text-ink-soft">
                  {entry.locations.map((loc, j) => (
                    <span key={loc}>
                      {j > 0 && " · "}
                      <Link href={`/location/${loc}`} className="text-leaf no-underline">
                        {LOCATIONS[loc]?.name ?? loc}
                      </Link>
                    </span>
                  ))}
                  {entry.time && <span className="ml-3">🕐 {entry.time.join(", ")}</span>}
                  {entry.weather && <span className="ml-3">☁ {entry.weather.join(", ")}</span>}
                </div>
              </div>
            ))}
          </>
        )}
      </Card>
    </PageWrap>
  );
}
