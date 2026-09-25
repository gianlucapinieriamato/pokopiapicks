# Pokopia Wiki — Project Context

## What this is

A static web app about the game Pokemon Pokopia (Nintendo Switch 2, released March 5 2026). Helps players figure out which items each Pokemon likes, plan housing, and look up game data.

## Stack

- Currently: single `index.html` with embedded JSON, vanilla JS, ES/EN toggle. Hotlinks icons from jsDelivr CDN mirroring the `/icons/` folder in this repo.
- Target: Next.js 15 App Router with `output: 'export'` (static export), TypeScript, Tailwind CSS. Deployed via Vercel.

## Data sources

- **Serebii** (https://www.serebii.net/pokemonpokopia/) — primary source for everything Pokopia-specific. Scrape with `requests` + regex, no BeautifulSoup. Crawl-delay 1.5–2s, never parallelize, always cache HTML locally in `/scripts/cache/` (gitignored).
- **PokeAPI sprites** (https://github.com/PokeAPI/sprites, BSD-3-Clause) — high-quality official artwork by national dex number.

## Hard rules

1. Slugs: lowercase, URL-safe, stable across re-scrapes. Cross-references between datasets always by slug, never by display name.
2. Serebii is a free fan-site — respect it. No parallel requests, no scraping without cache, no aggressive retry loops.
3. Data files in `/data/*.json` are the source of truth. Importable directly in Next with `import data from '@/data/pokemon.json'`.
4. UI labels are translatable (ES/EN), but data content stays in English (because Serebii is English).
5. Don't commit half-finished work. If a sub-phase breaks, pause and report — never commit inconsistent state.
6. Ask before improvising on decisions not covered by the plan.

## Folder structure (target)

```
/data/                  JSON files — source of truth
/scripts/               Python scrapers
  cache/                gitignored
/icons/                 mirrored from Serebii (Tier 0)
  pokemon/
  items/
  sprites-hq/           (Tier 2) PokeAPI official artwork
/app/                   Next.js App Router (after Phase 3)
```

## Working plan

The implementation roadmap lives at `pokopia-wiki-plan.md` at the repo root. Read it for the current tier/sub-phase structure. Follow it sequentially — don't skip ahead.

## Session handoff protocol

This project uses a custom skill at `.claude/skills/handoff/` to manage state between conversations. The skill writes to `.handoffs/` which serves both as state-tracking AND as a permanent project changelog.

Invoke the skill:

- **At the end of every sub-phase** (e.g., after finishing Tier 1.2, before starting 1.3) — always, regardless of context state.
- **When context is running low** — proactively, before quality degrades.
- **When the user signals end of session** — phrases like "let's continue tomorrow", "stop here", "good for now".

When starting a new conversation:

1. Read `.handoffs/CURRENT.md` FIRST — it points to current state.
2. Then read `CLAUDE.md` and `pokopia-wiki-plan.md`.
3. Optionally consult `.handoffs/history/` for context on past decisions.
4. Echo back to the user a one-paragraph summary of state before proceeding.

The `.handoffs/history/` folder is append-only — never modify past entries.

## Deployment

Vercel MCP is connected. Claude Code can deploy autonomously when reaching Phase 3 sub-phase 3.4.

## Status

See `.handoffs/CURRENT.md` for current state. If it doesn't exist, this is the first session and the handoff skill will initialize it.
