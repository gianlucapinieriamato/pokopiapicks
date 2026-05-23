/**
 * migrate-data.ts
 *
 * One-time migration: restructure all cross-references to use typed slugs
 * instead of display-name strings.
 *
 * Run:  npx tsx scripts/migrate-data.ts
 */

import { writeFileSync } from "fs";
import { join } from "path";

// ---------------------------------------------------------------------------
// Step 1: Import all existing data
// ---------------------------------------------------------------------------

// We use dynamic require so the TS compiler doesn't try to resolve @/ alias
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { ITEMS } = require("../app/lib/data/items") as typeof import("../app/lib/data/items");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { CATEGORIES } = require("../app/lib/data/categories") as typeof import("../app/lib/data/categories");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { POKEMON } = require("../app/lib/data/pokemon") as typeof import("../app/lib/data/pokemon");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { HABITATS } = require("../app/lib/data/habitats") as typeof import("../app/lib/data/habitats");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { LOCATIONS } = require("../app/lib/data/locations") as typeof import("../app/lib/data/locations");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { SPECIALTIES } = require("../app/lib/data/specialties") as typeof import("../app/lib/data/specialties");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { HABITAT_REQUIREMENTS } = require("../app/lib/data/habitat-requirements") as typeof import("../app/lib/data/habitat-requirements");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { ITEM_GROUPS } = require("../app/lib/data/item-groups") as typeof import("../app/lib/data/item-groups");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { ITEM_RECIPES } = require("../app/lib/data/crafting") as typeof import("../app/lib/data/crafting");

// ---------------------------------------------------------------------------
// Step 2: Build reverse lookup maps
// ---------------------------------------------------------------------------

const itemNameToSlug = new Map<string, string>();
for (const [displayName, item] of Object.entries(ITEMS)) {
  itemNameToSlug.set(displayName.toLowerCase(), item.slug);
  itemNameToSlug.set(item.slug.toLowerCase(), item.slug); // slug → slug passthrough
}

const catNameToSlug = new Map<string, string>();
for (const [slug, cat] of Object.entries(CATEGORIES)) {
  catNameToSlug.set(cat.name.toLowerCase(), slug);
  catNameToSlug.set(slug.toLowerCase(), slug); // slug → slug passthrough
}

const habitatNameToSlug = new Map<string, string>();
for (const [slug, hab] of Object.entries(HABITATS)) {
  habitatNameToSlug.set(hab.name.toLowerCase(), slug);
  habitatNameToSlug.set(slug.toLowerCase(), slug); // slug → slug passthrough
}

// ---------------------------------------------------------------------------
// Step 3: Helper functions
// ---------------------------------------------------------------------------

let unresolvedItemCount = 0;
let unresolvedCatCount = 0;
const unresolvedItems = new Set<string>();
const unresolvedCats = new Set<string>();

function resolveItemSlug(name: string, context: string): string {
  const slug = itemNameToSlug.get(name.toLowerCase());
  if (!slug) {
    unresolvedItemCount++;
    unresolvedItems.add(`"${name}" (in ${context})`);
    // Generate slug as fallback
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }
  return slug;
}

function resolveItemSlugOrGroup(
  name: string,
  context: string
): { type: "item" | "group"; value: string; name: string; qty?: number } {
  // Handle "(any)" patterns like "Seat (any)", "Bed (any)", "Table (any)"
  if (name.toLowerCase().includes("(any)")) {
    // Extract the group key: "Bed (any)" → "bed", "Seat (any)" → "seat"
    const groupKey = name.toLowerCase().replace(/\s*\(any\)\s*/, "").trim();
    return { type: "group", value: groupKey, name };
  }
  return { type: "item", value: resolveItemSlug(name, context), name };
}

// ---------------------------------------------------------------------------
// Step 4a: Transform ITEMS — re-key by slug
// ---------------------------------------------------------------------------

type ItemOutput = {
  slug: string;
  name: string;
  icon: string | null;
  categories: string[];
};

const newItems: Record<string, ItemOutput> = {};
for (const [, item] of Object.entries(ITEMS)) {
  newItems[item.slug] = { ...item, categories: [...item.categories] };
}

console.log(`Items re-keyed: ${Object.keys(newItems).length}`);

// ---------------------------------------------------------------------------
// Step 4b: Transform CATEGORIES — convert items[] from display names to item slugs
// ---------------------------------------------------------------------------

type CategoryOutput = {
  slug: string;
  name: string;
  items: string[];
};

const newCategories: Record<string, CategoryOutput> = {};
for (const [slug, cat] of Object.entries(CATEGORIES)) {
  newCategories[slug] = {
    ...cat,
    items: cat.items.map((name) =>
      resolveItemSlug(name, `CATEGORIES[${slug}].items`)
    ),
  };
}

console.log(`Categories migrated: ${Object.keys(newCategories).length}`);

// ---------------------------------------------------------------------------
// Step 4c: Transform POKEMON — convert categories[] from display names to
//           category slugs; add habitatSlug
// ---------------------------------------------------------------------------

type PokemonOutput = {
  name: string;
  num: number;
  habitat: string;
  habitatSlug: string;
  categories: string[];
  icon: string;
  slug: string;
  nationalDexNum: number | null;
  spriteHq: string | null;
  types?: readonly string[];
  specialties?: readonly string[];
  flavor?: string | null;
  primaryLocation?: string | null;
  habitatList?: unknown[];
};

const newPokemon: Record<string, PokemonOutput> = {};
for (const [slug, p] of Object.entries(POKEMON)) {
  const habitatSlug =
    habitatNameToSlug.get(p.habitat.toLowerCase()) ??
    p.habitat.toLowerCase().replace(/\s+/g, "-");

  const categories = p.categories.map((name) => {
    const catSlug = catNameToSlug.get(name.toLowerCase());
    if (!catSlug) {
      unresolvedCatCount++;
      unresolvedCats.add(`"${name}" (on pokemon ${slug})`);
    }
    return catSlug ?? name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  });

  newPokemon[slug] = {
    ...p,
    habitatSlug,
    categories,
  };
}

console.log(`Pokemon migrated: ${Object.keys(newPokemon).length}`);

// ---------------------------------------------------------------------------
// Step 4d: Transform LOCATIONS — convert all item arrays from display names to slugs
// ---------------------------------------------------------------------------

type ShopItemOutput = {
  slug: string;
  name: string;
  level: number;
};

type LocationOutput = {
  slug: string;
  name: string;
  description: string;
  objective: string;
  materials: string[];
  blocksAndPlants: string[];
  itemsInArea?: string[];
  itemsInPokeballs?: string[];
  treasure?: string[];
  shopItems?: ShopItemOutput[];
};

const newLocations: Record<string, LocationOutput> = {};
for (const [slug, loc] of Object.entries(LOCATIONS)) {
  const ctx = `LOCATIONS[${slug}]`;
  newLocations[slug] = {
    slug: loc.slug,
    name: loc.name,
    description: loc.description,
    objective: loc.objective,
    materials: (loc.materials ?? []).map((n) =>
      resolveItemSlug(n, `${ctx}.materials`)
    ),
    blocksAndPlants: (loc.blocksAndPlants ?? []).map((n) =>
      resolveItemSlug(n, `${ctx}.blocksAndPlants`)
    ),
    ...(loc.itemsInArea
      ? {
          itemsInArea: loc.itemsInArea.map((n) =>
            resolveItemSlug(n, `${ctx}.itemsInArea`)
          ),
        }
      : {}),
    ...(loc.itemsInPokeballs
      ? {
          itemsInPokeballs: loc.itemsInPokeballs.map((n) =>
            resolveItemSlug(n, `${ctx}.itemsInPokeballs`)
          ),
        }
      : {}),
    ...(loc.treasure
      ? {
          treasure: loc.treasure.map((n) =>
            resolveItemSlug(n, `${ctx}.treasure`)
          ),
        }
      : {}),
    ...(loc.shopItems
      ? {
          shopItems: loc.shopItems.map((s) => ({
            slug: resolveItemSlug(s.name, `${ctx}.shopItems`),
            name: s.name,
            level: s.level,
          })),
        }
      : {}),
  };
}

console.log(`Locations migrated: ${Object.keys(newLocations).length}`);

// ---------------------------------------------------------------------------
// Step 4e: Transform HABITAT_REQUIREMENTS — convert name to slug/group,
//           handle "(any)" patterns
// ---------------------------------------------------------------------------

type HabitatReqOutput = {
  type: "item" | "group";
  value: string;
  name: string;
  qty: number;
};

const newHabitatRequirements: Record<string, HabitatReqOutput[]> = {};
for (const [habitatSlug, reqs] of Object.entries(HABITAT_REQUIREMENTS)) {
  newHabitatRequirements[habitatSlug] = reqs.map((req) => {
    const resolved = resolveItemSlugOrGroup(
      req.name,
      `HABITAT_REQUIREMENTS[${habitatSlug}]`
    );
    return {
      type: resolved.type,
      value: resolved.value,
      name: req.name,
      qty: req.qty,
    };
  });
}

console.log(
  `Habitat requirements migrated: ${Object.keys(newHabitatRequirements).length} habitats`
);

// ---------------------------------------------------------------------------
// Step 4f: Transform ITEM_GROUPS — convert values from display names to item slugs
// ---------------------------------------------------------------------------

const newItemGroups: Record<string, string[]> = {};
for (const [key, names] of Object.entries(ITEM_GROUPS)) {
  newItemGroups[key] = names.map((n) =>
    resolveItemSlug(n, `ITEM_GROUPS[${key}]`)
  );
}

console.log(`Item groups migrated: ${Object.keys(newItemGroups).length}`);

// ---------------------------------------------------------------------------
// Step 4g: Transform ITEM_RECIPES — convert materials.name to item slugs
// ---------------------------------------------------------------------------

type CraftingIngredientOutput = {
  slug: string;
  name: string;
  qty: number;
};

type CraftingRecipeOutput = {
  category: string;
  unlock: string;
  materials: CraftingIngredientOutput[];
};

const newItemRecipes: Record<string, CraftingRecipeOutput> = {};
for (const [slug, recipe] of Object.entries(ITEM_RECIPES)) {
  newItemRecipes[slug] = {
    category: recipe.category,
    unlock: recipe.unlock,
    materials: recipe.materials.map((m) => ({
      slug: resolveItemSlug(m.name, `ITEM_RECIPES[${slug}].materials`),
      name: m.name,
      qty: m.qty,
    })),
  };
}

console.log(`Item recipes migrated: ${Object.keys(newItemRecipes).length}`);

// ---------------------------------------------------------------------------
// Step 5: Write the new files
// ---------------------------------------------------------------------------

const DATA_DIR = join(process.cwd(), "app", "lib", "data");

function writeDataFile(
  filename: string,
  exportName: string,
  typeAnnotation: string,
  typeImport: string,
  data: object
) {
  const header = `// AUTO-GENERATED by scripts/migrate-data.ts — do not edit by hand\n`;
  const importLine = typeImport
    ? `import type { ${typeImport} } from "../types";\n\n`
    : "";
  const body = `export const ${exportName}: ${typeAnnotation} = ${JSON.stringify(data, null, 2)} as const;\n`;
  const content = header + importLine + body;
  writeFileSync(join(DATA_DIR, filename), content, "utf-8");
  console.log(`  Wrote ${filename} (${Object.keys(data).length} entries)`);
}

console.log("\nWriting migrated data files...");

writeDataFile(
  "items.ts",
  "ITEMS",
  "Record<string, ItemEntry>",
  "ItemEntry",
  newItems
);

writeDataFile(
  "categories.ts",
  "CATEGORIES",
  "Record<string, CategoryEntry>",
  "CategoryEntry",
  newCategories
);

writeDataFile(
  "pokemon.ts",
  "POKEMON",
  "Record<string, PokemonEntry>",
  "PokemonEntry",
  newPokemon
);

writeDataFile(
  "locations.ts",
  "LOCATIONS",
  "Record<string, LocationEntry>",
  "LocationEntry",
  newLocations
);

writeDataFile(
  "habitat-requirements.ts",
  "HABITAT_REQUIREMENTS",
  "Record<string, HabitatRequirement[]>",
  "HabitatRequirement",
  newHabitatRequirements
);

writeDataFile(
  "item-groups.ts",
  "ITEM_GROUPS",
  "Record<string, string[]>",
  "",
  newItemGroups
);

writeDataFile(
  "crafting.ts",
  "ITEM_RECIPES",
  "Record<string, CraftingRecipe>",
  "CraftingRecipe",
  newItemRecipes
);

// SPECIALTIES doesn't need migration (already uses slugs), but re-write for
// consistency with the auto-generated header.
// We skip it to avoid touching files that don't need changes.
console.log("  Skipped specialties.ts (no cross-ref migration needed)");

// ---------------------------------------------------------------------------
// Step 6: Summary
// ---------------------------------------------------------------------------

console.log("\n=== MIGRATION COMPLETE ===");
console.log(`Items re-keyed: ${Object.keys(newItems).length}`);
console.log(`Categories migrated: ${Object.keys(newCategories).length}`);
console.log(`Pokemon migrated: ${Object.keys(newPokemon).length}`);
console.log(`Locations migrated: ${Object.keys(newLocations).length}`);
console.log(
  `Habitat requirements migrated: ${Object.keys(newHabitatRequirements).length} habitats`
);
console.log(`Item groups migrated: ${Object.keys(newItemGroups).length}`);
console.log(`Item recipes migrated: ${Object.keys(newItemRecipes).length}`);

if (unresolvedItemCount > 0) {
  console.log(
    `\n[UNRESOLVED ITEMS] ${unresolvedItemCount} total unresolved item name(s):`
  );
  for (const msg of [...unresolvedItems].sort()) {
    console.log(`  - ${msg}`);
  }
} else {
  console.log("\nNo unresolved item references.");
}

if (unresolvedCatCount > 0) {
  console.log(
    `\n[UNRESOLVED CATEGORIES] ${unresolvedCatCount} total unresolved category name(s):`
  );
  for (const msg of [...unresolvedCats].sort()) {
    console.log(`  - ${msg}`);
  }
} else {
  console.log("No unresolved category references.");
}
