import * as d3 from "d3";
import { C_GRID, CELL, RETRO_UNIT, RETRO_COLORS } from "../game/constants";

export class GridRenderer {
  private gGrid: d3.Selection<SVGGElement, unknown, any, any>;
  private width: number;
  private height: number;

  constructor(
    svg: d3.Selection<SVGSVGElement, unknown, any, any>,
    width: number,
    height: number
  ) {
    this.gGrid = svg.append("g");
    this.width = width;
    this.height = height;
    this.buildGrid();
  }

  private buildGrid() {
    // regular grid lines
    for (let x = CELL; x < this.width; x += CELL) {
      this.gGrid
        .append("line")
        .attr("class", "modern-grid")
        .attr("x1", x + 0.5)
        .attr("y1", 0)
        .attr("x2", x + 0.5)
        .attr("y2", this.height)
        .attr("stroke", C_GRID)
        .attr("stroke-width", 1)
        .attr("opacity", 1);
    }
    for (let y = CELL; y < this.height; y += CELL) {
      this.gGrid
        .append("line")
        .attr("class", "modern-grid")
        .attr("x1", 0)
        .attr("y1", y + 0.5)
        .attr("x2", this.width)
        .attr("y2", y + 0.5)
        .attr("stroke", C_GRID)
        .attr("stroke-width", 1)
        .attr("opacity", 1);
    }

    const retroGrid = this.gGrid
      .append("g")
      .attr("class", "retro-grid")
      .style("opacity", 0);

    // thick grid lines for retro look
    for (let x = 0; x < this.width; x += CELL) {
      retroGrid
        .append("line")
        .attr("class", "retro-major")
        .attr("x1", x)
        .attr("y1", 0)
        .attr("x2", x)
        .attr("y2", this.height)
        .attr("stroke", RETRO_COLORS.grid)
        .attr("stroke-width", 2);
    }
    for (let y = 0; y < this.height; y += CELL) {
      retroGrid
        .append("line")
        .attr("class", "retro-major")
        .attr("x1", 0)
        .attr("y1", y)
        .attr("x2", this.width)
        .attr("y2", y)
        .attr("stroke", RETRO_COLORS.grid)
        .attr("stroke-width", 2);
    }

    // fine grid detail
    for (let x = RETRO_UNIT; x < this.width; x += RETRO_UNIT) {
      if (x % CELL !== 0) {
        retroGrid
          .append("line")
          .attr("x1", x)
          .attr("y1", 0)
          .attr("x2", x)
          .attr("y2", this.height)
          .attr("stroke", RETRO_COLORS.grid)
          .attr("stroke-width", 1);
      }
    }
    for (let y = RETRO_UNIT; y < this.height; y += RETRO_UNIT) {
      if (y % CELL !== 0) {
        retroGrid
          .append("line")
          .attr("x1", 0)
          .attr("y1", y)
          .attr("x2", this.width)
          .attr("y2", y)
          .attr("stroke", RETRO_COLORS.grid)
          .attr("stroke-width", 1);
      }
    }
  }

  setRetroMode(retro: boolean) {
    this.gGrid.select(".retro-grid").style("opacity", retro ? 1 : 0);
    this.gGrid.selectAll(".modern-grid").style("opacity", retro ? 0 : 1);
  }
}
