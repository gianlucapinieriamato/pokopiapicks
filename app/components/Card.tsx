export default function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`bg-paper rounded-[22px] px-7 py-6 max-md:px-3 max-md:py-5 mb-5 ${className}`}
      style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.9) inset, 0 2px 0 var(--paper-edge), 0 14px 32px -10px var(--shadow)" }}
    >
      {children}
    </div>
  );
}
