type ActiveVariant = "on" | "on-accent" | "on-leaf";

const ACTIVE_CLASSES: Record<ActiveVariant, string> = {
  "on":       "bg-ink text-paper border-ink",
  "on-accent":"bg-accent text-paper border-accent",
  "on-leaf":  "bg-leaf text-paper border-leaf",
};

const BASE = "font-outfit font-bold text-[12px] px-3 py-[5px] bg-paper border border-[1.5px] border-accent rounded-full text-ink-soft transition-all tracking-[0.02em] hover:bg-accent hover:text-paper hover:border-accent";

export default function Shortcut({
  active,
  variant = "on",
  onClick,
  children,
  className = "",
}: {
  active?: boolean;
  variant?: ActiveVariant;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      className={`${BASE} ${active ? ACTIVE_CLASSES[variant] : ""} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
