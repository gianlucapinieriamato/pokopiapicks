#!/usr/bin/env python3
"""
Tier 2 — Download HQ official artwork sprites from PokeAPI.

Source: https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/{num}.png
Target: /icons/sprites-hq/{slug}.png

Usage:
  python scripts/download_sprites.py
  python scripts/download_sprites.py --force   # re-download even if cached
"""

import argparse
import json
import re
import sys
import time
import urllib.request
from pathlib import Path

ROOT     = Path(__file__).parent.parent
DATA_DIR = ROOT / 'data'
OUT_DIR  = ROOT / 'icons' / 'sprites-hq'
OUT_DIR.mkdir(parents=True, exist_ok=True)

BASE_URL = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork'
DELAY    = 0.3  # seconds between requests (GitHub raw is not Serebii — can be faster)
MAX_RETRIES = 3


def fetch_binary(url: str) -> bytes | None:
    for attempt in range(MAX_RETRIES):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'pokopia-wiki/1.0'})
            with urllib.request.urlopen(req, timeout=20) as resp:
                return resp.read()
        except Exception as e:
            print(f'    [attempt {attempt + 1}/{MAX_RETRIES}] {e}', file=sys.stderr)
            if attempt < MAX_RETRIES - 1:
                time.sleep(2 ** attempt)
    return None


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('--force', action='store_true', help='Re-download even if file exists')
    args = parser.parse_args()

    pokemon = json.loads((DATA_DIR / 'pokemon.json').read_text(encoding='utf-8'))

    ok = 0
    failed: list[str] = []
    skipped = 0

    for slug, pkmn in pokemon.items():
        num = pkmn.get('nationalDexNum')
        if not num:
            print(f'  SKIP {slug} — no nationalDexNum')
            failed.append(slug)
            continue

        out_file = OUT_DIR / f'{slug}.png'
        if out_file.exists() and not args.force:
            skipped += 1
            continue

        url = f'{BASE_URL}/{num}.png'
        print(f'  [{ok + len(failed) + 1}/{len(pokemon)}] {slug} (#{num})...', end=' ', flush=True)

        # Form-specific URL overrides for PokeAPI alternate form sprites
        FORM_OVERRIDES = {
            'paldeanwooper':      f'{BASE_URL}/194-paldea.png',
            'shelloseastsea':     f'{BASE_URL}/422-east.png',
            'gastrodoneastsea':   f'{BASE_URL}/423-east.png',
            'toxtricityampedform':  f'{BASE_URL}/849-amped.png',
            'toxtricitylowkeyform': f'{BASE_URL}/849-low-key.png',
            'tatsugiridroopyform':  f'{BASE_URL}/978-droopy.png',
            'tatsugiristretchyform': f'{BASE_URL}/978-stretchy.png',
            'tatsugiricurlyform':   f'{BASE_URL}/978-curly.png',
        }
        urls_to_try = [FORM_OVERRIDES.get(slug, url), url]

        data = None
        for try_url in dict.fromkeys(urls_to_try):  # dedup preserving order
            data = fetch_binary(try_url)
            if data:
                break
            time.sleep(DELAY)

        if data:
            out_file.write_bytes(data)
            print('OK')
            ok += 1
            time.sleep(DELAY)
        else:
            print('FAILED')
            failed.append(slug)

    print('-' * 60)
    print(f'OK: {ok}, Skipped (already exists): {skipped}, Failed: {len(failed)}')
    if failed:
        print(f'Failed slugs: {failed}')


if __name__ == '__main__':
    main()
