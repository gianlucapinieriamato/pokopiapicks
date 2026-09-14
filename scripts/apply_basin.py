#!/usr/bin/env python3
"""
Write scripts/cache/basin_manifest.json into the data files. No network access.

Refuses to touch anything that already exists, so re-running it is a no-op:
  app/lib/const/items.ts           new Item consts
  app/lib/const/categories.ts      favorite-item membership for the new items
  app/lib/const/crafting.ts        new recipes
  app/lib/const/habitat-config.ts  new HabitatConfig consts
  app/lib/const/specialties.ts     new Specialty consts
  app/lib/const/locations.ts       the Bubbly Basin Location const
  app/lib/const/pokemon.ts         the Basin Pokedex entries
  data/locations.json              Bubbly Basin, in label form
  data/pokemon-extra.json          classification / height / weight
  scripts/consts-map.json          slug -> const lookup
"""

import json
import re
from pathlib import Path

ROOT = Path(__file__).parent.parent
CACHE = Path(__file__).parent / 'cache'
CONST = ROOT / 'app/lib/const'
DATA = ROOT / 'data'
CMAP = Path(__file__).parent / 'consts-map.json'

MANIFEST = json.loads((CACHE / 'basin_manifest.json').read_text(encoding='utf-8'))


def esc(s: str) -> str:
    return s.replace('\\', '\\\\').replace('"', '\\"')


def ts_string(indent: str, key: str, value: str | None) -> str:
    """`key: "value",` — wrapped the way the rest of these files wrap it."""
    if value is None:
        return f'{indent}{key}: null,'
    line = f'{indent}{key}: "{esc(value)}",'
    if len(line) <= 80:
        return line
    return f'{indent}{key}:\n{indent}  "{esc(value)}",'


def insert_sorted(source: str, blocks: dict[str, str], terminator: str) -> str:
    """Splice `const: block` entries into their alphabetical slot."""
    marks = [(m.group(1), m.start()) for m in re.finditer(r'^  (\w+): \{', source, re.M)]
    end = source.index(terminator)
    at_position: dict[int, list[tuple[str, str]]] = {}
    for const, block in blocks.items():
        position = next((start for name, start in marks if name > const), end)
        at_position.setdefault(position, []).append((const, block))
    for position in sorted(at_position, reverse=True):
        insertion = ''.join(b for _c, b in sorted(at_position[position]))
        source = source[:position] + insertion + source[position:]
    return source


def report(path: Path, added: int, what: str) -> None:
    print(f'{path.relative_to(ROOT)}: +{added} {what}')


# ── items.ts ───────────────────────────────────────────────────────────────

def apply_items() -> list[dict]:
    path = CONST / 'items.ts'
    source = path.read_text(encoding='utf-8')
    existing = set(re.findall(r'^  (\w+): \{', source, re.M))
    existing_slugs = set(re.findall(r'slug: "([^"]+)"', source))

    new = [e for e in MANIFEST['items']
           if e['const'] not in existing and e['slug'] not in existing_slugs]
    blocks = {e['const']: (
        f'  {e["const"]}: {{\n'
        f'{ts_string("    ", "slug", e["slug"])}\n'
        f'{ts_string("    ", "label", e["label"])}\n'
        f'{ts_string("    ", "icon", e["icon"])}\n'
        f'  }},\n') for e in new}
    path.write_text(insert_sorted(source, blocks, '\n} as const;'), encoding='utf-8')
    report(path, len(new), 'items')
    return new


# ── categories.ts ──────────────────────────────────────────────────────────

def apply_categories(new_items: list[dict]) -> None:
    path = CONST / 'categories.ts'
    source = path.read_text(encoding='utf-8')

    by_category: dict[str, list[str]] = {}
    for entry in new_items:
        for slug in entry['categories']:
            by_category.setdefault(slug, []).append(entry['const'])

    added = 0
    for slug, consts in by_category.items():
        m = re.search(r'slug: "' + re.escape(slug) + r'",.*?\n(\s*)\] as ItemConst\[\],',
                      source, re.S)
        if not m:
            raise SystemExit(f'category block not found: {slug}')
        indent = m.group(1) + '  '
        present = set(re.findall(r'Item\.(\w+),', source[m.start():m.end()]))
        insertion = ''.join(f'{indent}Item.{c},\n' for c in consts if c not in present)
        source = source[:m.end(1) - len(m.group(1))] + insertion + source[m.end(1) - len(m.group(1)):]
        added += insertion.count('\n')
    path.write_text(source, encoding='utf-8')
    report(path, added, f'memberships across {len(by_category)} categories')


# ── crafting.ts ────────────────────────────────────────────────────────────

def apply_crafting(new_items: list[dict]) -> None:
    path = CONST / 'crafting.ts'
    source = path.read_text(encoding='utf-8')
    existing = set(re.findall(r'^  "([^"]+)":', source, re.M))

    blocks = []
    for entry in new_items:
        recipe = entry['recipe']
        if not recipe or entry['slug'] in existing:
            continue
        materials = ',\n'.join(
            f'      {{\n'
            f'        item: Item.{material["const"]},\n'
            f'        qty: {material["qty"]},\n'
            f'      }}'
            for material in recipe['materials'])
        blocks.append(
            f'  "{entry["slug"]}": {{\n'
            f'    "category": "{esc(recipe["category"])}",\n'
            f'    "unlock": "{esc(recipe["unlock"])}",\n'
            f'    "materials": [\n{materials}\n    ]\n'
            f'  }}')
    if blocks:
        source = source.replace('\n} as const;', ',\n' + ',\n'.join(blocks) + '\n} as const;', 1)
        path.write_text(source, encoding='utf-8')
    report(path, len(blocks), 'recipes')


# ── habitat-config.ts ──────────────────────────────────────────────────────

def apply_habitats() -> None:
    path = CONST / 'habitat-config.ts'
    source = path.read_text(encoding='utf-8')
    existing = set(re.findall(r'^  (\w+): \{', source, re.M))
    existing_slugs = set(re.findall(r'slug: "([^"]+)"', source))

    new = [h for h in MANIFEST['habitats']
           if h['const'] not in existing and h['slug'] not in existing_slugs]
    blocks = {}
    for habitat in new:
        requirements = ''
        for req in habitat['requirements']:
            if req['type'] == 'item':
                requirements += (
                    f'      {{\n'
                    f'        type: "item" as const,\n'
                    f'        item: Item.{req["const"]},\n'
                    f'{ts_string("        ", "label", req["label"])}\n'
                    f'        qty: {req["qty"]},\n'
                    f'      }},\n')
            else:
                requirements += (
                    f'      {{\n'
                    f'        type: "group" as const,\n'
                    f'{ts_string("        ", "groupKey", req["groupKey"])}\n'
                    f'{ts_string("        ", "label", req["label"])}\n'
                    f'        qty: {req["qty"]},\n'
                    f'      }},\n')
        blocks[habitat['const']] = (
            f'  {habitat["const"]}: {{\n'
            f'{ts_string("    ", "slug", habitat["slug"])}\n'
            f'{ts_string("    ", "label", habitat["label"])}\n'
            f'{ts_string("    ", "description", habitat["description"])}\n'
            f'    requirements: [\n{requirements}    ],\n'
            f'  }},\n')
    path.write_text(insert_sorted(source, blocks, '\n} as const;'), encoding='utf-8')
    report(path, len(new), 'habitats')


# ── specialties.ts ─────────────────────────────────────────────────────────

def apply_specialties() -> None:
    path = CONST / 'specialties.ts'
    source = path.read_text(encoding='utf-8')
    existing = set(re.findall(r'^  (\w+): \{', source, re.M))

    new = [s for s in MANIFEST['specialties'] if s['const'] not in existing]
    blocks = {s['const']: (
        f'  {s["const"]}: {{\n'
        f'{ts_string("    ", "slug", s["slug"])}\n'
        f'{ts_string("    ", "label", s["label"])}\n'
        f'{ts_string("    ", "description", s["description"])}\n'
        f'  }},\n') for s in new}
    path.write_text(insert_sorted(source, blocks, '\n} as const;'), encoding='utf-8')
    report(path, len(new), 'specialties')


# ── locations.ts ───────────────────────────────────────────────────────────

def apply_location() -> None:
    path = CONST / 'locations.ts'
    source = path.read_text(encoding='utf-8')
    location = MANIFEST['location']
    if f'  {location["const"]}: {{' in source:
        report(path, 0, 'locations (already present)')
        return

    def item_array(key: str, consts: list[str]) -> str:
        items = ''.join(f'      Item.{c},\n' for c in consts)
        return f'    {key}: [\n{items}    ] as ItemConst[],\n'

    shop = ''.join(f'      {{ item: Item.{s["const"]}, level: {s["level"]} }},\n'
                   for s in location['shopItems'])
    block = (
        f'  {location["const"]}: {{\n'
        f'{ts_string("    ", "slug", location["slug"])}\n'
        f'{ts_string("    ", "label", location["label"])}\n'
        f'{ts_string("    ", "description", location["description"])}\n'
        f'{ts_string("    ", "objective", location["objective"])}\n'
        + item_array('materials', location['materials'])
        + item_array('blocksAndPlants', location['blocksAndPlants'])
        + item_array('itemsInArea', location['itemsInArea'])
        + item_array('itemsInPokeballs', location['itemsInPokeballs'])
        + item_array('treasure', location['treasure'])
        + f'    shopItems: [\n{shop}    ] as ShopItemConst[],\n'
        f'  }},\n')
    source = source.replace('\n} as const;', '\n' + block + '} as const;', 1)
    path.write_text(source, encoding='utf-8')
    report(path, 1, 'locations')


# ── pokemon.ts ─────────────────────────────────────────────────────────────

LOCATION_CONST = {
    'witheredwastelands': 'WitheredWastelands', 'bleakbeach': 'BleakBeach',
    'rockyridges': 'RockyRidges', 'sparklingskylands': 'SparklingSkylands',
    'palettetown': 'PaletteTown', 'cloudisland': 'CloudIsland',
    'bubblybasin': 'BubblyBasin',
}


def apply_pokemon() -> None:
    path = CONST / 'pokemon.ts'
    source = path.read_text(encoding='utf-8')
    existing = set(re.findall(r'^  (\w+): \{', source, re.M))
    existing_slugs = set(re.findall(r'slug: "([^"]+)"', source))

    habitat_const = {
        re.search(r'slug: "([^"]+)"', body).group(1): const
        for const, body in _const_blocks(
            (CONST / 'habitat-config.ts').read_text(encoding='utf-8')).items()
        if re.search(r'slug: "([^"]+)"', body)
    }
    specialty_const = {
        re.search(r'slug: "([^"]+)"', body).group(1): const
        for const, body in _const_blocks(
            (CONST / 'specialties.ts').read_text(encoding='utf-8')).items()
        if re.search(r'slug: "([^"]+)"', body)
    }
    category_const = {
        re.search(r'slug: "([^"]+)"', body).group(1): const
        for const, body in _const_blocks(
            (CONST / 'categories.ts').read_text(encoding='utf-8')).items()
        if re.search(r'slug: "([^"]+)"', body)
    }

    blocks = []
    new = [p for p in MANIFEST['pokemon']
           if p['const'] not in existing and p['slug'] not in existing_slugs]
    for pokemon in new:
        habitats = ''
        for habitat in pokemon['habitatList']:
            locations = ''.join(f'          Location.{LOCATION_CONST[loc]},\n'
                                for loc in habitat['locations'])
            rarity = (f'Rarity.{habitat["rarity"].replace(" ", "")}'
                      if habitat['rarity'] else 'null')
            times = ', '.join(f'Time.{t}' for t in habitat['time'])
            weather = ', '.join(f'Weather.{w}' for w in habitat['weather'])
            habitats += (
                f'      {{\n'
                f'        habitat: HabitatConfig.{habitat_const[habitat["habitatSlug"]]},\n'
                f'        locations: [\n{locations}        ],\n'
                f'        rarity: {rarity},\n'
                f'        time: [{times}],\n'
                f'        weather: [{weather}],\n'
                f'        isCloudIsland: {str("cloudisland" in habitat["locations"]).lower()},\n'
                f'      }} as HabitatListConst,\n')
        categories = ''.join(f'      Category.{category_const[c]},\n'
                             for c in sorted(pokemon['categories'],
                                             key=lambda c: category_const[c]))
        specialties = ', '.join(f'Specialty.{specialty_const[s]}'
                                for s in pokemon['specialties'])
        primary = (f'Location.{LOCATION_CONST[pokemon["primaryLocation"]]}'
                   if pokemon['primaryLocation'] else 'null')
        flavor = f'Flavor.{pokemon["flavor"]}' if pokemon['flavor'] else 'null'
        blocks.append(
            f'  {pokemon["const"]}: {{\n'
            f'{ts_string("    ", "slug", pokemon["slug"])}\n'
            f'{ts_string("    ", "label", pokemon["label"])}\n'
            f'    num: {pokemon["num"]},\n'
            f'    nationalDexNum: {pokemon["nationalDexNum"]},\n'
            f'    isLegendary: {str(pokemon["isLegendary"]).lower()},\n'
            f'{ts_string("    ", "classification", pokemon["classification"])}\n'
            f'{ts_string("    ", "heightFt", pokemon["heightFt"])}\n'
            f'{ts_string("    ", "heightM", pokemon["heightM"])}\n'
            f'{ts_string("    ", "weightLbs", pokemon["weightLbs"])}\n'
            f'{ts_string("    ", "weightKg", pokemon["weightKg"])}\n'
            f'{ts_string("    ", "icon", pokemon["icon"])}\n'
            f'    types: [{", ".join(f"PokemonType.{t}" for t in pokemon["types"])}],\n'
            f'    habitat: PokemonHabitat.{pokemon["habitat"]},\n'
            f'    flavor: {flavor},\n'
            f'    categories: [\n{categories}    ],\n'
            f'    specialties: [{specialties}],\n'
            f'    primaryLocation: {primary},\n'
            f'    habitatList: [\n{habitats}    ],\n'
            f'  }},\n')
    if blocks:
        marker = '\n  },\n};'
        assert source.count(marker) == 1, 'unexpected end of Pokemon record'
        source = source.replace(marker, '\n  },\n' + ''.join(blocks) + '};', 1)
        path.write_text(source, encoding='utf-8')
    report(path, len(new), 'pokemon')


def _const_blocks(source: str) -> dict[str, str]:
    marks = [(m.group(1), m.start()) for m in re.finditer(r'^  (\w+): \{', source, re.M)]
    return {name: source[start:(marks[i + 1][1] if i + 1 < len(marks) else len(source))]
            for i, (name, start) in enumerate(marks)}


# ── data/*.json ────────────────────────────────────────────────────────────

def apply_data_json() -> None:
    label_by_const = {
        const: re.search(r'label: "((?:[^"\\]|\\.)*)"', body).group(1).replace('\\"', '"')
        for const, body in _const_blocks(
            (CONST / 'items.ts').read_text(encoding='utf-8')).items()
        if re.search(r'label: "', body)
    }

    path = DATA / 'locations.json'
    locations = json.loads(path.read_text(encoding='utf-8'))
    location = MANIFEST['location']
    if location['slug'] not in locations:
        locations[location['slug']] = {
            'slug': location['slug'],
            'name': location['label'],
            'description': location['description'],
            'objective': location['objective'],
            **{key: [label_by_const[c] for c in location[key]] for key in
               ('materials', 'blocksAndPlants', 'itemsInArea', 'itemsInPokeballs', 'treasure')},
            'shopItems': [{'name': label_by_const[s['const']], 'level': s['level']}
                          for s in location['shopItems']],
        }
        path.write_text(json.dumps(locations, ensure_ascii=False, indent=2), encoding='utf-8')
        report(path, 1, 'locations')

    path = DATA / 'pokemon-extra.json'
    extra = json.loads(path.read_text(encoding='utf-8'))
    added = 0
    for pokemon in MANIFEST['pokemon']:
        if pokemon['slug'] in extra:
            continue
        extra[pokemon['slug']] = {key: pokemon[key] for key in
                                  ('classification', 'heightFt', 'heightM',
                                   'weightLbs', 'weightKg')}
        added += 1
    path.write_text(json.dumps(dict(sorted(extra.items())), ensure_ascii=False, indent=2),
                    encoding='utf-8')
    report(path, added, 'pokemon')


# ── consts-map.json ────────────────────────────────────────────────────────

def apply_consts_map() -> None:
    source = CMAP.read_text(encoding='utf-8')
    additions = (
        [(f'Item::{e["slug"]}', f'Item.{e["const"]}') for e in MANIFEST['items']]
        + [(f'HabitatConfig::{h["slug"]}', f'HabitatConfig.{h["const"]}')
           for h in MANIFEST['habitats']]
        + [(f'Specialty::{s["slug"]}', f'Specialty.{s["const"]}')
           for s in MANIFEST['specialties']]
        + [(f'Location::{MANIFEST["location"]["slug"]}',
            f'Location.{MANIFEST["location"]["const"]}')]
        + [(f'Pokemon::{p["slug"]}', f'Pokemon.{p["const"]}') for p in MANIFEST['pokemon']]
    )
    existing = set(re.findall(r'"([^"]+)":', source))
    lines = [f'  "{key}": "{value}",' for key, value in additions if key not in existing]
    if lines:
        source = source.rstrip()
        assert source.endswith('}')
        body = source[:-1].rstrip()
        if not body.endswith(','):
            body += ','
        CMAP.write_text(body + '\n' + '\n'.join(lines).rstrip(',') + '\n}\n', encoding='utf-8')
    report(CMAP, len(lines), 'mappings')


def main() -> None:
    new_items = apply_items()
    apply_categories(new_items)
    apply_crafting(new_items)
    apply_habitats()
    apply_specialties()
    apply_location()
    apply_pokemon()
    apply_data_json()
    apply_consts_map()


if __name__ == '__main__':
    main()
