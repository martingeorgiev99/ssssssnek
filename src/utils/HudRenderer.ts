import * as d3 from "d3";

export class HudRenderer {
  private gHud: d3.Selection<SVGGElement, unknown, any, any>;
  private width: number;
  private height: number;

  constructor(
    svg: d3.Selection<SVGSVGElement, unknown, any, any>,
    width: number,
    height: number
  ) {
    this.gHud = svg.append("g");
    this.width = width;
    this.height = height;
  }

  updateStatus(paused: boolean, gameOver: boolean) {
    let msg = "";
    if (paused && !gameOver) msg = "PAUSED";
    else if (gameOver) msg = "GAME OVER — press R";

    const hudText = this.gHud
      .selectAll<SVGTextElement, string>("text.hud")
      .data(msg ? [msg] : []);

    hudText
      .enter()
      .append("text")
      .attr("class", "hud")
      .attr("x", this.width / 2)
      .attr("y", this.height / 2)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .style("font", "28px monospace")
      .style("fill", "#fff")
      .merge(hudText as any)
      .text((d) => d);

    hudText.exit().remove();
  }
}
