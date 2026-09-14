#!/usr/bin/env python3
"""
Download the Bubbly Basin item and Pokemon icons from Serebii into /public/icons.

Reads scripts/cache/basin_manifest.json — run scripts/build_basin_manifest.py
first. Already-downloaded icons are skipped, so re-running is cheap.
"""

import json
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).parent.parent
CACHE = Path(__file__).parent / 'cache'
BASE = 'https://www.serebii.net/pokemonpokopia'
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0',
    'Referer': 'https://www.serebii.net/pokemonpokopia/',
}
DELAY = 1.8


def download(url: str, dest: Path) -> bool:
    if dest.exists() and dest.stat().st_size > 0:
        return True
    try:
        request = urllib.request.Request(urllib.parse.quote(url, safe=':/'), headers=HEADERS)
        with urllib.request.urlopen(request, timeout=30) as resp:
            data = resp.read()
    except Exception as e:
        print(f'  WARN {url}: {e}', file=sys.stderr)
        return False
    finally:
        time.sleep(DELAY)
    if not data.startswith(b'\x89PNG'):
        print(f'  WARN {url}: not a PNG', file=sys.stderr)
        return False
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_bytes(data)
    return True


def main() -> None:
    manifest = json.loads((CACHE / 'basin_manifest.json').read_text(encoding='utf-8'))
    jobs = ([(f'{BASE}/items/{e["icon_file"]}',
              ROOT / 'public/icons/items' / e['icon_file']) for e in manifest['items']]
            + [(f'{BASE}/pokemon/small/{p["icon"]}',
                ROOT / 'public/icons/pokemon' / p['icon']) for p in manifest['pokemon']])

    failed = []
    for i, (url, dest) in enumerate(jobs, 1):
        if not download(url, dest):
            failed.append(url)
        if i % 50 == 0:
            print(f'  [{i}/{len(jobs)}] {len(failed)} failed', flush=True)

    print(f'DONE: {len(jobs) - len(failed)}/{len(jobs)} icons present')
    if failed:
        print('failed:', failed)
        sys.exit(1)


if __name__ == '__main__':
    main()
