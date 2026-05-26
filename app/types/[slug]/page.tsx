import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PokemonType, POKEMON_BY_TYPE } from "@/app/lib/const";
import JsonLd from "@/app/components/JsonLd";
import { SITE_URL } from "@/app/lib/config";
import PageWrap from "@/app/components/PageWrap";
import Breadcrumb from "@/app/components/Breadcrumb";
import Card from "@/app/components/Card";
import PageHeader from "@/app/components/PageHeader";
import PokemonGridCard from "@/app/components/PokemonGridCard";
import PokemonGrid from "@/app/components/PokemonGrid";

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.values(PokemonType).map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const t = Object.values(PokemonType).find((pt) => pt.slug === slug);
  if (!t) return { title: "Not found" };
  const count = (POKEMON_BY_TYPE[slug] ?? []).length;
  return {
    title: `${t.label} Type — Pokémon List`,
    description: `All ${count} ${t.label}-type Pokémon in Pokopia. Browse by type to find the right roommates and gift strategies.`,
    openGraph: { url: `${SITE_URL}/types/${slug}/` },
  };
}

export default async function TypePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const t = Object.values(PokemonType).find((pt) => pt.slug === slug);
  if (!t) notFound();

  const pokemonWith = (POKEMON_BY_TYPE[slug] ?? []).slice().sort(
    (a, b) => (a.nationalDexNum ?? 99999) - (b.nationalDexNum ?? 99999),
  );

  return (
    <PageWrap>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: "Types", item: `${SITE_URL}/types` },
            { "@type": "ListItem", position: 3, name: t.label, item: `${SITE_URL}/types/${slug}` },
          ],
        }}
      />
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Types", href: "/types" },
          { label: t.label },
        ]}
      />
      <PageHeader title={`${t.label} Type`} meta={pokemonWith.length + " Pokémon"} />
      <Card>
        {pokemonWith.length > 0 ? (
          <PokemonGrid>
            {pokemonWith.map((p) => (
              <PokemonGridCard key={p.slug} p={p} />
            ))}
          </PokemonGrid>
        ) : (
          <p className="font-mono text-[12px] text-ink-soft tracking-[0.04em] font-medium">
            No Pokémon data for this type yet.
          </p>
        )}
      </Card>
    </PageWrap>
  );
}
