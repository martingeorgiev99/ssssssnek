import { MUSHROOM_MS, PIZZA_MS, PIZZA_SPEED_MULT, MIN_STEP } from "./constants";

export class GameState {
  score = 0;
  paused = false;
  over = false;
  mushroomsEnabled = true;

  invertMs = 0;
  speedMs = 0;

  baseStep: number;

  constructor(startStep: number) {
    this.baseStep = startStep;
  }

  reset(startStep: number) {
    this.score = 0;
    this.paused = false;
    this.over = false;
    this.invertMs = 0;
    this.speedMs = 0;
    this.baseStep = startStep;
  }

  addPoints(points: number) {
    this.score += points;
  }
  applyMushroom() {
    if (this.mushroomsEnabled) {
      this.invertMs = MUSHROOM_MS;
    }
  }
  applyPizza() {
    this.speedMs = PIZZA_MS;
  }

  speedUp(amount: number) {
    this.baseStep = Math.max(MIN_STEP, this.baseStep - amount);
  }

  tickEffects(dt: number) {
    const beforeInv = this.invertMs,
      beforeSpd = this.speedMs;
    if (this.invertMs > 0) this.invertMs = Math.max(0, this.invertMs - dt);
    if (this.speedMs > 0) this.speedMs = Math.max(0, this.speedMs - dt);
    return beforeInv !== this.invertMs || beforeSpd !== this.speedMs;
  }

  currentStep(): number {
    return Math.max(
      MIN_STEP,
      this.baseStep * (this.speedMs > 0 ? PIZZA_SPEED_MULT : 1)
    );
  }
}
