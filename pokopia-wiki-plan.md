# Pokopia Wiki — Implementation plan

## Context

Project: web tool for the game Pokémon Pokopia. Currently a single self-contained `index.html` with data scraped from Serebii (308 Pokémon, 608 items, 43 favorite categories).

**Target stack:** Next.js with `output: 'export'` (static export, file-system routing). Migration happens after Tier 1.

**Repo:** github.com/gianlucapinieriamato/pokopia-wiki

**Primary data source:** Serebii (https://www.serebii.net/pokemonpokopia/).
**High-quality sprite source:** PokéAPI sprites repo (raw.githubusercontent.com/PokeAPI/sprites).

---

## Final folder structure

```
/data/                  # JSON files — source of truth, imported by Next at build time
  pokemon.json
  specialties.json
  habitats.json
  locations.json
  items.json            # extracted from current embedded JSON
  favorite-categories.json   # 43 categories + their items (already scraped in Tier 0)
/icons/                 # mirrored icons, already exists
  pokemon/
  items/
  sprites-hq/           # (Tier 2) PokéAPI official artwork by national dex num
/scripts/
  scrape_tier1.py       # Serebii scraper
  download_sprites.py   # Tier 2: download HQ sprites
  cache/                # downloaded HTML, .gitignored
/index.html             # transitional, deleted in Phase 3 (Next.js migration)
/app/                   # (Phase 3+) Next.js App Router
  pokemon/[slug]/
  habitat/[slug]/
  location/[slug]/
  specialty/[slug]/
  item/[slug]/
  lookup/
  ...
```

---

## General rules (apply to all phases)

1. **One commit per sub-phase**, descriptive English message like `feat(tier1): add specialties.json with descriptions`.
2. **Show result to user before advancing from one sub-phase to the next.** Pause and wait for explicit approval. (Suspended during unsupervised overnight runs — see `OVERNIGHT_RUN.md`.)
3. **If a decision isn't covered by the plan, ask the user before implementing.** No improvisation.
4. **Scraper:** `requests` + regex, NO BeautifulSoup. Crawl-delay 1.5–2s, no parallelization. Local cache in `/scripts/cache/`. Retry 3x with exponential backoff.
5. **Slugs lowercase, URL-safe, no special characters.** Cross-references between datasets always by slug, never by display name.
6. **Schemas are immutable once validated.** If you need to change a schema mid-tier, first migrate existing data, then continue.
7. **Don't touch `index.html` during Tier 1 and Tier 2.** It's replaced entirely in Phase 3.
8. **Language:** English default, Spanish toggle (Tier 0 i18n is intact). New JSON files are in English (Serebii data). Do not translate anything in this plan.

---

# Tier 1 — Expand the dataset (the most critical tier)

## Sub-phase 1.1 — Setup

- Create `/data/`, `/scripts/`, `/scripts/cache/`.
- Add `/scripts/cache/` to `.gitignore`.
- Move the dataset embedded in the current `index.html` to `/data/pokemon.json` and `/data/favorite-categories.json` (separate Pokémon from favorite categories).
- **DO NOT touch `index.html`** — keep its inline data. The `/data/*.json` files are the source of truth from now on.
- Commit: `chore(tier1): scaffold data/ and scripts/ directories`.

## Sub-phase 1.2 — Specialties (31 entries)

- Index URL: https://www.serebii.net/pokemonpokopia/specialty.shtml
- Per-specialty URL: https://www.serebii.net/pokemonpokopia/pokedex/specialty/{slug}.shtml
- Generate `/data/specialties.json`:

```json
{
  "crush": {
    "slug": "crush",
    "name": "Crush",
    "description": "Pokemon with the Crush specialty can mash materials into different things",
    "pokemon": []
  }
}
```

- **`pokemon: []` empty for now** — populated in sub-phase 1.5 as a reverse lookup. Explicit placeholder beats partial data.
- Verify: descriptions are complete (not truncated), 31 entries.
- Commit: `feat(tier1): add specialties.json (descriptions, reverse-lookup pending)`.

## Sub-phase 1.3 — Locations (5 areas)

- Index URL: https://www.serebii.net/pokemonpokopia/locations.shtml
- Per-location URL: https://www.serebii.net/pokemonpokopia/locations/{slug}.shtml
- Slugs: `witheredwastelands`, `bleakbeach`, `rockyridges`, `sparklingskylands`, `palettetown`.
- Schema:

```json
{
  "witheredwastelands": {
    "slug": "witheredwastelands",
    "name": "Withered Wastelands",
    "description": "...",
    "objective": "...",
    "materials": ["Sturdy stick", "Stone", "..."],
    "blocksAndPlants": ["Tall grass", "Moss", "..."]
  }
}
```

- **Check Dream Island / Cloud Island:** Serebii may have more than 5 locations if you include these. If they appear, add them with their own slugs.
- Commit: `feat(tier1): add locations.json`.

## Sub-phase 1.4 — Habitats (~210 entries)

- Index URL: https://www.serebii.net/pokemonpokopia/habitats.shtml
- Per-habitat URL: https://www.serebii.net/pokemonpokopia/habitatdex/{slug}.shtml
- IMPORTANT: these are the game-specific habitats ("Tall Grass", "Boulder-shaded Tall Grass", "Tree-shaded flower bed"). NOT to be confused with "Ideal Habitat" (Dry/Bright/Warm/Cool/Dark/Humid), which is already in `pokemon.json` as the `habitat` field.
- Schema:

```json
{
  "smoothtallgrass": {
    "slug": "smoothtallgrass",
    "name": "Smooth tall grass",
    "description": "...",
    "pokemon": []
  }
}
```

- **`pokemon: []` is also a placeholder** — populated in sub-phase 1.5.
- Expected: ~210 habitats. If the scrape returns less than 90%, pause and report before commit.
- Commit: `feat(tier1): add habitats.json (~210 entries, reverse-lookup pending)`.

## Sub-phase 1.5 — Per-Pokémon details (CRITICAL)

URL: https://www.serebii.net/pokemonpokopia/pokedex/{slug}.shtml (~308 pages)

**One fetch per Pokémon.** Extract these 5 fields from each page in a single pass:

- `specialties`: array of slugs (e.g., `["crush", "bulldoze"]`). Include primary AND secondary.
- `flavor`: one normalized word, no plural "s". Values: `"Dry" | "Sour" | "Spicy" | "Sweet" | "Bitter"`.
- `habitatList`: array of:

```json
  {
    "habitatSlug": "smoothtallgrass",
    "locations": ["witheredwastelands", "bleakbeach", "..."],
    "rarity": "Common" | "Rare",
    "time": ["Morning", "Day", "Evening", "Night"],
    "weather": ["Sun", "Cloud", "Rain"],
    "isCloudIsland": false
  }
```

- `primaryLocation`: slug of the first location where the Pokémon appears. `null` if not applicable (legendaries with no fixed location).
- `nationalDexNum`: integer. Extract from the icon filename (`448.png` → 448) or from the individual page. For variant forms (Paldean, etc.), use the base number.

**Error handling rules:**

- If a field fails for a Pokémon, log it and continue with the other fields of the same Pokémon. DO NOT abort the entire page.
- At the end, summary report:
  - Pokémon with all 5 fields complete: X
  - Pokémon with any null field: Y
  - List of incomplete Pokémon with which fields are missing
- If >5% (>15 Pokémon) have incomplete fields, **pause and show before commit**.

**After extracting data:**

- Reconstruct `specialties[].pokemon` as a reverse lookup from `pokemon.json` and update `/data/specialties.json`.
- Reconstruct `habitats[].pokemon` as a reverse lookup from `pokemon.json` and update `/data/habitats.json`.

**Commit (ONE only, with all 3 files updated):**
`feat(tier1): per-pokemon details + reverse-lookup for specialties and habitats`

## Sub-phase 1.6 — Final Tier 1 validation

Before closing Tier 1, run integrity checks:

- Every `specialties[]` in `pokemon.json` references slugs that exist in `specialties.json`.
- Every `habitatList[].habitatSlug` references slugs that exist in `habitats.json`.
- Every `habitatList[].locations[]` references slugs that exist in `locations.json`.
- Every `primaryLocation` references a slug that exists in `locations.json` (or is `null`).
- Every slug in `specialties[].pokemon` and `habitats[].pokemon` references a slug that exists in `pokemon.json`.

If there are errors, list them all before any fix. DO NOT silently fix — they may be symptoms of scraper bugs.

Final commit if everything passes: `chore(tier1): validation passes — all cross-references consistent`.

**Tier 1 acceptance criteria:** all 5 JSON files exist, are consistent with each other, summary report shows no major errors.

---

# Tier 2 — High-quality sprites

## Sub-phase 2.1 — Download HQ sprites from PokéAPI

- Source: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/{nationalDexNum}.png`
- For each Pokémon in `pokemon.json`, download the corresponding sprite to `/icons/sprites-hq/{slug}.png` (rename to Pokopia slug, not national number, for consistency with the rest of the project).
- For alternate forms (Paldean Wooper, Tatsugiri forms, Stereo Rotom, etc.), PokéAPI has files like `194-paldea.png`. Map accordingly; if a specific form isn't available, fall back to the base sprite with a log.
- License: PokéAPI sprites is BSD-3-Clause. Create `/icons/sprites-hq/LICENSE.md` with the appropriate attribution.
- Script: `/scripts/download_sprites.py`. Idempotent — only download if the file doesn't exist locally.
- Commit: `feat(tier2): high-quality official artwork sprites from PokeAPI`.

## Sub-phase 2.2 — Update `pokemon.json` with sprite paths

- Add field `spriteHq: "/icons/sprites-hq/{slug}.png"` to each Pokémon (or `null` if download failed).
- Keep the existing `icon` field (small Serebii sprite) — useful for lists/grids where resolution isn't needed.
- Commit: `feat(tier2): add spriteHq paths to pokemon.json`.

**Tier 2 acceptance criteria:** all Pokémon have `spriteHq` populated (or `null` documented with reason).

---

# Phase 3 — Migration to Next.js

## Sub-phase 3.1 — Next scaffolding

- `npx create-next-app@latest` on a separate branch (`feat/nextjs-migration`).
  - TypeScript: yes
  - Tailwind: yes (matches current style with less boilerplate)
  - App Router: yes
  - `src/` directory: no (we want `/app` at root)
  - Import alias: `@/*`
- Configure `next.config.js`:

```js
module.exports = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
};
```

- Verify that `npm run build` generates `/out/` correctly.
- Commit: `chore(next): scaffold Next.js with static export config`.

## Sub-phase 3.2 — Migrate current UI to `app/page.tsx`

- Replicate the current home (search bar + Pokémon card) as a React component in `app/page.tsx`.
- Move styles to Tailwind (or `app/globals.css` + modules). Keep look & feel identical to current.
- Import data: `import pokemon from '@/data/pokemon.json'`. Bundler includes it at build time.
- EN/ES toggle same as current, persisted in `localStorage`.
- Verify: visually identical to current `index.html`, search works, clicking a suggestion shows the detail.
- Commit: `feat(next): migrate home view to Next App Router`.

## Sub-phase 3.3 — Delete old `index.html`

- Confirm the Next home works in `npm run dev` and in `npm run build && npx serve out/`.
- Delete `/index.html` and any legacy assets (duplicated inline CSS/JS).
- Update README with dev/build instructions.
- Commit: `chore(next): remove legacy index.html`.

## Sub-phase 3.4 — Vercel deployment

- Use the Vercel MCP (already connected) to deploy the project.
- Verify `npm run build` produces `out/` correctly first.
- Create a Vercel project linked to this repo. Build command: `npm run build`. Output directory: `out/`. Framework preset: Next.js.
- Trigger a deploy and confirm the preview URL works.
- Document the URL in README.
- This sub-phase runs autonomously via the MCP — no user intervention needed.

**Phase 3 acceptance criteria:** site deployed, functionally identical to original `index.html`.

---

# Tier 3 — Individual pages and advanced lookup

From here, each sub-phase adds a new dynamic route with its page.

## Sub-phase 3.5 — `/pokemon/[slug]`

- Individual page for each Pokémon. Layout inspired by pokopiawiki.com (which you've seen): large sprite, info, navigation between dex numbers.
- Generate with `generateStaticParams` from `pokemon.json`.
- Content:
  - Header: HQ sprite, name, #national / #pokopia dex, types (if we add them from PokéAPI later — omit for now if missing)
  - **Pokémon navigation:** ◀ Prev / Next ▶ buttons that go to the previous/next Pokémon by Pokopia dex number. Next URL: `/pokemon/{slug}`. Left/right arrow keys also navigate.
  - Ideal habitat (Dry/Bright/etc.) + flavor.
  - Specialties as clickable pills → link to `/specialty/[slug]`.
  - Favorite categories as pills → link to `/category/[slug]` (defined in sub-phase 3.10).
  - List of items the Pokémon likes, grouped by category, with "best gifts" highlighted (same as current home).
  - Habitat list: where it appears (habitat + locations + rarity + time + weather) — each habitat links to `/habitat/[slug]`, locations to `/location/[slug]`.
- Commit: `feat(tier3): pokemon detail pages with navigation`.

## Sub-phase 3.6 — `/habitat/[slug]`

- Page per habitat (~210). Header with name + description.
- Grid of Pokémon that spawn there (sprite + name + link to `/pokemon/[slug]`).
- Commit: `feat(tier3): habitat detail pages`.

## Sub-phase 3.7 — `/location/[slug]`

- Page per location (5+). Header with name + description + objective.
- Three sections:
  - **Materials** (flat list).
  - **Plants & Blocks** (flat list).
  - **Pokémon that appear here** (grid, derived from `pokemon.json` filtering by `habitatList[].locations` that include this slug).
- Commit: `feat(tier3): location detail pages`.

## Sub-phase 3.8 — `/specialty/[slug]`

- Page per specialty (31). Header with name + description.
- Grid of Pokémon that have it (sprite + name + link).
- Commit: `feat(tier3): specialty detail pages`.

## Sub-phase 3.9 — `/item/[slug]`

- Page per item (608). Header with name + icon.
- List of favorite categories it belongs to (linked to `/category/[slug]`).
- List of Pokémon that like it (grid).
- Commit: `feat(tier3): item detail pages`.

## Sub-phase 3.10 — `/category/[slug]`

- Page per favorite category (43, e.g., "Stone stuff", "Blocky stuff").
- Header with name.
- Items section: grid of items in this category (link to `/item/[slug]`).
- Pokémon section: grid of Pokémon that like it (link to `/pokemon/[slug]`).
- Commit: `feat(tier3): favorite category detail pages`.

## Sub-phase 3.11 — `/pokedex` (navigable index)

- Paginated list of all 308 Pokémon in Pokopia dex order. Cards with sprite + name + #dex + types/habitat.
- Side filters: by habitat (Dry/Bright/...), by specialty, by flavor.
- Search at the top of the page (identical to current search).
- Commit: `feat(tier3): pokedex index page with filters`.

## Sub-phase 3.12 — `/lookup` (Advanced Lookup)

- Advanced search page with combinable filters:
  - Ideal habitat (multi-select)
  - Specialty (multi-select)
  - Favorite categories (multi-select)
  - Flavor (multi-select)
  - Primary location (multi-select)
- Result: grid of Pokémon that match ALL filters (AND), with counts.
- No pagination: if more than 50 results, show warning. If 0, show empty message.
- Commit: `feat(tier3): advanced lookup page`.

## Sub-phase 3.13 — Global navigation

- Consistent header across all pages with links: Home, Pokédex, Lookup, (future: Roommate Matchmaker).
- Breadcrumbs on each detail page (e.g., Home › Pokédex › Lucario).
- Minimal footer with credits to Serebii and PokéAPI.
- Commit: `feat(tier3): global navigation and breadcrumbs`.

## Sub-phase 3.14 — Basic SEO

- Metadata per page: `<title>`, `<meta description>`, OpenGraph tags (for Twitter/Discord previews).
- Auto-generated `sitemap.xml` from JSON.
- `robots.txt`.
- Commit: `feat(tier3): SEO metadata and sitemap`.

**Tier 3 acceptance criteria:** all pages exist, navigation works, lookup returns correct results. Deployed to production.

---

# Tier 4 — Roommate Matchmaker

## Sub-phase 4.1 — Matchmaking logic

- Page `/matchmaker` (or `/roommates`).
- Input: user picks an "anchor" Pokémon (the one already in a room).
- Output: ranked list of recommended companions, based on:
  - **Same `habitat` (Dry/Bright/etc.) — hard requirement.** Game rules say no crossing habitat lines in housing.
  - Items in common (overlap between `categories` of both Pokémon) — score by number of shared items.
  - Complementary specialties — bonus if they have different specialties that pair well (e.g., Build + Crush, Burn + Search).
- Show top 10 with visible score and breakdown (how many items shared, which specialties).

## Sub-phase 4.2 — Suggested groups

- "Build me a group of 4 around X" button — system builds a group of 4 Pokémon that maximizes items in common across all 4 (same habitat).
- Simple greedy algorithm: start with anchor, keep adding the Pokémon with the most items in common with the current group.

## Sub-phase 4.3 — Polish

- Attractive UI with large sprites, smooth match appearance animations.
- Allow comparing two Pokémon side-by-side showing overlap.
- Final commit: `feat(tier4): roommate matchmaker`.

**Tier 4 acceptance criteria:** matchmaker returns reasonable results, groups of 4 have >50% item overlap.

---

# Out of scope (DO NOT do in this plan)

- **Location Planner.** Combinatorial optimization solver, too complex for v1. Re-evaluate after Tier 4 if users request it.
- **Cooking recipes, mystery gift codes, dailies, interactive map.** Features pokopiawiki.com has but not in our scope.
- **Multiplayer / Island Visit features.** Require backend, out of scope for SSG.
- **Translation of descriptions.** ES/EN toggle only affects UI labels, not content (which stays in English because it comes from Serebii).
- **PWA / offline mode.** If the user requests it later, evaluate then.

---

# How to proceed

1. Start with **Tier 1 sub-phase 1.1**.
2. Show intermediate result at the end of each sub-phase and wait for approval.
3. If at any point you see a decision not covered by the plan, **ask before improvising**.
4. If a sub-phase breaks midway and you can't finish it, don't commit halfway — pause and report.
