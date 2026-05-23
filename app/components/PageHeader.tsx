export default function PageHeader({
  title,
  meta,
  children,
}: {
  title: React.ReactNode;
  meta?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <h1 className="font-outfit font-semibold leading-[1.05] tracking-[-0.025em] mb-2 text-[clamp(1.8rem,4vw,2.8rem)]">
        {title}
      </h1>
      {meta && <div className="font-mono text-[12px] text-ink-soft tracking-[0.04em] font-medium">{meta}</div>}
      {children}
    </div>
  );
}
