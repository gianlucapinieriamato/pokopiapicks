import type { Metadata } from "next";
import Nav from "@/app/components/Nav";
import LangToggle from "@/app/components/LangToggle";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Pokopia Picks · What each Pokémon likes",
    template: "%s | Pokopia Picks",
  },
  description: "Gift finder and wiki for Pokémon Pokopia — see what items each Pokémon likes, explore habitats, locations, and specialties.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <LangToggle />
        <Nav />
        <main className="flex-1">
          {children}
        </main>
        <footer className="site-footer">
          Pokopia Picks
        </footer>
      </body>
    </html>
  );
}
