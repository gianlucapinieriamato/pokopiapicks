"use client";
import Link from "next/link";
import { useState, useMemo } from "react";
import { POKEMON_LIST, SPECIALTIES, pkmnIconUrl } from "@/app/lib/data";

const HABITATS = ["Dry", "Bright", "Warm", "Cool", "Dark", "Humid"];
const FLAVORS = ["Dry", "Sour", "Spicy", "Sweet", "Bitter"];
const ALL_SPECIALTIES = Object.values(SPECIALTIES).sort((a, b) => a.name.localeCompare(b.name));

const PAGE_SIZE = 60;

export default function PokedexPage() {
  const [habitatFilter, setHabitatFilter] = useState<string[]>([]);
  const [flavorFilter, setFlavorFilter] = useState<string[]>([]);
  const [specialtyFilter, setSpecialtyFilter] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let list = POKEMON_LIST;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }
    if (habitatFilter.length) list = list.filter((p) => habitatFilter.includes(p.habitat));
    if (flavorFilter.length) list = list.filter((p) => p.flavor && flavorFilter.includes(p.flavor));
    if (specialtyFilter.length) list = list.filter((p) =>
      p.specialties?.some((s) => specialtyFilter.includes(s))
    );
    return list;
  }, [search, habitatFilter, flavorFilter, specialtyFilter]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggle = (arr: string[], val: string, set: (v: string[]) => void) => {
    set(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
    setPage(1);
  };

  return (
    <div className="detail-wrap">
      <div className="breadcrumb">
        <Link href="/">Home</Link><span>›</span><span>Pokédex</span>
      </div>
      <div className="detail-header">
        <div className="detail-title">Pokédex</div>
        <div className="detail-meta">{filtered.length} / {POKEMON_LIST.length} Pokémon</div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 16 }}>
        <input
          type="text"
          className="search-input"
          placeholder="Search Pokémon…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          style={{ marginBottom: 16 }}
        />

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div className="stat-label" style={{ marginBottom: 6 }}>Ideal Habitat</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {HABITATS.map((h) => (
                <button
                  key={h}
                  className="shortcut"
                  style={habitatFilter.includes(h) ? { background: "var(--ink)", color: "var(--paper)", borderColor: "var(--ink)" } : {}}
                  onClick={() => toggle(habitatFilter, h, setHabitatFilter)}
                >{h}</button>
              ))}
            </div>
          </div>
          <div>
            <div className="stat-label" style={{ marginBottom: 6 }}>Flavor</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {FLAVORS.map((f) => (
                <button
                  key={f}
                  className="shortcut"
                  style={flavorFilter.includes(f) ? { background: "var(--ink)", color: "var(--paper)", borderColor: "var(--ink)" } : {}}
                  onClick={() => toggle(flavorFilter, f, setFlavorFilter)}
                >{f}</button>
              ))}
            </div>
          </div>
          <div>
            <div className="stat-label" style={{ marginBottom: 6 }}>Specialty</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {ALL_SPECIALTIES.map((s) => (
                <button
                  key={s.slug}
                  className="shortcut"
                  style={specialtyFilter.includes(s.slug) ? { background: "var(--ink)", color: "var(--paper)", borderColor: "var(--ink)" } : {}}
                  onClick={() => toggle(specialtyFilter, s.slug, setSpecialtyFilter)}
                >{s.name}</button>
              ))}
            </div>
          </div>
        </div>

        {(habitatFilter.length || flavorFilter.length || specialtyFilter.length || search) ? (
          <button className="shortcut" style={{ marginTop: 12 }} onClick={() => { setHabitatFilter([]); setFlavorFilter([]); setSpecialtyFilter([]); setSearch(""); setPage(1); }}>
            Clear filters
          </button>
        ) : null}
      </div>

      {/* Grid */}
      <div className="card">
        {paginated.length === 0 ? (
          <p className="detail-meta">No Pokémon match your filters.</p>
        ) : (
          <div className="pkmn-grid">
            {paginated.map((p) => (
              <Link key={p.slug} href={`/pokemon/${p.slug}`} className="pkmn-grid-card">
                <div className="pkmn-grid-icon">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={pkmnIconUrl(p)} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "contain", imageRendering: "pixelated" }} />
                </div>
                <div className="pkmn-grid-num">#{String(p.num).padStart(3, "0")}</div>
                <div className="pkmn-grid-name">{p.name}</div>
                <div style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "var(--ink-fade)" }}>{p.habitat}</div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 20 }}>
            {page > 1 && <button className="pkmn-nav-btn" onClick={() => setPage(page - 1)}>◀ Prev</button>}
            <span className="detail-meta" style={{ alignSelf: "center" }}>Page {page} / {pages}</span>
            {page < pages && <button className="pkmn-nav-btn" onClick={() => setPage(page + 1)}>Next ▶</button>}
          </div>
        )}
      </div>
    </div>
  );
}
