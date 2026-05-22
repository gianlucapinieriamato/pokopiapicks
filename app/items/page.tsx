import type { Metadata } from "next";
import { ITEMS, CATEGORIES, POKEMON_LIST, catSlug } from "@/app/lib/data";
import JsonLd from "@/app/components/JsonLd";
import { SITE_URL } from "@/app/lib/config";

export const metadata: Metadata = {
  title: "Items & Gift Categories",
  description: `Browse all gift items and categories in Pokemon Pokopia. Filter by category to find the perfect item for any Pokemon.`,
};
import ItemsClient from "./ItemsClient";
import PageWrap from "@/app/components/PageWrap";
import Breadcrumb from "@/app/components/Breadcrumb";
import PageHeader from "@/app/components/PageHeader";

const ALL_ITEMS = Object.values(ITEMS);
const ALL_CATS = Object.values(CATEGORIES);

const pkmnCountByCat: Record<string, number> = {};
for (const p of POKEMON_LIST) {
  for (const cat of p.categories) {
    const s = catSlug(cat);
    pkmnCountByCat[s] = (pkmnCountByCat[s] ?? 0) + 1;
  }
}

export default function ItemsPage() {
  return (
    <PageWrap>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Items & Gift Categories",
        description: `Browse all ${ALL_ITEMS.length} gift items and ${ALL_CATS.length} categories in Pokemon Pokopia.`,
        url: `${SITE_URL}/items`,
      }} />
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Items" }]} />
      <PageHeader title="Items" />
      <ItemsClient items={ALL_ITEMS} categories={ALL_CATS} pkmnCountByCat={pkmnCountByCat} />
    </PageWrap>
  );
}
