type ActiveVariant = "on" | "on-accent" | "on-leaf";

const BASE = "font-outfit font-bold text-[12px] px-3 py-[5px] border border-[1.5px] border-accent rounded-full transition-all tracking-[0.02em]";
const INACTIVE = "bg-paper text-ink-soft hover:bg-accent hover:text-paper hover:border-accent";
const ACTIVE_CLASSES: Record<ActiveVariant, string> = {
  "on":       "bg-accent-soft text-accent-deep border-accent",
  "on-accent":"bg-accent text-paper border-accent-deep",
  "on-leaf":  "bg-leaf text-paper border-leaf",
};

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
      className={`${BASE} ${active ? ACTIVE_CLASSES[variant] : INACTIVE} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
