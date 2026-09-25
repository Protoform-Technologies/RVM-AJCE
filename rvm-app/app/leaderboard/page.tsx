import type { Metadata } from "next";

import { LeaderboardView } from "./leaderboard-view";

export const metadata: Metadata = {
  title: "AJCE Recycling Leaderboard | Cashcrow",
  description: "See AJCE's top recyclers and the community's environmental impact.",
};

export default function LeaderboardPage() {
  return <LeaderboardView />;
}
