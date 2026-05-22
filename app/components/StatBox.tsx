export default function StatBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex-1 min-w-[130px] bg-chrome rounded-xl px-[14px] py-3 border border-paper-edge">
      <div className="font-outfit font-extrabold text-[26px] leading-none text-accent-deep">{value}</div>
      <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink-soft mt-1 font-semibold">{label}</div>
    </div>
  );
}
