"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/pokedex", label: "Pokédex" },
  { href: "/lookup", label: "Filter" },
  { href: "/matchmaker", label: "Matchmaker" },
];

export default function Nav() {
  const pathname = usePathname();
  return (
    <nav className="site-nav">
      <div className="site-nav-inner">
        <Link href="/" className="site-nav-logo">
          <div className="site-nav-logo-mark">P</div>
          POKOPIA <span>PICKS</span>
        </Link>
        <div className="site-nav-links">
          {LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`site-nav-link${pathname === href ? " active" : ""}`}
            >
              {label}
            </Link>
          ))}
        </div>
        <div style={{
          marginLeft: "auto",
          fontFamily: "'JetBrains Mono', 'DM Mono', monospace",
          fontSize: 10, fontWeight: 600,
          color: "var(--ink-fade)", letterSpacing: "0.1em",
          display: "flex", gap: 8, alignItems: "center",
        }}>
          <span>308 PKM</span>
          <span style={{ color: "var(--paper-edge)" }}>·</span>
          <span>608 ITEMS</span>
          <span style={{ color: "var(--paper-edge)" }}>·</span>
          <span>43 CATS</span>
        </div>
      </div>
    </nav>
  );
}
