import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Category, POKEMON_LIST } from "@/app/lib/const";
import JsonLd from "@/app/components/JsonLd";
import { SITE_URL } from "@/app/lib/config";
import PageWrap from "@/app/components/PageWrap";
import Breadcrumb from "@/app/components/Breadcrumb";
import Card from "@/app/components/Card";
import PageHeader from "@/app/components/PageHeader";
import SectionTitle from "@/app/components/SectionTitle";
import PokemonGridCard from "@/app/components/PokemonGridCard";
import PokemonGrid from "@/app/components/PokemonGrid";

export function generateStaticParams() {
  return Object.values(Category).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = Object.values(Category).find((cat) => cat.slug === slug) ?? null;
  if (!c) return { title: "Not found" };
  return {
    title: `${c.label} — Gift Category`,
    description: `${c.label} items in Pokemon Pokopia: ${c.items.length} gifts that earn happiness with Pokemon that like this category.`,
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cat = Object.values(Category).find((c) => c.slug === slug) ?? null;
  if (!cat) return <PageWrap><p>Category not found.</p></PageWrap>;

  const pokemonWhoLike = POKEMON_LIST
    .filter((p) => p.categories.some((c) => c.slug === slug))
    .sort((a, b) => (a.nationalDexNum ?? 99999) - (b.nationalDexNum ?? 99999));

  return (
    <PageWrap>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Items", item: `${SITE_URL}/items` },
          { "@type": "ListItem", position: 3, name: cat.label, item: `${SITE_URL}/category/${slug}` },
        ],
      }} />
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Items", href: "/items" }, { label: cat.label }]} />
      <PageHeader title={cat.label} meta={`${cat.items.length} items · ${pokemonWhoLike.length} Pokemon`} />

      <Card>
        <SectionTitle>Items in this category</SectionTitle>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-2 px-1 mt-3">
          {cat.items.map((item) => (
            <Link key={item.slug} href={`/item/${item.slug}`} className="no-underline">
              <div className="text-[13px] px-[10px] py-[6px] rounded-lg bg-paper border border-surface-2 text-ink transition-all flex items-center gap-2 min-h-[44px] hover:border-accent hover:bg-surface-1">
                <div className="relative size-8 shrink-0">
                  {item.icon && <Image fill src={item.icon} alt={item.label} className="object-contain" sizes="32px" />}
                </div>
                <div className="flex-1 min-w-0">{item.label}</div>
              </div>
            </Link>
          ))}
        </div>
      </Card>

      {pokemonWhoLike.length > 0 && (
        <Card>
          <SectionTitle>Pokemon that like this category</SectionTitle>
          <PokemonGrid className="mt-3">
            {pokemonWhoLike.map((p) => (
              <PokemonGridCard key={p.slug} p={p} />
            ))}
          </PokemonGrid>
        </Card>
      )}
    </PageWrap>
  );
}
