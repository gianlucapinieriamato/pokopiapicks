"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/pokedex", label: "Pokédex" },
  { href: "/items", label: "Items" },
  { href: "/habitats", label: "Habitats" },
  { href: "/locations", label: "Locations" },
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
        (href === "/items" && (pathname.startsWith("/item/") || pathname.startsWith("/category"))) ||
        (href === "/habitats" && pathname.startsWith("/habitat/")) ||
        (href === "/locations" && pathname.startsWith("/location/"));

  const linkBase = "font-outfit font-bold text-[12px] px-3 py-[6px] rounded-full text-ink-soft no-underline transition-all tracking-[0.02em] hover:bg-surface-1 hover:text-ink";
  const linkActive = "bg-accent text-paper border border-accent-deep shadow-[0_2px_0_var(--accent-deep)]";

  const dropBase = "font-outfit font-bold text-[14px] px-[14px] py-[10px] rounded-[10px] text-ink-soft no-underline transition-all hover:bg-surface-1 hover:text-ink";
  const dropActive = "bg-accent text-paper";

  return (
    <nav className="sticky top-0 z-50 border-b backdrop-blur-[10px] bg-chrome border-[rgba(201,149,43,0.35)] shadow-[0_2px_12px_-4px_var(--shadow)]">
      <div className="max-w-[1080px] mx-auto px-5 h-14 flex items-center gap-[6px] max-md:h-[52px] max-md:px-[14px] max-md:gap-[10px]">
        <Link
          href="/"
          className="font-outfit font-extrabold text-[17px] text-ink no-underline tracking-[-0.02em] flex items-center gap-2 mr-2 whitespace-nowrap uppercase"
          onClick={() => setOpen(false)}
        >
          <Image src="/icon-192.png" alt="Pokopia Picks" width={32} height={32} className="rounded-[7px] shrink-0" />
          <span className="max-md:hidden">POKOPIA <span className="text-accent-deep italic">PICKS</span></span>
        </Link>

        <div className="flex gap-[2px] max-md:hidden">
          {LINKS.map(({ href, label }) => (
            <Link key={href} href={href} className={`${linkBase}${isActive(href) ? ` ${linkActive}` : ""}`}>
              {label}
            </Link>
          ))}
        </div>

        <button
          className="hidden max-md:flex ml-auto bg-transparent border border-[1.5px] border-accent rounded-lg py-[5px] px-[10px] text-base leading-none text-ink transition-all shrink-0 hover:bg-accent hover:text-paper items-center justify-center"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {open && (
        <div className="border-t border-paper-edge px-3 pb-3 pt-2 flex flex-col gap-[2px] bg-chrome">
          {LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`${dropBase}${isActive(href) ? ` ${dropActive}` : ""}`}
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
