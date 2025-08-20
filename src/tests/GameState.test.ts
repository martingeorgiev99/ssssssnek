import { describe, it, expect } from "vitest";
import { GameState } from "../game/GameState";
import {
  MUSHROOM_MS,
  PIZZA_MS,
  PIZZA_SPEED_MULT,
  MIN_STEP,
} from "../game/constants";

describe("GameState", () => {
  it("initializes with correct values", () => {
    const startStep = 100;
    const state = new GameState(startStep);

    expect(state.score).toBe(0);
    expect(state.paused).toBe(false);
    expect(state.over).toBe(false);
    expect(state.invertMs).toBe(0);
    expect(state.speedMs).toBe(0);
    expect(state.baseStep).toBe(startStep);
  });

  // test reset functionality
  it("resets to initial state", () => {
    const state = new GameState(100);
    state.score = 50;
    state.paused = true;
    state.over = true;
    state.invertMs = 1000;
    state.speedMs = 1000;

    const newStep = 150;
    state.reset(newStep);

    expect(state.score).toBe(0);
    expect(state.paused).toBe(false);
    expect(state.over).toBe(false);
    expect(state.invertMs).toBe(0);
    expect(state.speedMs).toBe(0);
    expect(state.baseStep).toBe(newStep);
  });

  // test score system
  it("correctly manages score", () => {
    const state = new GameState(100);

    state.addPoints(10);
    expect(state.score).toBe(10);

    state.addPoints(15);
    expect(state.score).toBe(25);
  });

  // test power-up effects
  it("correctly applies and manages power-ups", () => {
    const state = new GameState(100);

    state.applyMushroom();
    expect(state.invertMs).toBe(MUSHROOM_MS);

    state.applyPizza();
    expect(state.speedMs).toBe(PIZZA_MS);

    const dt = 1000;
    state.tickEffects(dt);

    expect(state.invertMs).toBe(Math.max(0, MUSHROOM_MS - dt));
    expect(state.speedMs).toBe(Math.max(0, PIZZA_MS - dt));
  });

  // test speed
  it("correctly manages speed", () => {
    const startStep = 100;
    const state = new GameState(startStep);

    state.speedUp(10);
    expect(state.baseStep).toBe(90);

    state.speedUp(1000);
    expect(state.baseStep).toBe(MIN_STEP);

    state.reset(startStep);
    state.applyPizza();
    expect(state.currentStep()).toBe(startStep * PIZZA_SPEED_MULT);
  });

  // test effect ticking
  it("returns correct change status when ticking effects", () => {
    const state = new GameState(100);

    expect(state.tickEffects(1000)).toBe(false);

    state.applyMushroom();
    state.applyPizza();
    expect(state.tickEffects(1000)).toBe(true);

    state.invertMs = 0;
    state.speedMs = 0;
    expect(state.tickEffects(1000)).toBe(false);
  });
});
