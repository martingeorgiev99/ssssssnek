export interface Rank {
  name: string;
  threshold: number;
  color: string;
  icon: string;
}

export const RANKS: Rank[] = [
  { name: "pisslow random", threshold: 500, color: "#a1a1aa", icon: "👹" },
  { name: "Bronze", threshold: 1000, color: "#b45309", icon: "🥉" },
  { name: "Silver", threshold: 2000, color: "#94a3b8", icon: "🥈" },
  { name: "Gold", threshold: 3500, color: "#fbbf24", icon: "🥇" },
  { name: "Platinum", threshold: 5000, color: "#7dd3fc", icon: "🍏" },
  { name: "Diamond", threshold: 7500, color: "#38bdf8", icon: "💎" },
  { name: "Master", threshold: 10000, color: "#8b5cf6", icon: "🏅" },
  { name: "Grandmaster", threshold: 12500, color: "#c084f1", icon: "👑" },
  { name: "Challenger", threshold: 15000, color: "#f43f5e", icon: "🏆" },
];

export class RankSystem {
  private static STORAGE_KEY = "snake_stats";

  static getStats(): { highScore: number; currentRank: Rank } {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    const stats = stored ? JSON.parse(stored) : { highScore: 0 };
    const currentRank = this.getRankForScore(stats.highScore);
    return { highScore: stats.highScore, currentRank };
  }

  static updateScore(score: number): void {
    const stats = this.getStats();
    if (score > stats.highScore) {
      stats.highScore = score;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stats));
    }
  }

  static getRankForScore(score: number): Rank {
    for (let i = RANKS.length - 1; i >= 0; i--) {
      if (score >= RANKS[i].threshold) {
        return RANKS[i];
      }
    }
    return RANKS[0];
  }

  static getNextRank(score: number): Rank | null {
    for (const rank of RANKS) {
      if (score < rank.threshold) {
        return rank;
      }
    }
    return null;
  }

  static getProgressToNextRank(score: number): number {
    const currentRank = this.getRankForScore(score);
    const nextRank = this.getNextRank(score);

    if (!nextRank) return 100; // Max rank achieved (impossible)

    const progress =
      (score - currentRank.threshold) /
      (nextRank.threshold - currentRank.threshold);
    return Math.min(Math.max(progress * 100, 0), 100);
  }
}
