import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pokemon Filter",
  description: "Advanced Pokemon search for Pokopia. Filter simultaneously by habitat, flavor, specialty, favorite category, and location.",
};

export default function LookupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
