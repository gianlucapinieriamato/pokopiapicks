import { pkmnIconUrl, dexNum, getRarity } from "@/app/lib/data";
import type { PokemonEntry } from "@/app/lib/types";

// Habitat gradient stops — maps Pokopia's 6 habitats to art-window colors
const HABITAT_BG: Record<string, [string, string]> = {
  Bright: ["#ffe9a0", "#d4a93a"],
  Cool:   ["#b8dff0", "#4a9abf"],
  Dark:   ["#c8b4d8", "#5a3878"],
  Dry:    ["#e8d4a0", "#b89050"],
  Humid:  ["#a8d4a0", "#4a8a4e"],
  Warm:   ["#f0b880", "#c86030"],
};

const HOLO = `linear-gradient(125deg,
  rgba(255,255,255,0) 0%,
  rgba(255,200,255,0.30) 20%,
  rgba(200,255,240,0.35) 35%,
  rgba(255,250,180,0.40) 50%,
  rgba(200,220,255,0.35) 65%,
  rgba(255,200,220,0.38) 80%,
  rgba(255,255,255,0) 100%)`;

export default function TcgCard({
  p,
  size = "md",
  giftCount = null,
}: {
  p: PokemonEntry;
  size?: "lg" | "md" | "sm";
  giftCount?: number | null;
}) {
  const r = getRarity(p);
  const isLg = size === "lg";
  const isSm = size === "sm";
  const w = isLg ? 340 : isSm ? 175 : 230;
  const ratio = isSm ? 1.45 : 1.4;
  const holoOpacity = r.holoIntensity / 100;
  const [h1, h2] = HABITAT_BG[p.habitat] ?? ["#d8ccb8", "#a89070"];
  const habBg = `linear-gradient(160deg, ${h1} 0%, ${h2} 100%)`;

  return (
    <div style={{
      width: w,
      height: w * ratio,
      flexShrink: 0,
      borderRadius: 14,
      background: `linear-gradient(135deg, var(--accent-soft) 0%, var(--accent) 30%, var(--accent-soft) 60%, var(--accent-deep) 100%)`,
      padding: isLg ? 7 : 5,
      position: "relative",
      boxShadow: `
        0 0 0 1px rgba(138,105,25,0.35),
        0 ${isLg ? 18 : 10}px ${isLg ? 36 : 22}px -10px rgba(45,36,24,0.35)
        ${r.sparkles ? ", 0 0 28px rgba(201,149,43,0.3)" : ""}
      `,
    }}>
      {/* Inner card face */}
      <div style={{
        width: "100%", height: "100%",
        borderRadius: 9,
        background: "var(--paper)",
        border: "1.5px solid rgba(138,105,25,0.28)",
        overflow: "hidden",
        display: "flex", flexDirection: "column",
        position: "relative",
      }}>
        {/* Header strip */}
        <div style={{
          padding: isLg ? "10px 14px" : "7px 10px",
          background: `linear-gradient(180deg, var(--bg-2) 0%, var(--chrome) 100%)`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          borderBottom: "1.5px solid var(--accent)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
            <div style={{
              fontFamily: "'Outfit', sans-serif", fontWeight: 800,
              fontSize: isLg ? 22 : isSm ? 13 : 15,
              letterSpacing: "-0.01em", lineHeight: 1,
              color: "var(--ink)",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>{p.name}</div>
            {r.sparkles && (
              <span style={{ fontSize: isLg ? 14 : 10, color: "var(--accent)", filter: "drop-shadow(0 0 3px var(--accent))" }}>★</span>
            )}
          </div>
          <div style={{
            fontFamily: "'JetBrains Mono', 'DM Mono', monospace", fontWeight: 600,
            fontSize: isLg ? 12 : 9, color: "var(--accent-deep)", letterSpacing: "0.1em",
            flexShrink: 0, marginLeft: 6,
          }}>{dexNum(p)}</div>
        </div>

        {/* Art window */}
        <div style={{
          margin: isLg ? 10 : 6,
          height: isLg ? 260 : isSm ? 130 : 155,
          borderRadius: 7,
          background: habBg,
          position: "relative", overflow: "hidden",
          border: "1.5px solid rgba(138,105,25,0.42)",
          display: "flex", alignItems: "flex-end", justifyContent: "center",
        }}>
          {/* Sparkle dots — legendary only */}
          {r.sparkles && (
            <div style={{
              position: "absolute", inset: 0, pointerEvents: "none",
              backgroundImage: `
                radial-gradient(circle at 18% 22%, rgba(255,255,255,0.95) 1.2px, transparent 2.5px),
                radial-gradient(circle at 72% 30%, rgba(255,255,255,0.85) 1px, transparent 2px),
                radial-gradient(circle at 30% 65%, rgba(255,255,255,0.9) 1.4px, transparent 3px),
                radial-gradient(circle at 85% 70%, rgba(255,255,255,0.8) 1px, transparent 2px),
                radial-gradient(circle at 50% 88%, rgba(255,255,255,0.95) 1.2px, transparent 2.5px)`,
            }} />
          )}
          {/* Holo sheen — intensity scales with rarity */}
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: HOLO, mixBlendMode: "screen", opacity: holoOpacity,
          }} />
          {/* Habitat pill */}
          <div style={{
            position: "absolute", top: 7, left: 7,
            padding: "2px 8px", borderRadius: 99,
            background: "rgba(255,255,255,0.82)", color: "var(--ink)",
            fontFamily: "'Outfit', sans-serif", fontWeight: 700,
            fontSize: isLg ? 11 : 9, letterSpacing: "0.04em",
            backdropFilter: "blur(4px)",
          }}>{p.habitat}</div>
          {/* Badge: LEGENDARY or gift count */}
          {(giftCount !== null || r.sparkles) && (
            <div style={{
              position: "absolute", top: 7, right: 7,
              padding: "2px 8px", borderRadius: 99,
              background: r.sparkles
                ? `linear-gradient(135deg, var(--accent), var(--accent-deep))`
                : "var(--accent)",
              color: "var(--paper)",
              fontFamily: "'Outfit', sans-serif", fontWeight: 800,
              fontSize: isLg ? 11 : 9, letterSpacing: "0.04em",
              boxShadow: "0 2px 0 var(--accent-deep)",
            }}>
              {r.sparkles ? "LEGENDARY" : `${giftCount} GIFTS`}
            </div>
          )}
          {/* Sprite */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={pkmnIconUrl(p)}
            alt={p.name}
            style={{
              width: isLg ? "78%" : "72%",
              height: isLg ? "83%" : "80%",
              objectFit: "contain",
              imageRendering: "pixelated",
              filter: "drop-shadow(0 5px 0 rgba(45,36,24,0.22))",
              position: "relative", zIndex: 1, marginBottom: -4,
            }}
          />
        </div>

        {/* Category chips */}
        <div style={{
          padding: isLg ? "4px 12px 6px" : "3px 8px 4px",
          display: "flex", flexWrap: "wrap", gap: 3,
        }}>
          {p.categories.slice(0, isSm ? 2 : isLg ? undefined : 3).map((c) => (
            <span key={c} className="pkmn-cat-tag" style={{
              fontSize: isSm ? 9 : 10,
              padding: isSm ? "2px 7px" : "3px 9px",
            }}>{c}</span>
          ))}
        </div>

        {/* Footer label — sm/md only */}
        {!isLg && (
          <div style={{
            marginTop: "auto", padding: isSm ? "4px 10px" : "5px 12px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            background: `linear-gradient(180deg, transparent, var(--chrome))`,
            fontFamily: "'JetBrains Mono', 'DM Mono', monospace", fontSize: 8,
            color: "var(--ink-soft)", letterSpacing: "0.1em", fontWeight: 600,
          }}>
            <span>POKOPIA · PICKS</span>
            <span>{r.rarityLabel}</span>
          </div>
        )}

        {/* Overall holo sweep over full card face */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: HOLO, mixBlendMode: "soft-light", opacity: holoOpacity * 0.65,
        }} />
      </div>
    </div>
  );
}
