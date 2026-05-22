export default function InfoTip({ tip }: { tip: string }) {
  return (
    <span
      tabIndex={0}
      className="group/tip relative inline-flex items-center justify-center size-4 rounded-full border-[1.5px] border-ink-fade text-ink-fade text-[10px] font-mono font-bold cursor-help align-middle shrink-0 leading-none transition-colors hover:border-accent-deep hover:text-accent-deep focus:outline-none focus:border-accent-deep focus:text-accent-deep"
      aria-label={tip}
    >
      i
      <span className="pointer-events-none absolute bottom-[calc(100%+6px)] left-1/2 -translate-x-1/2 z-20 opacity-0 transition-opacity duration-150 group-hover/tip:opacity-100 group-focus/tip:opacity-100 bg-ink text-paper px-[10px] py-[5px] rounded-md text-[12px] font-['Outfit'] font-medium whitespace-normal w-max max-w-[260px] text-center leading-[1.4] tracking-normal">
        {tip}
        <span className="absolute top-full left-1/2 -translate-x-1/2 block size-0 border-x-[5px] border-x-transparent border-t-[5px] border-t-ink" />
      </span>
    </span>
  );
}
