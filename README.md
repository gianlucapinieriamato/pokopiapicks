# Pokopia Picks

Gift finder and wiki for **Pokemon Pokopia** (Nintendo Switch 2). Find what items each Pokemon likes, plan housing by habitat, look up locations and specialties.

## Stack

- **Next.js 16** — App Router, static export (`output: 'export'`)
- **TypeScript** + **Tailwind CSS v4**
- Deployed via **Vercel**

## Development

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # generates out/ for static deployment
```

## Data

All game data lives in `/data/*.json`:

| File                       | Description                                                                     |
| -------------------------- | ------------------------------------------------------------------------------- |
| `pokemon.json`             | 308 Pokemon — name, dex#, habitat, categories, specialties, habitatList, flavor |
| `favorite-categories.json` | 43 gift categories with their item lists                                        |
| `items.json`               | 608 items with icon paths and category refs                                     |
| `specialties.json`         | 31 specialties with Pokemon reverse lookup                                      |
| `habitats.json`            | 201 in-game habitat types with Pokemon reverse lookup                           |
| `locations.json`           | 6 locations with materials and plants/blocks                                    |

Data scraped from [Serebii](https://www.serebii.net/pokemonpokopia/). HQ sprites from [PokeAPI sprites](https://github.com/PokeAPI/sprites) (BSD-3-Clause).

## Scraping

```bash
python scripts/scrape_tier1.py specialties   # re-scrape specialties
python scripts/scrape_tier1.py locations     # re-scrape locations
python scripts/scrape_tier1.py habitats      # re-scrape habitats
python scripts/scrape_tier1.py pokemon       # re-scrape per-pokemon details

python scripts/download_sprites.py          # download/update HQ sprites
```

Scraped HTML is cached in `/scripts/cache/` (gitignored). Crawl-delay 1.8s, no parallelization.
