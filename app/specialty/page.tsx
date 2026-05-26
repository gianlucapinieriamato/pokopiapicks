import type { Metadata } from "next";
import { Specialty, POKEMON_BY_SPECIALTY } from "@/app/lib/const";
import JsonLd from "@/app/components/JsonLd";
import { SITE_URL } from "@/app/lib/config";
import PageWrap from "@/app/components/PageWrap";
import Breadcrumb from "@/app/components/Breadcrumb";
import Card from "@/app/components/Card";
import PageHeader from "@/app/components/PageHeader";
import { FilterableGrid } from "@/app/components/FilterableGrid";

export const metadata: Metadata = {
  title: "Specialties",
  description: "Browse all Pokemon Pokopia specialties and see which Pokemon have each one.",
};

const ALL_SPECIALTIES = Object.values(Specialty);

export default function SpecialtiesPage() {
  return (
    <PageWrap>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Pokopia Specialties",
        description: "Browse all Pokemon Pokopia specialties and see which Pokemon have each one.",
        url: `${SITE_URL}/specialty`,
      }} />
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Specialties" }]} />
      <PageHeader title="Specialties" meta={`${ALL_SPECIALTIES.length} specialties`}>
        <p className="mt-2 text-[13px] text-ink-soft leading-relaxed max-w-prose">
          Specialties determine bonus effects when a Pokemon helps with certain Pokopia activities. Pokemon that share a specialty tend to work well together and pair naturally as roommates.
        </p>
      </PageHeader>

      <Card>
        <FilterableGrid
          searchPlaceholder="Search specialties…"
          items={ALL_SPECIALTIES.map((s) => ({
            slug: s.slug,
            href: `/specialty/${s.slug}`,
            label: s.label,
            description: s.description ?? null,
            meta: `${(POKEMON_BY_SPECIALTY[s.slug] ?? []).length} Pokemon`,
          }))}
        />
      </Card>
    </PageWrap>
  );
}
