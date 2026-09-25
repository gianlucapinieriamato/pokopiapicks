# Pokopia Wiki — Project Context

## What this is

A gift-finder/wiki web app for the game Pokemon Pokopia (Nintendo Switch 2, released March 5 2026). Helps players figure out which items each Pokemon likes, plan housing, and look up game data (Pokedex, items, habitats, locations, specialties).

## Stack

Next.js 16 App Router, TypeScript, Tailwind CSS v4. Deployed on Vercel. Not a static export — dynamic `[slug]` routes use `generateStaticParams` under the normal Vercel Next.js runtime (`next.config.ts` has no `output: 'export'`; the `out/` directory in the tree is a stale artifact from an earlier static-export phase and can be ignored/deleted).

## Data pipeline (non-obvious — read before touching game data)

- **Raw scraped data**: `/data/*.json` (currently `locations.json`, `pokemon-extra.json`). Scraped from Serebii with the Python scripts in `/scripts/`.
- **App data**: NOT imported from `/data/*.json` at runtime. It lives as generated TypeScript const files in `app/lib/const/*.ts` (e.g. `pokemon.ts`, `items.ts`, `locations.ts`, `specialties.ts`, `habitat-config.ts`). These carry an `AUTO-GENERATED — do not edit by hand` header, but **the generator script referenced there no longer exists in the repo**.
- **How updates actually happen**: targeted Python patch scripts (e.g. `scripts/patch_pokemon_ts.py`) read a `/data/*.json` file and regex-splice fields directly into the matching `app/lib/const/*.ts` file in place. Re-running a patch script is safe (they skip entries already patched) but they are fragile regex operations — if you add a new field, add a corresponding patch script rather than hand-editing the generated `.ts`, and verify the diff before committing.
- Categories/specialties/etc. in the const files are **slugs**, not display names — resolve via the matching `*_CONST` lookup (e.g. `CATEGORIES[slug].name`).
- `POKEMON_LIST` is sorted by `nationalDexNum ?? 99999` in `app/lib/const` — listing pages rely on this order; don't re-sort ad hoc.

## Data sources (for scraping)

- **Serebii** (https://www.serebii.net/pokemonpokopia/) — primary source for everything Pokopia-specific. Scrape with `requests` + regex, no BeautifulSoup. Crawl-delay 1.5–2s, never parallelize, always cache HTML locally in `/scripts/cache/` (gitignored).
- **PokeAPI sprites** (https://github.com/PokeAPI/sprites, BSD-3-Clause) — official artwork by national dex number.

## Hard rules

1. Slugs: lowercase, URL-safe, stable across re-scrapes. Cross-references between datasets always by slug, never by display name.
2. Serebii is a free fan-site — respect it. No parallel requests, no scraping without cache, no aggressive retry loops.
3. UI labels are translatable (ES/EN via `useLang()` in `app/lib/lang.ts`), but data content stays in English (because Serebii is English).
4. Don't commit half-finished work. If a sub-phase breaks, pause and report — never commit inconsistent state.
5. Ask before improvising on decisions not covered by an active plan.
6. Icons live at `public/icons/{pokemon,items}/`, not `/icons/` — Next.js only serves static assets from `public/`.
7. Sitemap base URL is currently hardcoded to a Vercel preview URL — update if/when a custom domain is added.
8. Screenshots/verification captures (`verify-*.png`, `poptip-*.png`, etc.) generated during UI review are scratch output — don't commit them to the repo root; clean up or gitignore after use.

## Session handoff protocol

This project uses a custom skill at `.claude/skills/handoff/` to manage state between conversations. The skill writes to `.handoffs/` which serves both as state-tracking AND as a permanent project changelog.

Invoke the skill:

- **At the end of every meaningful work session** — always, regardless of context state.
- **When context is running low** — proactively, before quality degrades.
- **When the user signals end of session** — phrases like "let's continue tomorrow", "stop here", "good for now".

When starting a new conversation:

1. Read `.handoffs/CURRENT.md` FIRST — it points to current state and any active gotchas.
2. Optionally consult `.handoffs/history/` for context on past decisions.
3. Echo back to the user a one-paragraph summary of state before proceeding.

The `.handoffs/history/` folder is append-only — never modify past entries.

## Status

No active implementation plan — the original roadmap (formerly `pokopia-wiki-plan.md`) has been fully executed and the file removed. The app is live on Vercel. See `.handoffs/CURRENT.md` for current state and open follow-up ideas.
