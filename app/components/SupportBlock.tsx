const KOFI_DEFAULT = "https://ko-fi.com/gpihh";

export default function SupportBlock({
  kofiUrl = KOFI_DEFAULT,
}: {
  kofiUrl?: string;
}) {
  return (
    <aside
      id="support"
      aria-label="Support Pokopia Picks"
      className="bg-paper rounded-[22px] px-5 py-5 md:px-7 md:py-6 text-center shadow-[var(--shadow-card)]"
    >
      <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-accent-deep font-semibold mb-2">
        POKOPIA · PICKS
      </div>
      <h2 className="font-outfit font-extrabold text-xl tracking-[-0.01em] text-ink mb-2">
        Enjoying Pokopia Picks?
      </h2>
      <p className="text-[13px] text-ink-soft leading-relaxed">
        This is a fan-made wiki, free and ad-supported. If it saved you some
        time, you can buy me a coffee. It helps keep the Pokedex, items, and
        habitat data current with every game update.
      </p>
      <a
        href={kofiUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 inline-block font-outfit font-bold text-[15px] px-6 py-[11px] rounded-full bg-accent text-paper border border-accent-deep shadow-[0_2px_0_var(--accent-deep)] no-underline transition-all hover:bg-accent-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        ☕ Buy me a coffee
      </a>
    </aside>
  );
}
