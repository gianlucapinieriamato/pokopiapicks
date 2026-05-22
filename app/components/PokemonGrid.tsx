export default function PokemonGrid({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-[10px] md:gap-2 ${className}`}>
      {children}
    </div>
  );
}
