import type { Metadata } from "next";
import { HABITATS, POKEMON } from "@/app/lib/data";
import JsonLd from "@/app/components/JsonLd";
import { SITE_URL } from "@/app/lib/config";
import PageWrap from "@/app/components/PageWrap";
import PokemonGrid from "@/app/components/PokemonGrid";
import Breadcrumb from "@/app/components/Breadcrumb";
import Card from "@/app/components/Card";
import PageHeader from "@/app/components/PageHeader";
import PokemonGridCard from "@/app/components/PokemonGridCard";

export function generateStaticParams() {
  return Object.keys(HABITATS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const h = HABITATS[slug];
  if (!h) return { title: "Not found" };
  return { title: h.name, description: h.description };
}

export default async function HabitatPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const h = HABITATS[slug];
  if (!h) return <PageWrap><p>Habitat not found.</p></PageWrap>;

  const pokemonHere = h.pokemon
    .flatMap((s) => POKEMON[s] ? [POKEMON[s]] : [])
    .sort((a, b) => (a.nationalDexNum ?? 99999) - (b.nationalDexNum ?? 99999));

  return (
    <PageWrap>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Habitats", item: `${SITE_URL}/habitats` },
          { "@type": "ListItem", position: 3, name: h.name, item: `${SITE_URL}/habitat/${slug}` },
        ],
      }} />
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Habitats", href: "/habitats" }, { label: h.name }]} />
      <PageHeader title={h.name} meta={pokemonHere.length + " Pokemon spawn here"}>
        {h.description && <p className="text-[13px] text-ink-soft mb-4 leading-relaxed">{h.description}</p>}
      </PageHeader>
      {pokemonHere.length > 0 ? (
        <Card>
          <PokemonGrid>
            {pokemonHere.map((p) => (
              <PokemonGridCard key={p.slug} p={p} />
            ))}
          </PokemonGrid>
        </Card>
      ) : (
        <Card><p className="font-mono text-[12px] text-ink-soft tracking-[0.04em] font-medium">No Pokemon data for this habitat yet.</p></Card>
      )}
    </PageWrap>
  );
}
