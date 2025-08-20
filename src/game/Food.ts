import type { FoodModel } from "./types";
import { FoodType, vec, key } from "./types";
import type { Vec } from "./types";
import { FOOD_WEIGHTS, RETRO_FOOD_WEIGHTS } from "./constants";
import { Snake } from "./Snake";
import { GameBoard } from "./GameBoard";

function pickWeighted(isRetro: boolean = false): FoodType {
  if (isRetro) return FoodType.CHERRY;

  const weights = isRetro ? RETRO_FOOD_WEIGHTS : FOOD_WEIGHTS;
  const r = Math.random();
  let acc = 0;

  const entries = Object.entries(weights).sort((a, b) =>
    a[0].localeCompare(b[0])
  );
  for (const [type, weight] of entries) {
    acc += weight;
    if (r <= acc) return type as FoodType;
  }

  return FoodType.CHERRY;
}

export class Food {
  static spawn(board: GameBoard, snake: Snake): FoodModel {
    const occupied = new Set(snake.body().map(key));
    const r = Math.random();
    let position: Vec;
    do position = vec(Math.floor(r * board.cols), Math.floor(r * board.rows));
    while (occupied.has(key(position)));
    const isRetro = Food.isRetroMode();
    return { pos: position, type: pickWeighted(isRetro) };
  }

  static isRetroMode(): boolean {
    if (typeof window === "undefined") return false;
    return (window as any).isRetroMode || false;
  }
}
