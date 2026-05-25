"use client";
import { useState, useId } from "react";
import InfoTip from "@/app/components/InfoTip";
import PokemonGridCard from "@/app/components/PokemonGridCard";
import type { PokemonConst } from "@/app/lib/const";

export default function VariantsSection({ variants }: { variants: PokemonConst[] }) {
  const [open, setOpen] = useState(true);
  const contentId = useId();

  if (variants.length === 0) return null;

  return (
    <div className="bg-paper rounded-xl mb-5 shadow-[var(--shadow-card)] border border-paper-edge">
      <div className={`flex items-center bg-surface-1 border-b border-paper-edge rounded-t-xl transition-colors hover:bg-surface-2${!open ? " rounded-b-xl" : ""}`}>
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          aria-controls={contentId}
          className="flex-1 flex items-center gap-2 px-4 py-3 md:px-7 cursor-pointer text-left"
        >
          <span className="font-outfit font-bold text-[16px]">Variants</span>
          <span className="font-mono text-[11px] text-ink-soft ml-auto font-medium">{variants.length}</span>
          <span className="font-mono text-[11px] text-ink-fade pl-1" aria-hidden="true">
            {open ? "▲" : "▼"}
          </span>
        </button>
        <span className="flex items-center pr-4 shrink-0">
          <InfoTip tip="Alternate forms of the same Pokémon species with different appearances or stats." align="right" />
        </span>
      </div>
      <div
        id={contentId}
        className={`grid transition-[grid-template-rows] duration-200 ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <div className="px-3 py-4 md:px-7 md:py-5">
            <div className="grid grid-cols-2 min-[360px]:grid-cols-3 sm:grid-cols-[repeat(auto-fill,minmax(110px,1fr))] gap-3">
              {variants.map((v) => (
                <PokemonGridCard key={v.slug} p={v} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
