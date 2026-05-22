import Link from "next/link";
import Image from "next/image";

export default function BestGiftItem({
  item,
  cats,
  href,
  iconSrc,
}: {
  item: string;
  cats: string[];
  href: string;
  iconSrc?: string;
}) {
  const isElite = cats.length >= 3;
  return (
    <Link href={href} className="no-underline">
      <div className={`relative flex gap-3 items-center rounded-[14px] p-[14px] border border-[1.5px] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_18px_-6px_var(--shadow)] ${isElite ? "bg-gradient-to-br from-[#ffd9c9] to-[#ffe9d8] border-accent-deep" : "bg-gradient-to-br from-accent-soft to-surface-1 border-accent"}`}>
        <div className={`absolute -top-2 right-3 font-mono text-[10px] font-semibold px-2 py-[3px] rounded-full text-paper tracking-[0.06em] ${isElite ? "bg-accent-deep" : "bg-accent"}`}>
          {cats.length}× categories
        </div>
        <div className="size-14 shrink-0 bg-white/70 rounded-[10px] p-1">
          {iconSrc && (
            <div className="relative w-full h-full">
              <Image fill src={iconSrc} alt={item} className="object-contain [image-rendering:pixelated]" sizes="56px" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-extrabold text-[14px] mb-1 text-ink leading-tight">{item}</div>
          <div className="font-mono text-[10px] text-ink-soft tracking-[0.02em] leading-snug">{cats.join(" · ")}</div>
        </div>
      </div>
    </Link>
  );
}
