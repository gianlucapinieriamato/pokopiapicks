#!/usr/bin/env python3
"""
Tier 1 scraper -- Pokemon Pokopia data expansion.

Usage:
  python scripts/scrape_tier1.py specialties    [--no-cache]
  python scripts/scrape_tier1.py locations      [--no-cache]
  python scripts/scrape_tier1.py habitats       [--no-cache]
  python scripts/scrape_tier1.py pokemon        [--no-cache]
"""

import argparse
import json
import re
import sys
import time
import urllib.request
from pathlib import Path

ROOT      = Path(__file__).parent.parent
DATA_DIR  = ROOT / 'data'
CACHE_DIR = Path(__file__).parent / 'cache'
CACHE_DIR.mkdir(exist_ok=True)
DATA_DIR.mkdir(exist_ok=True)

BASE = 'https://www.serebii.net'
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0',
    'Referer':    'https://www.serebii.net/pokemonpokopia/',
    'Accept':     'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
}
DELAY       = 1.8   # seconds between live requests
MAX_RETRIES = 3
BACKOFF     = 3.0   # base seconds for exponential backoff


# ── Network ────────────────────────────────────────────────────────────────────

def fetch(url: str, cache_key: str, use_cache: bool = True) -> str | None:
    cache_file = CACHE_DIR / f'{cache_key}.html'
    if use_cache and cache_file.exists():
        return cache_file.read_text(encoding='utf-8', errors='replace')

    last_err = None
    for attempt in range(MAX_RETRIES):
        try:
            request = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(request, timeout=20) as resp:
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


# ── Helpers ────────────────────────────────────────────────────────────────────

def clean_text(s: str) -> str:
    s = re.sub(r'<[^>]+>', '', s)
    s = re.sub(r'\s+', ' ', s)
    return (s.replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>')
             .replace('&quot;', '"').replace('&#39;', "'").replace('&nbsp;', ' ')
             .replace('&eacute;', 'e').replace('&Eacute;', 'E').strip())


def hr():
    print('-' * 60)


# ── SPECIALTIES ────────────────────────────────────────────────────────────────

def parse_specialty_rows(html: str) -> list[tuple[str, list[str]]]:
    """
    From a specialty page, yield (pokemon_slug, [their_specialty_slugs]) pairs.
    Row structure: ...pokemon name link...</td> <td>...specialty icon links...</td>
    """
    row_re = re.compile(
        r'href="/pokemonpokopia/pokedex/([a-z0-9\-]+)\.shtml"><u>[^<]+</u></a></td>'
        r'\s*<td[^>]*>(.*?)</td>',
        re.DOTALL | re.IGNORECASE,
    )
    out: list[tuple[str, list[str]]] = []
    for m in row_re.finditer(html):
        pkmn_slug = m.group(1).lower()
        spec_slugs = list(dict.fromkeys(
            s.lower() for s in re.findall(
                r'/pokemonpokopia/pokedex/specialty/([a-z0-9\-]+)\.shtml',
                m.group(2), re.IGNORECASE,
            )
        ))
        if pkmn_slug and spec_slugs:
            out.append((pkmn_slug, spec_slugs))
    return out


def scrape_specialties(use_cache: bool) -> None:
    index_url = f'{BASE}/pokemonpokopia/specialty.shtml'
    print('Fetching specialty index...')
    html = fetch(index_url, 'specialty-index', use_cache)
    if not html:
        sys.exit('Could not fetch specialty index')

    # Index uses relative hrefs: href="pokedex/specialty/{slug}.shtml"
    raw = re.findall(r'href="pokedex/specialty/([a-z0-9\-]+)\.shtml"', html, re.IGNORECASE)
    seen: set[str] = set()
    slugs: list[str] = []
    for s in raw:
        key = s.lower()
        if key not in seen:
            seen.add(key)
            slugs.append(key)

    # Descriptions come directly from the index page
    # Row: ...href="pokedex/specialty/{slug}.shtml"><u>{name}</u>...  <td class="fooinfo">{desc}</td>
    index_info: dict[str, dict] = {}
    for m in re.finditer(
        r'href="pokedex/specialty/([a-z0-9\-]+)\.shtml"><u>([^<]+)</u></a></td>\s*<td[^>]*>([^<]*)',
        html, re.IGNORECASE,
    ):
        key = m.group(1).lower()
        index_info[key] = {
            'name': clean_text(m.group(2)),
            'description': clean_text(m.group(3)),
        }

    print(f'Found {len(slugs)} specialties.\n')

    # pkmn_to_specs: aggregate across all pages for cross-reference
    pkmn_to_specs: dict[str, set[str]] = {}
    results: dict = {}
    failures: list[str] = []

    for i, slug in enumerate(slugs, 1):
        url  = f'{BASE}/pokemonpokopia/pokedex/specialty/{slug}.shtml'
        info = index_info.get(slug, {})
        name = info.get('name', slug.replace('-', ' ').title())
        desc = info.get('description', '')
        print(f'  [{i:2d}/{len(slugs)}] {slug}...', end=' ', flush=True)

        page = fetch(url, f'specialty-{slug}', use_cache)
        if not page:
            print('FAILED')
            failures.append(slug)
            results[slug] = {'slug': slug, 'name': name, 'description': desc, 'pokemon': []}
            continue

        rows = parse_specialty_rows(page)
        for pkmn_slug, spec_slugs in rows:
            pkmn_to_specs.setdefault(pkmn_slug, set()).update(spec_slugs)

        # Pokemon that HAVE this specialty (their row contains this slug)
        seen_p: set[str] = set()
        pkmn_with = []
        for p, specs in rows:
            if slug in specs and p not in seen_p:
                seen_p.add(p)
                pkmn_with.append(p)

        # Fallback for unique-ability specialties (Explode, Yawn…):
        # the Pokemon appear on the page but their formal specialty differs.
        # Use all linked Pokemon from the page so the list is never empty.
        if not pkmn_with:
            pkmn_with = list(dict.fromkeys(
                m.group(1).lower()
                for m in re.finditer(
                    r'/pokemonpokopia/pokedex/([a-z0-9\-]+)\.shtml',
                    page, re.IGNORECASE,
                )
            ))

        results[slug] = {
            'slug': slug,
            'name': name,
            'description': desc,
            'pokemon': pkmn_with,
        }
        print(f'OK -- {len(pkmn_with)} Pokemon with {name}')

    out = DATA_DIR / 'specialties.json'
    out.write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding='utf-8')

    # Persist cross-reference (used later in pokemon-details step)
    xref = DATA_DIR / '_pkmn_specialties_xref.json'
    xref.write_text(
        json.dumps({k: sorted(v) for k, v in pkmn_to_specs.items()}, ensure_ascii=False, indent=2),
        encoding='utf-8',
    )

    hr()
    print(f'Specialties: {len(results)} written, {len(failures)} failed.')
    print(f'Cross-ref: {len(pkmn_to_specs)} Pokemon mapped to specialties -> {xref.name}')
    if failures:
        print(f'Failed slugs: {failures}')


# ── LOCATIONS ──────────────────────────────────────────────────────────────────

LOCATION_SLUGS = [
    'witheredwastelands',
    'bleakbeach',
    'rockyridges',
    'sparklingskylands',
    'palettetown',
]


def scrape_locations(use_cache: bool) -> None:
    print('Scraping locations...\n')
    results: dict = {}
    failures: list[str] = []

    for i, slug in enumerate(LOCATION_SLUGS, 1):
        url = f'{BASE}/pokemonpokopia/locations/{slug}.shtml'
        print(f'  [{i}/{len(LOCATION_SLUGS)}] {slug}...', end=' ', flush=True)

        page = fetch(url, f'location-{slug}', use_cache)
        if not page:
            print('FAILED')
            failures.append(slug)
            continue

        # Name from page title
        name = slug.title()
        title_m = re.search(r'<title[^>]*>([^<]+)</title>', page, re.IGNORECASE)
        if title_m:
            parts = [p.strip() for p in re.split(r'[-|]', title_m.group(1)) if p.strip()]
            parts = [p for p in parts if 'Serebii' not in p and 'Pokemon' not in p]
            if parts:
                name = clean_text(parts[0])

        # Description: first longish sentence-like td in main content
        description = ''
        page_stripped = re.sub(r'<(script|style)[^>]*>.*?</\1>', '', page, flags=re.DOTALL | re.IGNORECASE)
        for m in re.finditer(r'<td[^>]*>(.*?)</td>', page_stripped, re.DOTALL | re.IGNORECASE):
            t = clean_text(m.group(1))
            if len(t) > 40 and re.search(r'[a-z]{4}', t) and 'Serebii' not in t:
                description = t
                break

        # Materials and blocks: look for table rows with text items
        materials: list[str] = []
        blocks_plants: list[str] = []
        objective = ''

        # Serebii location pages often have labeled sections
        # We look for "Material" and "Objective" headers
        obj_m = re.search(r'[Oo]bjective[^<]*<[^>]+>\s*([^<]{5,})', page)
        if obj_m:
            objective = clean_text(obj_m.group(1))

        # Items in lists or tables — grab td text in main content area
        all_tds = [clean_text(m.group(1)) for m in re.finditer(
            r'<td[^>]*class="[^"]*fooinfo[^"]*"[^>]*>(.*?)</td>',
            page, re.DOTALL | re.IGNORECASE,
        )]
        # Short items (<= 50 chars, no HTML artefacts) are likely material names
        item_candidates = [t for t in all_tds if 5 < len(t) <= 60 and re.search(r'[a-zA-Z]', t)]

        results[slug] = {
            'slug': slug,
            'name': name,
            'description': description,
            'objective': objective,
            'materials': materials,       # to be enriched once we see page structure
            'blocksAndPlants': blocks_plants,
            '_rawItems': item_candidates, # temporary — remove after review
        }
        print(f'OK')

    out = DATA_DIR / 'locations.json'
    out.write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding='utf-8')
    hr()
    print(f'Locations: {len(results)} written, {len(failures)} failed.')
    if failures:
        print(f'Failed slugs: {failures}')


# ── HABITATS ───────────────────────────────────────────────────────────────────

def scrape_habitats(use_cache: bool) -> None:
    index_url = f'{BASE}/pokemonpokopia/habitats.shtml'
    print('Fetching habitat index...')
    html = fetch(index_url, 'habitat-index', use_cache)
    if not html:
        sys.exit('Could not fetch habitat index')

    # Extract slugs: href="habitatdex/{slug}.shtml" (relative)
    raw = re.findall(r'href="habitatdex/([a-z0-9\-]+)\.shtml"', html, re.IGNORECASE)
    seen: set[str] = set()
    slugs: list[str] = []
    for s in raw:
        key = s.lower()
        if key not in seen:
            seen.add(key)
            slugs.append(key)

    # Extract names from index (same pattern as specialties)
    index_info: dict[str, dict] = {}
    for m in re.finditer(
        r'href="habitatdex/([a-z0-9\-]+)\.shtml"[^>]*>([^<]+)<',
        html, re.IGNORECASE,
    ):
        key = m.group(1).lower()
        if key not in index_info:
            index_info[key] = {'name': clean_text(m.group(2))}

    print(f'Found {len(slugs)} habitats.\n')

    results: dict = {}
    failures: list[str] = []

    for i, slug in enumerate(slugs, 1):
        url = f'{BASE}/pokemonpokopia/habitatdex/{slug}.shtml'
        name = index_info.get(slug, {}).get('name', slug.replace('-', ' ').title())
        print(f'  [{i:3d}/{len(slugs)}] {slug}...', end=' ', flush=True)

        page = fetch(url, f'habitat-{slug}', use_cache)
        if not page:
            print('FAILED')
            failures.append(slug)
            continue

        # Description: first meaningful td content
        description = ''
        page_stripped = re.sub(r'<(script|style)[^>]*>.*?</\1>', '', page, flags=re.DOTALL | re.IGNORECASE)
        for m in re.finditer(r'<td[^>]*>(.*?)</td>', page_stripped, re.DOTALL | re.IGNORECASE):
            t = clean_text(m.group(1))
            if len(t) > 30 and re.search(r'[a-z]{4}', t) and 'Serebii' not in t:
                description = t
                break

        # Pokemon slugs from absolute pokemonpokopia links
        pkmn = list(dict.fromkeys(
            m.group(1).lower()
            for m in re.finditer(
                r'/pokemonpokopia/pokedex/([a-z0-9\-]+)\.shtml',
                page, re.IGNORECASE,
            )
        ))

        results[slug] = {
            'slug': slug,
            'name': name,
            'description': description,
            'pokemon': pkmn,
        }
        print(f'OK -- {len(pkmn)} Pokemon')

    out = DATA_DIR / 'habitats.json'
    out.write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding='utf-8')
    hr()
    print(f'Habitats: {len(results)} written, {len(failures)} failed.')
    if failures:
        print(f'Failed slugs: {failures}')


# ── POKEMON DETAILS ────────────────────────────────────────────────────────────

FLAVOR_RE   = re.compile(r'\b(Dry|Sour|Spicy|Sweet|Bitter)\b\s+[Ff]lavor', re.IGNORECASE)
FLAVOR_NORM = {'dry': 'Dry', 'sour': 'Sour', 'spicy': 'Spicy', 'sweet': 'Sweet', 'bitter': 'Bitter'}

TIME_TOKENS    = {'morning', 'day', 'evening', 'night'}
WEATHER_TOKENS = {'sun', 'cloud', 'rain', 'cloudy', 'sunny', 'rainy'}
WEATHER_NORM   = {'cloudy': 'Cloud', 'sunny': 'Sun', 'rainy': 'Rain',
                  'cloud': 'Cloud', 'sun': 'Sun', 'rain': 'Rain'}
RARITY_RE      = re.compile(r'\b(common|rare)\b', re.IGNORECASE)


def parse_pkmn_page(html: str, slug: str) -> dict:
    # Flavor
    flavor = None
    m = FLAVOR_RE.search(html)
    if m:
        flavor = FLAVOR_NORM.get(m.group(1).lower())

    # Habitat list
    habitat_list: list[dict] = []
    rows = re.findall(r'<tr[^>]*>(.*?)</tr>', html, re.IGNORECASE | re.DOTALL)
    for row in rows:
        cells = [clean_text(c) for c in re.findall(
            r'<td[^>]*>(.*?)</td>', row, re.IGNORECASE | re.DOTALL,
        )]
        row_text = ' '.join(cells).lower()

        locs_found = [loc for loc in LOCATION_SLUGS if loc in row_text]
        if not locs_found and not RARITY_RE.search(row_text):
            continue

        hab_links = re.findall(r'/pokemonpokopia/habitatdex/([a-z0-9\-]+)\.shtml', row, re.IGNORECASE)
        if not hab_links:
            continue

        rarity_m = RARITY_RE.search(row_text)
        rarity   = rarity_m.group(1).capitalize() if rarity_m else None
        times    = sorted(t.capitalize() for t in TIME_TOKENS if t in row_text)
        weather  = list(dict.fromkeys(WEATHER_NORM[w] for w in WEATHER_TOKENS if w in row_text))

        habitat_list.append({
            'habitatSlug': hab_links[0].lower(),
            'locations':   locs_found,
            'rarity':      rarity,
            'time':        times or None,
            'weather':     weather or None,
            'isCloudIsland': bool(re.search(r'cloud\s*island', row_text, re.IGNORECASE)),
        })

    primary = next((loc for loc in LOCATION_SLUGS if loc in html.lower()), None)

    return {
        'flavor':          flavor,
        'habitatList':     habitat_list,
        'primaryLocation': primary,
    }


def scrape_pokemon_details(use_cache: bool) -> None:
    pokemon = json.loads((DATA_DIR / 'pokemon.json').read_text(encoding='utf-8'))

    # Load specialty cross-reference if available
    xref_file = DATA_DIR / '_pkmn_specialties_xref.json'
    pkmn_to_specs: dict[str, list[str]] = {}
    if xref_file.exists():
        pkmn_to_specs = json.loads(xref_file.read_text(encoding='utf-8'))
        print(f'Loaded specialty xref for {len(pkmn_to_specs)} Pokemon.')

    slugs = list(pokemon.keys())
    print(f'Scraping {len(slugs)} Pokemon detail pages...\n')

    failures: list[str] = []

    for i, slug in enumerate(slugs, 1):
        url = f'{BASE}/pokemonpokopia/pokedex/{slug}.shtml'
        print(f'  [{i:3d}/{len(slugs)}] {slug}...', end=' ', flush=True)

        page = fetch(url, f'pkmn-{slug}', use_cache)
        if not page:
            print('FAILED')
            failures.append(slug)
            continue

        extras = parse_pkmn_page(page, slug)
        extras['specialties'] = pkmn_to_specs.get(slug, [])
        pokemon[slug].update(extras)

        fl = extras['flavor'] or '?'
        sp = len(extras['specialties'])
        hl = len(extras['habitatList'])
        print(f'OK -- flavor={fl}, {sp} spec(s), {hl} habitat(s)')

    out = DATA_DIR / 'pokemon.json'
    out.write_text(json.dumps(pokemon, ensure_ascii=False, indent=2), encoding='utf-8')
    hr()
    print(f'Pokemon: {len(pokemon) - len(failures)} updated, {len(failures)} failed.')
    if failures:
        print(f'Failed slugs: {failures}')


# ── CLI ────────────────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(description='Tier 1 Pokopia scraper')
    parser.add_argument(
        'step',
        choices=['specialties', 'locations', 'habitats', 'pokemon'],
    )
    parser.add_argument('--no-cache', action='store_true',
                        help='Re-fetch even if cached HTML exists')
    args = parser.parse_args()

    if args.step == 'specialties':
        scrape_specialties(not args.no_cache)
    elif args.step == 'locations':
        scrape_locations(not args.no_cache)
    elif args.step == 'habitats':
        scrape_habitats(not args.no_cache)
    elif args.step == 'pokemon':
        scrape_pokemon_details(not args.no_cache)


if __name__ == '__main__':
    main()
