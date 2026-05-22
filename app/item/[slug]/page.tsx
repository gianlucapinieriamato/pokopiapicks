import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ITEMS, CATEGORIES, POKEMON, pkmnIconUrl, dexNum, catDisplayName } from "@/app/lib/data";
import JsonLd from "@/app/components/JsonLd";
import { SITE_URL } from "@/app/lib/config";
import PageWrap from "@/app/components/PageWrap";
import Breadcrumb from "@/app/components/Breadcrumb";
import Card from "@/app/components/Card";
import SectionTitle from "@/app/components/SectionTitle";
import PokemonGridCard from "@/app/components/PokemonGridCard";
import PokemonGrid from "@/app/components/PokemonGrid";

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
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Items", item: `${SITE_URL}/items` },
          { "@type": "ListItem", position: 3, name: item.name, item: `${SITE_URL}/item/${slug}` },
        ],
      }} />
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Items", href: "/items" }, { label: item.name }]} />
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-2">
          {item.icon && (
            <div className="size-16 bg-surface-1 rounded-[10px] p-[6px] shrink-0">
              <div className="relative w-full h-full">
                <Image fill src={item.icon} alt={item.name} className="object-contain [image-rendering:pixelated]" sizes="64px" />
              </div>
            </div>
          )}
          <div className="font-outfit font-extrabold leading-[1.05] tracking-[-0.025em] text-[clamp(1.8rem,4vw,2.8rem)]">{item.name}</div>
        </div>
      </div>

      <Card>
        <SectionTitle>Categories</SectionTitle>
        <div className="flex flex-wrap gap-2 mt-2 mb-4">
          {item.categories.map((c) => (
            <Link key={c} href={`/category/${c}`} className="font-outfit text-[11px] font-bold px-[10px] py-1 rounded-full bg-surface-1 text-ink border border-[1.5px] border-paper-edge tracking-[0.04em] no-underline">{catDisplayName(c)}</Link>
          ))}
        </div>

        <SectionTitle>Pokemon that like this item</SectionTitle>
        <div className="font-mono text-[12px] text-ink-soft tracking-[0.04em] font-medium mb-3">{pokemonWhoLike.length} Pokemon</div>
        {pokemonWhoLike.length > 0 && (
          <PokemonGrid>
            {pokemonWhoLike.map((p) => (
              <PokemonGridCard key={p.slug} p={p} />
            ))}
          </PokemonGrid>
        )}
      </Card>
    </PageWrap>
  );
}
