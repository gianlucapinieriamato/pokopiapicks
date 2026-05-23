import Link from "next/link";

const CLS = "font-outfit font-bold text-[13px] px-4 py-2 bg-paper border border-[1.5px] border-accent rounded-full text-ink-soft no-underline flex items-center gap-[6px] transition-all cursor-pointer shadow-[0_2px_0_var(--accent-deep)] hover:bg-accent hover:text-paper hover:border-accent-deep";

export default function NavBtn({
  href,
  onClick,
  children,
  title,
  className = "",
}: {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  title?: string;
  className?: string;
}) {
  const cls = className ? `${CLS} ${className}` : CLS;
  if (href) return <Link href={href} className={cls} title={title}>{children}</Link>;
  return <button type="button" className={cls} onClick={onClick} title={title}>{children}</button>;
}
