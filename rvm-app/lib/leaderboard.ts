export type MaterialImpact = {
  items: number;
  amount: number;
  eco_credits: number;
  co2e_kg: number;
};

export type LeaderboardEntry = {
  rank: number;
  admission_number: string;
  items_recycled: number;
  amount_earned: number;
  eco_credits: number;
  co2e_kg: number;
  by_material: {
    plastic?: MaterialImpact;
    aluminium?: MaterialImpact;
  };
};

export type LeaderboardSummary = {
  participants: number;
  total_eco_credits: number;
  total_co2e_kg: number;
};

export type LeaderboardData = {
  summary: LeaderboardSummary;
  leaderboard: LeaderboardEntry[];
};

export type LeaderboardApiResponse =
  | { success: true; data: LeaderboardData }
  | { success: false; error: string; message: string };
