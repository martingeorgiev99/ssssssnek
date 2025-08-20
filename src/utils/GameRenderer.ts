import * as d3 from "d3";
import type { Vec } from "../game/types";
import type { FoodModel } from "../game/types";
import { C_BG, RETRO_COLORS } from "../game/constants";
import { SNAKE_SKINS } from "../game/SnakeSkins";
import { SnakeRenderer } from "./SnakeRenderer";
import { RankDisplay } from "./RankDisplay";
import { GridRenderer } from "./GridRenderer";
import { FoodRenderer } from "./FoodRenderer";
import { HudRenderer } from "./HudRenderer";
import { GameUIManager } from "./GameUIManager";

export class GameRenderer {
  private svg!: d3.Selection<SVGSVGElement, unknown, any, any>;
  private rankDisplay!: RankDisplay;
  private gridRenderer!: GridRenderer;
  private foodRenderer!: FoodRenderer;
  private hudRenderer!: HudRenderer;
  private snakeRenderer: SnakeRenderer;
  private uiManager!: GameUIManager;
  public width: number;
  public height: number;
  private currentSkin = "default";
  private lastFrame = performance.now();
  private retroMode = false;
  private oldSegs: Array<{ pos: Vec; index: number }> = [];
  private animProg = 0;
  private lastHeadDir = 0;
  private effectsGroup: d3.Selection<SVGGElement, unknown, any, any>;
  private game: any;

  onMushroomToggle(enabled: boolean) {
    this.game.setMushroomEffects(enabled);
  }

  constructor(w: number, h: number, game: any) {
    this.game = game;
    this.width = w;
    this.height = h;

    let wrap = d3.select<HTMLDivElement, unknown>("#game-container");
    if (wrap.empty()) {
      const container = d3
        .select("body")
        .append("div")
        .style("display", "flex")
        .style("justify-content", "center")
        .style("align-items", "center")
        .style("flex-wrap", "wrap")
        .style("min-height", "100vh")
        .style("background", "#0a0a0a")
        .style("gap", "32px")
        .style("padding", "16px");

      this.rankDisplay = new RankDisplay(container);

      wrap = container
        .append("div")
        .attr("id", "game-container")
        .style("display", "flex")
        .style("flex-direction", "column")
        .style("align-items", "center")
        .style("gap", "10px")
        .style("width", "min(90vw, 90vh)");
    }

    this.uiManager = new GameUIManager(wrap, {
      onModeChange: (retro) => this.switchMode(retro),
      onSkinChange: (skinId) => this.changeSkin(skinId),
      onMushroomToggle: (enabled) => this.onMushroomToggle(enabled),
      onSoundToggle: (enabled) => this.game.setSoundEnabled(enabled),
    });

    const svgContainer = wrap
      .append("div")
      .style("width", "min(90vw, 90vh)")
      .style("aspect-ratio", `${w / h}`);

    const svg = svgContainer
      .append("svg")
      .attr("viewBox", `0 0 ${w} ${h}`)
      .style("width", "100%")
      .style("height", "100%")
      .style("background", C_BG);

    this.svg = svg;
    this.gridRenderer = new GridRenderer(svg, this.width, this.height);
    this.foodRenderer = new FoodRenderer(svg);
    this.snakeRenderer = new SnakeRenderer(svg);
    this.hudRenderer = new HudRenderer(svg, this.width, this.height);

    this.effectsGroup = svg.append("g").attr("class", "effects");
  }

  changeSkin(skinId: string) {
    if (SNAKE_SKINS[skinId]) {
      this.currentSkin = skinId;
      this.svg.select("defs").remove(); // force gradient rebuild
    }
  }

  switchMode(retro: boolean) {
    this.retroMode = retro;
    (window as any).isRetroMode = retro;
    this.svg.style("background", retro ? RETRO_COLORS.background : C_BG);

    this.gridRenderer.setRetroMode(retro);
    this.uiManager.setSkinSelectVisibility(!retro);
    this.game.soundManager.switchMode(retro);

    if (retro) {
      this.currentSkin = "default";
    } else {
      this.currentSkin = d3
        .select<HTMLSelectElement, unknown>("#skin-select")
        .property("value") as string;
    }
  }

  hud(score: number, invertMs: number, speedMs: number) {
    this.uiManager.updateScore(score, invertMs, speedMs);
    this.rankDisplay.updateScore(score);
  }

  showScorePopup(pos: Vec, score: number) {
    const x = (pos.x * this.width) / 25 + this.width / 50;
    const y = (pos.y * this.height) / 20 + this.height / 40;

    this.effectsGroup
      .append("text")
      .attr("x", x)
      .attr("y", y)
      .attr("text-anchor", "middle")
      .attr("fill", "#fff")
      .style("font-family", "Arial")
      .style("font-size", "24px")
      .style("font-weight", "bold")
      .style("pointer-events", "none")
      .text(`+${score}`)
      .transition()
      .duration(1000)
      .attr("y", y - 50)
      .style("opacity", 0)
      .remove();
  }

  shakeScreen() {
    const intensity = 8;
    const duration = 400;

    this.svg.interrupt();

    const shakeCount = 8;
    let delay = 0;
    const stepDuration = duration / shakeCount;

    for (let i = 0; i < shakeCount; i++) {
      const dx = (Math.random() - 0.5) * intensity * (1 - i / shakeCount);
      const dy = (Math.random() - 0.5) * intensity * (1 - i / shakeCount);

      this.svg
        .transition()
        .delay(delay)
        .duration(stepDuration)
        .ease(d3.easeCubicOut)
        .style("transform", `translate(${dx}px, ${dy}px)`);

      delay += stepDuration;
    }

    this.svg
      .transition()
      .delay(delay)
      .duration(stepDuration)
      .ease(d3.easeCubicOut)
      .style("transform", "translate(0px, 0px)");
  }

  draw(snake: Vec[], food: FoodModel, paused: boolean, gameOver: boolean) {
    const now = performance.now();
    const dt = now - this.lastFrame;
    this.lastFrame = now;

    if (!paused && !gameOver) {
      this.animProg += dt / 120;
      if (this.animProg > 1) this.animProg = 1;
    }

    this.foodRenderer.draw(food, this.retroMode);

    const segments = snake.map((s, i) => ({ pos: s, index: i }));
    const smoothSegs = SnakeRenderer.calculateSmoothSegments(
      segments,
      this.oldSegs,
      this.animProg
    );

    const segsForRetro = this.retroMode ? segments : smoothSegs;

    if (this.retroMode) {
      this.snakeRenderer.drawRetroSnake(segsForRetro);
    } else {
      // head direction
      let headAngle = this.lastHeadDir;

      if (snake.length > 1) {
        const head = snake[0];
        const neck = snake[1];
        const dx = head.x - neck.x;
        const dy = head.y - neck.y;

        if (dx > 0) headAngle = 0;
        else if (dx < 0) headAngle = 180;
        else if (dy > 0) headAngle = 90;
        else if (dy < 0) headAngle = -90;

        this.lastHeadDir = headAngle;
      }

      this.snakeRenderer.drawModernSnake(
        smoothSegs,
        SNAKE_SKINS[this.currentSkin],
        headAngle,
        now
      );
    }

    this.hudRenderer.updateStatus(paused, gameOver);

    // prep next frame
    if (this.animProg >= 1 || paused || gameOver) {
      this.oldSegs = segments;
      this.animProg = 0;
    }
  }
}
