import { describe, it, expect } from "vitest";
import { GameBoard } from "../game/GameBoard";
import { vec } from "../game/types";
import { COLS, ROWS, CELL } from "../game/constants";

describe("GameBoard", () => {
  // test dimensions
  it("initializes with correct dimensions", () => {
    const board = new GameBoard();
    expect(board.cols).toBe(COLS);
    expect(board.rows).toBe(ROWS);
    expect(board.cell).toBe(CELL);
  });

  // test boundary checks
  it("correctly identifies positions inside the board", () => {
    const board = new GameBoard();

    // valid positions
    expect(board.isInside(vec(0, 0))).toBe(true);
    expect(board.isInside(vec(COLS - 1, ROWS - 1))).toBe(true);
    expect(board.isInside(vec(COLS / 2, ROWS / 2))).toBe(true);

    // invalid positions
    expect(board.isInside(vec(-1, 0))).toBe(false);
    expect(board.isInside(vec(0, -1))).toBe(false);
    expect(board.isInside(vec(COLS, 0))).toBe(false);
    expect(board.isInside(vec(0, ROWS))).toBe(false);
  });

  // test center position calculation
  it("correctly calculates center position", () => {
    const board = new GameBoard();
    const center = board.center();

    expect(center.x).toBe(Math.floor(COLS / 2));
    expect(center.y).toBe(Math.floor(ROWS / 2));
  });

  // test pixel dimensions
  it("correctly calculates pixel dimensions", () => {
    const board = new GameBoard();

    expect(board.widthPx()).toBe(COLS * CELL);
    expect(board.heightPx()).toBe(ROWS * CELL);
  });
});
