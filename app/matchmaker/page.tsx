import type { Metadata } from "next";
import MatchmakerClient from "./MatchmakerClient";

export const metadata: Metadata = {
  title: "Matchmaker",
  description: "Find the best housing group for any Pokemon in Pokemon Pokopia. Match by shared habitat and item preferences, with complementary specialty bonuses.",
};

export default function MatchmakerPage() {
  return <MatchmakerClient />;
}
