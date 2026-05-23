import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SPECIALTIES, POKEMON } from "@/app/lib/data";
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
  return Object.keys(SPECIALTIES).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const s = SPECIALTIES[slug];
  if (!s) return { title: "Not found" };
  const description = s.description?.trim()
    ? s.description.slice(0, 155)
    : `${s.name} is a specialty in Pokémon Pokopia. ${s.pokemon.length} Pokémon have this specialty.`;
  return {
    title: `${s.name} Specialty — Pokémon List | Pokopia Picks`,
    description,
    openGraph: {
      url: `${SITE_URL}/specialty/${slug}/`,
    },
  };
}

export default async function SpecialtyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = SPECIALTIES[slug];
  if (!s) notFound();
  const description = s.description?.trim()
    ? s.description.slice(0, 155)
    : `${s.name} is a specialty in Pokémon Pokopia. ${s.pokemon.length} Pokémon have this specialty.`;

  const pokemonWith = s.pokemon
    .flatMap((pSlug) => POKEMON[pSlug] ? [POKEMON[pSlug]] : [])
    .sort((a, b) => (a.nationalDexNum ?? 99999) - (b.nationalDexNum ?? 99999));

  return (
    <PageWrap>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Specialties", item: `${SITE_URL}/specialty` },
          { "@type": "ListItem", position: 3, name: s.name, item: `${SITE_URL}/specialty/${slug}` },
        ],
      }} />
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Specialties", href: "/specialty" }, { label: s.name }]} />
      <PageHeader title={s.name} meta={pokemonWith.length + " Pokemon"}>
        {s.description && <p className="text-[13px] text-ink-soft mb-4 leading-relaxed">{s.description}</p>}
      </PageHeader>
      <Card>
        {pokemonWith.length > 0 ? (
          <PokemonGrid>
            {pokemonWith.map((p) => (
              <PokemonGridCard key={p.slug} p={p} />
            ))}
          </PokemonGrid>
        ) : (
          <p className="font-mono text-[12px] text-ink-soft tracking-[0.04em] font-medium">No Pokemon data for this specialty yet.</p>
        )}
      </Card>
    </PageWrap>
  );
}
