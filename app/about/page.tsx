import type { Metadata } from "next";
import Link from "next/link";
import PageWrap from "@/app/components/PageWrap";
import Breadcrumb from "@/app/components/Breadcrumb";
import Card from "@/app/components/Card";
import SectionTitle from "@/app/components/SectionTitle";
import { SITE_NAME } from "@/app/lib/config";

export const metadata: Metadata = {
  title: "About",
  description: `About ${SITE_NAME} — a fan-made gift guide and wiki for Pokemon Pokopia on Nintendo Switch 2.`,
};

export default function AboutPage() {
  return (
    <PageWrap>
      <Breadcrumb
        items={[{ label: "Home", href: "/" }, { label: "About" }]}
      />

      <Card>
        <SectionTitle className="mb-4">About Pokopia Picks</SectionTitle>
        <div className="space-y-4 text-[14px] text-ink leading-relaxed max-w-[680px]">
          <p>
            <strong>Pokopia Picks</strong> is a free, fan-made reference site
            for <em>Pokemon Pokopia</em>, released on Nintendo Switch 2 on March
            5, 2026. It was built to answer the question every player eventually
            asks: <em>what does this Pokemon actually like?</em>
          </p>
          <p>
            In Pokemon Pokopia, each Pokemon has favorite item categories — gifts
            that increase their happiness and unlock bonuses for your home. With
            hundreds of Pokemon and dozens of item categories, keeping track of
            it all in your head is nearly impossible. Pokopia Picks organizes
            all of that data so you can look up any Pokemon instantly.
          </p>
        </div>
      </Card>

      <Card>
        <SectionTitle className="mb-4">What you can do here</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[14px] text-ink leading-relaxed">
          <div>
            <p className="font-outfit font-bold mb-1">
              <Link href="/pokedex" className="text-accent-deep no-underline hover:underline">
                Pokedex
              </Link>
            </p>
            <p className="text-ink-soft">
              Browse all Pokemon with filters for habitat, type, specialty, and
              flavor. Each entry shows favorite gift categories, best items,
              where to find the Pokemon, and any passive drops.
            </p>
          </div>
          <div>
            <p className="font-outfit font-bold mb-1">
              <Link href="/matchmaker" className="text-accent-deep no-underline hover:underline">
                Matchmaker
              </Link>
            </p>
            <p className="text-ink-soft">
              Find the best Pokemon roommates for any Pokemon. The matchmaker
              shows which Pokemon share a habitat and can live together in your
              Pokopia home.
            </p>
          </div>
          <div>
            <p className="font-outfit font-bold mb-1">
              <Link href="/items" className="text-accent-deep no-underline hover:underline">
                Item Explorer
              </Link>
            </p>
            <p className="text-ink-soft">
              Browse every gift item in Pokemon Pokopia. See which Pokemon like
              each item, which categories it belongs to, and whether any Pokemon
              passively drop it.
            </p>
          </div>
          <div>
            <p className="font-outfit font-bold mb-1">
              <Link href="/habitats" className="text-accent-deep no-underline hover:underline">
                Habitats
              </Link>
            </p>
            <p className="text-ink-soft">
              Explore the game&apos;s habitats and the Pokemon that live in
              each. Useful for planning which Pokemon can share a living space.
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <SectionTitle className="mb-4">About the data</SectionTitle>
        <div className="space-y-4 text-[14px] text-ink leading-relaxed max-w-[680px]">
          <p>
            Game data is sourced from publicly available fan resources and
            in-game research. Pokemon and all related properties are trademarks
            of their respective owners. Pokopia Picks is an unofficial fan
            project and is not affiliated with or endorsed by Nintendo, Game
            Freak, or The Pokemon Company.
          </p>
          <p>
            If you spot an error or missing data,{" "}
            <a
              href="https://forms.gle/4uJkvp1R5xKgd7MU6"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-deep underline"
            >
              submit a report here
            </a>
            .
          </p>
        </div>
      </Card>
    </PageWrap>
  );
}
