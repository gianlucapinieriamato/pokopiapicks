import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pokedex",
  description:
    "Browse all Pokemon in Pokopia. Filter by habitat, specialty, and flavor to find the Pokemon you need.",
};

export default function PokedexLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
