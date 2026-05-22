import { ITEMS, CATEGORIES } from "@/app/lib/data";
import ItemsClient from "./ItemsClient";
import PageWrap from "@/app/components/PageWrap";
import Breadcrumb from "@/app/components/Breadcrumb";
import PageHeader from "@/app/components/PageHeader";

const ALL_ITEMS = Object.values(ITEMS).sort((a, b) => a.name.localeCompare(b.name));
const ALL_CATS = Object.values(CATEGORIES).sort((a, b) => a.name.localeCompare(b.name));

export default function ItemsPage() {
  return (
    <PageWrap>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Items" }]} />
      <PageHeader title="Items" />
      <ItemsClient items={ALL_ITEMS} categories={ALL_CATS} />
    </PageWrap>
  );
}
