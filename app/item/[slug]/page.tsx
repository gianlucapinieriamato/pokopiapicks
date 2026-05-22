import Link from "next/link";
import type { Metadata } from "next";
import { ITEMS, CATEGORIES, POKEMON, pkmnIconUrl, dexNum, catDisplayName } from "@/app/lib/data";
import PageWrap from "@/app/components/PageWrap";
import Breadcrumb from "@/app/components/Breadcrumb";
import Card from "@/app/components/Card";
import SectionTitle from "@/app/components/SectionTitle";
import PokemonGridCard from "@/app/components/PokemonGridCard";

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
  if (!item) return <PageWrap><p>Item not found.</p></PageWrap>;

  const pokemonWhoLike = Object.values(POKEMON)
    .filter((p) => {
      return item.categories.some((catSlug) => {
        const catDisplay = CATEGORIES[catSlug]?.name ?? catSlug;
        return p.categories.includes(catDisplay) || p.categories.includes(catSlug);
      });
    })
    .sort((a, b) => (a.nationalDexNum ?? 99999) - (b.nationalDexNum ?? 99999));

  return (
    <PageWrap>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Items", href: "/items" }, { label: item.name }]} />
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-2">
          {item.icon && (
            <div className="size-16 bg-surface-1 rounded-[10px] flex items-center justify-center p-[6px] shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.icon} alt={item.name} className="w-full h-full object-contain [image-rendering:pixelated]" />
            </div>
          )}
          <div className="font-outfit font-extrabold leading-[1.05] tracking-[-0.025em] text-[clamp(1.8rem,4vw,2.8rem)]">{item.name}</div>
        </div>
      </div>

      <Card>
        <SectionTitle>Favorite categories</SectionTitle>
        <div className="flex flex-wrap gap-2 mt-2 mb-4">
          {item.categories.map((c) => (
            <Link key={c} href={`/category/${c}`} className="pkmn-cat-tag no-underline">{catDisplayName(c)}</Link>
          ))}
        </div>

        <SectionTitle>Pokémon that like this item</SectionTitle>
        <div className="font-mono text-[12px] text-ink-soft tracking-[0.04em] font-medium mb-3">{pokemonWhoLike.length} Pokémon</div>
        {pokemonWhoLike.length > 0 && (
          <div className="pkmn-grid">
            {pokemonWhoLike.map((p) => (
              <PokemonGridCard key={p.slug} p={p} />
            ))}
          </div>
        )}
      </Card>
    </PageWrap>
  );
}
