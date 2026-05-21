import type { Metadata } from "next";
import Nav from "@/app/components/Nav";
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
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,800;1,9..144,500&family=DM+Mono:wght@400;500&family=Nunito:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col" style={{ paddingTop: 0, background: 'none' }}>
        <Nav />
        <main className="flex-1">
          {children}
        </main>
        <footer className="site-footer">
          Data from <a href="https://www.serebii.net/pokemonpokopia/" target="_blank" rel="noopener">Serebii</a> ·
          HQ sprites from <a href="https://github.com/PokeAPI/sprites" target="_blank" rel="noopener">PokéAPI</a> (BSD-3-Clause) ·
          Not affiliated with Nintendo or Game Freak
        </footer>
      </body>
    </html>
  );
}
