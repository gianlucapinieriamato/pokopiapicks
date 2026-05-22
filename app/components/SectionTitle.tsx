export default function SectionTitle({
  children,
  pill,
  className = "",
}: {
  children: React.ReactNode;
  pill?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`font-outfit font-extrabold text-xl tracking-[-0.01em] mb-2 flex items-baseline gap-2 ${className}`}>
      {children}
      {pill !== undefined && (
        <span className="font-mono text-[10px] font-semibold px-2 py-[3px] rounded-full tracking-[0.06em] bg-accent text-paper">
          {pill}
        </span>
      )}
    </div>
  );
}
