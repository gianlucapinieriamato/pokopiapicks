import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  HabitatConfig,
  POKEMON_BY_HABITAT_CONFIG,
} from "@/app/lib/const";
import type { HabitatRequirementConst } from "@/app/lib/const";
import JsonLd from "@/app/components/JsonLd";
import { SITE_URL } from "@/app/lib/config";
import PageWrap from "@/app/components/PageWrap";
import PokemonGrid from "@/app/components/PokemonGrid";
import Breadcrumb from "@/app/components/Breadcrumb";
import Card from "@/app/components/Card";
import PageHeader from "@/app/components/PageHeader";
import PokemonGridCard from "@/app/components/PokemonGridCard";
import SectionTitle from "@/app/components/SectionTitle";
import Link from "next/link";
import Image from "next/image";

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.values(HabitatConfig).map((h) => ({ slug: h.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const h = Object.values(HabitatConfig).find((hc) => hc.slug === slug);
  if (!h) return { title: "Not found" };
  const pokemonHere = POKEMON_BY_HABITAT_CONFIG[slug] ?? [];
  const desc =
    `${h.label} habitat in Pokemon Pokopia — ${pokemonHere.length} Pokemon spawn here. ${h.description ?? ""}`.trim();
  return {
    title: `${h.label} Habitat — Build Guide | Pokopia Picks`,
    description: desc.slice(0, 155),
    openGraph: {
      url: `${SITE_URL}/habitats/${slug}/`,
    },
  };
}

export default async function HabitatPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const h = Object.values(HabitatConfig).find((hc) => hc.slug === slug);
  if (!h) notFound();

  const pokemonHere = (POKEMON_BY_HABITAT_CONFIG[slug] ?? [])
    .slice()
    .sort((a, b) => (a.nationalDexNum ?? 99999) - (b.nationalDexNum ?? 99999));

  return (
    <PageWrap>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: "Habitats", item: `${SITE_URL}/habitats` },
            { "@type": "ListItem", position: 3, name: h.label, item: `${SITE_URL}/habitats/${slug}` },
          ],
        }}
      />
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Habitats", href: "/habitats" },
          { label: h.label },
        ]}
      />
      <PageHeader
        title={h.label}
        meta={pokemonHere.length + " Pokemon spawn here"}
      >
        {h.description && (
          <p className="text-[13px] text-ink-soft mb-4 leading-relaxed">
            {h.description}
          </p>
        )}
      </PageHeader>

      {h.requirements.length > 0 && (
        <Card>
          <SectionTitle>How to build</SectionTitle>
          <div className="flex flex-wrap gap-3 mt-3">
            {h.requirements.map((req: HabitatRequirementConst) => {
              const isGroup = req.type === "group";
              const icon = isGroup ? null : req.item.icon;
              const href = isGroup
                ? `/items?group=${encodeURIComponent(req.groupKey)}`
                : `/item/${req.item.slug}`;

              const inner = (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-1 border border-paper-edge">
                  {icon && (
                    <div className="relative size-8 shrink-0">
                      <Image
                        fill
                        src={icon}
                        alt={req.label}
                        className="object-contain"
                        sizes="32px"
                      />
                    </div>
                  )}
                  <div>
                    <div className="font-outfit font-semibold text-[13px] text-ink leading-tight">
                      {req.label}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {req.qty > 1 && (
                        <span className="font-mono text-[11px] text-ink-soft">×{req.qty}</span>
                      )}
                      {isGroup && (
                        <span className="font-mono text-[10px] text-ink-soft bg-surface-2 px-1.5 py-0.5 rounded-full">
                          any type
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );

              return (
                <Link key={req.label} href={href} className="no-underline">
                  {inner}
                </Link>
              );
            })}
          </div>
        </Card>
      )}

      {pokemonHere.length > 0 ? (
        <Card>
          <PokemonGrid>
            {pokemonHere.map((p) => (
              <PokemonGridCard key={p.slug} p={p} />
            ))}
          </PokemonGrid>
        </Card>
      ) : (
        <Card>
          <p className="font-mono text-[12px] text-ink-soft tracking-[0.04em] font-medium">
            No Pokemon data for this habitat yet.
          </p>
        </Card>
      )}
    </PageWrap>
  );
}
