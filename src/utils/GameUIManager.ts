import * as d3 from "d3";
import { SNAKE_SKINS } from "../game/SnakeSkins";

export interface GameUICallbacks {
  onModeChange: (retro: boolean) => void;
  onSkinChange: (skinId: string) => void;
  onMushroomToggle: (enabled: boolean) => void;
  onSoundToggle: (enabled: boolean) => void;
}

export class GameUIManager {
  private skinSelect: d3.Selection<HTMLDivElement, unknown, any, any>;
  private scoreEl: d3.Selection<HTMLDivElement, unknown, any, any>;

  constructor(
    container: d3.Selection<HTMLDivElement, unknown, any, any>,
    callbacks: GameUICallbacks
  ) {
    const titleDiv = container
      .append("div")
      .style("color", "white")
      .style("font-family", "monospace")
      .style("margin-bottom", "10px");

    titleDiv
      .append("span")
      .html("<b>Snake</b> — arrows/WASD move · SPACE pause · R restart ");

    const helpButton = titleDiv
      .append("span")
      .style("color", "#00b7ffff")
      .style("cursor", "help")
      .style("position", "relative")
      .text("?");

    const tooltip = helpButton
      .append("div")
      .style("display", "none")
      .style("position", "absolute")
      .style("top", "20px")
      .style("left", "0")
      .style("min-width", "200px")
      .style("background", "#2d3748")
      .style("padding", "8px")
      .style("z-index", "1")
      .html(`Advance through the ranks to become the mightiest snake to ever live!<br>
            <br>
            Modern mode:<br>
            &nbsp;Cherries award you 100 points<br>
            &nbsp;Mushroom - 350 points and inverted controls for 30 seconds<br>
            &nbsp;Pizza - 400 points and gives you a speed up for 6 seconds<br>
            <br>
            Retro mode:<br>
            &nbsp;Revisit the good old days!<br>
            &nbsp;Only one food type awarding you 100 points each, no special effects`);

    helpButton
      .on("mouseover", function () {
        tooltip.style("display", "block");
      })
      .on("mouseout", function () {
        tooltip.style("display", "none");
      });

    const modeSelect = container
      .append("div")
      .style("margin-bottom", "10px")
      .style("color", "white")
      .style("font-family", "monospace");

    modeSelect.append("span").text("Mode: ");
    const toggle = modeSelect
      .append("select")
      .style("background", "#2d3748")
      .style("color", "white")
      .style("border", "1px solid #4a5568")
      .style("padding", "2px 6px")
      .style("border-radius", "4px")
      .style("margin-right", "16px")
      .on("change", (event) =>
        callbacks.onModeChange(event.target.value === "retro")
      );

    const modes = [
      { value: "modern", label: "Modern" },
      { value: "retro", label: "Retro" },
    ];
    modes.forEach((mode) => {
      toggle.append("option").attr("value", mode.value).text(mode.label);
    });

    const skinDiv = container
      .append("div")
      .style("margin-bottom", "10px")
      .style("color", "white")
      .style("font-family", "monospace");

    this.skinSelect = skinDiv;
    skinDiv.append("span").text("Snake Skin: ");
    const select = skinDiv
      .append("select")
      .style("background", "#2d3748")
      .style("color", "white")
      .style("border", "1px solid #4a5568")
      .style("padding", "2px 6px")
      .style("border-radius", "4px")
      .attr("id", "skin-select")
      .on("change", (event) => callbacks.onSkinChange(event.target.value));

    for (const [id, skin] of Object.entries(SNAKE_SKINS)) {
      select.append("option").attr("value", id).text(skin.name);
    }

    // Set initial skin to default
    select.property("value", "default");

    const soundToggleDiv = container.append("div")
      .style("margin-bottom", "10px")
      .style("color", "white")
      .style("font-family", "monospace");
    
    soundToggleDiv.append("input")
      .attr("type", "checkbox")
      .attr("id", "sound-toggle")
      .style("margin-right", "8px")
      .property("checked", true)
      .on("change", (event) => callbacks.onSoundToggle(event.target.checked));
    
    soundToggleDiv.append("label")
      .attr("for", "sound-toggle")
      .text("Enable sounds");

    const mushroomToggleDiv = container
      .append("div")
      .style("margin-bottom", "10px")
      .style("color", "white")
      .style("font-family", "monospace");

    mushroomToggleDiv
      .append("input")
      .attr("type", "checkbox")
      .attr("id", "mushroom-toggle")
      .style("margin-right", "8px")
      .property("checked", true)
      .on("change", (event) =>
        callbacks.onMushroomToggle(event.target.checked)
      );

    mushroomToggleDiv
      .append("label")
      .attr("for", "mushroom-toggle")
      .text("Enable mushroom effects");

    this.scoreEl = container
      .append("div")
      .style("color", "#9ae6b4")
      .style("font-family", "monospace")
      .style("margin-top", "8px")
      .text("Score: 0");
  }

  updateScore(score: number, invertMs: number = 0, speedMs: number = 0) {
    let text = `Score: ${score}`;
    if (invertMs > 0) text += ` | Dizzy:${(invertMs / 1000).toFixed(1)}s`;
    if (speedMs > 0) text += ` | Zoomies:${(speedMs / 1000).toFixed(1)}s`;

    this.scoreEl.text(text);
  }

  setSkinSelectVisibility(visible: boolean) {
    this.skinSelect.style("display", visible ? "block" : "none");
  }
}
