export default function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`bg-paper rounded-[22px] px-3 py-5 md:px-7 md:py-6 mb-5 shadow-[var(--shadow-card)] ${className}`}
    >
      {children}
    </div>
  );
}
