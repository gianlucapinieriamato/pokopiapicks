import Link from "next/link";
import Image from "next/image";
import HoverTile from "./HoverTile";

export default function ItemTile({ name, slug, icon }: { name: string; slug?: string; icon?: string | null }) {
  const tile = (
    <HoverTile className="flex items-center gap-2.5 py-2 px-2.5">
      <div className="relative size-7 shrink-0">
        {icon && <Image fill src={icon} alt="" className="object-contain [image-rendering:pixelated]" sizes="28px" />}
      </div>
      <span className="font-outfit font-semibold text-xs text-ink leading-[1.3] line-clamp-2">{name}</span>
    </HoverTile>
  );
  return slug ? <Link href={`/item/${slug}`} className="no-underline">{tile}</Link> : tile;
}
