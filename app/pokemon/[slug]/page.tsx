import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  POKEMON_BY_SLUG,
  POKEMON_LIST,
  POKEMON_VARIANTS_BY_BASE,
  POKEMON_BASE_BY_VARIANT,
  pkmnIconUrl,
  dexNum,
} from "@/app/lib/const";
import type { PokemonConst, ItemConst } from "@/app/lib/const";
import JsonLd from "@/app/components/JsonLd";
import InfoTip from "@/app/components/InfoTip";
import { SITE_URL } from "@/app/lib/config";
import CollapsibleSection from "@/app/components/CollapsibleSection";
import HabitatEntryCard from "@/app/components/HabitatEntryCard";
import GoesWellWith from "@/app/components/GoesWellWith";
import VariantsSection from "@/app/components/VariantsSection";
import ArrowKeyNav from "@/app/components/ArrowKeyNav";
import TcgCard from "@/app/components/TcgCard";
import StatBox from "@/app/components/StatBox";
import BestGiftItem from "@/app/components/BestGiftItem";
import NavBtn from "@/app/components/NavBtn";
import PageWrap from "@/app/components/PageWrap";
import Breadcrumb from "@/app/components/Breadcrumb";
import Card from "@/app/components/Card";
import SectionTitle from "@/app/components/SectionTitle";

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(POKEMON_BY_SLUG).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = (POKEMON_BY_SLUG[slug] ?? null) as PokemonConst | null;
  if (!p) return { title: "Not found" };
  const specNames = p.specialties.map((s) => s.label).join(", ");
  const catList = p.categories
    .slice(0, 3)
    .map((c) => c.label)
    .join(", ");
  return {
    title: `${p.label} — gifts, habitat & specialties`,
    description: `What does ${p.label} like in Pokemon Pokopia? ${p.habitat.label} habitat${specNames ? `, ${specNames} specialty` : ""}${catList ? `. Loves: ${catList}` : ""}. Find the best gift items and roommates in Pokemon Pokopia.`,
    openGraph: {
      url: `${SITE_URL}/pokemon/${slug}/`,
      images: [
        {
          url: p.spriteHq ?? `/icons/pokemon/${p.icon}`,
          width: 480,
          height: 480,
          alt: p.label,
        },
      ],
    },
  };
}

export default async function PokemonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = (POKEMON_BY_SLUG[slug] ?? null) as PokemonConst | null;
  if (!p) notFound();

  const variants = POKEMON_VARIANTS_BY_BASE[slug] ?? [];
  const baseForm = POKEMON_BASE_BY_VARIANT[slug] ?? null;
  const isVariant = baseForm !== null;
  const variantDisplayList = isVariant && baseForm
    ? [baseForm, ...(POKEMON_VARIANTS_BY_BASE[baseForm.slug] ?? []).filter((v) => v.slug !== slug)]
    : variants;

  const idx = POKEMON_LIST.findIndex((q) => q.slug === slug);
  const prev = idx > 0 ? POKEMON_LIST[idx - 1] : null;
  const next = idx < POKEMON_LIST.length - 1 ? POKEMON_LIST[idx + 1] : null;

  // Build item → { item object, categories } map
  const itemMap = p.categories
    .flatMap((cat) => cat.items.map((item) => ({ item, catSlug: cat.slug })))
    .reduce<Record<string, { item: ItemConst; cats: string[] }>>(
      (acc, { item, catSlug }) => {
        (acc[item.slug] ??= { item, cats: [] }).cats.push(catSlug);
        return acc;
      },
      {},
    );
  const allItems = Object.values(itemMap);
  const sharedItems = allItems
    .filter(({ cats }) => cats.length >= 2)
    .sort(
      (a, b) =>
        b.cats.length - a.cats.length || a.item.slug.localeCompare(b.item.slug),
    );

  return (
    <PageWrap>
      <ArrowKeyNav
        prevSlug={prev?.slug ?? null}
        nextSlug={next?.slug ?? null}
      />
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: SITE_URL,
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Pokedex",
                item: `${SITE_URL}/pokedex`,
              },
              {
                "@type": "ListItem",
                position: 3,
                name: p.label,
                item: `${SITE_URL}/pokemon/${slug}`,
              },
            ],
          },
          {
            "@context": "https://schema.org",
            "@type": "VideoGameCharacter",
            name: p.label,
            isPartOf: { "@type": "VideoGame", name: "Pokemon Pokopia" },
            description: `${p.label} — ${p.habitat.label} habitat. Favorite items: ${p.categories
              .slice(0, 3)
              .map((c) => c.label)
              .join(", ")}.`,
            image: p.spriteHq ?? `/icons/pokemon/${p.icon}`,
            url: `${SITE_URL}/pokemon/${slug}/`,
          },
        ]}
      />
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Pokedex", href: "/pokedex" },
          { label: p.label },
        ]}
      />

      {/* ── Hero: card + info ── */}
      <Card>
      <div className="flex flex-col items-center text-center gap-4 sm:flex-row sm:items-stretch sm:text-left sm:gap-7">
        <div className="shrink-0 w-full max-w-[280px] sm:max-w-none sm:w-[240px]">
          <TcgCard p={p} size="lg" />
        </div>
        <div className="flex-1 min-w-0 bg-chrome rounded-xl border border-paper-edge p-3 sm:p-4">
          <div className="flex items-baseline justify-between gap-2 mb-2">
            <div className="font-outfit font-extrabold text-[22px] sm:text-[26px] md:text-[36px] tracking-[-0.02em] leading-[1.05]">
              {p.label}
            </div>
            <div className="font-mono text-[12px] text-accent-deep font-semibold tracking-[0.1em] shrink-0">
              #{dexNum(p)}
            </div>
          </div>

          {/* Classification · Height · Weight — first line */}
          <div className="font-mono text-[12px] text-ink-soft tracking-[0.04em] flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-x-3 gap-y-0.5 mb-2">
            {p.classification && (
              <span className="inline-flex items-center gap-1.5">
                <span>Classification: </span>
                <span className="font-semibold text-ink">
                  {p.classification}
                </span>
              </span>
            )}
            {p.heightM && (
              <span className="inline-flex items-center gap-1.5">
                <span>Height: </span>
                <span className="font-semibold text-ink">{p.heightM}</span>
                {p.heightFt && (
                  <span className="text-ink-fade">({p.heightFt})</span>
                )}
              </span>
            )}
            {p.weightKg && (
              <span className="inline-flex items-center gap-1.5">
                <span>Weight: </span>
                <span className="font-semibold text-ink">{p.weightKg}</span>
                {p.weightLbs && (
                  <span className="text-ink-fade">({p.weightLbs})</span>
                )}
              </span>
            )}
          </div>

          {/* Habitat · Flavor */}
          <div className="font-mono text-[12px] text-ink-soft tracking-[0.04em] flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-x-3 gap-y-0.5">
            <span className="inline-flex items-center gap-1.5">
              <span>Habitat: </span>
              <span className="text-leaf font-semibold">{p.habitat.label}</span>
              <InfoTip tip="Pokemon with the same habitat can share a living space in Pokopia." />
            </span>
            {p.flavor && (
              <span className="inline-flex items-center gap-1.5">
                <span>Flavor: </span>
                <span className="text-leaf font-semibold">
                  {p.flavor.label}
                </span>
                <InfoTip tip="The berry flavor this Pokemon prefers. Pokemon that share a flavor tend to like the same gift items." />
              </span>
            )}
          </div>

          {/* Specialty + Type — side by side */}
          {(p.specialties.length > 0 || p.types.length > 0) && (
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-3">
              {p.specialties.length > 0 && (
                <div>
                  <p className="font-mono text-[11px] text-ink-soft tracking-[0.04em] font-medium mb-1 flex items-center gap-1.5">
                    Specialty
                    <InfoTip tip="Specialties determine bonus effects when this Pokemon helps with certain Pokopia activities." />
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {p.specialties.map((s) => (
                      <Link
                        key={s.slug}
                        href={`/specialty/${s.slug}`}
                        className="font-outfit text-[11px] font-bold px-[10px] py-1 rounded-full bg-surface-1 text-accent-deep border border-[1.5px] border-accent tracking-[0.04em] no-underline"
                      >
                        {s.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {p.types.length > 0 && (
                <div>
                  <p className="font-mono text-[11px] text-ink-soft tracking-[0.04em] font-medium mb-1">
                    Type
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {p.types.map((t) => (
                      <span
                        key={t.slug}
                        className="font-outfit text-[11px] font-bold px-[10px] py-1 rounded-full bg-accent-soft text-accent-deep border border-[1.5px] border-accent tracking-[0.04em]"
                      >
                        {t.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-3">
            <p className="font-mono text-[11px] text-ink-soft tracking-[0.04em] font-medium mb-1 flex items-center gap-1.5">
              Favorite categories
              <InfoTip
                tip={`Gift items in these categories will earn extra happiness with ${p.label}.`}
              />
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {p.categories.map((c) => (
                <Link
                  key={c.slug}
                  href={`/category/${c.slug}`}
                  className="font-outfit text-[11px] font-bold px-[10px] py-1 rounded-full bg-surface-1 text-ink border border-[1.5px] border-paper-edge tracking-[0.04em] no-underline"
                >
                  {c.label}
                </Link>
              ))}
            </div>
          </div>

          {/* ── Where to find — sm+ flat, inside info column ── */}
          {p.habitatList.length > 0 && (
            <div className="hidden sm:flex flex-col gap-4 mt-3">
              {p.habitatList.map((entry) => (
                <HabitatEntryCard key={entry.habitat.slug} entry={entry} flat />
              ))}
            </div>
          )}
        </div>
      </div>
      </Card>

      {/* ── Where to find — mobile only, below Card ── */}
      {p.habitatList.length > 0 && (
        <div className="sm:hidden flex flex-col gap-2 mb-5">
          {p.habitatList.map((entry) => (
            <HabitatEntryCard key={entry.habitat.slug} entry={entry} />
          ))}
        </div>
      )}

      {/* ── Variants ── */}
      <VariantsSection variants={variantDisplayList} />

      {/* ── Goes well with ── */}
      <GoesWellWith slug={slug} habitat={p.habitat} />

      {/* ── Gift data ── */}
      <Card>
        <div className="flex gap-3 mb-6 flex-wrap">
          <StatBox value={allItems.length} label="items total" />
          <StatBox value={sharedItems.length} label="in 2+ categories" />
        </div>

        {sharedItems.length > 0 && (
          <>
            <SectionTitle pill="TOP GIFTS">Best gifts</SectionTitle>
            <p className="text-[13px] text-ink-soft mb-4 leading-relaxed">
              These items appear in multiple categories: they count double (or
              more).
            </p>
            <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3 mb-7">
              {sharedItems.map(({ item, cats }) => {
                const catLabels = cats.map((catSlug) => {
                  const cat = p.categories.find((c) => c.slug === catSlug);
                  return cat?.label ?? catSlug;
                });
                return (
                  <BestGiftItem
                    key={item.slug}
                    item={item.label}
                    cats={catLabels}
                    href={`/item/${item.slug}`}
                    iconSrc={item.icon ?? undefined}
                  />
                );
              })}
            </div>
          </>
        )}

        <SectionTitle>All by category</SectionTitle>
        <p className="text-[13px] text-ink-soft mb-4 leading-relaxed">
          Items marked with ★ appear in more than one of this Pokemon&apos;s
          liked categories. Click a category name to collapse it.
        </p>
        {p.categories.map((cat) => {
          return (
            <CollapsibleSection
              key={cat.slug}
              title={cat.label}
              count={`${cat.items.length} items`}
              defaultOpen={true}
            >
              <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-2 px-1 mb-2">
                {cat.items.map((item) => {
                  const cats = itemMap[item.slug]?.cats ?? [];
                  const isShared = cats.length >= 2;
                  const otherCats = cats
                    .filter((cs) => cs !== cat.slug)
                    .map((cs) => {
                      const fc = p.categories.find((c) => c.slug === cs);
                      return fc?.label ?? cs;
                    });
                  return (
                    <Link
                      key={item.slug}
                      href={`/item/${item.slug}`}
                      className="no-underline"
                    >
                      <div
                        className={`text-[13px] px-[10px] py-[6px] rounded-lg border transition-all flex items-center gap-2 min-h-[44px] hover:border-accent hover:bg-surface-1 ${isShared ? "bg-accent-soft border-accent font-bold" : "bg-paper border-surface-2 text-ink"}`}
                      >
                        <div className="relative size-8 shrink-0">
                          {item.icon && (
                            <Image
                              fill
                              src={item.icon}
                              alt={item.label}
                              className="object-contain"
                              sizes="32px"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            {isShared && (
                              <span className="text-accent text-[11px]">★</span>
                            )}
                            <span>{item.label}</span>
                          </div>
                          {isShared && (
                            <div className="font-mono text-[9px] text-ink-soft mt-[2px] leading-tight">
                              + {otherCats.join(", ")}
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </CollapsibleSection>
          );
        })}
      </Card>

      <div className="flex justify-between gap-2 min-w-0">
        {prev ? (
          <NavBtn
            href={`/pokemon/${prev.slug}`}
            title="Previous Pokemon (← key)"
            className="min-w-0 max-w-[48%]"
          >
            <span className="truncate">{`◀ ${prev.label} #${dexNum(prev)}`}</span>
          </NavBtn>
        ) : (
          <span />
        )}
        {next ? (
          <NavBtn
            href={`/pokemon/${next.slug}`}
            title="Next Pokemon (→ key)"
            className="min-w-0 max-w-[48%]"
          >
            <span className="truncate">{`${next.label} #${dexNum(next)} ▶`}</span>
          </NavBtn>
        ) : (
          <span />
        )}
      </div>
    </PageWrap>
  );
}
