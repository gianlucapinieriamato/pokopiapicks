import type { Metadata } from "next";
import Link from "next/link";
import { SPECIALTIES } from "@/app/lib/data";
import JsonLd from "@/app/components/JsonLd";
import { SITE_URL } from "@/app/lib/config";
import PageWrap from "@/app/components/PageWrap";
import Breadcrumb from "@/app/components/Breadcrumb";
import Card from "@/app/components/Card";
import PageHeader from "@/app/components/PageHeader";
import HoverTile from "@/app/components/HoverTile";

export const metadata: Metadata = {
  title: "Specialties",
  description: "Browse all Pokemon Pokopia specialties and see which Pokemon have each one.",
};

const ALL_SPECIALTIES = Object.values(SPECIALTIES);

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
      <PageHeader title="Specialties" meta={`${ALL_SPECIALTIES.length} specialties`} />

      <Card>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-2">
          {ALL_SPECIALTIES.map((s) => (
            <Link key={s.slug} href={`/specialty/${s.slug}`} className="no-underline">
              <HoverTile className="py-3 px-3.5">
                <div className="font-outfit font-bold text-sm text-ink mb-1">{s.name}</div>
                {s.description && (
                  <div className="font-mono text-[10px] text-ink-soft tracking-[0.02em] leading-snug mb-1 line-clamp-2">{s.description}</div>
                )}
                <div className="font-mono text-[10px] text-ink-fade tracking-[0.04em]">
                  {s.pokemon.length} Pokemon
                </div>
              </HoverTile>
            </Link>
          ))}
        </div>
      </Card>
    </PageWrap>
  );
}
