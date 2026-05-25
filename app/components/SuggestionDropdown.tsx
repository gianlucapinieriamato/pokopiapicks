"use client";

import PkmnIcon from "@/app/components/PkmnIcon";
import { pkmnIconUrl, dexNum } from "@/app/lib/const";
import type { PokemonConst } from "@/app/lib/const";

type Option = Pick<
  PokemonConst,
  "slug" | "label" | "icon" | "num" | "nationalDexNum" | "categories"
>;

const SUGGESTION_ROW =
  "flex items-center gap-3 px-4 py-2 cursor-pointer border-b border-surface-1 transition-colors hover:bg-surface-1 last:border-b-0";

type Props = {
  id: string;
  options: Option[];
  activeIdx: number;
  onSelect: (option: Option) => void;
};

export function SuggestionDropdown({
  id,
  options,
  activeIdx,
  onSelect,
}: Props) {
  if (options.length === 0) return null;
  return (
    <ul
      id={id}
      role="listbox"
      aria-label="Pokemon suggestions"
      className="absolute top-[calc(100%+6px)] left-0 right-0 bg-paper border border-[1.5px] border-paper-edge rounded-[14px] max-h-[360px] overflow-y-auto z-10 block shadow-[0_12px_28px_-8px_var(--shadow)]"
    >
      {options.map((opt, i) => (
        <li key={opt.slug}>
          <div
            id={`${id}-opt-${opt.slug}`}
            role="option"
            aria-selected={i === activeIdx}
            className={`${SUGGESTION_ROW}${i === activeIdx ? " bg-surface-1" : ""}`}
            onMouseDown={(e) => {
              e.preventDefault();
              onSelect(opt);
            }}
          >
            <PkmnIcon
              src={pkmnIconUrl(opt as PokemonConst)}
              alt={opt.label}
              className="size-11 object-contain shrink-0"
            />
            <span className="font-mono text-[11px] text-ink-fade min-w-[38px] font-semibold">
              #{dexNum(opt as PokemonConst)}
            </span>
            <span className="font-bold text-[15px]">{opt.label}</span>
            <span className="ml-auto font-mono text-[10px] text-ink-soft bg-surface-2 px-2 py-[3px] rounded-full font-semibold">
              {opt.categories.length} cats
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
