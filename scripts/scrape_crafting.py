#!/usr/bin/env python3
"""
Scrape crafting recipes for items and habitat requirements from Serebii.

Writes:
  app/lib/data/habitat-requirements.ts  -- items needed to build each habitat
  app/lib/data/crafting.ts              -- crafting recipes for craftable items

Usage:
  python scripts/scrape_crafting.py habitats   [--no-cache]
  python scripts/scrape_crafting.py items       [--no-cache]
  python scripts/scrape_crafting.py all         [--no-cache]
"""

import argparse
import re
import sys
import time
import urllib.request
from pathlib import Path

ROOT      = Path(__file__).parent.parent
DATA_DIR  = ROOT / 'app' / 'lib' / 'data'
CACHE_DIR = Path(__file__).parent / 'cache'
CACHE_DIR.mkdir(exist_ok=True)

BASE = 'https://www.serebii.net'
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0',
    'Referer':    'https://www.serebii.net/pokemonpokopia/',
    'Accept':     'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
}
DELAY       = 1.8
MAX_RETRIES = 3
BACKOFF     = 3.0


# ── Network ────────────────────────────────────────────────────────────────────

def fetch_bytes(url: str, cache_path: Path, use_cache: bool) -> bytes | None:
    if use_cache and cache_path.exists():
        return cache_path.read_bytes()
    try:
        req = urllib.request.Request(url, headers={**HEADERS, 'Accept': '*/*'})
        with urllib.request.urlopen(req, timeout=20) as r:
            if r.status != 200:
                return None
            data = r.read()
        cache_path.write_bytes(data)
        time.sleep(DELAY)
        return data
    except Exception as e:
        print(f'    WARN: {url} — {e}', file=sys.stderr)
        return None


def fetch(url: str, cache_key: str, use_cache: bool = True) -> str | None:
    cache_file = CACHE_DIR / f'{cache_key}.html'
    if use_cache and cache_file.exists():
        return cache_file.read_text(encoding='utf-8', errors='replace')

    last_err = None
    for attempt in range(MAX_RETRIES):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=20) as resp:
                html = resp.read().decode('utf-8', errors='replace')
            cache_file.write_text(html, encoding='utf-8')
            time.sleep(DELAY)
            return html
        except Exception as e:
            last_err = e
            print(f'    [attempt {attempt+1}/{MAX_RETRIES}] {e}', file=sys.stderr)
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


def name_to_slug(name: str) -> str:
    s = re.sub(r'[^a-z0-9]+', '-', name.lower())
    return s.strip('-')


def js_str(s: str) -> str:
    return s.replace('\\', '\\\\').replace('"', '\\"')


def hr():
    print('-' * 60)


# ── HABITAT REQUIREMENTS ───────────────────────────────────────────────────────

# Serebii typos / broken HTML → canonical names used in items.ts
HABITAT_NAME_FIXES: dict[str, str] = {
    'carboad boxes':          'Cardboard boxes',
    'boo-in-thebox':          'Boo-in-the-box',
    'seat (wide':             'Seat (wide)',   # missing closing paren in HTML
    'garbage bag':            'Garbage bags',
    'hot-spring water':       'Hot-spring Water',
    'muddy water':            'Muddy Water',
    'ocean water':            'Ocean Water',
}


def parse_habitat_requirements(html: str) -> list[dict]:
    """
    Parse the Requirements table from a habitatdex page.
    Returns list of { name, qty } dicts.
    """
    # Find requirements section (between <h2>Requirements</h2> and next <h2>)
    req_m = re.search(
        r'<h2>Requirements</h2>(.*?)(?=<h2|</main|</body)',
        html, re.DOTALL | re.IGNORECASE,
    )
    if not req_m:
        return []

    section = req_m.group(1)

    # Extract table rows (skip header row)
    rows = re.findall(r'<tr[^>]*>(.*?)</tr>', section, re.DOTALL | re.IGNORECASE)
    results: list[dict] = []

    for row in rows:
        cells = re.findall(r'<td[^>]*>(.*?)</td>', row, re.DOTALL | re.IGNORECASE)
        if len(cells) < 3:
            continue

        # Skip header rows
        if re.search(r'class="fooevo"', row, re.IGNORECASE):
            continue

        # Name: look for <u>Name</u> in cells[1]
        name_m = re.search(r'<u>([^<]+)</u>', cells[1], re.IGNORECASE)
        if not name_m:
            # Fallback: alt attribute in cells[0]
            name_m = re.search(r'alt="([^"]+)"', cells[0], re.IGNORECASE)
        if not name_m:
            continue

        name = clean_text(name_m.group(1))
        if not name or name.lower() in ('image', 'name', 'quantity'):
            continue
        # Apply Serebii typo fixes
        name = HABITAT_NAME_FIXES.get(name.lower(), name)

        # If the name cell has no <a href> link, this item accepts any variant
        has_link = bool(re.search(r'<a\s+href=["\']', cells[1], re.IGNORECASE))
        if not has_link and '(any)' not in name.lower():
            name = name + ' (any)'

        # Quantity: last cell, clean text should be an integer
        qty_text = clean_text(cells[2])
        try:
            qty = int(qty_text)
        except ValueError:
            qty = 1

        results.append({'name': name, 'qty': qty})

    return results


def load_habitat_slugs() -> list[str]:
    """Load habitat slugs from habitats.ts."""
    ts = (DATA_DIR / 'habitats.ts').read_text(encoding='utf-8')
    return re.findall(r'"slug":\s*"([^"]+)"', ts)


def scrape_habitats(use_cache: bool) -> None:
    slugs = load_habitat_slugs()
    print(f'Processing {len(slugs)} habitats...\n')

    results: dict[str, list[dict]] = {}
    no_req: list[str] = []
    failures: list[str] = []

    for i, slug in enumerate(slugs, 1):
        url = f'{BASE}/pokemonpokopia/habitatdex/{slug}.shtml'
        cache_key = f'habitat-{slug}'
        print(f'  [{i:3d}/{len(slugs)}] {slug}...', end=' ', flush=True)

        html = fetch(url, cache_key, use_cache)
        if not html:
            print('FAILED')
            failures.append(slug)
            continue

        reqs = parse_habitat_requirements(html)
        results[slug] = reqs

        if reqs:
            print(f'OK -- {len(reqs)} item(s)')
        else:
            no_req.append(slug)
            print('OK -- no requirements')

    # Write habitat-requirements.ts
    out = DATA_DIR / 'habitat-requirements.ts'
    lines = ['import type { HabitatRequirement } from "../types";\n',
             '\nexport const HABITAT_REQUIREMENTS: Record<string, HabitatRequirement[]> = {']

    for slug, reqs in sorted(results.items()):
        if not reqs:
            continue
        items_json = ', '.join(
            f'{{ name: "{js_str(r["name"])}", qty: {r["qty"]} }}'
            for r in reqs
        )
        lines.append(f'  "{slug}": [{items_json}],')

    lines.append('};\n')
    out.write_text('\n'.join(lines), encoding='utf-8')

    hr()
    print(f'Habitats: {len(results)} processed, {len(no_req)} without requirements, {len(failures)} failed.')
    print(f'Written to {out.relative_to(ROOT)}')
    if failures:
        print(f'Failed slugs: {failures}')


# ── ITEM CRAFTING RECIPES ──────────────────────────────────────────────────────

# Category heading normalisation
CATEGORY_NORM = {
    'furniture': 'Furniture',
    'misc':      'Misc',
    'outdoor':   'Outdoor',
    'utilities': 'Utilities',
    'buildings': 'Buildings',
    'blocks':    'Blocks',
    'other':     'Other',
}


def parse_crafting_materials(td_html: str) -> list[dict]:
    """
    Parse ingredients from the requirements <td>.
    Serebii uses a nested table: <td><u>Name</u></a> * N</td>
    """
    materials: list[dict] = []
    for m in re.finditer(r'<u>([^<]+)</u></a>\s*\*\s*(\d+)', td_html, re.IGNORECASE):
        name = clean_text(m.group(1))
        qty  = int(m.group(2))
        if name:
            materials.append({'name': name, 'qty': qty})
    return materials


def parse_crafting_page(html: str) -> list[dict]:
    """
    Parse all craftable items from the /pokemonpokopia/crafting.shtml page.

    HTML structure (actual Serebii):
      <h2><a name="furniture"></a>List of Furniture</h2>
      <table class="dextable">
        <tr>  ← item row (no closing </tr> before next item)
          <td class="cen"><a href="items/storagebox.shtml"><img alt="Storage Box"/></a></td>
          <td class="cen"><a href="items/storagebox.shtml">Storage Box</u></a></td>
          <td class="fooinfo">Register 6 Pokémon</td>
          <td class="fooinfo">
            <table><tr>
              <td><img/></td>
              <td><a href="..."><u>Lumber</u></a> * 1</td>
            </tr></table>   ← no closing </td> on outer fooinfo
        </tr><tr>  ← next item
    """
    html = re.sub(r'<(script|style)[^>]*>.*?</\1>', '', html, flags=re.DOTALL | re.IGNORECASE)

    # Map h2 heading position → category name
    sections: list[tuple[int, str]] = []
    for m in re.finditer(r'<h2[^>]*>(.*?)</h2>', html, re.DOTALL | re.IGNORECASE):
        heading = clean_text(m.group(1))  # clean_text strips <a name="..."> etc.
        heading_key = re.sub(r'^list\s+of\s+', '', heading.lower().strip()).rstrip('.')
        cat = CATEGORY_NORM.get(heading_key, heading.strip())
        sections.append((m.start(), cat))

    # Find each item entry by its image cell: <td class="cen"><a href="items/SLUG"><img
    item_starts = list(re.finditer(
        r'<td\s+class="cen">\s*<a\s+href="items/([a-z0-9]+)\.shtml"[^>]*>\s*<img',
        html, re.IGNORECASE,
    ))

    results: list[dict] = []

    for i, m in enumerate(item_starts):
        pos = m.start()

        # Determine category: last section header before this item
        category = 'Other'
        for sec_pos, sec_cat in sections:
            if sec_pos <= pos:
                category = sec_cat

        # Chunk = from this item start to next item start (or end)
        end_pos = item_starts[i + 1].start() if i + 1 < len(item_starts) else len(html)
        chunk = html[pos:end_pos]

        # Item name from img alt (most reliable — name td has broken </u></a>)
        name_m = re.search(r'alt="([^"]+)"', chunk)
        if not name_m:
            continue
        name = clean_text(name_m.group(1))
        if not name or name.lower() in ('picture', 'image'):
            continue

        # First <td class="fooinfo"> → unlock condition
        unlock_m = re.search(r'<td\s+class="fooinfo">(.*?)</td>', chunk, re.DOTALL | re.IGNORECASE)
        if not unlock_m:
            continue
        # Replace <br> with " / " before stripping tags so multi-line unlocks stay readable
        unlock_raw = re.sub(r'<br\s*/?>', ' / ', unlock_m.group(1), flags=re.IGNORECASE)
        unlock = clean_text(unlock_raw)

        # Second <td class="fooinfo"> → nested ingredients table (may lack closing </td>)
        after_unlock = chunk[unlock_m.end():]
        mats_m = re.search(r'<td\s+class="fooinfo">(.*)', after_unlock, re.DOTALL | re.IGNORECASE)
        if not mats_m:
            continue

        materials = parse_crafting_materials(mats_m.group(1))
        if not materials:
            continue

        results.append({
            'name':      name,
            'slug':      name_to_slug(name),
            'category':  category,
            'unlock':    unlock,
            'materials': materials,
        })

    return results


def scrape_items(use_cache: bool) -> None:
    url = f'{BASE}/pokemonpokopia/crafting.shtml'
    print('Fetching crafting page...')
    html = fetch(url, 'crafting-index', use_cache)
    if not html:
        sys.exit('Could not fetch crafting page')

    recipes = parse_crafting_page(html)
    print(f'Parsed {len(recipes)} craftable items.\n')

    # Dedupe by slug (keep first occurrence)
    seen: set[str] = set()
    deduped: list[dict] = []
    for r in recipes:
        if r['slug'] not in seen:
            seen.add(r['slug'])
            deduped.append(r)

    print(f'After dedup: {len(deduped)} unique items.')

    # Group by category for summary
    from collections import Counter
    cats = Counter(r['category'] for r in deduped)
    for cat, count in sorted(cats.items()):
        print(f'  {cat}: {count}')

    # Write crafting.ts
    out = DATA_DIR / 'crafting.ts'
    lines = ['import type { CraftingRecipe } from "../types";\n',
             '\nexport const ITEM_RECIPES: Record<string, CraftingRecipe> = {']

    for r in deduped:
        mats_json = ', '.join(
            f'{{ name: "{js_str(m["name"])}", qty: {m["qty"]} }}'
            for m in r['materials']
        )
        lines.append(
            f'  "{js_str(r["slug"])}": {{'
            f' category: "{js_str(r["category"])}",'
            f' unlock: "{js_str(r["unlock"])}",'
            f' materials: [{mats_json}] }},'
        )

    lines.append('};\n')
    out.write_text('\n'.join(lines), encoding='utf-8')

    hr()
    print(f'Written {len(deduped)} recipes to {out.relative_to(ROOT)}')


# ── ICONS ──────────────────────────────────────────────────────────────────────

ICONS_DIR = ROOT / 'public' / 'icons' / 'items'
ITEMS_TS  = DATA_DIR / 'items.ts'


def icon_filename(name: str) -> str:
    """'Side table' → 'sidetable.png'  (same convention as Serebii)"""
    return name.lower().replace(' ', '') + '.png'


def load_existing_item_names() -> set[str]:
    content = ITEMS_TS.read_text(encoding='utf-8')
    return set(re.findall(r'"name":\s*"([^"]+)"', content))


def collect_all_requirement_names() -> set[str]:
    """Names referenced in habitat-requirements.ts and crafting.ts materials."""
    names: set[str] = set()
    req_ts = (DATA_DIR / 'habitat-requirements.ts').read_text(encoding='utf-8')
    names.update(re.findall(r'name:\s*"([^"]+)"', req_ts))
    craft_ts = (DATA_DIR / 'crafting.ts').read_text(encoding='utf-8')
    # item names from crafting.ts keys (slugs) + material names
    names.update(re.findall(r'name:\s*"([^"]+)"', craft_ts))
    # Also add crafted item names (the keys are slugs — recover display names from alt-names in crafting)
    # The crafted items themselves are not in items.ts either; their names are in the crafting alt text
    for m in re.finditer(r'"([^"]+)":\s*\{\s*category:', craft_ts):
        slug = m.group(1)
        # Convert slug back to title-cased name for lookup
        # We don't have the exact display name here, so skip — covered by habitat requirements
    return names


def append_items_to_ts(new_entries: list[dict]) -> None:
    """Append new item entries to items.ts before the closing };"""
    content = ITEMS_TS.read_text(encoding='utf-8')
    inserts = []
    for e in new_entries:
        icon_val = f'"/icons/items/{icon_filename(e["name"])}"' if e['has_icon'] else 'null'
        block = (
            f'  "{js_str(e["name"])}": {{\n'
            f'    "slug": "{js_str(e["slug"])}",\n'
            f'    "name": "{js_str(e["name"])}",\n'
            f'    "icon": {icon_val},\n'
            f'    "categories": []\n'
            f'  }}'
        )
        inserts.append(block)

    insertion = ',\n'.join(inserts)
    # Insert before the final };
    close_pos = content.rfind('};')
    content = content[:close_pos] + ',\n' + insertion + '\n' + content[close_pos:]
    ITEMS_TS.write_text(content, encoding='utf-8')


def scrape_icons(use_cache: bool) -> None:
    existing = load_existing_item_names()
    all_names = collect_all_requirement_names()
    missing = sorted(n for n in all_names if n not in existing and len(n) > 1)

    print(f'Items in items.ts: {len(existing)}')
    print(f'Unique names referenced in requirements/crafting: {len(all_names)}')
    print(f'Missing from items.ts: {len(missing)}\n')

    ICONS_DIR.mkdir(parents=True, exist_ok=True)
    added: list[dict] = []
    no_icon: list[str] = []

    for i, name in enumerate(missing, 1):
        fname    = icon_filename(name)
        icon_url = f'{BASE}/pokemonpokopia/items/{fname}'
        local    = ICONS_DIR / fname
        cache    = CACHE_DIR / f'req-icon-{fname}'

        print(f'  [{i:3d}/{len(missing)}] {name!r}...', end=' ', flush=True)

        if local.exists():
            print('already exists')
            added.append({'name': name, 'slug': name_to_slug(name), 'has_icon': True})
            continue

        data = fetch_bytes(icon_url, cache, use_cache)
        if data and len(data) > 200:  # skip tiny/empty responses
            local.write_bytes(data)
            print(f'OK ({len(data)} bytes)')
            added.append({'name': name, 'slug': name_to_slug(name), 'has_icon': True})
        else:
            print('no icon')
            no_icon.append(name)
            added.append({'name': name, 'slug': name_to_slug(name), 'has_icon': False})

    hr()
    print(f'Downloaded: {sum(1 for a in added if a["has_icon"])} / No icon: {len(no_icon)}')
    if no_icon:
        print(f'No icon: {no_icon[:10]}{"..." if len(no_icon) > 10 else ""}')

    if added:
        print(f'\nAppending {len(added)} entries to items.ts...')
        append_items_to_ts(added)
        print('Done.')


# ── CLI ────────────────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(description='Crafting recipe scraper for Pokopia')
    parser.add_argument('step', choices=['habitats', 'items', 'icons', 'all'])
    parser.add_argument('--no-cache', action='store_true')
    args = parser.parse_args()
    use_cache = not args.no_cache

    if args.step in ('habitats', 'all'):
        scrape_habitats(use_cache)
        if args.step == 'all':
            print()

    if args.step in ('items', 'all'):
        scrape_items(use_cache)
        if args.step == 'all':
            print()

    if args.step in ('icons', 'all'):
        scrape_icons(use_cache)


if __name__ == '__main__':
    main()
