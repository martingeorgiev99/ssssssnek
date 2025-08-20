import * as d3 from "d3";
import { GameBoard } from "./GameBoard";
import { GameState } from "./GameState";
import { Snake } from "./Snake";
import { Food } from "./Food";
import type { FoodModel } from "./types";
import { FoodType, vec } from "./types";
import type { Vec } from "./types";
import { START_STEP, SPEEDUP, POINTS, RETRO_POINTS } from "./constants";
import { GameRenderer } from "../utils/GameRenderer";
import { SNAKE_SKINS } from "./SnakeSkins";
import { SoundManager } from "../utils/SoundManager";

export class Game {
  private board = new GameBoard();
  private state = new GameState(START_STEP);
  private soundManager = new SoundManager();
  setMushroomEffects(enabled: boolean) {
    this.state.mushroomsEnabled = enabled;
  }
  private snake!: Snake;
  private food!: FoodModel;
  private dir: Vec = vec(1, 0);
  private nextDir: Vec = vec(1, 0);
  private renderer = new GameRenderer(
    this.board.widthPx(),
    this.board.heightPx(),
    this
  );

  private last = performance.now();
  private tick = START_STEP;

  start() {
    this.reset();
    this.bindInput();
    d3.timer(() => this.loop());
  }

  private reset() {
    this.state.reset(START_STEP);
    this.dir = vec(1, 0);
    this.nextDir = vec(1, 0);
    this.snake = new Snake(this.board.center(), 3);
    this.food = Food.spawn(this.board, this.snake);
    const isRetro = (window as Window & { isRetroMode?: boolean }).isRetroMode || false;
    this.soundManager.switchMode(isRetro);
    this.renderer.hud(
      this.state.score,
      this.state.invertMs,
      this.state.speedMs
    );
  }

  changeSkin(skinId: string) {
    if (SNAKE_SKINS[skinId]) {
      this.renderer.changeSkin(skinId);
    }
  }

  setSoundEnabled(enabled: boolean) {
    this.soundManager.setMuted(!enabled);
  }

  private bindInput() {
    const map: Record<string, Vec> = {
      ArrowUp: vec(0, -1),
      KeyW: vec(0, -1),
      ArrowDown: vec(0, 1),
      KeyS: vec(0, 1),
      ArrowLeft: vec(-1, 0),
      KeyA: vec(-1, 0),
      ArrowRight: vec(1, 0),
      KeyD: vec(1, 0),
    };
    addEventListener("keydown", (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        if (!this.state.over) this.state.paused = !this.state.paused;
        return;
      }
      if (e.code === "KeyR") {
        this.reset();
        return;
      }
      const base = map[e.code];
      if (!base) return;

      const inv = this.state.invertMs > 0 ? vec(-base.x, -base.y) : base;
      // prevent instant reverse
      if (
        this.snake.body().length > 1 &&
        inv.x === -this.dir.x &&
        inv.y === -this.dir.y
      )
        return;
      this.nextDir = inv;
    });
  }

  private loop() {
    const now = performance.now();
    const dt = now - this.last;
    this.last = now;

    if (!this.state.paused && !this.state.over) {
      const hudDirty = this.state.tickEffects(dt);
      this.tick -= dt;
      while (this.tick <= 0) {
        this.step();
        this.tick += this.state.currentStep();
      }
      if (hudDirty)
        this.renderer.hud(
          this.state.score,
          this.state.invertMs,
          this.state.speedMs
        );
    }

    this.renderer.draw(
      this.snake.body(),
      this.food,
      this.state.paused,
      this.state.over
    );
  }

  private step() {
    this.dir = this.nextDir;
    const h = this.snake.head();
    const next = vec(h.x + this.dir.x, h.y + this.dir.y);

    if (!this.board.isInside(next) || this.snake.contains(next, true)) {
      this.state.over = true;
      this.renderer.shakeScreen();
      const isRetro = (window as any).isRetroMode || false;
      this.soundManager.playGameOver(isRetro);
      return;
    }

    const ate = next.x === this.food.pos.x && next.y === this.food.pos.y;
    this.snake.move(next, ate);

    if (ate) {
      this.onEat(this.food.type);
      this.food = Food.spawn(this.board, this.snake);
      this.renderer.hud(
        this.state.score,
        this.state.invertMs,
        this.state.speedMs
      );
    }
  }

  private onEat(type: FoodType) {
    const isRetro =
      (window as Window & { isRetroMode?: boolean }).isRetroMode || false;

    // Play point sound for either mode
    this.soundManager.playPoints(isRetro);

    // retro mode, all food 100 points and no special effects
    if (isRetro) {
      this.state.addPoints(RETRO_POINTS);
      return;
    }

    // modern mode - different points and effects
    this.state.addPoints(POINTS[type]);
    if (type === FoodType.MUSHROOM) this.state.applyMushroom();
    if (type === FoodType.PIZZA) this.state.applyPizza();
    this.state.speedUp(SPEEDUP);
  }
}
