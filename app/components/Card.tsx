export default function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`bg-paper rounded-[22px] px-7 py-6 max-md:px-3 max-md:py-5 mb-5 shadow-[var(--shadow-card)] ${className}`}
    >
      {children}
    </div>
  );
}
