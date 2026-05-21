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
  const raw = usePathname();
  const pathname = raw.length > 1 ? raw.replace(/\/$/, "") : raw;
  return (
    <nav className="site-nav">
      <div className="site-nav-inner">
        <Link href="/" className="site-nav-logo">
          <div className="site-nav-logo-mark">P</div>
          POKOPIA <span>PICKS</span>
        </Link>
        <div className="site-nav-links">
          {LINKS.map(({ href, label }) => {
            const isActive =
              href === "/"
                ? pathname === "/"
                : pathname === href || (href === "/pokedex" && pathname.startsWith("/pokemon"));
            return (
              <Link
                key={href}
                href={href}
                className={`site-nav-link${isActive ? " active" : ""}`}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
