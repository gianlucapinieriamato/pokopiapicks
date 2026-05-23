/**
 * scripts/gen-consts.ts
 * Generates app/lib/data/consts.ts and scripts/consts-map.json
 * from the existing data files.
 *
 * Run with: npx tsx scripts/gen-consts.ts
 */

import { writeFileSync } from "fs";
import { join } from "path";
import { CATEGORIES } from "../app/lib/data/categories";
import { HABITATS } from "../app/lib/data/habitats";
import { ITEMS } from "../app/lib/data/items";
import { LOCATIONS } from "../app/lib/data/locations";
import { SPECIALTIES } from "../app/lib/data/specialties";
import { POKEMON } from "../app/lib/data/pokemon";

// ---------------------------------------------------------------------------
// Helper: convert a display name to a PascalCase identifier
// "Blocky stuff" → "BlockyStuff"
// "Smooth tall grass" → "SmoothTallGrass"
// "DJ" → "Dj"  (lower-cased all-caps words are kept as-is via word boundary)
// ---------------------------------------------------------------------------
function toPascalCase(name: string): string {
  return name
    .split(/[\s\-_/()]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("")
    .replace(/[^A-Za-z0-9]/g, "");
}

// ---------------------------------------------------------------------------
// Collect data
// ---------------------------------------------------------------------------

// 1. Categories (43)
const categories = Object.values(CATEGORIES).map((c) => ({
  slug: c.slug,
  name: c.name,
  key: toPascalCase(c.name),
}));

// 2. Habitat configs (201) — entries in HABITATS
const habitatConfigs = Object.values(HABITATS).map((h) => ({
  slug: h.slug,
  name: h.name,
  key: toPascalCase(h.name),
}));

// 3. Locations (6)
const locations = Object.values(LOCATIONS).map((l) => ({
  slug: l.slug,
  name: l.name,
  key: toPascalCase(l.name),
}));

// 4. Specialties (31)
const specialties = Object.values(SPECIALTIES).map((s) => ({
  slug: s.slug,
  name: s.name,
  key: toPascalCase(s.name),
}));

// Helper: display name → slug ("Bright light" → "bright-light", "Dry" → "dry")
const toSlug = (v: string) => v.toLowerCase().replace(/\s+/g, "-");

// 5. PokemonHabitat — derived from distinct pokemon.habitat display names, stored as slugs
const pokemonHabitatSet = new Set<string>();
for (const p of Object.values(POKEMON) as any[]) {
  if (p.habitat) pokemonHabitatSet.add(p.habitat as string);
}
const pokemonHabitats = [...pokemonHabitatSet]
  .sort()
  .map((displayName) => ({
    slug: toSlug(displayName), // "dry", "bright", etc.
    name: displayName,
    key: toPascalCase(displayName),
  }));

// 6. Weather — slugified values (e.g. "Sun" → "sun")
const weatherSet = new Set<string>();
for (const p of Object.values(POKEMON) as any[]) {
  for (const h of p.habitatList ?? []) {
    for (const w of h.weather ?? []) weatherSet.add(w);
  }
}
const weatherEntries = [...weatherSet].sort().map((v) => ({ slug: toSlug(v), name: v, key: toPascalCase(v) }));

// 7. Time — slugified values (e.g. "Morning" → "morning")
const timeSet = new Set<string>();
for (const p of Object.values(POKEMON) as any[]) {
  for (const h of p.habitatList ?? []) {
    for (const t of h.time ?? []) timeSet.add(t);
  }
}
const timeEntries = [...timeSet].sort().map((v) => ({ slug: toSlug(v), name: v, key: toPascalCase(v) }));

// 8. Rarity — slugified values (e.g. "Common" → "common")
const raritySet = new Set<string>();
for (const p of Object.values(POKEMON) as any[]) {
  for (const h of p.habitatList ?? []) {
    if (h.rarity) raritySet.add(h.rarity);
  }
}
const rarityEntries = [...raritySet].sort().map((v) => ({ slug: toSlug(v), name: v, key: toPascalCase(v) }));

// 9. Flavor — slugified values (e.g. "Dry" → "dry")
const flavorSet = new Set<string>();
for (const p of Object.values(POKEMON) as any[]) {
  if (p.flavor) flavorSet.add(p.flavor);
}
const flavorEntries = [...flavorSet].sort().map((v) => ({ slug: toSlug(v), name: v, key: toPascalCase(v) }));

// 10. Items (878) — slug → name lookup
const itemEntriesRaw = Object.values(ITEMS).map((i) => ({
  slug: i.slug,
  name: i.name,
  key: toPascalCase(i.name),
}));

// 11. Pokemon (308) — slug → name lookup
const pokemonEntriesRaw = Object.values(POKEMON).map((p) => ({
  slug: p.slug,
  name: p.name,
  key: toPascalCase(p.name),
}));

// ---------------------------------------------------------------------------
// De-duplicate keys within each group (in case two entries produce same key)
// ---------------------------------------------------------------------------
function dedup(
  entries: { slug: string; name: string; key: string }[]
): { slug: string; name: string; key: string }[] {
  const seen = new Map<string, number>();
  return entries.map((e) => {
    const count = seen.get(e.key) ?? 0;
    seen.set(e.key, count + 1);
    return count === 0 ? e : { ...e, key: `${e.key}${count + 1}` };
  });
}

const catEntries = dedup(categories);
const habEntries = dedup(habitatConfigs);
const locEntries = dedup(locations);
const spEntries = dedup(specialties);
const phEntries = dedup(pokemonHabitats);
const wxEntries = dedup(weatherEntries);
const tmEntries = dedup(timeEntries);
const rrEntries = dedup(rarityEntries);
const flEntries = dedup(flavorEntries);
const itemEntries = dedup(itemEntriesRaw);
const pokemonEntries = dedup(pokemonEntriesRaw);

// ---------------------------------------------------------------------------
// Build the slug → "Group.Key" lookup map (consts-map.json)
// ---------------------------------------------------------------------------
// We need separate maps per field to avoid collision (e.g. "dry" as location vs habitatSlug)
const constsMap: Record<string, string> = {};

for (const e of catEntries) {
  constsMap[`Category::${e.slug}`] = `Category.${e.key}`;
}
for (const e of habEntries) {
  constsMap[`HabitatConfig::${e.slug}`] = `HabitatConfig.${e.key}`;
}
for (const e of locEntries) {
  constsMap[`Location::${e.slug}`] = `Location.${e.key}`;
}
for (const e of spEntries) {
  constsMap[`Specialty::${e.slug}`] = `Specialty.${e.key}`;
}
for (const e of phEntries) {
  constsMap[`PokemonHabitat::${e.slug}`] = `PokemonHabitat.${e.key}`;
}
for (const e of wxEntries) {
  constsMap[`Weather::${e.slug}`] = `Weather.${e.key}`;
}
for (const e of tmEntries) {
  constsMap[`Time::${e.slug}`] = `Time.${e.key}`;
}
for (const e of rrEntries) {
  constsMap[`Rarity::${e.slug}`] = `Rarity.${e.key}`;
}
for (const e of flEntries) {
  constsMap[`Flavor::${e.slug}`] = `Flavor.${e.key}`;
}
for (const e of itemEntries) {
  constsMap[`Item::${e.slug}`] = `Item.${e.key}`;
}
for (const e of pokemonEntries) {
  constsMap[`Pokemon::${e.slug}`] = `Pokemon.${e.key}`;
}

// ---------------------------------------------------------------------------
// Generate consts.ts content
// ---------------------------------------------------------------------------
function buildConstBlock(
  groupName: string,
  typeName: string,
  entries: { slug: string; name: string; key: string }[],
  comment: string
): string {
  const maxKeyLen = Math.max(...entries.map((e) => e.key.length));
  const rows = entries
    .map((e) => {
      const pad = " ".repeat(maxKeyLen - e.key.length + 2);
      return `  ${e.key}:${pad}"${e.slug}",`;
    })
    .join("\n");

  return `/** ${comment} */
export const ${groupName} = {
${rows}
} as const;
export type ${typeName} = typeof ${groupName}[keyof typeof ${groupName}];
`;
}

const banner = `// AUTO-GENERATED by scripts/gen-consts.ts — do not edit by hand
// Re-run \`npx tsx scripts/gen-consts.ts\` after adding or renaming slugs.
`;

const constsTs =
  banner +
  "\n" +
  buildConstBlock("Category",      "CategorySlug",      catEntries, `Category slugs (${catEntries.length})`) +
  "\n" +
  buildConstBlock("HabitatConfig", "HabitatConfigSlug", habEntries, `Habitat configuration slugs — habitatList[].habitatSlug (${habEntries.length})`) +
  "\n" +
  buildConstBlock("Location",      "LocationSlug",      locEntries, `Location slugs (${locEntries.length})`) +
  "\n" +
  buildConstBlock("Specialty",     "SpecialtySlug",     spEntries,  `Specialty slugs (${spEntries.length})`) +
  "\n" +
  buildConstBlock("PokemonHabitat","PokemonHabitatSlug",phEntries,  `Top-level pokemon habitat-type display names — pokemon.habitat (${phEntries.length})`) +
  "\n" +
  buildConstBlock("Weather",       "WeatherValue",      wxEntries,  `Weather conditions — habitatList[].weather (${wxEntries.length})`) +
  "\n" +
  buildConstBlock("Time",          "TimeValue",         tmEntries,  `Time-of-day values — habitatList[].time (${tmEntries.length})`) +
  "\n" +
  buildConstBlock("Rarity",        "RarityValue",       rrEntries,  `Spawn rarity values — habitatList[].rarity (${rrEntries.length})`) +
  "\n" +
  buildConstBlock("Flavor",        "FlavorValue",       flEntries,  `Pokemon flavor preferences — pokemon.flavor (${flEntries.length})`) +
  "\n" +
  buildConstBlock("Item",          "ItemSlug",          itemEntries,    `Item slugs (${itemEntries.length})`) +
  "\n" +
  buildConstBlock("Pokemon",       "PokemonSlug",       pokemonEntries, `Pokemon slugs (${pokemonEntries.length})`);

// ---------------------------------------------------------------------------
// Write files
// ---------------------------------------------------------------------------
const root = join(__dirname, "..");

const constsPath = join(root, "app", "lib", "data", "consts.ts");
writeFileSync(constsPath, constsTs, "utf-8");
console.log(`Wrote ${constsPath}`);

const mapPath = join(root, "scripts", "consts-map.json");
writeFileSync(mapPath, JSON.stringify(constsMap, null, 2), "utf-8");
console.log(`Wrote ${mapPath}`);

// Print summary
console.log("\nSummary:");
console.log(`  Category:      ${catEntries.length} entries`);
console.log(`  HabitatConfig: ${habEntries.length} entries`);
console.log(`  Location:      ${locEntries.length} entries`);
console.log(`  Specialty:     ${spEntries.length} entries`);
console.log(`  PokemonHabitat: ${phEntries.length} entries`);
console.log(`  Weather:        ${wxEntries.length} entries`);
console.log(`  Time:           ${tmEntries.length} entries`);
console.log(`  Rarity:         ${rrEntries.length} entries`);
console.log(`  Flavor:         ${flEntries.length} entries`);
console.log(`  Item:           ${itemEntries.length} entries`);
console.log(`  Pokemon:        ${pokemonEntries.length} entries`);
