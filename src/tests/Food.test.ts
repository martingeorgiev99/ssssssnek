import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Food } from "../game/Food";
import { Snake } from "../game/Snake";
import { GameBoard } from "../game/GameBoard";
import { FoodType, vec } from "../game/types";
import { COLS, ROWS } from "../game/constants";

describe("Food", () => {
  let board: GameBoard;
  let isRetroModeSpy: any;

  beforeEach(() => {
    board = new GameBoard();
    isRetroModeSpy = vi.spyOn(Food, "isRetroMode").mockReturnValue(false);
  });

  afterEach(() => {
    isRetroModeSpy.mockRestore();
  });

  // test food spawning in normal mode
  it("spawns food in valid position", () => {
    const snake = new Snake(vec(5, 5), 3);

    const mockRandom = vi.spyOn(Math, "random");
    mockRandom.mockReturnValue(0.5);

    const food = Food.spawn(board, snake);

    // food position is within board bounds
    expect(food.pos.x).toBeGreaterThanOrEqual(0);
    expect(food.pos.x).toBeLessThan(COLS);
    expect(food.pos.y).toBeGreaterThanOrEqual(0);
    expect(food.pos.y).toBeLessThan(ROWS);

    // food doesn't spawn on snake
    const snakePositions = snake.body();
    const foodOnSnake = snakePositions.some(
      (pos) => pos.x === food.pos.x && pos.y === food.pos.y
    );
    expect(foodOnSnake).toBe(false);

    mockRandom.mockRestore();
  });

  // test food spawning in retro mode
  it("always spawns cherry in retro mode", () => {
    const snake = new Snake(vec(5, 5), 3);

    isRetroModeSpy.mockReturnValue(true);

    const food = Food.spawn(board, snake);

    // retro mode, always be cherry
    expect(food.type).toBe(FoodType.CHERRY);
  });

  // test food spawning with snake occupying space
  it("can spawn food in unoccupied spaces", () => {
    const snake = new Snake(vec(0, 0), Math.floor((COLS * ROWS) / 2)); // takes up half the board

    const food = Food.spawn(board, snake);

    // should be in one of the remaining spaces
    const snakePositions = snake.body();
    const foodOnSnake = snakePositions.some(
      (pos) => pos.x === food.pos.x && pos.y === food.pos.y
    );
    expect(foodOnSnake).toBe(false);
  });

  // test food type distribution
  it("spawns different types of food in normal mode", () => {
    const snake = new Snake(vec(5, 5), 3);
    isRetroModeSpy.mockReturnValue(false);

    const mockRandom = vi.spyOn(Math, "random");
    mockRandom
      .mockReturnValueOnce(0.3)
      .mockReturnValueOnce(0.8)
      .mockReturnValue(0.95);

    const foodTypes = new Set<FoodType>();
    const foodResults: FoodType[] = [];

    for (let i = 0; i < 3; i++) {
      const food = Food.spawn(board, snake);
      foodTypes.add(food.type);
      foodResults.push(food.type);
    }

    console.log("Food types received:", foodResults);
    console.log("Unique food types:", Array.from(foodTypes));

    // should have multiple food types
    expect(foodTypes.size).toBeGreaterThan(1);

    mockRandom.mockRestore();
  });
});
