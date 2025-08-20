import * as d3 from "d3";
import { CELL, RETRO_UNIT, RETRO_COLORS } from "../game/constants";
import type { Vec } from "../game/types";

export interface SnakeSkin {
  head: string;
  body: string;
}

export interface SmoothSegment {
  pos: Vec;
  index: number;
}

export class SnakeRenderer {
  private readonly gSnake: d3.Selection<SVGGElement, unknown, any, any>;
  private readonly svg: d3.Selection<SVGSVGElement, unknown, any, any>;

  constructor(svg: d3.Selection<SVGSVGElement, unknown, any, any>) {
    this.svg = svg;
    this.gSnake = svg.append("g");
  }

  drawModernSnake(
    smoothSegs: SmoothSegment[],
    skin: { head: string; body: string },
    headAngle: number,
    now: number
  ) {
    this.gSnake.selectAll("*").remove();
    if (!smoothSegs.length) return;

    SnakeRenderer.setupGradients(this.svg, skin);

    if (smoothSegs.length > 1) {
      const bodyPath = this.buildSimpleBodyPath(smoothSegs);
      const thickness = CELL * 0.7;

      this.gSnake
        .append("path")
        .attr("d", bodyPath)
        .attr("fill", "none")
        .attr("stroke", "#000")
        .attr("stroke-width", thickness + 4)
        .attr("stroke-linecap", "round")
        .attr("opacity", 0.15)
        .attr("transform", "translate(2, 2)");

      this.gSnake
        .append("path")
        .attr("d", bodyPath)
        .attr("fill", "none")
        .attr("stroke", "url(#snake-body-gradient)")
        .attr("stroke-width", thickness)
        .attr("stroke-linecap", "round");
    }

    const head = smoothSegs[0].pos;
    const cx = head.x * CELL + CELL / 2;
    const cy = head.y * CELL + CELL / 2;

    this.gSnake
      .append("ellipse")
      .attr("cx", cx)
      .attr("cy", cy)
      .attr("rx", CELL * 0.5)
      .attr("ry", CELL * 0.4)
      .attr("fill", skin.head)
      .attr("transform", `rotate(${headAngle} ${cx} ${cy})`);

    this.gSnake
      .append("circle")
      .attr("cx", cx + CELL * 0.2)
      .attr("cy", cy)
      .attr("r", 3)
      .attr("fill", "#000")
      .attr("transform", `rotate(${headAngle} ${cx} ${cy})`);

    if (smoothSegs.length > 2) {
      const tail = smoothSegs[smoothSegs.length - 1];
      const tailX = tail.pos.x * CELL + CELL / 2;
      const tailY = tail.pos.y * CELL + CELL / 2;
      const wiggle = Math.sin(now / 300) * 30;

      this.gSnake
        .append("circle")
        .attr("cx", tailX)
        .attr("cy", tailY)
        .attr("r", CELL * 0.2)
        .attr("fill", skin.body)
        .attr("transform", `rotate(${wiggle} ${tailX} ${tailY})`);
    }
  }

  drawRetroSnake(segs: SmoothSegment[]) {
    this.gSnake.selectAll("*").remove();
    this.gSnake.attr("shape-rendering", "crispEdges");
    if (!segs.length) return;

    segs.forEach((s, i) => {
      this.gSnake
        .append("rect")
        .attr("x", Math.round(s.pos.x * CELL))
        .attr("y", Math.round(s.pos.y * CELL))
        .attr("width", CELL)
        .attr("height", CELL)
        .attr("fill", RETRO_COLORS.snake);

      if (i === 0) {
        this.gSnake
          .append("rect")
          .attr("x", Math.round(s.pos.x * CELL) + RETRO_UNIT)
          .attr("y", Math.round(s.pos.y * CELL) + RETRO_UNIT)
          .attr("width", RETRO_UNIT)
          .attr("height", RETRO_UNIT)
          .attr("fill", RETRO_COLORS.background);
      }
    });
  }

  buildSimpleBodyPath(segments: SmoothSegment[]) {
    if (segments.length < 2) return "";

    const points = segments.map((s) => ({
      x: s.pos.x * CELL + CELL / 2,
      y: s.pos.y * CELL + CELL / 2,
    }));

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }

    return path;
  }

  static calculateSmoothSegments(
    segments: Array<{ pos: Vec; index: number }>,
    oldSegs: Array<{ pos: Vec; index: number }>,
    animProg: number
  ): SmoothSegment[] {
    return segments.map((seg, i) => {
      const { pos: newPos, index } = seg;
      const { pos: oldPos } = oldSegs[i] ?? seg;

      return {
        index,
        pos: {
          x: oldPos.x + (newPos.x - oldPos.x) * animProg,
          y: oldPos.y + (newPos.y - oldPos.y) * animProg,
        },
      };
    });
  }

  static setupGradients(
    svg: d3.Selection<SVGSVGElement, unknown, any, any>,
    skin: SnakeSkin
  ) {
    let defs = svg.select<SVGDefsElement>("defs");
    if (defs.empty()) defs = svg.append<SVGDefsElement>("defs");
    defs.selectAll("linearGradient").remove();

    const grad = defs
      .append("linearGradient")
      .attr("id", "snake-body-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");

    const head = d3.color(skin.head),
      body = d3.color(skin.body);
    if (head && body) {
      const lightHead = head.brighter(0.1),
        darkBody = body.darker(0.2);
      [
        { offset: "0%", color: lightHead.toString() },
        { offset: "40%", color: skin.head },
        { offset: "100%", color: darkBody.toString() },
      ].forEach((s) =>
        grad.append("stop").attr("offset", s.offset).attr("stop-color", s.color)
      );
    }
  }
}
