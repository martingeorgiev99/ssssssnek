import { describe, it, expect, beforeEach, vi } from "vitest";
import { Game } from "../game/Game";
import { FoodType, vec } from "../game/types";
import { Snake } from "../game/Snake";
import { Food } from "../game/Food";

const mockDocument = {
  getElementById: vi.fn(),
  querySelector: vi.fn(),
  createElement: vi.fn(),
  createElementNS: vi.fn(),
  documentElement: {},
};

const mockWindow = {
  performance: { now: vi.fn() },
  addEventListener: vi.fn(),
  d3: { timer: vi.fn() },
  localStorage: {
    getItem: vi.fn().mockReturnValue(JSON.stringify({ highScore: 0 })),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 1,
    key: vi.fn(),
  },
};

let mockRenderer: any;

describe("Game", () => {
  let game: Game;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();

    global.document = mockDocument as any;
    global.window = mockWindow as any;
    global.performance = mockWindow.performance as any;
    global.addEventListener = mockWindow.addEventListener;
    global.localStorage = mockWindow.localStorage;

    const mockSvg = {} as SVGSVGElement;
    mockDocument.createElementNS.mockReturnValue(mockSvg);

    mockRenderer = {
      draw: vi.fn(),
      hud: vi.fn(),
      changeSkin: vi.fn(),
      svg: mockSvg,
      rankDisplay: { updateScore: vi.fn() },
      gridRenderer: { setRetroMode: vi.fn() },
      foodRenderer: { draw: vi.fn() },
      snakeRenderer: {
        drawModernSnake: vi.fn(),
        drawRetroSnake: vi.fn(),
        calculateSmoothSegments: vi.fn(),
      },
      hudRenderer: { updateStatus: vi.fn() },
      uiManager: {
        updateScore: vi.fn(),
        setSkinSelectVisibility: vi.fn(),
      },
      width: 800,
      height: 600,
      currentSkin: "default",
      lastFrame: 0,
      retroMode: false,
      oldSegs: [],
      animProg: 0,
      lastHeadDir: 0,
      switchMode: vi.fn(),
    };

    mockWindow.d3.timer.mockImplementation((callback: () => void) =>
      callback()
    );

    let time = 0;
    mockWindow.performance.now.mockImplementation(() => (time += 100));

    vi.spyOn(Food, "spawn").mockImplementation(() => ({
      pos: vec(5, 5),
      type: FoodType.CHERRY,
    }));

    Game.prototype["renderer"] = mockRenderer;
    game = new Game();
  });

  // test game initialization and state
  it("initializes game with correct state", () => {
    game.start();

    expect(game["state"].score).toBe(0);
    expect(game["state"].paused).toBe(false);
    expect(game["state"].over).toBe(false);
    expect(game["dir"]).toEqual(vec(1, 0));
  });

  // test controls and input handling
  it("handles keyboard input correctly", () => {
    game.start();

    const [[event, listener]] = mockWindow.addEventListener.mock.calls;
    expect(event).toBe("keydown");

    // test pause
    listener({ code: "Space", preventDefault: vi.fn() });
    expect(game["state"].paused).toBe(true);
    listener({ code: "Space", preventDefault: vi.fn() });
    expect(game["state"].paused).toBe(false);

    // test direction changes
    listener({ code: "ArrowUp" });
    expect(game["nextDir"]).toEqual(vec(0, -1));

    // moving up
    game["dir"] = vec(0, -1);

    // can't reverse direction
    listener({ code: "ArrowDown" });
    expect(game["nextDir"]).toEqual(vec(0, -1)); // unchanged
  });

  // test scoring and powerups
  it("handles scoring and food effects", () => {
    game.start();
    game["snake"] = new Snake(vec(4, 5), 3);
    game["dir"] = vec(1, 0);

    game["step"](); // eat food at (5,5)

    expect(game["state"].score).toBeGreaterThan(0);
  });

  // test game over conditions
  it("detects game over conditions", () => {
    game.start();

    // wall collision
    game["snake"] = new Snake(vec(0, 0), 3);
    game["dir"] = vec(-1, 0);
    game["nextDir"] = vec(-1, 0);
    game["step"]();
    expect(game["state"].over).toBe(true); // ded
  });

  // test game reset
  it("resets game state on R key press", () => {
    game.start();
    game["state"].score = 100;
    game["state"].over = true;

    const [[, listener]] = mockWindow.addEventListener.mock.calls;
    listener({ code: "KeyR" });

    expect(game["state"].score).toBe(0);
    expect(game["state"].over).toBe(false);
    expect(game["dir"]).toEqual(vec(1, 0));
  });
});
