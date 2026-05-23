import Image from "next/image";
import { pkmnIconUrl, dexNum, getRarity, SPECIALTIES } from "@/app/lib/data";
import type { PokemonEntry } from "@/app/lib/types";

const HABITAT_COLORS: Record<string, [string, string]> = {
  Bright: ["#ffe9a0", "#d4a93a"],
  Cool: ["#b8dff0", "#4a9abf"],
  Dark: ["#c8b4d8", "#5a3878"],
  Dry: ["#e8d4a0", "#b89050"],
  Humid: ["#a8d4a0", "#4a8a4e"],
  Warm: ["#f0b880", "#c86030"],
};

const CHIP_BASE =
  "font-outfit font-bold rounded-full bg-surface-1 text-ink border border-[1.5px] border-paper-edge tracking-[0.04em] leading-[1.4]";

const VARIANTS = {
  lg: {
    wrapper: "max-w-[340px]",
    frameRound: "rounded-2xl",
    innerRound: "rounded-[10px]",
    inset: "inset-[7px]",
    headerPad: "px-[14px] py-[10px]",
    artMargin: "m-2 mb-0",
    chipArea: "px-[10px] pt-[6px] pb-1",
    footerPad: "px-3 pt-[6px] pb-2",
    name: "text-[20px]",
    dex: "text-[11px]",
    artLabel: "text-[10px]",
    chipLabel: "text-[8px]",
    chip: "text-[9px] px-2 py-[2px]",
    chipSm: "text-[9px] px-2 py-[2px]",
    footer: "text-[9px]",
    star: "text-[13px]",
    frameShadow:
      "shadow-[0_0_0_1px_rgba(138,105,25,0.35),0_18px_36px_-10px_rgba(45,36,24,0.35)]",
    legendShadow:
      "shadow-[0_0_0_1px_rgba(138,105,25,0.35),0_18px_36px_-10px_rgba(45,36,24,0.35),0_0_28px_rgba(201,149,43,0.3)]",
  },
  md: {
    wrapper: "max-w-[260px]",
    frameRound: "rounded-xl",
    innerRound: "rounded-lg",
    inset: "inset-1",
    headerPad: "px-[9px] py-[6px]",
    artMargin: "m-1 mb-0",
    chipArea: "px-[6px] pt-1 pb-[3px]",
    footerPad: "px-2 pt-[3px] pb-[5px]",
    name: "text-[14px]",
    dex: "text-[8px]",
    artLabel: "text-[8px]",
    chipLabel: "text-[7px]",
    chip: "text-[9px] px-2 py-[2px]",
    chipSm: "text-[9px] px-2 py-[2px]",
    footer: "text-[7px]",
    star: "text-[9px]",
    frameShadow:
      "shadow-[0_0_0_1px_rgba(138,105,25,0.35),0_8px_20px_-10px_rgba(45,36,24,0.35)]",
    legendShadow:
      "shadow-[0_0_0_1px_rgba(138,105,25,0.35),0_8px_20px_-10px_rgba(45,36,24,0.35),0_0_28px_rgba(201,149,43,0.3)]",
  },
  sm: {
    wrapper: "max-w-[220px]",
    frameRound: "rounded-xl",
    innerRound: "rounded-lg",
    inset: "inset-1",
    headerPad: "px-[9px] py-[6px]",
    artMargin: "m-1 mb-0",
    chipArea: "px-[6px] pt-1 pb-[3px]",
    footerPad: "px-2 pt-[3px] pb-[5px]",
    name: "text-[12px]",
    dex: "text-[8px]",
    artLabel: "text-[8px]",
    chipLabel: "text-[7px]",
    chip: "text-[8px] px-[6px] py-[2px]",
    chipSm: "text-[8px] px-[6px] py-[2px]",
    footer: "text-[7px]",
    star: "text-[9px]",
    frameShadow:
      "shadow-[0_0_0_1px_rgba(138,105,25,0.35),0_8px_20px_-10px_rgba(45,36,24,0.35)]",
    legendShadow:
      "shadow-[0_0_0_1px_rgba(138,105,25,0.35),0_8px_20px_-10px_rgba(45,36,24,0.35),0_0_28px_rgba(201,149,43,0.3)]",
  },
} as const;

function ChipRow({
  items,
  max,
  chipClass,
  badgeClass,
}: {
  items: string[];
  max?: number;
  chipClass: string;
  badgeClass: string;
}) {
  const visible = max == null ? items : items.slice(0, max);
  const overflow = max == null ? 0 : items.length - max;
  return (
    <div className="flex flex-wrap gap-[3px]">
      {visible.map((item) => (
        <span key={item} className={chipClass}>
          {item}
        </span>
      ))}
      {overflow > 0 && <span className={badgeClass}>+{overflow}</span>}
    </div>
  );
}

export default function TcgCard({
  p,
  size = "md",
}: {
  p: PokemonEntry;
  size?: "lg" | "md" | "sm";
}) {
  const r = getRarity(p);
  const isSm = size === "sm";
  const v = VARIANTS[size];
  const [h1, h2] = HABITAT_COLORS[p.habitat] ?? ["#d8ccb8", "#a89070"];

  const holoOpacity = r.holoIntensity / 100;
  const sweepOpacity = r.sparkles ? holoOpacity * 0.65 : 0;

  return (
    <div className={`relative w-full ${v.wrapper} aspect-[100/155]`}>
      {/* Gold frame */}
      <div
        className={`absolute inset-0 ${v.frameRound} ${r.sparkles ? v.legendShadow : v.frameShadow}`}
        style={{
          background:
            "linear-gradient(135deg, var(--accent-soft) 0%, var(--accent) 30%, var(--accent-soft) 60%, var(--accent-deep) 100%)",
        }}
      >
        {/* Inner card face */}
        <div
          className={`absolute ${v.inset} ${v.innerRound} bg-paper border border-[1.5px] border-[rgba(138,105,25,0.28)] overflow-hidden flex flex-col`}
        >
          {/* Header: name + dex */}
          <div
            className={`${v.headerPad} flex items-center justify-between border-b border-accent shrink-0 gap-1`}
            style={{
              background:
                "linear-gradient(180deg, var(--color-surface-2) 0%, var(--color-chrome) 100%)",
            }}
          >
            <div
              className={`font-outfit font-extrabold ${v.name} tracking-[-0.01em] leading-none text-ink whitespace-nowrap overflow-hidden text-ellipsis min-w-0`}
            >
              {p.name}
              {r.sparkles && (
                <span
                  className={`${v.star} text-accent drop-shadow-[0_0_3px_var(--accent)] ml-1`}
                >
                  ★
                </span>
              )}
            </div>
            <div
              className={`font-mono font-semibold ${v.dex} text-accent-deep tracking-[0.08em] shrink-0`}
            >
              {dexNum(p)}
            </div>
          </div>

          {/* Art window */}
          <div
            className={`${v.artMargin} shrink-0 grow-0 basis-[54%] rounded-md habitat-art relative overflow-hidden border border-[1.5px] border-[rgba(138,105,25,0.42)] flex items-end justify-center`}
            style={{ "--h1": h1, "--h2": h2 } as React.CSSProperties}
          >
            {r.sparkles && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ backgroundImage: "var(--sparkle-dots)" }}
              />
            )}
            {/* Holo shimmer overlay */}
            <div
              className="absolute inset-0 pointer-events-none mix-blend-screen"
              style={{
                backgroundImage: "var(--holo-gradient)",
                opacity: holoOpacity,
              }}
            />
            {/* Habitat pill */}
            <div
              className={`absolute top-[5px] left-[5px] ${v.artLabel} px-[7px] py-[2px] rounded-full bg-white/85 text-ink font-outfit font-bold tracking-[0.03em]`}
            >
              {p.habitat}
            </div>
            {/* Gift count / legendary badge */}
            {r.sparkles && (
              <div
                className={`absolute top-[5px] right-[5px] ${v.artLabel} px-[7px] py-[2px] rounded-full text-paper font-outfit font-extrabold tracking-[0.03em] shadow-[0_1px_0_var(--accent-deep)] bg-gradient-to-br from-accent to-accent-deep`}
              >
                LEGENDARY
              </div>
            )}
            <div className="relative w-[75%] h-[88%] z-[1] -mb-0.5 drop-shadow-[0_4px_0_rgba(45,36,24,0.20)]">
              <Image
                fill
                src={pkmnIconUrl(p)}
                alt={p.name}
                className="object-contain [image-rendering:pixelated]"
                sizes="200px"
              />
            </div>
          </div>

          {/* Chips: Likes / Specialty / Flavor */}
          <div className={`${v.chipArea} shrink-0`}>
            <div
              className={`font-mono ${v.chipLabel} text-ink-fade tracking-[0.07em] font-semibold uppercase mb-[3px]`}
            >
              Likes
            </div>
            <ChipRow
              items={p.categories}
              max={size === "lg" ? 3 : 2}
              chipClass={`${CHIP_BASE} ${v.chip}`}
              badgeClass={`${CHIP_BASE} ${v.chip} text-ink-soft`}
            />

            {((p.specialties && p.specialties.length > 0) || p.flavor) && (
              <div className="flex gap-[6px] mt-1 items-start">
                {p.specialties && p.specialties.length > 0 && (
                  <div className="flex-1 min-w-0">
                    <div
                      className={`font-mono ${v.chipLabel} text-accent-deep tracking-[0.07em] font-semibold uppercase mb-[3px]`}
                    >
                      Specialty
                    </div>
                    <ChipRow
                      items={p.specialties.map(
                        (s) => SPECIALTIES[s]?.name ?? s,
                      )}
                      max={size === "lg" ? 3 : 1}
                      chipClass={`${CHIP_BASE} ${v.chipSm} text-accent-deep border-accent bg-accent-soft`}
                      badgeClass={`${CHIP_BASE} ${v.chipSm} text-accent-deep border-accent bg-accent-soft`}
                    />
                  </div>
                )}
                {p.flavor && (
                  <div className="flex-1 min-w-0">
                    <div
                      className={`font-mono ${v.chipLabel} text-leaf tracking-[0.07em] font-semibold uppercase mb-[3px]`}
                    >
                      Flavor
                    </div>
                    <ChipRow
                      items={[p.flavor]}
                      max={2}
                      chipClass={`${CHIP_BASE} ${v.chipSm} text-leaf border-leaf bg-leaf-soft`}
                      badgeClass={`${CHIP_BASE} ${v.chipSm} text-leaf border-leaf bg-leaf-soft`}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer bar */}
          <div
            className={`mt-auto ${v.footerPad} flex justify-between items-center border-t border-paper-edge shrink-0`}
            style={{
              background:
                "linear-gradient(180deg, transparent, var(--color-chrome))",
            }}
          >
            <span
              className={`font-mono ${v.footer} text-ink-fade tracking-[0.08em] font-semibold`}
            >
              POKOPIA · PICKS
            </span>
            <span
              className={`font-mono ${v.footer} ${r.sparkles ? "text-accent" : "text-ink-fade"} tracking-[0.06em] font-semibold`}
            >
              {p.types?.[0]?.toUpperCase() ?? ""}
            </span>
          </div>

          {/* Holo sweep (legendary only) */}
          <div
            className="transition-opacity duration-300 group-hover:opacity-[0.18] absolute inset-0 pointer-events-none mix-blend-soft-light"
            style={{
              backgroundImage: "var(--holo-gradient)",
              opacity: sweepOpacity,
            }}
          />
        </div>
      </div>
    </div>
  );
}
