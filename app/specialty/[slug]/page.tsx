import type { Metadata } from "next";
import { SPECIALTIES, POKEMON } from "@/app/lib/data";
import PageWrap from "@/app/components/PageWrap";
import Breadcrumb from "@/app/components/Breadcrumb";
import Card from "@/app/components/Card";
import PageHeader from "@/app/components/PageHeader";
import PokemonGridCard from "@/app/components/PokemonGridCard";
import PokemonGrid from "@/app/components/PokemonGrid";

export function generateStaticParams() {
  return Object.keys(SPECIALTIES).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const s = SPECIALTIES[slug];
  if (!s) return { title: "Not found" };
  return { title: `${s.name} specialty`, description: s.description };
}

export default async function SpecialtyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = SPECIALTIES[slug];
  if (!s) return <PageWrap><p>Specialty not found.</p></PageWrap>;

  const pokemonWith = s.pokemon
    .flatMap((pSlug) => POKEMON[pSlug] ? [POKEMON[pSlug]] : [])
    .sort((a, b) => (a.nationalDexNum ?? 99999) - (b.nationalDexNum ?? 99999));

  return (
    <PageWrap>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Specialties", href: "/specialties" }, { label: s.name }]} />
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
