#!/usr/bin/env python3
"""
Parse the cached Bubbly Basin pages into scripts/cache/basin_manifest.json.

No network access — run scripts/scrape_basin.py first.

The manifest holds everything the Expansion Pass Part 1 adds, already resolved
against the existing consts so scripts/apply_basin.py can write it out verbatim:
  items       new Item consts (+ favorite categories, + crafting recipe)
  habitats    new HabitatConfig consts (+ resolved requirements)
  specialties new Specialty consts
  location    the Bubbly Basin Location const
  pokemon     the 52 Basin Pokedex entries
"""

import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent
CACHE = Path(__file__).parent / 'cache'
CONST = ROOT / 'app/lib/const'


# ── Text helpers ───────────────────────────────────────────────────────────

def unesc(s: str) -> str:
    return html.unescape(s).replace('�', 'e').replace('é', 'e')


def unesc_accented(s: str) -> str:
    """Like unesc(), but keeps the accent: Serebii writes "Pok&eacute;mon" and
    the Pokemon classifications in our data are spelled "... Pokemon" with it."""
    return html.unescape(s).replace('�', 'é')


def strip_tags(s: str) -> str:
    return re.sub(r'\s+', ' ', unesc(re.sub(r'<[^>]+>', ' ', s))).strip()


def strip_tags_accented(s: str) -> str:
    return re.sub(r'\s+', ' ', unesc_accented(re.sub(r'<[^>]+>', ' ', s))).strip()


def norm(s: str) -> str:
    """Loose key for matching labels across pages."""
    return re.sub(r'[^a-z0-9]+', ' ', unesc(s).lower()).strip()


def slugify(label: str) -> str:
    return re.sub(r'[^a-z0-9]+', '-', unesc(label).lower()).strip('-')


def pascal(label: str) -> str:
    parts = re.split(r'[^A-Za-z0-9]+', unesc(label))
    return ''.join(p[:1].upper() + p[1:] if p else '' for p in parts)


def read(name: str) -> str:
    p = CACHE / f'{name}.html'
    if not p.exists():
        sys.exit(f'missing cache file: {p} — run scripts/scrape_basin.py first')
    return p.read_text(encoding='utf-8', errors='replace')


def const_blocks(source: str) -> dict[str, str]:
    """const name -> its body. Splits on entry boundaries, so it copes with the
    one-line entries Prettier collapses short objects into."""
    marks = [(m.group(1), m.start()) for m in re.finditer(r'^  (\w+): \{', source, re.M)]
    return {name: source[start:(marks[i + 1][1] if i + 1 < len(marks) else len(source))]
            for i, (name, start) in enumerate(marks)}


# ── Existing consts ────────────────────────────────────────────────────────

items_ts = (CONST / 'items.ts').read_text(encoding='utf-8')
EXISTING_ITEM_CONSTS = set(re.findall(r'^  (\w+): \{', items_ts, re.M))
EXISTING_ITEM_SLUGS = set(re.findall(r'slug: "([^"]+)"', items_ts))
EXISTING_ITEM_ICONS = set(re.findall(r'icon: "/icons/items/([^"]+)"', items_ts))
ITEM_LABEL2CONST: dict[str, str] = {}
ITEM_CONST2LABEL: dict[str, str] = {}
for const, body in const_blocks(items_ts).items():
    lm = re.search(r'label: "((?:[^"\\]|\\.)*)"', body)
    if lm:
        ITEM_LABEL2CONST[norm(lm.group(1))] = const
        ITEM_CONST2LABEL[const] = lm.group(1).replace('\\"', '"')

habitats_ts = (CONST / 'habitat-config.ts').read_text(encoding='utf-8')
EXISTING_HABITAT_SLUGS = set(re.findall(r'slug: "([^"]+)"', habitats_ts))
groups_ts = (CONST / 'item-groups.ts').read_text(encoding='utf-8')
GROUP_KEYS = (set(re.findall(r'"([^"]+)":\s*\[', groups_ts))
              | set(re.findall(r'groupKey: "([^"]+)"', habitats_ts)))

specialties_ts = (CONST / 'specialties.ts').read_text(encoding='utf-8')
EXISTING_SPECIALTY_SLUGS = set(re.findall(r'slug: "([^"]+)"', specialties_ts))

categories_ts = (CONST / 'categories.ts').read_text(encoding='utf-8')
CATEGORY_CONST_BY_SLUG = {
    re.search(r'slug: "([^"]+)"', body).group(1): const
    for const, body in const_blocks(categories_ts).items()
    if re.search(r'slug: "([^"]+)"', body)
}
# Serebii's favorites URLs drop the hyphens our slugs use.
CATEGORY_BY_HREF = {s.replace('-', ''): s for s in CATEGORY_CONST_BY_SLUG}

pokemon_ts = (CONST / 'pokemon.ts').read_text(encoding='utf-8')
EXISTING_PKMN_SLUGS = set(re.findall(r'slug: "([^"]+)"', pokemon_ts))
EXISTING_PKMN_CONSTS = set(re.findall(r'^  (\w+): \{', pokemon_ts, re.M))

warnings: list[str] = []


# ── Item universe (items.shtml) ────────────────────────────────────────────

def parse_item_universe() -> dict[str, dict]:
    page = read('items-index')
    labels: dict[str, str] = {}
    for href, label in re.findall(
            r'<td class="cen"><a href="items/([^"]+)\.shtml"><u>([^<]*)</u></a></td>', page):
        labels.setdefault(href, unesc(label).strip())
    universe: dict[str, dict] = {}
    for href, icon, alt in re.findall(
            r'<td class="cen"><a href="items/([^"]+)\.shtml">'
            r'<img src="items/([^"]+)"[^>]*alt="([^"]*)"\s*/></a></td>', page):
        if href in universe:
            continue
        universe[href] = {
            'href': f'{href}.shtml',
            'icon_file': icon,
            'label': labels.get(href) or unesc(alt).strip(),
        }
    return universe


ITEM_UNIVERSE = parse_item_universe()
HREF2LABEL = {v['href']: v['label'] for v in ITEM_UNIVERSE.values()}


# ── Favorite categories: item href -> [category slug] ──────────────────────

def parse_favorite_membership() -> dict[str, list[str]]:
    membership: dict[str, list[str]] = {}
    for href_slug, cat_slug in CATEGORY_BY_HREF.items():
        f = CACHE / f'fav-{href_slug}.html'
        if not f.exists():
            warnings.append(f'no cached favorites page for category {cat_slug}')
            continue
        page = f.read_text(encoding='utf-8', errors='replace')
        seen: set[str] = set()
        for item_href in re.findall(r'/pokemonpokopia/items/([^"]+\.shtml)', page):
            if item_href in HREF2LABEL and item_href not in seen:
                seen.add(item_href)
                membership.setdefault(item_href, []).append(cat_slug)
    return membership


FAV_MEMBERSHIP = parse_favorite_membership()


# ── Crafting recipes: item href -> {category, unlock, materials} ───────────

CRAFT_CATEGORY_LABEL = {
    'furniture': 'Furniture', 'misc': 'Misc', 'misc.': 'Misc', 'outdoor': 'Outdoor',
    'utilities': 'Utilities', 'buildings': 'Buildings', 'blocks': 'Blocks',
    'other': 'Other', 'food': 'Food', 'kits': 'Kits', 'nature': 'Nature',
}


def parse_recipes() -> dict[str, dict]:
    page = read('crafting')
    anchors = sorted(((m.group(1).rstrip('.').lower(), m.start())
                      for m in re.finditer(r'<a name="([^"]+)"', page)),
                     key=lambda x: x[1])

    def category_at(pos: int) -> str:
        current = None
        for name, start in anchors:
            if start <= pos:
                current = name
            else:
                break
        return CRAFT_CATEGORY_LABEL.get(current, 'Misc')

    pic_re = re.compile(
        r'<td class="cen"><a href="items/([^"]+\.shtml)">'
        r'<img src="items/[^"]+"[^>]*alt="([^"]*)"\s*/></a></td>')
    picks = [(m.group(1), m.start(), m.end()) for m in pic_re.finditer(page)]
    recipes: dict[str, dict] = {}
    for i, (href, start, end) in enumerate(picks):
        stop = picks[i + 1][1] if i + 1 < len(picks) else len(page)
        chunk = page[end:stop]
        unlock = ''
        um = re.search(r'<td class="fooinfo">(.*?)</td>', chunk, re.S)
        if um:
            unlock = strip_tags(re.sub(r'<br\s*/?>', ' / ', um.group(1)))
        materials = [(mh, unesc(ml), int(q)) for mh, ml, q in re.findall(
            r'<a href="items/([^"]+\.shtml)"><u>([^<]+)</u></a>\s*\*\s*(\d+)', chunk)]
        recipes[href] = {'category': category_at(start), 'unlock': unlock,
                         'materials': materials}
    return recipes


RECIPES = parse_recipes()


# ── New items ──────────────────────────────────────────────────────────────

def build_items() -> list[dict]:
    out: list[dict] = []
    used_consts = set(EXISTING_ITEM_CONSTS)
    used_slugs = set(EXISTING_ITEM_SLUGS)
    for entry in ITEM_UNIVERSE.values():
        if entry['icon_file'] in EXISTING_ITEM_ICONS:
            continue
        label = entry['label']
        const, slug = pascal(label), slugify(label)
        if const in used_consts or slug in used_slugs:
            warnings.append(f'item collision: {label!r} -> {const}/{slug}')
            continue
        used_consts.add(const)
        used_slugs.add(slug)
        out.append({
            'label': label,
            'slug': slug,
            'const': const,
            'icon': f'/icons/items/{entry["icon_file"]}',
            'icon_file': entry['icon_file'],
            'href': entry['href'],
            'categories': sorted(FAV_MEMBERSHIP.get(entry['href'], [])),
            'recipe': RECIPES.get(entry['href']),
        })
    out.sort(key=lambda e: e['const'])
    return out


NEW_ITEMS = build_items()
# label -> const across existing and new items, for recipe/requirement resolution
LABEL2CONST = {**ITEM_LABEL2CONST, **{norm(e['label']): e['const'] for e in NEW_ITEMS}}
HREF2CONST = {e['href']: e['const'] for e in NEW_ITEMS}
for href, label in HREF2LABEL.items():
    HREF2CONST.setdefault(href, LABEL2CONST.get(norm(label)))


def resolve_item(label: str, href: str | None = None) -> str | None:
    const = LABEL2CONST.get(norm(label))
    if const is None and href:
        const = HREF2CONST.get(href)
    return const


for entry in NEW_ITEMS:
    if not entry['recipe']:
        continue
    resolved = [(resolve_item(ml, mh), ml, qty)
                for mh, ml, qty in entry['recipe']['materials']]
    unresolved = [ml for const, ml, _q in resolved if const is None]
    if unresolved:
        # Serebii lists a material we have no item for — drop the recipe rather
        # than publish an incomplete one.
        warnings.append(f'dropped recipe for {entry["label"]!r}: unresolved {unresolved}')
        entry['recipe'] = None
    else:
        entry['recipe']['materials'] = [{'const': const, 'qty': qty}
                                        for const, _ml, qty in resolved]


# ── New habitats ───────────────────────────────────────────────────────────

# Typos on the Serebii habitat pages, mapped onto the real ITEM_GROUPS keys.
GROUP_KEY_FIXES = {'seat (widde)': 'seat (wide)', 'garbage bagss': 'garbage bags'}


def group_key(name: str) -> str:
    key = re.sub(r'\s*\(any\)\s*$', '', name.strip(), flags=re.I)
    key = re.sub(r'\s+', ' ', key.lower()).strip()
    key = re.sub(r'\s*\(', ' (', key)
    return GROUP_KEY_FIXES.get(key, key)


def build_habitats(slugs: list[str]) -> list[dict]:
    out = []
    for slug in slugs:
        if slug in EXISTING_HABITAT_SLUGS:
            continue
        f = CACHE / f'habitat-{slug}.html'
        if not f.exists():
            warnings.append(f'no cached habitat page for {slug}')
            continue
        page = f.read_text(encoding='utf-8', errors='replace')
        label = strip_tags(re.search(r'<h1>(.*?)</h1>', page, re.S).group(1))

        description = ''
        body = re.sub(r'<(script|style)[^>]*>.*?</\1>', '', page, flags=re.S | re.I)
        for m in re.finditer(r'<td[^>]*>(.*?)</td>', body, re.S | re.I):
            text = strip_tags(m.group(1))
            if len(text) > 30 and re.search(r'[a-z]{4}', text) and 'Serebii' not in text:
                description = text
                break

        requirements = []
        i = page.find('<h2>Requirements</h2>')
        if i >= 0:
            table = page[i:page.find('</table>', i) + 8]
            for row in re.findall(r'<tr>(.*?)</tr>', table, re.S):
                if 'fooevo' in row:
                    continue
                nm = re.search(r'<u>([^<]+)</u>', row)
                if not nm:
                    continue
                name = unesc(nm.group(1)).strip()
                qm = re.search(r'<td class="fooinfo">\s*(\d*)\s*</td>\s*$', row.strip())
                qty = int(qm.group(1)) if (qm and qm.group(1)) else 1
                link = re.search(r'items/([^"]+\.shtml)', row)
                if link:
                    const = resolve_item(name, link.group(1))
                    if const is None:
                        warnings.append(f'unresolved habitat item {name!r} in {slug}')
                        continue
                    requirements.append({'type': 'item', 'const': const,
                                         'label': ITEM_CONST2LABEL.get(const, name), 'qty': qty})
                else:
                    key = group_key(name)
                    if key not in GROUP_KEYS:
                        warnings.append(f'unknown group key {key!r} in habitat {slug}')
                    requirements.append({'type': 'group', 'groupKey': key,
                                         'label': name, 'qty': qty})
        out.append({'slug': slug, 'const': pascal(label), 'label': label,
                    'description': description, 'requirements': requirements})
    out.sort(key=lambda e: e['const'])
    return out


# ── Pokemon pages ──────────────────────────────────────────────────────────

TYPE_CONST = {
    'bug': 'Bug', 'dark': 'Dark', 'dragon': 'Dragon', 'electric': 'Electric',
    'fairy': 'Fairy', 'fighting': 'Fighting', 'fire': 'Fire', 'flying': 'Flying',
    'ghost': 'Ghost', 'grass': 'Grass', 'ground': 'Ground', 'ice': 'Ice',
    'normal': 'Normal', 'poison': 'Poison', 'psychic': 'Psychic', 'rock': 'Rock',
    'steel': 'Steel', 'water': 'Water',
}


def parse_habitat_table(page: str) -> list[dict]:
    """The Habitats & Locations table is column-per-habitat, so read it by column."""
    i = page.find('Habitats & Locations')
    if i < 0:
        return []
    section = page[i:page.find('</main>', i)]

    slugs = re.findall(
        r'<td class="fooevo"><a href="/pokemonpokopia/habitatdex/([^"\.]+)\.shtml"', section)
    if not slugs:
        return []

    locations = re.findall(r'<b>Location</b>:(.*?)</td>', section, re.S)
    rarities = re.findall(r'<b>Rarity</b>:\s*<br\s*/?>\s*([A-Za-z ]+)', section)
    timeweather = re.findall(
        r'<b>Time</b></td><td[^>]*><b>Weather</b></td></tr>\s*'
        r'<tr><td valign="top">(.*?)</td><td valign="top">(.*?)</tr>', section, re.S)

    out = []
    for n, slug in enumerate(slugs):
        loc_cell = locations[n] if n < len(locations) else ''
        times, weather = timeweather[n] if n < len(timeweather) else ('', '')
        out.append({
            'habitatSlug': slug,
            'locations': re.findall(r'/pokemonpokopia/locations/([a-z]+)\.shtml', loc_cell),
            'rarity': rarities[n].strip().title() if n < len(rarities) else None,
            'time': [t for t in ('Morning', 'Day', 'Evening', 'Night') if t in strip_tags(times)],
            'weather': [w for w in ('Sun', 'Cloud', 'Rain') if w in strip_tags(weather)],
        })
    return out


def build_pokemon(roster: list[dict]) -> list[dict]:
    out = []
    for entry in roster:
        slug = entry['slug']
        page = read(f'pkmn-{slug}')
        head = page[page.find('<a name="general">'):page.find('Habitats & Locations')]

        num, label = re.search(r'<h1>#(\d+)\s*([^<]+)</h1>', head).groups()
        national = int(re.search(r'/pokemonpokopia/pokemon/(\d+)[^"]*\.png', head).group(1))
        types = [TYPE_CONST[t] for t in dict.fromkeys(
            re.findall(r'/pokedex-sv/type/icon/([a-z]+)\.png', head))]

        info = re.findall(r'<td class="fooinfo">(.*?)</td>', head, re.S)
        classification = strip_tags_accented(info[0]) if info else ''
        height = strip_tags(info[1]).split(' ') if len(info) > 1 else ['', '']
        weight = strip_tags(info[2]).split(' ') if len(info) > 2 else ['', '']

        specialties = list(dict.fromkeys(
            re.findall(r'/pokemonpokopia/pokedex/specialty/([a-z0-9\-]+)\.shtml', head)))
        ideal = re.search(r'/pokemonpokopia/pokedex/idealhabitat/([a-z]+)\.shtml', head)
        categories = [CATEGORY_BY_HREF[c] for c in dict.fromkeys(
            re.findall(r'/pokemonpokopia/favorites/([a-z0-9\-]+)\.shtml', head))
            if c in CATEGORY_BY_HREF]
        flavor = re.search(r'<u>(Dry|Sour|Spicy|Sweet|Bitter) flavors</u>', head, re.I)

        habitat_list = parse_habitat_table(page)
        locations = [loc for h in habitat_list for loc in h['locations']]
        primary = ('bubblybasin' if 'bubblybasin' in locations
                   else next((loc for loc in locations if loc != 'cloudisland'), None))

        if not types:
            warnings.append(f'{slug}: no types parsed')
        if not habitat_list:
            warnings.append(f'{slug}: no habitats parsed')

        out.append({
            'slug': slug,
            'const': pascal(label),
            'label': unesc(label).strip(),
            'num': int(num),
            'nationalDexNum': national,
            'isLegendary': False,  # set by main() once habitats are known
            'classification': classification or None,
            'heightFt': height[0] or None,
            'heightM': height[1] if len(height) > 1 else None,
            'weightLbs': weight[0] or None,
            'weightKg': weight[1] if len(weight) > 1 else None,
            'icon': entry['sprite'],
            'types': types,
            'habitat': (ideal.group(1).capitalize() if ideal else None),
            'flavor': flavor.group(1).capitalize() if flavor else None,
            'categories': categories,
            'specialties': specialties or entry['specialties'],
            'primaryLocation': primary,
            'habitatList': habitat_list,
            'canDive': 'Underwater capable' in head,
        })
    return out


# ── New specialties ────────────────────────────────────────────────────────

def build_specialties() -> list[dict]:
    index = read('specialty-index')
    out = []
    for slug, label, description in re.findall(
            r'href="pokedex/specialty/([a-z0-9\-]+)\.shtml"><u>([^<]+)</u></a></td>'
            r'\s*<td[^>]*>([^<]*)', index):
        if slug in EXISTING_SPECIALTY_SLUGS:
            continue
        out.append({'slug': slug, 'const': pascal(label), 'label': unesc(label).strip(),
                    'description': strip_tags(description)})
    return out


# ── Bubbly Basin location ──────────────────────────────────────────────────

def section_items(page: str, heading: str) -> list[str]:
    """Item consts listed under an <h2> heading of the location page."""
    m = re.search(r'<h2[^>]*>[^<]*' + heading + r'[^<]*</h2>(.*?)(?=<h2|</main)',
                  page, re.I | re.S)
    if not m:
        warnings.append(f'bubblybasin: no section matching {heading!r}')
        return []
    out = []
    for href, label in re.findall(
            r'<td class="fooevo"><a href="/pokemonpokopia/items/([^"]+)\.shtml">([^<]+)</a>',
            m.group(1)):
        # "X Recipe" entries drop the recipe for X — same item either way.
        label = re.sub(r'\s*Recipe\s*$', '', unesc(label).strip())
        const = resolve_item(label, f'{href}.shtml')
        if const is None:
            warnings.append(f'bubblybasin {heading}: unresolved item {label!r}')
        elif const not in out:
            out.append(const)
    return out


def build_location() -> dict:
    page = re.sub(r'<(script|style)[^>]*>.*?</\1>', '',
                  read('location-bubblybasin'), flags=re.S | re.I)
    paragraphs = [strip_tags(m.group(1)) for m in
                  re.finditer(r'<p>(.*?)</p>', page[page.find('<h1>'):], re.S)]
    description = ' '.join(p for p in paragraphs if len(p) > 40)

    shop = []
    m = re.search(r'<h2[^>]*>[^<]*Exclusive Shop Items[^<]*</h2>(.*?)(?=<h2|</main)',
                  page, re.I | re.S)
    if m:
        for row in re.findall(r'<tr[^>]*>(.*?)</tr>', m.group(1), re.S | re.I):
            lvl = re.search(r'Lv\.\s*(\d+)', row)
            name = re.search(r'<td class="cen">([^<]+)</td>', row)
            if not (lvl and name):
                continue
            # "X Recipe" rows sell the recipe for X — same item either way.
            label = re.sub(r'\s*Recipe\s*$', '', strip_tags(name.group(1)))
            const = resolve_item(label)
            if const is None:
                warnings.append(f'bubblybasin shop: unresolved item {label!r}')
            else:
                shop.append({'const': const, 'level': int(lvl.group(1))})

    return {
        'slug': 'bubblybasin',
        'const': 'BubblyBasin',
        'label': 'Bubbly Basin',
        'description': description,
        'objective': '',
        'materials': section_items(page, 'Naturally Occuring Materials'),
        'blocksAndPlants': section_items(page, r'Naturally Occuring Plants'),
        # Whirlpool drops have no field of their own — they are found in the area.
        'itemsInArea': (section_items(page, 'Items Found in Area')
                        + section_items(page, 'Items found in Whirlpools')),
        'itemsInPokeballs': section_items(page, r'Items Found in Pok'),
        'treasure': section_items(page, 'Treasure Found in Area'),
        'shopItems': shop,
    }


# ── Assemble ───────────────────────────────────────────────────────────────

def main() -> None:
    roster = json.loads((CACHE / 'basin_roster.json').read_text(encoding='utf-8'))
    roster = [r for r in roster if r['slug'] not in EXISTING_PKMN_SLUGS]

    # Serebii does not flag legendaries on the Pokemon pages themselves, but
    # they are exactly the Pokemon with no Habitats & Locations table: they are
    # befriended through the story rather than found in a habitat. That holds
    # for the 12 legendaries already in the data, and for Phione and Manaphy
    # here.
    pokemon = build_pokemon(roster)
    for entry in pokemon:
        entry['isLegendary'] = not entry['habitatList']
    habitat_slugs = list(dict.fromkeys(h['habitatSlug'] for p in pokemon for h in p['habitatList']))

    manifest = {
        'items': NEW_ITEMS,
        'habitats': build_habitats(habitat_slugs),
        'specialties': build_specialties(),
        'location': build_location(),
        'pokemon': pokemon,
    }
    (CACHE / 'basin_manifest.json').write_text(
        json.dumps(manifest, ensure_ascii=False, indent=1), encoding='utf-8')

    loc = manifest['location']
    print(f'items:       {len(manifest["items"]):4d} new '
          f'({sum(1 for e in manifest["items"] if e["categories"])} with categories, '
          f'{sum(1 for e in manifest["items"] if e["recipe"])} with recipes)')
    print(f'habitats:    {len(manifest["habitats"]):4d} new')
    print(f'specialties: {len(manifest["specialties"]):4d} new '
          f'({", ".join(s["label"] for s in manifest["specialties"]) or "-"})')
    print(f'pokemon:     {len(manifest["pokemon"]):4d} new')
    print(f'location:    {loc["label"]} — {len(loc["materials"])} materials, '
          f'{len(loc["blocksAndPlants"])} plants, {len(loc["itemsInArea"])} area, '
          f'{len(loc["itemsInPokeballs"])} balls, {len(loc["treasure"])} treasure, '
          f'{len(loc["shopItems"])} shop')
    if warnings:
        print(f'\n{len(warnings)} warning(s):')
        for w in warnings[:40]:
            print(f'  {w}')


if __name__ == '__main__':
    main()
