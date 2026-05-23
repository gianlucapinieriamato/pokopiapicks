import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Specialty, POKEMON_BY_SPECIALTY, POKEMON_LIST } from "@/app/lib/const";
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
  return Object.values(Specialty).map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const s = Object.values(Specialty).find((sp) => sp.slug === slug);
  if (!s) return { title: "Not found" };
  const pokemonWithIt = POKEMON_BY_SPECIALTY[slug] ?? [];
  const description = s.description?.trim()
    ? s.description.slice(0, 155)
    : `${s.label} is a specialty in Pokemon Pokopia. ${pokemonWithIt.length} Pokemon have this specialty.`;
  return {
    title: `${s.label} Specialty — Pokemon List | Pokopia Picks`,
    description,
    openGraph: {
      url: `${SITE_URL}/specialty/${slug}/`,
    },
  };
}

export default async function SpecialtyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const s = Object.values(Specialty).find((sp) => sp.slug === slug);
  if (!s) notFound();

  const pokemonWith = (POKEMON_BY_SPECIALTY[slug] ?? []).slice().sort(
    (a, b) => (a.nationalDexNum ?? 99999) - (b.nationalDexNum ?? 99999)
  );

  const description = s.description?.trim()
    ? s.description.slice(0, 155)
    : `${s.label} is a specialty in Pokemon Pokopia. ${pokemonWith.length} Pokemon have this specialty.`;

  return (
    <PageWrap>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: "Specialties", item: `${SITE_URL}/specialty` },
            { "@type": "ListItem", position: 3, name: s.label, item: `${SITE_URL}/specialty/${slug}` },
          ],
        }}
      />
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Specialties", href: "/specialty" },
          { label: s.label },
        ]}
      />
      <PageHeader title={s.label} meta={pokemonWith.length + " Pokemon"}>
        {s.description && (
          <p className="text-[13px] text-ink-soft mb-4 leading-relaxed">
            {s.description}
          </p>
        )}
      </PageHeader>
      <Card>
        {pokemonWith.length > 0 ? (
          <PokemonGrid>
            {pokemonWith.map((p) => (
              <PokemonGridCard key={p.slug} p={p} />
            ))}
          </PokemonGrid>
        ) : (
          <p className="font-mono text-[12px] text-ink-soft tracking-[0.04em] font-medium">
            No Pokemon data for this specialty yet.
          </p>
        )}
      </Card>
    </PageWrap>
  );
}
