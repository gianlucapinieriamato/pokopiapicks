import Image from "next/image";

export default function PkmnIcon({
  src,
  alt,
  className,
}: {
  src: string | null;
  alt: string;
  className?: string;
}) {
  if (!src) return <div className={`flex items-center justify-center text-ink-fade ${className ?? ""}`}>·</div>;
  return (
    <div className={`relative ${className ?? ""}`}>
      <Image fill src={src} alt={alt} className="object-contain [image-rendering:pixelated]" sizes="44px" />
    </div>
  );
}
