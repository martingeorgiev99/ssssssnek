import * as d3 from "d3";
import { RANKS, RankSystem } from "../game/RankSystem";

export class RankDisplay {
  private ranksContainer: d3.Selection<HTMLDivElement, unknown, any, any>;
  constructor(
    parentContainer: d3.Selection<HTMLDivElement, unknown, any, any>
  ) {
    const ranksPanel = parentContainer
      .append("div")
      .style("width", "min(200px, 90vw)")
      .style("background", "#1a1a1a")
      .style("border-radius", "8px")
      .style("padding", "16px")
      .style("color", "white")
      .style("font-family", "monospace");

    ranksPanel
      .append("h2")
      .style("margin", "0 0 16px 0")
      .style("font-size", "18px")
      .text("Ranks");

    this.ranksContainer = ranksPanel
      .append("div")
      .style("display", "flex")
      .style("flex-direction", "column")
      .style("gap", "8px");
  }

  refreshRanks(score: number) {
    RankSystem.updateScore(score);
    const stats = RankSystem.getStats();
    const nextRank = RankSystem.getNextRank(score);
    const progress = RankSystem.getProgressToNextRank(score);

    this.ranksContainer.selectAll("*").remove();

    RANKS.forEach((rank) => {
      const unlocked = rank.threshold <= stats.highScore;
      const row = this.ranksContainer
        .append("div")
        .style("display", "flex")
        .style("align-items", "center")
        .style("gap", "8px")
        .style("padding", "4px")
        .style("border-radius", "4px")
        .style("background", unlocked ? "#2d374850" : "transparent")
        .style("opacity", unlocked ? "1" : "0.5");

      row.append("span").text(rank.icon);
      row.append("span").style("color", rank.color).text(rank.name);

      row
        .append("span")
        .style("margin-left", "auto")
        .style("opacity", "0.7")
        .text(rank.threshold.toLocaleString());
    });

    if (nextRank) {
      const progressBar = this.ranksContainer
        .append("div")
        .style("height", "4px")
        .style("background", "#2d3748")
        .style("border-radius", "2px")
        .style("margin", "8px 0");

      progressBar
        .append("div")
        .style("height", "100%")
        .style("width", `${progress}%`)
        .style("background", stats.currentRank.color)
        .style("border-radius", "2px")
        .style("transition", "width 0.3s ease-out");
    }
  }

  updateScore(score: number) {
    this.refreshRanks(score);
  }
}
