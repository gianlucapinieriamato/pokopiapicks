import { existsSync } from "fs";
import { join } from "path";
import { ITEMS } from "@/app/lib/data";
import type { ResolvedItem } from "@/app/lib/types";

// Scraped names that differ from canonical ITEMS keys or correct display names
export const NAME_FIXES: Record<string, string> = {
  "Beautiful flower seeds": "Beautiful flower",
  "Elegant flower seed": "Elegant flower",
  "Wooden chair": "Wooden stool",
  "Grubby rag": "Grubby rags",
  "Speakers": "Speaker",
  "Public chair": "Public Seat",
};

// Items whose icon filename on Serebii differs from the name-derived path
export const ICON_OVERRIDES: Record<string, string> = {
  "Pecha tree seed": "/icons/items/pechaseeds.png",
  "Public chair": "/icons/items/publicseat.png",
  "Speakers": "/icons/items/speaker.png",
  "PP Up": "/icons/items/ppup.png",
};

export function resolveItem(name: string): ResolvedItem {
  const displayName = NAME_FIXES[name] ?? name;
  if (ICON_OVERRIDES[name]) return { icon: ICON_OVERRIDES[name], slug: undefined, displayName };

  const canonical = NAME_FIXES[name] ?? name;
  const entry = ITEMS[canonical] ?? ITEMS[name];
  if (entry) return { icon: entry.icon, slug: entry.slug, displayName };

  const baseName = name.endsWith(" Recipe") ? name.slice(0, -7) : name;
  const baseEntry = ITEMS[baseName];
  if (baseEntry) return { icon: baseEntry.icon, slug: baseEntry.slug, displayName };

  const derivedPath = `/icons/items/${baseName.toLowerCase().replace(/\s+/g, "")}.png`;
  if (existsSync(join(process.cwd(), "public", derivedPath))) return { icon: derivedPath, slug: undefined, displayName };

  return { icon: null, slug: undefined, displayName };
}
