#!/usr/bin/env python3
"""
Bubbly Basin scraper — Expansion Pass Part 1.

Fetches (and caches) every Serebii page needed to add the Bubbly Basin update:
the 52 Basin Pokedex entries, the new habitats, the new location, the item
listing, the favorite-item categories and the crafting recipes.

Usage:
  python scripts/scrape_basin.py            # fetch everything, reuse cache
  python scripts/scrape_basin.py --no-cache # re-fetch even if cached
"""

import argparse
import json
import re
import sys
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).parent.parent
CACHE_DIR = Path(__file__).parent / 'cache'
CACHE_DIR.mkdir(exist_ok=True)

BASE = 'https://www.serebii.net'
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0',
    'Referer': 'https://www.serebii.net/pokemonpokopia/',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
}
DELAY = 1.8         # seconds between live requests — Serebii is a fan site
MAX_RETRIES = 3
BACKOFF = 3.0


def fetch(url: str, cache_key: str, use_cache: bool = True) -> str | None:
    cache_file = CACHE_DIR / f'{cache_key}.html'
    if use_cache and cache_file.exists():
        return cache_file.read_text(encoding='utf-8', errors='replace')

    last_err = None
    for attempt in range(MAX_RETRIES):
        try:
            request = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(request, timeout=30) as resp:
                html = resp.read().decode('utf-8', errors='replace')
            cache_file.write_text(html, encoding='utf-8')
            time.sleep(DELAY)
            return html
        except Exception as e:
            last_err = e
            print(f'    [attempt {attempt + 1}/{MAX_RETRIES}] {e}', file=sys.stderr)
            if attempt < MAX_RETRIES - 1:
                time.sleep(BACKOFF ** (attempt + 1))

    print(f'  FAILED {url}: {last_err}', file=sys.stderr)
    return None


def fetch_many(pairs: list[tuple[str, str]], use_cache: bool, what: str) -> list[str]:
    """pairs = [(url, cache_key)]. Returns the cache keys that failed."""
    failures = []
    for i, (url, key) in enumerate(pairs, 1):
        print(f'  [{i:3d}/{len(pairs)}] {what} {key}...', end=' ', flush=True)
        if fetch(url, key, use_cache) is None:
            failures.append(key)
            print('FAILED')
        else:
            print('OK')
    return failures


def main() -> None:
    parser = argparse.ArgumentParser(description='Bubbly Basin Pokopia scraper')
    parser.add_argument('--no-cache', action='store_true',
                        help='Re-fetch even if cached HTML exists')
    args = parser.parse_args()
    use_cache = not args.no_cache

    all_failures: list[str] = []

    # ── Index pages ────────────────────────────────────────────────────────
    print('Index pages...')
    index_pages = [
        (f'{BASE}/pokemonpokopia/basinpokedex.shtml', 'basin-pokedex'),
        (f'{BASE}/pokemonpokopia/locations/bubblybasin.shtml', 'location-bubblybasin'),
        (f'{BASE}/pokemonpokopia/items.shtml', 'items-index'),
        (f'{BASE}/pokemonpokopia/favorites.shtml', 'favorites-index'),
        (f'{BASE}/pokemonpokopia/habitats.shtml', 'habitat-index'),
        (f'{BASE}/pokemonpokopia/specialty.shtml', 'specialty-index'),
        (f'{BASE}/pokemonpokopia/crafting.shtml', 'crafting'),
    ]
    all_failures += fetch_many(index_pages, use_cache, '')

    basin = fetch(f'{BASE}/pokemonpokopia/basinpokedex.shtml', 'basin-pokedex', use_cache)
    if not basin:
        sys.exit('Could not fetch the Basin Pokedex — aborting')

    # ── Basin Pokedex roster ───────────────────────────────────────────────
    section = basin[basin.find('List of Available'):]
    section = section[:section.find('</main>')]
    roster = []
    parts = re.split(r'<td class="cen">#(\d+)</td>', section)
    for k in range(1, len(parts), 2):
        num, body = int(parts[k]), parts[k + 1]
        roster.append({
            'num': num,
            'slug': re.search(r'/pokemonpokopia/pokedex/([^"\.]+)\.shtml', body).group(1),
            'label': re.search(r'<u>([^<]+)</u>', body).group(1),
            'sprite': re.search(r'/pokemonpokopia/pokemon/small/([^"\s]+)', body).group(1),
            'specialties': list(dict.fromkeys(re.findall(
                r'/pokemonpokopia/pokedex/specialty/([a-z0-9\-]+)\.shtml', body))),
        })
    (CACHE_DIR / 'basin_roster.json').write_text(
        json.dumps(roster, ensure_ascii=False, indent=1), encoding='utf-8')
    print(f'\nBasin Pokedex: {len(roster)} entries\n')

    # ── Pokemon detail pages ───────────────────────────────────────────────
    print('Pokemon detail pages...')
    all_failures += fetch_many(
        [(f'{BASE}/pokemonpokopia/pokedex/{p["slug"]}.shtml', f'pkmn-{p["slug"]}') for p in roster],
        use_cache, 'pkmn')

    # ── Habitat pages referenced by those Pokemon ──────────────────────────
    habitats: list[str] = []
    for p in roster:
        page = (CACHE_DIR / f'pkmn-{p["slug"]}.html')
        if not page.exists():
            continue
        text = page.read_text(encoding='utf-8', errors='replace')
        for slug in re.findall(r'/pokemonpokopia/habitatdex/([^"/]+)\.shtml', text):
            if slug not in habitats:
                habitats.append(slug)
    print(f'\nHabitat pages ({len(habitats)} referenced)...')
    all_failures += fetch_many(
        [(f'{BASE}/pokemonpokopia/habitatdex/{s}.shtml', f'habitat-{s}') for s in habitats],
        use_cache, 'habitat')

    # ── Favorite-item category pages ───────────────────────────────────────
    favorites_index = (CACHE_DIR / 'favorites-index.html').read_text(encoding='utf-8', errors='replace')
    cats = list(dict.fromkeys(re.findall(
        r'/pokemonpokopia/favorites/([a-z0-9\-]+)\.shtml', favorites_index)))
    print(f'\nFavorite category pages ({len(cats)})...')
    all_failures += fetch_many(
        [(f'{BASE}/pokemonpokopia/favorites/{s}.shtml', f'fav-{s}') for s in cats],
        use_cache, 'fav')

    # ── Specialty pages (Scrub is new with the Basin) ──────────────────────
    specialty_index = (CACHE_DIR / 'specialty-index.html').read_text(encoding='utf-8', errors='replace')
    specs = list(dict.fromkeys(re.findall(
        r'href="pokedex/specialty/([a-z0-9\-]+)\.shtml"', specialty_index)))
    print(f'\nSpecialty pages ({len(specs)})...')
    all_failures += fetch_many(
        [(f'{BASE}/pokemonpokopia/pokedex/specialty/{s}.shtml', f'specialty-{s}') for s in specs],
        use_cache, 'spec')

    print('-' * 60)
    if all_failures:
        print(f'{len(all_failures)} page(s) FAILED: {all_failures}')
        sys.exit(1)
    print('All pages cached.')


if __name__ == '__main__':
    main()
