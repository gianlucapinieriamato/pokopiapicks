import type { Metadata } from "next";
import { HabitatConfig, POKEMON_BY_HABITAT_CONFIG } from "@/app/lib/const";
import JsonLd from "@/app/components/JsonLd";
import { SITE_URL } from "@/app/lib/config";
import PageWrap from "@/app/components/PageWrap";
import Breadcrumb from "@/app/components/Breadcrumb";
import Card from "@/app/components/Card";
import PageHeader from "@/app/components/PageHeader";
import { FilterableGrid } from "@/app/components/FilterableGrid";

export const metadata: Metadata = {
  title: "Habitats",
  description: "Browse all Pokemon Pokopia habitats and see which Pokemon spawn there.",
};

const ALL_HABITATS = Object.values(HabitatConfig);

export default function HabitatsPage() {
  return (
    <PageWrap>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Pokopia Habitats",
        description: "Browse all Pokemon Pokopia habitats and see which Pokemon spawn there.",
        url: `${SITE_URL}/habitats`,
      }} />
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Habitats" }]} />
      <PageHeader title="Habitats" meta={`${ALL_HABITATS.length} habitats`}>
        <p className="mt-2 text-[13px] text-ink-soft leading-relaxed max-w-prose">
          Pokemon with the same habitat can share a living space in Pokopia. Grouping compatible Pokemon boosts their happiness and unlocks bonus interactions.
        </p>
      </PageHeader>

      <Card>
        <FilterableGrid
          searchPlaceholder="Search habitats…"
          items={ALL_HABITATS.map((h) => ({
            slug: h.slug,
            href: `/habitats/${h.slug}`,
            label: h.label,
            description: h.description ?? null,
            meta: `${(POKEMON_BY_HABITAT_CONFIG[h.slug] ?? []).length} Pokemon spawn here`,
          }))}
        />
      </Card>
    </PageWrap>
  );
}
