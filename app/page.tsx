import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from "@/app/lib/config";
import { POKEMON_LIST } from "@/app/lib/const";
import HoverTile from "@/app/components/HoverTile";
import TcgCard from "@/app/components/TcgCard";
import Card from "@/app/components/Card";
import SectionTitle from "@/app/components/SectionTitle";
import { HomeSearchBar } from "@/app/components/HomeSearchBar";
import JsonLd from "@/app/components/JsonLd";

export const metadata: Metadata = {
  title: `${SITE_NAME} — Pokemon Pokopia Gift Guide & Wiki`,
  description: SITE_DESCRIPTION,
};

const FEATURES = [
  {
    href: "/matchmaker",
    label: "Matchmaker",
    desc: "Find the best roommates for any Pokemon",
  },
  {
    href: "/items",
    label: "Item Explorer",
    desc: "Browse all items and gift categories",
  },
  {
    href: "/pokedex",
    label: "Pokedex",
    desc: "Filter by habitat, flavor, specialty & more",
  },
  {
    href: "/habitats",
    label: "Habitats",
    desc: "Explore where each Pokemon lives",
  },
] as const;

export default function Home() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Dataset",
          "name": "Pokemon Pokopia Gift Guide Data",
          "description": "Comprehensive database of Pokemon gift preferences, habitats, item categories, specialties, and locations for the game Pokemon Pokopia on Nintendo Switch 2.",
          "url": SITE_URL,
          "creator": {
            "@type": "Organization",
            "name": "Pokopia Picks",
            "url": SITE_URL,
          },
          "license": `${SITE_URL}/about`,
          "keywords": [
            "Pokemon Pokopia",
            "Pokemon gifts",
            "Nintendo Switch 2",
            "Pokemon habitats",
            "gift guide",
          ],
          "inLanguage": "en",
          "isAccessibleForFree": true,
          "isPartOf": {
            "@type": "VideoGame",
            "name": "Pokemon Pokopia",
            "gamePlatform": "Nintendo Switch 2",
          },
        }}
      />
      <div className="max-w-[1080px] mx-auto px-5 pt-8 pb-20 relative z-[1]">
      <header className="text-center mb-5 pt-6 pb-2 px-5">
        <h1 className="font-outfit font-medium text-[clamp(2rem,5vw,3.4rem)] leading-none tracking-[-0.025em] mb-2 text-ink-soft whitespace-nowrap uppercase">
          Pokopia{" "}
          <span className="italic text-accent-deep font-bold">Picks</span>
        </h1>
        <p className="max-w-[600px] mx-auto text-ink-soft text-[15px] leading-[1.65] mb-3">
          The fan-made gift guide for <strong className="text-ink">Pokemon Pokopia</strong>{" "}
          (Nintendo Switch 2). Every Pokemon has favorite item categories —
          gifts that boost their happiness and unlock bonuses in your home.
          Look up any Pokemon to see exactly what to give them, which roommates
          they get along with, and where to find them.
        </p>
        <p className="max-w-[560px] mx-auto text-ink-fade text-[13px] leading-[1.55]">
          Search a Pokemon or browse the collection below. Click any card to see
          the full breakdown.
        </p>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
        {FEATURES.map((f) => (
          <Link key={f.href} href={f.href} className="no-underline">
            <HoverTile className="py-3 px-3.5 text-center h-full">
              <div className="font-outfit font-bold text-[13px] text-ink mb-1">
                {f.label}
              </div>
              <div className="font-mono text-[10px] text-ink-fade tracking-[0.02em] leading-snug">
                {f.desc}
              </div>
            </HoverTile>
          </Link>
        ))}
      </div>

      <Card>
        <HomeSearchBar />
      </Card>

      <Card>
        <SectionTitle className="mb-5">All Pokemon</SectionTitle>
        <div className="grid grid-cols-1 min-[400px]:grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(175px,1fr))] gap-2 sm:gap-3 max-w-[220px] min-[400px]:max-w-none mx-auto min-[400px]:mx-0">
          {POKEMON_LIST.map((p) => (
            <Link
              key={p.slug}
              href={`/pokemon/${p.slug}`}
              className="group cursor-pointer border-none bg-transparent p-0 text-left flex no-underline text-inherit transition-transform duration-150 hover:-translate-y-1 hover:scale-[1.02]"
              aria-label={p.label}
            >
              <TcgCard p={p} size="sm" />
            </Link>
          ))}
        </div>
      </Card>
      </div>
    </>
  );
}
