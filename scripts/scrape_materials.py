#!/usr/bin/env python3
"""
Scrape icons for naturally-occurring materials/plants/blocks found in location pages
that are not yet in items.ts (they have no gift categories — they're collectible field items).

Usage:
  python scripts/scrape_materials.py [--no-cache] [--dry-run]
"""

import argparse
import re
import sys
import time
import urllib.request
from pathlib import Path

ROOT       = Path(__file__).parent.parent
ITEMS_TS   = ROOT / 'app' / 'lib' / 'data' / 'items.ts'
LOCS_TS    = ROOT / 'app' / 'lib' / 'data' / 'locations.ts'
ICONS_DIR  = ROOT / 'public' / 'icons' / 'items'
CACHE_DIR  = Path(__file__).parent / 'cache'
CACHE_DIR.mkdir(exist_ok=True)
ICONS_DIR.mkdir(parents=True, exist_ok=True)

BASE    = 'https://www.serebii.net'
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0',
    'Referer':    'https://www.serebii.net/pokemonpokopia/',
    'Accept':     '*/*',
}
DELAY = 1.8


# ── Helpers ────────────────────────────────────────────────────────────────────

def fetch_bytes(url: str, cache_path: Path, use_cache: bool) -> bytes | None:
    if use_cache and cache_path.exists():
        return cache_path.read_bytes()
    try:
        req = urllib.request.Request(url, headers=HEADERS)
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


def name_to_icon_file(name: str) -> str:
    """'Adorable hedge (blue)' → 'adorablehedge(blue).png'"""
    return name.lower().replace(' ', '') + '.png'


def name_to_slug(name: str) -> str:
    """'Adorable hedge (blue)' → 'adorable-hedge-blue'"""
    s = re.sub(r'[^a-z0-9]+', '-', name.lower())
    return s.strip('-')


# ── Parse existing items.ts ────────────────────────────────────────────────────

def load_existing_item_keys() -> set[str]:
    content = ITEMS_TS.read_text(encoding='utf-8')
    # Top-level keys: lines like   "Item Name": {
    return set(re.findall(r'^\s{2}"([^"]+)": \{', content, re.MULTILINE))


def load_location_materials() -> list[str]:
    """Return all unique item names from locations.ts materials + blocksAndPlants."""
    content = LOCS_TS.read_text(encoding='utf-8')
    items: list[str] = []
    for arr in re.finditer(r'"(?:materials|blocksAndPlants)": \[(.*?)\]', content, re.DOTALL):
        items.extend(re.findall(r'"([^"]+)"', arr.group(1)))
    return sorted(set(items))


# ── Append new entries to items.ts ────────────────────────────────────────────

def append_items_to_ts(new_entries: list[dict]) -> None:
    """Insert new items into items.ts, maintaining alphabetical key order."""
    content = ITEMS_TS.read_text(encoding='utf-8')

    # Build insertion text
    inserts: list[tuple[str, str]] = []  # (key, block)
    for e in new_entries:
        icon_val = f'"/icons/items/{name_to_icon_file(e["name"])}"' if e['icon'] else 'null'
        block = (
            f'  "{e["name"]}": {{\n'
            f'    "slug": "{e["slug"]}",\n'
            f'    "name": "{e["name"]}",\n'
            f'    "icon": {icon_val},\n'
            f'    "categories": []\n'
            f'  }}'
        )
        inserts.append((e['name'].lower(), block))

    inserts.sort(key=lambda x: x[0])

    # Find the closing `};` and insert before it (after sorting into the object)
    # Simple approach: find each insertion point alphabetically
    # The object keys in the file are already sorted — we insert each new key
    # in the right alphabetical position.
    for key, block in inserts:
        # Find the last key that is alphabetically <= our key
        key_re = re.compile(r'\n  "([^"]+)": \{', re.MULTILINE)
        insert_after = 0
        for m in key_re.finditer(content):
            if m.group(1).lower() <= key:
                insert_after = m.end() + content[m.end():].index('}') + 1
            else:
                break
        if insert_after == 0:
            # Insert before first key
            pos = content.index('\n  "')
            content = content[:pos] + '\n' + block + ',' + content[pos:]
        else:
            content = content[:insert_after] + ',\n' + block + content[insert_after:]

    ITEMS_TS.write_text(content, encoding='utf-8')


# ── Main ───────────────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('--no-cache', action='store_true')
    parser.add_argument('--dry-run', action='store_true', help='Report what would be added, do not write')
    args = parser.parse_args()
    use_cache = not args.no_cache

    existing = load_existing_item_keys()
    all_materials = load_location_materials()
    missing = [m for m in all_materials if m not in existing]

    print(f'Found {len(all_materials)} unique location materials.')
    print(f'{len(existing)} already in items.ts, {len(missing)} to add.\n')

    if args.dry_run:
        for m in missing:
            print(f'  {m!r}  icon={name_to_icon_file(m)}  slug={name_to_slug(m)}')
        return

    added: list[dict] = []
    no_icon: list[str] = []

    for i, name in enumerate(missing, 1):
        icon_file = name_to_icon_file(name)
        icon_url  = f'{BASE}/pokemonpokopia/items/{icon_file}'
        local     = ICONS_DIR / icon_file
        cache     = CACHE_DIR / f'item-icon-{icon_file}'

        print(f'  [{i:3d}/{len(missing)}] {name!r}...', end=' ', flush=True)

        data = fetch_bytes(icon_url, cache, use_cache)
        if data:
            local.write_bytes(data)
            print(f'OK  ({len(data)} bytes)')
            added.append({'name': name, 'slug': name_to_slug(name), 'icon': True})
        else:
            print('no icon')
            no_icon.append(name)
            added.append({'name': name, 'slug': name_to_slug(name), 'icon': False})

    print(f'\nDownloaded: {sum(1 for a in added if a["icon"])}  /  No icon: {len(no_icon)}')
    if no_icon:
        print('No icon found for:', no_icon[:10])

    print('\nUpdating items.ts...')
    append_items_to_ts(added)
    print('Done.')


if __name__ == '__main__':
    main()
