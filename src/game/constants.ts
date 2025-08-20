import { FoodType } from "./types";

export const COLS = 25;
export const ROWS = 20;
export const CELL = 56;
export const RETRO_UNIT = CELL / 3; // lore-accurate

export const START_STEP = 66;
export const MIN_STEP = 50;
export const SPEEDUP = 2;
export const PIZZA_SPEED_MULT = 0.6;

export const MUSHROOM_MS = 30_000; // ew
export const PIZZA_MS = 6_000;

export const FOOD_WEIGHTS: Record<FoodType, number> = {
  [FoodType.CHERRY]: 0.7,
  [FoodType.MUSHROOM]: 0.15, // ew
  [FoodType.PIZZA]: 0.15,
};

export const RETRO_FOOD_WEIGHTS: Record<FoodType, number> = {
  [FoodType.CHERRY]: 1,
  [FoodType.MUSHROOM]: 0,
  [FoodType.PIZZA]: 0,
};

export const POINTS: Record<FoodType, number> = {
  [FoodType.CHERRY]: 100,
  [FoodType.MUSHROOM]: 350,
  [FoodType.PIZZA]: 400,
};

export const RETRO_POINTS = 100;

export const C_BG = "#004799ff";
export const C_GRID = "#000000ff";

export const RETRO_COLORS = {
  background: "#9EB644", // NOKIA GREEN 🤩
  snake: "#000000",
  grid: "#8EA440",
  food: "#000000",
};
