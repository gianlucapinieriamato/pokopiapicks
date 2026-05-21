"""
Augments data/pokemon.json with Pokémon type data from PokéAPI.
Adds a `types` field (list of 1-2 capitalized type names, e.g. ["Rock", "Ground"]).
Uses local cache in scripts/cache/types/ to avoid re-fetching.
"""

import json
import os
import time
import urllib.request

DATA_PATH = os.path.join(os.path.dirname(__file__), "../data/pokemon.json")
CACHE_DIR = os.path.join(os.path.dirname(__file__), "cache/types")
API_BASE = "https://pokeapi.co/api/v2/pokemon"

os.makedirs(CACHE_DIR, exist_ok=True)

with open(DATA_PATH, encoding="utf-8") as f:
    pokemon = json.load(f)

updated = 0
skipped = 0

for slug, entry in pokemon.items():
    dex = entry.get("nationalDexNum")
    if not dex:
        skipped += 1
        continue

    cache_file = os.path.join(CACHE_DIR, f"{dex}.json")
    if os.path.exists(cache_file):
        with open(cache_file, encoding="utf-8") as f:
            data = json.load(f)
    else:
        url = f"{API_BASE}/{dex}"
        print(f"Fetching {slug} (#{dex})...")
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "pokopia-wiki/1.0 (https://github.com/gianlucapinieriamato/pokopia-wiki)"})
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.load(resp)
            with open(cache_file, "w", encoding="utf-8") as f:
                json.dump(data, f)
            time.sleep(0.5)
        except Exception as e:
            print(f"  ERROR for {slug}: {e}")
            skipped += 1
            continue

    types = [t["type"]["name"].capitalize() for t in sorted(data["types"], key=lambda x: x["slot"])]
    entry["types"] = types
    updated += 1

with open(DATA_PATH, "w", encoding="utf-8") as f:
    json.dump(pokemon, f, ensure_ascii=False, indent=2)

print(f"\nDone. Updated: {updated}, Skipped (no dex#): {skipped}")
