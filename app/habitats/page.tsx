import type { Metadata } from "next";
import Link from "next/link";
import { HabitatConfig, POKEMON_BY_HABITAT_CONFIG } from "@/app/lib/const";
import JsonLd from "@/app/components/JsonLd";
import { SITE_URL } from "@/app/lib/config";
import PageWrap from "@/app/components/PageWrap";
import Breadcrumb from "@/app/components/Breadcrumb";
import Card from "@/app/components/Card";
import PageHeader from "@/app/components/PageHeader";
import HoverTile from "@/app/components/HoverTile";

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
      <PageHeader title="Habitats" meta={`${ALL_HABITATS.length} habitats`} />

      <Card>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-2">
          {ALL_HABITATS.map((h) => {
            const count = (POKEMON_BY_HABITAT_CONFIG[h.slug] ?? []).length;
            return (
              <Link key={h.slug} href={`/habitats/${h.slug}`} className="no-underline">
                <HoverTile className="py-3 px-3.5">
                  <div className="font-outfit font-bold text-sm text-ink mb-1">{h.label}</div>
                  {h.description && (
                    <div className="font-mono text-[10px] text-ink-soft tracking-[0.02em] leading-snug mb-1 line-clamp-2">{h.description}</div>
                  )}
                  <div className="font-mono text-[10px] text-ink-fade tracking-[0.04em]">
                    {count} Pokemon spawn here
                  </div>
                </HoverTile>
              </Link>
            );
          })}
        </div>
      </Card>
    </PageWrap>
  );
}
