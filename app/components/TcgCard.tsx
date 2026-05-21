import { pkmnIconUrl, dexNum, getRarity } from "@/app/lib/data";
import type { PokemonEntry } from "@/app/lib/types";

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
  const holoOpacity = r.holoIntensity / 100;
  const [h1, h2] = HABITAT_BG[p.habitat] ?? ["#d8ccb8", "#a89070"];

  return (
    <div style={{
      width: "100%",
      maxWidth: isLg ? 340 : isSm ? 220 : 260,
      aspectRatio: "1 / 1.42",
      borderRadius: isLg ? 16 : 12,
      background: `linear-gradient(135deg, var(--accent-soft) 0%, var(--accent) 30%, var(--accent-soft) 60%, var(--accent-deep) 100%)`,
      padding: isLg ? 7 : 4,
      position: "relative",
      boxShadow: `
        0 0 0 1px rgba(138,105,25,0.35),
        0 ${isLg ? 18 : 8}px ${isLg ? 36 : 20}px -10px rgba(45,36,24,0.35)
        ${r.sparkles ? ", 0 0 28px rgba(201,149,43,0.3)" : ""}
      `,
    }}>
      {/* Inner card face */}
      <div style={{
        width: "100%",
        height: "100%",
        borderRadius: isLg ? 10 : 8,
        background: "var(--paper)",
        border: "1.5px solid rgba(138,105,25,0.28)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}>

        {/* ── Header: name + dex num ─────────────────────────── */}
        <div style={{
          padding: isLg ? "10px 14px" : "6px 9px",
          background: `linear-gradient(180deg, var(--bg-2) 0%, var(--chrome) 100%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1.5px solid var(--accent)",
          flexShrink: 0,
          gap: 4,
        }}>
          <div style={{
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 800,
            fontSize: isLg ? 20 : isSm ? 12 : 14,
            letterSpacing: "-0.01em",
            lineHeight: 1,
            color: "var(--ink)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            minWidth: 0,
          }}>
            {p.name}
            {r.sparkles && (
              <span style={{ fontSize: isLg ? 13 : 9, color: "var(--accent)", filter: "drop-shadow(0 0 3px var(--accent))", marginLeft: 4 }}>★</span>
            )}
          </div>
          <div style={{
            fontFamily: "'JetBrains Mono', 'DM Mono', monospace",
            fontWeight: 600,
            fontSize: isLg ? 11 : 8,
            color: "var(--accent-deep)",
            letterSpacing: "0.08em",
            flexShrink: 0,
          }}>{dexNum(p)}</div>
        </div>

        {/* ── Art window: 54% of card height ────────────────── */}
        <div style={{
          margin: isLg ? "8px 8px 0" : "4px 4px 0",
          height: "54%",
          borderRadius: 6,
          background: `linear-gradient(160deg, ${h1} 0%, ${h2} 100%)`,
          position: "relative",
          overflow: "hidden",
          border: "1.5px solid rgba(138,105,25,0.42)",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          flexShrink: 0,
        }}>
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
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: HOLO, mixBlendMode: "screen", opacity: holoOpacity,
          }} />
          {/* Habitat pill */}
          <div style={{
            position: "absolute", top: 5, left: 5,
            padding: "2px 7px", borderRadius: 99,
            background: "rgba(255,255,255,0.84)", color: "var(--ink)",
            fontFamily: "'Outfit', sans-serif", fontWeight: 700,
            fontSize: isLg ? 10 : 8, letterSpacing: "0.03em",
          }}>{p.habitat}</div>
          {/* Badge */}
          {(giftCount !== null || r.sparkles) && (
            <div style={{
              position: "absolute", top: 5, right: 5,
              padding: "2px 7px", borderRadius: 99,
              background: r.sparkles
                ? `linear-gradient(135deg, var(--accent), var(--accent-deep))`
                : "var(--accent)",
              color: "var(--paper)",
              fontFamily: "'Outfit', sans-serif", fontWeight: 800,
              fontSize: isLg ? 10 : 8, letterSpacing: "0.03em",
              boxShadow: "0 1px 0 var(--accent-deep)",
            }}>
              {r.sparkles ? "LEGENDARY" : `${giftCount} GIFTS`}
            </div>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={pkmnIconUrl(p)}
            alt={p.name}
            style={{
              width: "75%",
              height: "88%",
              objectFit: "contain",
              imageRendering: "pixelated",
              filter: "drop-shadow(0 4px 0 rgba(45,36,24,0.20))",
              position: "relative",
              zIndex: 1,
              marginBottom: -2,
            }}
          />
        </div>

        {/* ── Category chips ──────────────────────────────────── */}
        <div style={{
          padding: isLg ? "6px 10px 4px" : "4px 6px 3px",
          display: "flex",
          flexWrap: "wrap",
          gap: 3,
          flexShrink: 0,
        }}>
          {p.categories.slice(0, isSm ? 2 : isLg ? undefined : 3).map((c) => (
            <span key={c} className="pkmn-cat-tag" style={{
              fontSize: isSm ? 8 : 9,
              padding: isSm ? "2px 6px" : "2px 8px",
              lineHeight: 1.4,
            }}>{c}</span>
          ))}
        </div>

        {/* ── Footer bar ─────────────────────────────────────── */}
        <div style={{
          marginTop: "auto",
          padding: isLg ? "6px 12px 8px" : "3px 8px 5px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: `linear-gradient(180deg, transparent, var(--chrome))`,
          borderTop: "1px solid var(--paper-edge)",
          flexShrink: 0,
        }}>
          <span style={{
            fontFamily: "'JetBrains Mono', 'DM Mono', monospace",
            fontSize: isLg ? 9 : 7,
            color: "var(--ink-fade)",
            letterSpacing: "0.08em",
            fontWeight: 600,
          }}>POKOPIA · PICKS</span>
          <span style={{
            fontFamily: "'JetBrains Mono', 'DM Mono', monospace",
            fontSize: isLg ? 9 : 7,
            color: r.sparkles ? "var(--accent)" : "var(--ink-fade)",
            letterSpacing: "0.06em",
            fontWeight: 600,
          }}>{r.rarityLabel}</span>
        </div>

        {/* Holo sweep */}
        <div className="tcg-holo-sweep" style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: HOLO, mixBlendMode: "soft-light",
          opacity: r.sparkles ? holoOpacity * 0.65 : 0,
        }} />
      </div>
    </div>
  );
}
