"use client";
import { useState } from "react";

export default function CollapsibleSection({
  title,
  count,
  children,
  defaultOpen = true,
}: {
  title: string;
  count?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mb-4">
      <button
        type="button"
        className="w-full text-left flex items-baseline gap-2 mb-2 px-[14px] py-2 bg-chrome rounded-[10px] border border-paper-edge cursor-pointer transition-colors hover:bg-surface-2"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
      >
        <span className="font-outfit font-bold text-[16px]">{title}</span>
        {count !== undefined && <span className="font-mono text-[11px] text-ink-soft ml-auto font-medium">{count}</span>}
        <span className="font-mono text-[11px] text-ink-fade pl-2">
          {open ? "▲" : "▼"}
        </span>
      </button>
      {open && children}
    </div>
  );
}
