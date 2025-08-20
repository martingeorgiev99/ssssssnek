export type Vec = { x: number; y: number };

export const FoodType = {
  CHERRY: "cherry",
  MUSHROOM: "mushroom",
  PIZZA: "pizza",
} as const;

export type FoodType = (typeof FoodType)[keyof typeof FoodType];

export type FoodModel = { pos: Vec; type: FoodType };

// Tiny helpers
export const vec = (x: number, y: number): Vec => ({ x, y });
export const eq = (a: Vec, b: Vec) => a.x === b.x && a.y === b.y;
export const key = (p: Vec) => `${p.x},${p.y}`;
