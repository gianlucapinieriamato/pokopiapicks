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
    'cloudisland',
]

# Map from display-name fragments (lowercase) to slug
LOCATION_DISPLAY = {
    'withered wastelands': 'witheredwastelands',
    'bleak beach':         'bleakbeach',
    'rocky ridges':        'rockyridges',
    'sparkling skylands':  'sparklingskylands',
    'palette town':        'palettetown',
    'cloud island':        'cloudisland',
}


def extract_h2_section(html: str, heading_pattern: str) -> list[str]:
    """Extract list items or td text from the section following an <h2> matching the pattern."""
    m = re.search(
        r'<h2[^>]*>[^<]*' + heading_pattern + r'[^<]*</h2>(.*?)(?=<h2|</body)',
        html, re.IGNORECASE | re.DOTALL,
    )
    if not m:
        return []
    content = m.group(1)
    items = [clean_text(li) for li in re.findall(r'<li[^>]*>(.*?)</li>', content, re.IGNORECASE | re.DOTALL)]
    if not items:
        items = [clean_text(td) for td in re.findall(r'<td[^>]*>(.*?)</td>', content, re.IGNORECASE | re.DOTALL)]
    seen = set()
    out = []
    for t in items:
        if 2 < len(t) < 100 and re.search(r'[a-zA-Z]', t) and t not in seen:
            seen.add(t)
            out.append(t)
    return out


def extract_fooevo_section(html: str, heading_pattern: str) -> list[str]:
    """Extract only fooevo td items from the section following an <h2>. Safer than extract_h2_section
    for sections that also have cen tds with quantity/image noise."""
    m = re.search(
        r'<h2[^>]*>[^<]*' + heading_pattern + r'[^<]*</h2>(.*?)(?=<h2|</body)',
        html, re.IGNORECASE | re.DOTALL,
    )
    if not m:
        return []
    content = m.group(1)
    items = [clean_text(td) for td in re.findall(r'<td[^>]*class=["\']fooevo["\'][^>]*>(.*?)</td>', content, re.IGNORECASE | re.DOTALL)]
    seen = set()
    out = []
    for t in items:
        if 2 < len(t) < 100 and re.search(r'[a-zA-Z]', t) and t not in seen:
            seen.add(t)
            out.append(t)
    return out


def extract_shop_items(html: str) -> list[dict]:
    """Extract shop items with unlock levels from the Exclusive Shop Items section."""
    m = re.search(
        r'<h2[^>]*>[^<]*Exclusive Shop Items[^<]*</h2>(.*?)(?=<h2|</body)',
        html, re.IGNORECASE | re.DOTALL,
    )
    if not m:
        return []
    content = m.group(1)
    results = []
    for row in re.findall(r'<tr[^>]*>(.*?)</tr>', content, re.IGNORECASE | re.DOTALL):
        level_m = re.search(r'<td[^>]*class=["\']fooinfo["\'][^>]*>Lv\.\s*(\d+)', row, re.IGNORECASE)
        if not level_m:
            continue
        level = int(level_m.group(1))
        # Name is in a cen td that does NOT start with <img
        name_m = re.search(r'<td[^>]*class=["\']cen["\'][^>]*>(?!\s*<img)([^<]+)', row, re.IGNORECASE)
        if not name_m:
            continue
        name = clean_text(name_m.group(1))
        if name:
            results.append({'name': name, 'level': level})
    return results


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

        page_stripped = re.sub(r'<(script|style)[^>]*>.*?</\1>', '', page, flags=re.DOTALL | re.IGNORECASE)

        # Name: from page <title>, stripping " Locations - ..." suffix
        name = slug.replace('-', ' ').title()
        title_m = re.search(r'<title[^>]*>([^<]+)</title>', page, re.IGNORECASE)
        if title_m:
            raw_title = clean_text(title_m.group(1))
            # Strip trailing " Locations - Pokemon Pokopia" or similar
            raw_title = re.sub(r'\s+Locations\s*[-–].*$', '', raw_title, flags=re.IGNORECASE).strip()
            raw_title = re.sub(r'\s*[-–|].*$', '', raw_title).strip()
            if raw_title:
                name = raw_title

        # Description: first long td
        description = ''
        for m in re.finditer(r'<td[^>]*>(.*?)</td>', page_stripped, re.DOTALL | re.IGNORECASE):
            t = clean_text(m.group(1))
            if len(t) > 40 and re.search(r'[a-z]{4}', t) and 'Serebii' not in t:
                description = t
                break

        materials = extract_h2_section(page_stripped, r'Materials')
        blocks_plants = extract_h2_section(page_stripped, r'Plants')
        items_in_area = extract_fooevo_section(page_stripped, r'Items Found in Area')
        items_in_pokeballs = extract_fooevo_section(page_stripped, r'Items Found in Pok')
        treasure = extract_fooevo_section(page_stripped, r'Treasure Found in Area')
        shop_items = extract_shop_items(page_stripped)

        results[slug] = {
            'slug': slug,
            'name': name,
            'description': description,
            'objective': '',
            'materials': materials,
            'blocksAndPlants': blocks_plants,
            'itemsInArea': items_in_area,
            'itemsInPokeballs': items_in_pokeballs,
            'treasure': treasure,
            'shopItems': shop_items,
        }
        print(f'OK — {len(materials)} mat, {len(blocks_plants)} plants, {len(items_in_area)} area, {len(items_in_pokeballs)} balls, {len(treasure)} treasure, {len(shop_items)} shop')

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

    # Extract names from index — each habitat has 2 anchors (icon + text); take first non-empty
    index_info: dict[str, dict] = {}
    for m in re.finditer(
        r'href="habitatdex/([a-z0-9\-]+)\.shtml"[^>]*>(.*?)</a',
        html, re.IGNORECASE | re.DOTALL,
    ):
        key = m.group(1).lower()
        if key in index_info:
            continue
        candidate = clean_text(re.sub(r'<[^>]+>', '', m.group(2)))
        if candidate:
            index_info[key] = {'name': candidate}

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

TIME_WORDS    = ['Morning', 'Day', 'Evening', 'Night']
WEATHER_WORDS = ['Sun', 'Cloud', 'Rain']
RARITY_RE     = re.compile(r'Rarity:\s*(Common|Rare)', re.IGNORECASE)


def _locations_from_text(text: str) -> list[str]:
    """Map display-name fragments to location slugs found in text."""
    lower = text.lower()
    found = []
    for display, slug in LOCATION_DISPLAY.items():
        if display in lower:
            found.append(slug)
    return found


def parse_pkmn_page(html: str, slug: str) -> dict:
    # Flavor
    flavor = None
    m = FLAVOR_RE.search(html)
    if m:
        flavor = FLAVOR_NORM.get(m.group(1).lower())

    # Find "Habitats & Locations" table and parse it block-by-block.
    # Structure (one block per habitat):
    #   row: <td> habitat name with habitatdex link </td>
    #   row: (optional empty / image row)
    #   row: Location: Withered WastelandsBleak Beach...
    #   row: Rarity: Common|Rare
    #   row: TimeWeather  (header)
    #   row: Morning Day Evening Night  Sun Cloud Rain
    habitat_list: list[dict] = []

    # Extract all rows from the habitats table
    hab_section_m = re.search(
        r'Habitats\s*(?:&amp;|&)\s*Locations(.*?)(?=<h\d|</table>)',
        html, re.IGNORECASE | re.DOTALL,
    )
    if not hab_section_m:
        # Fallback: search whole page
        section_html = html
    else:
        section_html = hab_section_m.group(1)

    rows = re.findall(r'<tr[^>]*>(.*?)</tr>', section_html, re.IGNORECASE | re.DOTALL)

    i = 0
    last_hab_slug = None
    while i < len(rows):
        row = rows[i]
        hab_links = re.findall(r'/pokemonpokopia/habitatdex/([a-z0-9\-]+)\.shtml', row, re.IGNORECASE)
        if not hab_links:
            i += 1
            continue

        hab_slug = hab_links[0].lower()

        # Skip duplicate hab rows (image icon rows re-link the same habitat)
        if hab_slug == last_hab_slug:
            i += 1
            continue
        last_hab_slug = hab_slug

        # Collect the next handful of rows for this block (until next new hab link or end)
        block_rows = []
        j = i + 1
        while j < len(rows) and j < i + 10:
            next_habs = re.findall(r'/pokemonpokopia/habitatdex/([a-z0-9\-]+)\.shtml', rows[j], re.IGNORECASE)
            if next_habs and next_habs[0].lower() != hab_slug:
                break
            block_rows.append(clean_text(rows[j]))
            j += 1

        block_text = ' '.join(block_rows)

        # Locations
        locs = _locations_from_text(block_text)
        is_cloud = 'cloudisland' in locs

        # Rarity
        rarity = None
        rm = RARITY_RE.search(block_text)
        if rm:
            rarity = rm.group(1).capitalize()

        # Time
        times = [t for t in TIME_WORDS if t.lower() in block_text.lower()]

        # Weather
        weather = [w for w in WEATHER_WORDS if w.lower() in block_text.lower()]

        habitat_list.append({
            'habitatSlug':   hab_slug,
            'locations':     locs,
            'rarity':        rarity,
            'time':          times or None,
            'weather':       weather or None,
            'isCloudIsland': is_cloud,
        })

        i = j

    # Primary location: first non-cloud location found, or first found
    primary = None
    for entry in habitat_list:
        for loc in entry['locations']:
            if loc != 'cloudisland':
                primary = loc
                break
        if primary:
            break

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
