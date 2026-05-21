import Link from "next/link";
import { ITEMS, CATEGORIES } from "@/app/lib/data";
import ItemsClient from "./ItemsClient";

const ALL_ITEMS = Object.values(ITEMS).sort((a, b) => a.name.localeCompare(b.name));
const ALL_CATS = Object.values(CATEGORIES).sort((a, b) => a.name.localeCompare(b.name));

export default function ItemsPage() {
  return (
    <div className="detail-wrap">
      <div className="breadcrumb">
        <Link href="/">Home</Link><span>›</span><span>Items</span>
      </div>
      <div className="detail-header">
        <div className="detail-title">Items</div>
      </div>
      <ItemsClient items={ALL_ITEMS} categories={ALL_CATS} />
    </div>
  );
}
