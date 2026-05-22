import Link from "next/link";
import { pkmnIconUrl, dexNum } from "@/app/lib/data";
import type { PokemonEntry } from "@/app/lib/types";

export default function PokemonGridCard({
  p,
  prefix,
  children,
}: {
  p: PokemonEntry;
  prefix?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <Link
      href={`/pokemon/${p.slug}`}
      className="bg-chrome border border-[1.5px] border-paper-edge rounded-[14px] p-3 text-center no-underline text-ink flex flex-col items-center gap-1 transition-all hover:bg-paper hover:border-accent hover:-translate-y-0.5 hover:shadow-[0_6px_16px_-6px_var(--shadow)]"
    >
      {prefix}
      <div className="size-16 flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={pkmnIconUrl(p)} alt={p.name} className="w-full h-full object-contain [image-rendering:pixelated]" />
      </div>
      <div className="font-mono text-[10px] text-ink-fade font-medium">#{dexNum(p)}</div>
      <div className="font-bold text-[12px] leading-tight">{p.name}</div>
      {children}
    </Link>
  );
}
