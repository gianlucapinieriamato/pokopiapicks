export default function HoverTile({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-surface-1 border border-paper-edge rounded-lg transition-all duration-150 cursor-pointer hover:-translate-y-0.5 hover:shadow-md hover:bg-surface-2 ${className}`}>
      {children}
    </div>
  );
}
