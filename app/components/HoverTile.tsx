export default function HoverTile({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-surface-1 border border-paper-edge rounded-lg transition-colors cursor-pointer hover:bg-surface-2 ${className}`}>
      {children}
    </div>
  );
}
