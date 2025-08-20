import * as d3 from "d3";
import { CELL, RETRO_UNIT, RETRO_COLORS } from "../game/constants";
import { FOOD_SPRITES } from "../game/FoodSprites";
import type { FoodModel } from "../game/types";

export class FoodRenderer {
  private gFood: d3.Selection<SVGGElement, unknown, any, any>;

  constructor(svg: d3.Selection<SVGSVGElement, unknown, any, any>) {
    this.gFood = svg.append("g");
  }

  draw(food: FoodModel, isRetroMode: boolean) {
    this.gFood.selectAll("*").remove();

    if (isRetroMode) {
      this.drawRetroFood(food);
    } else {
      this.drawModernFood(food);
    }
  }

  private drawRetroFood(food: FoodModel) {
    const pattern = [
      [0, 1, 0],
      [1, 1, 1],
      [0, 1, 0],
    ];
    const x = food.pos.x * CELL;
    const y = food.pos.y * CELL;

    for (let i = 0; i < pattern.length; i++) {
      for (let j = 0; j < pattern[i].length; j++) {
        if (pattern[i][j] === 1) {
          this.gFood
            .append("rect")
            .attr("x", x + j * RETRO_UNIT)
            .attr("y", y + i * RETRO_UNIT)
            .attr("width", RETRO_UNIT)
            .attr("height", RETRO_UNIT)
            .attr("fill", RETRO_COLORS.food);
        }
      }
    }
  }

  private drawModernFood(food: FoodModel) {
    this.gFood
      .append("text")
      .attr("x", food.pos.x * CELL + CELL / 2)
      .attr("y", food.pos.y * CELL + CELL / 2)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .style("font-size", `${CELL * 0.8}px`)
      .text(FOOD_SPRITES[food.type]);
  }
}
