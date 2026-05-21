"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/pokedex", label: "Pokédex" },
  { href: "/items", label: "Items" },
  { href: "/categories", label: "Categories" },
  { href: "/lookup", label: "Filter" },
  { href: "/matchmaker", label: "Matchmaker" },
];

export default function Nav() {
  const raw = usePathname();
  const pathname = raw.length > 1 ? raw.replace(/\/$/, "") : raw;
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname === href ||
        (href === "/pokedex" && pathname.startsWith("/pokemon")) ||
        (href === "/items" && pathname.startsWith("/item/")) ||
        (href === "/categories" && pathname.startsWith("/category/"));

  return (
    <nav className="site-nav">
      <div className="site-nav-inner">
        <Link href="/" className="site-nav-logo" onClick={() => setOpen(false)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon-192.png" alt="Pokopia Picks" className="site-nav-icon" />
          <span className="site-nav-logo-text">POKOPIA <span>PICKS</span></span>
        </Link>

        <div className="site-nav-links">
          {LINKS.map(({ href, label }) => (
            <Link key={href} href={href} className={`site-nav-link${isActive(href) ? " active" : ""}`}>
              {label}
            </Link>
          ))}
        </div>

        <button
          className="site-nav-burger"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {open && (
        <div className="site-nav-dropdown">
          {LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`site-nav-dropdown-link${isActive(href) ? " active" : ""}`}
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
