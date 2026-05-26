"use client";
import { useState, Fragment } from "react";
import Link from "next/link";
import InfoTip from "@/app/components/InfoTip";
import type { HabitatListConst } from "@/app/lib/const/pokemon";

function HabitatEntryContent({ entry }: { entry: HabitatListConst }) {
  return (
    <div className="flex flex-col gap-1.5 text-[11px] font-mono">
      <span className="inline-flex items-start gap-1.5">
        <span className="text-ink-fade font-semibold tracking-[0.05em]">Habitat:</span>
        <Link href={`/habitats/${entry.habitat.slug}`} className="text-leaf no-underline font-semibold hover:underline">
          {entry.habitat.label}
        </Link>
      </span>
      {entry.locations.length > 0 && (
        <span className="inline-flex items-baseline gap-1.5">
          <span className="text-ink-fade font-semibold tracking-[0.05em] shrink-0">Locations:</span>
          <span className="text-ink-soft">
            {entry.locations.map((loc, i) => (
              <Fragment key={loc.slug}>
                {i > 0 && ", "}
                <Link href={`/locations/${loc.slug}`} className="text-leaf no-underline font-semibold hover:underline">{loc.label}</Link>
              </Fragment>
            ))}
          </span>
        </span>
      )}
      {(entry.time.length > 0 || entry.weather.length > 0) && (
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {entry.time.length > 0 && (
            <span className="inline-flex items-start gap-1.5">
              <span className="text-ink-fade font-semibold tracking-[0.05em]">Time:</span>
              <span className="text-ink-soft">{entry.time.map((t) => t.label).join(", ")}</span>
            </span>
          )}
          {entry.weather.length > 0 && (
            <span className="inline-flex items-start gap-1.5">
              <span className="text-ink-fade font-semibold tracking-[0.05em]">Weather:</span>
              <span className="text-ink-soft">{entry.weather.map((w) => w.label).join(", ")}</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default function HabitatEntryCard({
  entry,
  flat = false,
}: {
  entry: HabitatListConst;
  flat?: boolean;
}) {
  const [open, setOpen] = useState(true);

  if (flat) {
    return (
      <div>
        <p className="font-outfit font-bold text-[15px] text-ink mb-1.5 flex items-center gap-1.5">
          Where to find
          {entry.rarity && (
            <span className="font-mono text-[10px] font-semibold px-2 py-[2px] rounded-full bg-paper border border-paper-edge text-ink-soft">
              {entry.rarity.label}
            </span>
          )}
          <InfoTip tip="Shows where and when to find this Pokémon in Pokopia." />
        </p>
        <HabitatEntryContent entry={entry} />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-paper-edge bg-chrome">
      <div className={`flex items-center bg-surface-1 border-b border-paper-edge rounded-t-xl transition-colors hover:bg-surface-2${!open ? " rounded-b-xl" : ""}`}>
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          className="flex-1 flex items-center gap-2 px-4 py-3 cursor-pointer sm:pointer-events-none sm:cursor-default text-left"
        >
          <span className="font-outfit font-bold text-[16px] text-ink leading-tight">
            Where to find
          </span>
          <div className="ml-auto flex items-center gap-2">
            {entry.rarity && (
              <span className="font-mono text-[10px] text-ink-soft font-semibold bg-paper px-2 py-[2px] rounded-full border border-paper-edge">
                {entry.rarity.label}
              </span>
            )}
            <span className="font-mono text-[11px] text-ink-fade sm:hidden" aria-hidden="true">
              {open ? "▲" : "▼"}
            </span>
          </div>
        </button>
        <span className="flex items-center pr-4 shrink-0">
          <InfoTip tip="Shows where and when to find this Pokémon in Pokopia." align="right" />
        </span>
      </div>
      <div className={`grid transition-[grid-template-rows] duration-200 sm:grid-rows-[1fr] ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <div className="px-3 py-4">
            <HabitatEntryContent entry={entry} />
          </div>
        </div>
      </div>
    </div>
  );
}
