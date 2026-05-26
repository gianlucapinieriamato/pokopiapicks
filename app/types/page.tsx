import type { Metadata } from "next";
import { PokemonType, POKEMON_BY_TYPE } from "@/app/lib/const";
import JsonLd from "@/app/components/JsonLd";
import { SITE_URL } from "@/app/lib/config";
import PageWrap from "@/app/components/PageWrap";
import Breadcrumb from "@/app/components/Breadcrumb";
import Card from "@/app/components/Card";
import PageHeader from "@/app/components/PageHeader";
import { FilterableGrid } from "@/app/components/FilterableGrid";

export const metadata: Metadata = {
  title: "Types",
  description: "Browse all 18 Pokémon types in Pokopia and see which Pokémon have each type.",
};

const ALL_TYPES = Object.values(PokemonType);

export default function TypesPage() {
  return (
    <PageWrap>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Pokopia Types",
        description: "Browse all 18 Pokémon types in Pokopia.",
        url: `${SITE_URL}/types`,
      }} />
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Types" }]} />
      <PageHeader title="Types" meta={`${ALL_TYPES.length} types`}>
        <p className="mt-2 text-[13px] text-ink-soft leading-relaxed max-w-prose">
          A Pokemon&apos;s elemental type shapes its identity and battle interactions in Pokopia. Click a type to browse all Pokemon that belong to it.
        </p>
      </PageHeader>

      <Card>
        <FilterableGrid
          searchPlaceholder="Search types…"
          colMin="160px"
          items={ALL_TYPES.map((t) => ({
            slug: t.slug,
            href: `/types/${t.slug}`,
            label: t.label,
            meta: `${(POKEMON_BY_TYPE[t.slug] ?? []).length} Pokémon`,
          }))}
        />
      </Card>
    </PageWrap>
  );
}
