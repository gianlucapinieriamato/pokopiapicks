import Link from "next/link";
import Image from "next/image";
import { pkmnIconUrl, dexNum } from "@/app/lib/const";
import type { PokemonConst } from "@/app/lib/const";

export default function PokemonGridCard({
  p,
  prefix,
  children,
}: {
  p: PokemonConst;
  prefix?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <Link
      href={`/pokemon/${p.slug}`}
      className="bg-chrome border border-[1.5px] border-paper-edge rounded-[14px] p-3 text-center no-underline text-ink flex flex-col items-center gap-1 transition-all hover:bg-paper hover:border-accent hover:-translate-y-0.5 hover:shadow-[0_6px_16px_-6px_var(--shadow)]"
    >
      {prefix}
      <div className="relative size-16">
        <Image fill src={pkmnIconUrl(p)} alt={p.label} className="object-contain [image-rendering:pixelated]" sizes="64px" />
      </div>
      <div className="font-mono text-[10px] text-ink-fade font-medium">#{dexNum(p)}</div>
      <div className="font-bold text-[12px] leading-tight">{p.label}</div>
      {children}
    </Link>
  );
}
