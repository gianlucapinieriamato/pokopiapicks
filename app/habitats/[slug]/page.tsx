import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  HabitatConfig,
  POKEMON_BY_HABITAT_CONFIG,
  Item,
} from "@/app/lib/const";
import type { ItemConst } from "@/app/lib/const";
import { HABITAT_REQUIREMENTS } from "@/app/lib/data/habitat-requirements";
import type { HabitatRequirement } from "@/app/lib/types";
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
import { existsSync } from "fs";
import { join } from "path";

type ResolvedReq = {
  req: HabitatRequirement;
  item: { slug: string; name: string; icon: string | null; } | undefined;
  isExact: boolean;
  isAny: boolean;
};

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

  const requirements = HABITAT_REQUIREMENTS[slug] ?? [];

  // Build a slug → item lookup from Item const for icon resolution
  const allItems = Object.values(Item);
  const itemBySlug = new Map(allItems.map((i) => [i.slug, i]));
  const itemByName = new Map(allItems.map((i) => [i.label.toLowerCase(), i]));

  // For each requirement, resolve to: exact match, or best prefix match
  const resolved: ResolvedReq[] = requirements.map((req) => {
    const nameLower = req.name.toLowerCase();
    const baseName = nameLower.replace(/\s*\(any\)\s*$/, "").trim();
    const isAnyLabel = nameLower.includes("(any)");

    if (isAnyLabel) {
      const anyIconPath = `/icons/items/${baseName.replace(/\s+/g, "")}(any).png`;
      if (existsSync(join(process.cwd(), "public", anyIconPath))) {
        return {
          req,
          item: { slug: "", name: req.name, icon: anyIconPath },
          isExact: false,
          isAny: true,
        };
      }
    }

    // 1. Exact match on full name
    const exact = itemByName.get(nameLower);
    if (exact) return { req, item: { slug: exact.slug, name: exact.label, icon: exact.icon }, isExact: true, isAny: isAnyLabel };

    // 2. Exact match on base name
    const baseExact = itemByName.get(baseName);
    if (baseExact) return { req, item: { slug: baseExact.slug, name: baseExact.label, icon: baseExact.icon }, isExact: false, isAny: true };

    // 3. Word-boundary match
    const wordRe = new RegExp(
      `(?:^|\\s)${baseName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:\\s|$)`,
      "i",
    );
    const wordMatch = allItems.find((i) => wordRe.test(i.label));
    if (wordMatch) return { req, item: { slug: wordMatch.slug, name: wordMatch.label, icon: wordMatch.icon }, isExact: false, isAny: true };

    // 4. No match
    return { req, item: undefined, isExact: false, isAny: isAnyLabel };
  });

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

      {resolved.length > 0 && (
        <Card>
          <SectionTitle>How to build</SectionTitle>
          <div className="flex flex-wrap gap-3 mt-3">
            {resolved.map(({ req, item, isExact, isAny }) => {
              const inner = (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-1 border border-paper-edge">
                  {item?.icon && (
                    <div className="relative size-8 shrink-0">
                      <Image
                        fill
                        src={item.icon}
                        alt={req.name}
                        className="object-contain [image-rendering:pixelated]"
                        sizes="32px"
                      />
                    </div>
                  )}
                  <div>
                    <div className="font-outfit font-semibold text-[13px] text-ink leading-tight">
                      {req.name}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {req.qty > 1 && (
                        <span className="font-mono text-[11px] text-ink-soft">×{req.qty}</span>
                      )}
                      {isAny && (
                        <span className="font-mono text-[10px] text-ink-soft bg-surface-2 px-1.5 py-0.5 rounded-full">
                          any type
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
              const baseName = req.name.replace(/\s*\(any\)\s*$/i, "").trim();
              const groupKey = baseName.toLowerCase();
              const href = isAny
                ? `/items?group=${encodeURIComponent(groupKey)}`
                : isExact && item?.slug
                  ? `/item/${item.slug}`
                  : null;
              return href ? (
                <Link key={req.name} href={href} className="no-underline">
                  {inner}
                </Link>
              ) : (
                <div key={req.name}>{inner}</div>
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
