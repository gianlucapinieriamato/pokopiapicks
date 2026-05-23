#!/usr/bin/env python3
"""
Patches app/lib/const/pokemon.ts to insert classification/height/weight
into every Pokemon entry, after the `isLegendary:` field.

Safe to re-run: skips entries that already have `classification:`.
Reads from data/pokemon-extra.json.
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).parent.parent
EXTRA_JSON = ROOT / 'data' / 'pokemon-extra.json'
POKEMON_TS = ROOT / 'app' / 'lib' / 'const' / 'pokemon.ts'

extra: dict[str, dict] = json.loads(EXTRA_JSON.read_text(encoding='utf-8'))
content = POKEMON_TS.read_text(encoding='utf-8')


def ts_string(v: str | None) -> str:
    if v is None:
        return 'null'
    escaped = v.replace('\\', '\\\\').replace('"', '\\"')
    return f'"{escaped}"'


# Match an isLegendary line NOT already followed by classification
ISLEGENDARY_RE = re.compile(
    r'(    isLegendary: (?:true|false),\n)'
    r'(?!    classification:)',
)


def make_extra_block(slug: str) -> str:
    d = extra.get(slug, {})
    classification = ts_string(d.get('classification'))
    height_ft      = ts_string(d.get('heightFt'))
    height_m       = ts_string(d.get('heightM'))
    weight_lbs     = ts_string(d.get('weightLbs'))
    weight_kg      = ts_string(d.get('weightKg'))
    return (
        f'    classification: {classification},\n'
        f'    heightFt: {height_ft},\n'
        f'    heightM: {height_m},\n'
        f'    weightLbs: {weight_lbs},\n'
        f'    weightKg: {weight_kg},\n'
    )


# Split into per-Pokemon blocks using `  Key: {` boundaries
BLOCK_RE = re.compile(
    r'(  \w+: \{[\s\S]*?^\s{2}\},?\n)',
    re.MULTILINE,
)

SLUG_RE = re.compile(r'    slug: "([^"]+)"')


def patch_block(block: str) -> str:
    slug_m = SLUG_RE.search(block)
    if not slug_m:
        return block
    slug = slug_m.group(1)
    if 'classification:' in block:
        return block  # already patched
    extra_lines = make_extra_block(slug)
    return ISLEGENDARY_RE.sub(r'\1' + extra_lines, block, count=1)


patched = BLOCK_RE.sub(lambda m: patch_block(m.group(1)), content)

POKEMON_TS.write_text(patched, encoding='utf-8')
print('Patched pokemon.ts')
