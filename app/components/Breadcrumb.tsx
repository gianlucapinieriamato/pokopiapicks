import Link from "next/link";

type BreadcrumbItem = { label: string; href?: string };

export default function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav
      className="font-mono text-[11px] text-ink-fade tracking-[0.04em] mb-10 flex flex-wrap items-center gap-x-2 gap-y-1 font-medium"
      aria-label="Breadcrumb"
    >
      {items.map((item, i) => (
        <span key={item.label} className="flex items-center gap-2">
          {i > 0 && <span aria-hidden>›</span>}
          {item.href ? (
            <Link
              href={item.href}
              className="text-ink-soft no-underline hover:text-accent-deep transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span>{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
