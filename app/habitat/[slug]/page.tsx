import type { Metadata } from "next";
import { HABITATS, POKEMON } from "@/app/lib/data";
import PageWrap from "@/app/components/PageWrap";
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
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Habitats", href: "/habitats" }, { label: h.name }]} />
      <PageHeader title={h.name} meta={pokemonHere.length + " Pokémon spawn here"}>
        {h.description && <p className="text-[13px] text-ink-soft mb-4 leading-relaxed">{h.description}</p>}
      </PageHeader>
      {pokemonHere.length > 0 ? (
        <Card>
          <div className="pkmn-grid">
            {pokemonHere.map((p) => (
              <PokemonGridCard key={p.slug} p={p} />
            ))}
          </div>
        </Card>
      ) : (
        <Card><p className="font-mono text-[12px] text-ink-soft tracking-[0.04em] font-medium">No Pokémon data for this habitat yet.</p></Card>
      )}
    </PageWrap>
  );
}
