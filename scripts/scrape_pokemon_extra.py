#!/usr/bin/env python3
"""
Extract classification, height, weight from cached Pokemon detail pages.
Reads scripts/cache/pkmn-{slug}.html — no network requests.
Outputs data/pokemon-extra.json: { slug: { classification, heightFt, heightM, weightLbs, weightKg } }
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).parent.parent
CACHE_DIR = Path(__file__).parent / 'cache'
DATA_DIR = ROOT / 'data'
DATA_DIR.mkdir(exist_ok=True)

HTML_ENTITIES = {
    '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"',
    '&#39;': "'", '&nbsp;': ' ', '&eacute;': 'é', '&Eacute;': 'É',
    '&#8217;': '’', '&#8221;': '”',
}

STATS_RE = re.compile(
    r'<td[^>]*class=["\']foo["\'][^>]*>Type</td>'   # "Type" header cell
    r'.*?'                                            # ...remaining header cells...
    r'<td[^>]*class=["\']cen["\'][^>]*>.*?</td>\s*' # type icons cell (skip)
    r'<td[^>]*class=["\']fooinfo["\'][^>]*>(.*?)</td>\s*'  # classification
    r'<td[^>]*class=["\']fooinfo["\'][^>]*>(.*?)</td>\s*'  # height
    r'<td[^>]*class=["\']fooinfo["\'][^>]*>(.*?)</td>',    # weight
    re.DOTALL | re.IGNORECASE,
)


def decode_html(s: str) -> str:
    for entity, char in HTML_ENTITIES.items():
        s = s.replace(entity, char)
    s = re.sub(r'&[a-zA-Z]+;', '', s)   # drop unknown entities
    s = re.sub(r'&#\d+;', '', s)         # drop unknown numeric entities
    return s.strip()


def clean(s: str) -> str:
    s = re.sub(r'<[^>]+>', ' ', s)   # strip tags
    s = re.sub(r'\s+', ' ', s)
    return decode_html(s).strip()


def split_br(s: str) -> list[str]:
    """Split on <br />, <br/>, <br> and return cleaned parts."""
    parts = re.split(r'<br\s*/?\s*>', s, flags=re.IGNORECASE)
    return [clean(p) for p in parts if clean(p)]


results: dict[str, dict] = {}
missing: list[str] = []

for cache_file in sorted(CACHE_DIR.glob('pkmn-*.html')):
    slug = cache_file.stem[5:]  # strip "pkmn-"
    html = cache_file.read_text(encoding='utf-8', errors='replace')

    m = STATS_RE.search(html)
    if not m:
        print(f'  WARN {slug}: stats table not found')
        missing.append(slug)
        results[slug] = {
            'classification': None,
            'heightFt': None, 'heightM': None,
            'weightLbs': None, 'weightKg': None,
        }
        continue

    classification = clean(m.group(1))

    height_parts = split_br(m.group(2))
    heightFt = height_parts[0] if len(height_parts) > 0 else None
    heightM  = height_parts[1] if len(height_parts) > 1 else None

    weight_parts = split_br(m.group(3))
    weightLbs = weight_parts[0] if len(weight_parts) > 0 else None
    weightKg  = weight_parts[1] if len(weight_parts) > 1 else None

    results[slug] = {
        'classification': classification or None,
        'heightFt': heightFt,
        'heightM': heightM,
        'weightLbs': weightLbs,
        'weightKg': weightKg,
    }
    print(f'  OK {slug}: {classification!r} {heightFt} / {heightM} | {weightLbs} / {weightKg}')

out = DATA_DIR / 'pokemon-extra.json'
out.write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding='utf-8')
print(f'\nDone: {len(results)} entries, {len(missing)} missing -> {out}')
