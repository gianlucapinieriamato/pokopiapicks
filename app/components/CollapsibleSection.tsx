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
    <div className="cat-block">
      <button
        className="cat-head"
        onClick={() => setOpen((prev) => !prev)}
        style={{ width: "100%", textAlign: "left", cursor: "pointer", background: "none", border: "none", padding: 0 }}
        aria-expanded={open}
      >
        <span className="cat-name">{title}</span>
        {count && <span className="cat-count">{count}</span>}
        <span style={{ marginLeft: "auto", paddingLeft: 8, fontFamily: "'DM Mono', monospace", fontSize: 11, color: "var(--ink-fade)" }}>
          {open ? "▲" : "▼"}
        </span>
      </button>
      {open && children}
    </div>
  );
}
