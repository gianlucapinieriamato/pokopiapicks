"use client";
import { useState, useId } from "react";
import InfoTip from "@/app/components/InfoTip";

export default function CollapsibleSection({
  title,
  count,
  info,
  children,
  defaultOpen = true,
  className = "mb-4",
}: {
  title: string;
  count?: string;
  info?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const contentId = useId();
  return (
    <div className={className}>
      <div className="flex items-center mb-2 bg-surface-1 rounded-xl border border-paper-edge transition-colors hover:bg-surface-2">
        <button
          type="button"
          className="flex-1 text-left flex items-center gap-2 px-[14px] py-2 cursor-pointer rounded-xl"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          aria-controls={contentId}
        >
          <span className="font-outfit font-bold text-[16px]">{title}</span>
          {count !== undefined && <span className="font-mono text-[11px] text-ink-soft ml-auto font-medium">{count}</span>}
          <span className="font-mono text-[11px] text-ink-fade pl-2" aria-hidden="true">
            {open ? "▲" : "▼"}
          </span>
        </button>
        {info && <span className="flex items-center pr-3 shrink-0"><InfoTip tip={info} /></span>}
      </div>
      <div
        id={contentId}
        className={`grid transition-[grid-template-rows] duration-200 ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
