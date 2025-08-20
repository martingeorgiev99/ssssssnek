import { describe, it, expect } from "vitest";
import { Snake } from "../game/Snake";
import { vec } from "../game/types";

describe("Snake", () => {
  // test snake core behavior (movement, growth, collisions)
  it("has complete snake behavior", () => {
    const snake = new Snake(vec(5, 5), 3);

    // initial state
    expect(snake.body().length).toBe(3);
    expect(snake.body()).toEqual([
      vec(5, 5), // head
      vec(4, 5), // body
      vec(3, 5), // tail
    ]);

    // normal movement (no grow)
    snake.move(vec(5, 4), false);
    expect(snake.head()).toEqual(vec(5, 4));
    expect(snake.body().length).toBe(3);

    // growth when eating
    snake.move(vec(5, 3), true);
    expect(snake.body().length).toBe(4);

    // collision checks
    expect(snake.contains(vec(5, 3))).toBe(true); // head
    expect(snake.contains(vec(6, 6))).toBe(false); // miss
    expect(snake.contains(vec(5, 3), true)).toBe(false); // ignore head

    // reset
    snake.reset(vec(10, 10), 3);
    expect(snake.head()).toEqual(vec(10, 10));
    expect(snake.body().length).toBe(3);
  });
});
