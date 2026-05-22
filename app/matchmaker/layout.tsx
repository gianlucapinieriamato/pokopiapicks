import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Matchmaker",
  description: "Find the best Pokemon roommates in Pokopia. Pick an anchor Pokemon and discover which companions share the most item preferences.",
};

export default function MatchmakerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
