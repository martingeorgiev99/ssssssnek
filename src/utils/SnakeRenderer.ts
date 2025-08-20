import * as d3 from "d3";
import { CELL, RETRO_UNIT, RETRO_COLORS } from "../game/constants";
import type { Vec } from "../game/types";

export interface SnakeSkin {
  head: string;
  body: string;
  eyeColor?: string;
  name?: string;
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

  /**
   * Renders a modern-style snake with smooth curves, gradient effects, and animated features.
   * The snake consists of three main parts:
   * 1. Body: A curved path with shadow, gradient fill, and highlight
   * 2. Head: A custom shape that rotates based on movement direction
   * 3. Eyes: Animated pupils that move side to side
   * 
   * @param smoothSegs Array of snake segments with interpolated positions
   * @param skin Colors for the snake's appearance
   * @param headAngle Rotation angle of the head in degrees
   * @param now Current timestamp for animations
   */
  drawModernSnake(
    smoothSegs: SmoothSegment[],
    skin: { head: string; body: string; eyeColor?: string },
    headAngle: number,
    now: number
  ) {
    this.gSnake.selectAll("*").remove();
    this.gSnake.attr("shape-rendering", null);
    if (!smoothSegs.length) return;

    SnakeRenderer.setupGradients(this.svg, skin);
    const bodyPath = SnakeRenderer.buildSnakePath(smoothSegs);
    if (bodyPath && smoothSegs.length > 1) {
      const thickness = CELL * 0.7;
      this.gSnake.append("path")
        .attr("d", bodyPath)
        .attr("fill", "none")
        .attr("stroke", "#000")
        .attr("stroke-width", thickness + 4)
        .attr("stroke-linecap", "round")
        .attr("stroke-linejoin", "round")
        .attr("opacity", 0.15)
        .attr("transform", "translate(2, 2)");
      this.gSnake.append("path")
        .attr("d", bodyPath)
        .attr("fill", "none")
        .attr("stroke", "url(#snake-body-gradient)")
        .attr("stroke-width", thickness)
        .attr("stroke-linecap", "round")
        .attr("stroke-linejoin", "round");
      this.gSnake.append("path")
        .attr("d", bodyPath)
        .attr("fill", "none")
        .attr("stroke", d3.color(skin.head)?.brighter(0.6).toString() || skin.head)
        .attr("stroke-width", thickness * 0.3)
        .attr("stroke-linecap", "round")
        .attr("stroke-linejoin", "round")
        .attr("opacity", 0.4);
    }

    const headSeg = smoothSegs[0];
    const head = SnakeRenderer.createHead(headSeg.pos, headAngle);
    this.gSnake.append("path")
      .attr("d", head.headPath)
      .attr("fill", "#000")
      .attr("opacity", 0.2)
      .attr("transform", `translate(1.5,1.5) rotate(${head.angle} ${head.cx} ${head.cy})`);
    this.gSnake.append("path")
      .attr("d", head.headPath)
      .attr("fill", skin.body)
      .attr("transform", `rotate(${head.angle} ${head.cx} ${head.cy})`);
    this.gSnake.append("path")
      .attr("d", head.headPath)
      .attr("fill", skin.head)
      .attr("opacity", 0.9)
      .attr("transform", `rotate(${head.angle} ${head.cx} ${head.cy})`);

    // Create a group for eyes that rotates with the head
    // Create eye group that rotates with head
    const eyeGroup = this.gSnake.append("g")
      .attr("transform", `rotate(${head.angle} ${head.cx} ${head.cy})`);

    // Calculate eye positions
    const eyeSpacing = head.width * 0.2;
    const eyeY = head.angle > 90 && head.angle < 270
      ? head.cy + head.len * 0.1  // Eyes on bottom when facing left
      : head.cy - head.len * 0.1; // Eyes on top otherwise

    // Draw both eyes using defs for reuse
    let defs = this.svg.select<SVGDefsElement>("defs");
    if (!defs.select("#snake-eye").size()) {
      // Create reusable eye definition
      const eye = defs.append("g").attr("id", "snake-eye");
      // Eye shadow
      eye.append("circle")
        .attr("r", 4)
        .attr("fill", "#000")
        .attr("opacity", 0.3);
      // Eye white
      eye.append("circle")
        .attr("r", 3)
        .attr("class", "eye-color");
    }

    // Add eyes and animate pupils
    [-eyeSpacing, eyeSpacing].forEach((xOffset, i) => {
      const eyeX = head.cx + xOffset;
      // Use the defined eye shape
      const eye = eyeGroup.append("use")
        .attr("href", "#snake-eye")
        .attr("x", eyeX)
        .attr("y", eyeY);
      // Set eye color from skin
      eye.select(".eye-color").attr("fill", skin.eyeColor || "#f0f0f0");
      
      // Add animated pupil (single shape instead of two)
      const pupilMove = Math.sin(now / 1000 + i * Math.PI) * 0.5;
      eyeGroup.append("ellipse")
        .attr("cx", eyeX + pupilMove)
        .attr("cy", eyeY)
        .attr("rx", 1.2)
        .attr("ry", 2)
        .attr("fill", "#000")
        .attr("filter", "url(#snake-pupil-highlight)");
    });

    // Create pupil highlight filter if it doesn't exist
    if (!defs.select("#snake-pupil-highlight").size()) {
      const filter = defs.append("filter")
        .attr("id", "snake-pupil-highlight")
        .attr("x", "-50%")
        .attr("y", "-50%")
        .attr("width", "200%")
        .attr("height", "200%");
      filter.append("feDropShadow")
        .attr("dx", "0.5")
        .attr("dy", "-0.5")
        .attr("stdDeviation", "0.5")
        .attr("flood-color", "white")
        .attr("flood-opacity", "0.8");
    }
    
    // Add animated tail only if snake is long enough
    if (smoothSegs.length > 2) {
      this.drawTail(smoothSegs, skin.body, now);
    }
  }

  /**
   * Renders a retro-style snake reminiscent of old Nokia phones.
   * Features:
   * - Pixel-perfect grid alignment using crispEdges
   * - Fine grid overlay using RETRO_UNIT size
   * - Clipping path to contain the grid within snake body
   * - Simple rectangular segments with a "pixel" eye in the head
   */
  drawRetroSnake(segs: SmoothSegment[]) {
    this.gSnake.selectAll("*").remove();
    this.gSnake.attr("shape-rendering", "crispEdges");

    if (!segs.length) return;

    // full rects
    const cells = segs.map(s => ({
        x: Math.round(s.pos.x * CELL),
        y: Math.round(s.pos.y * CELL),
        w: CELL,
        h: CELL,
    }));

    let defs = this.svg.select<SVGDefsElement>("defs");
    if (defs.empty()) defs = this.svg.append<SVGDefsElement>("defs");

    defs.select("#snake-clip").remove();
    const clip = defs.append("clipPath")
        .attr("id", "snake-clip")
        .attr("clipPathUnits", "userSpaceOnUse");

    cells.forEach(c =>
        clip.append("rect")
        .attr("x", c.x).attr("y", c.y)
        .attr("width", c.w).attr("height", c.h)
    );

    const body = this.gSnake.append("g");
    cells.forEach(c =>
        body.append("rect")
        .attr("x", c.x).attr("y", c.y)
        .attr("width", c.w).attr("height", c.h)
        .attr("fill", RETRO_COLORS.snake)
    );

    {
        const headCell = cells[0];
        if (headCell) {
        body.append("rect")
            .attr("x", headCell.x + RETRO_UNIT)
            .attr("y", headCell.y + RETRO_UNIT)
            .attr("width", RETRO_UNIT)
            .attr("height", RETRO_UNIT)
            .attr("fill", RETRO_COLORS.background);
        }
    }

    // Create retro grid pattern if it doesn't exist
    if (!defs.select("#retro-grid-pattern").size()) {
      const pattern = defs.append("pattern")
        .attr("id", "retro-grid-pattern")
        .attr("patternUnits", "userSpaceOnUse")
        .attr("width", RETRO_UNIT)
        .attr("height", RETRO_UNIT);

      // Single vertical and horizontal line for the grid
      pattern.append("path")
        .attr("d", `M ${RETRO_UNIT} 0 V ${RETRO_UNIT} M 0 ${RETRO_UNIT} H ${RETRO_UNIT}`)
        .attr("stroke", RETRO_COLORS.grid)
        .attr("stroke-width", 1)
        .attr("vector-effect", "non-scaling-stroke");
    }

    // Get the bounds of the snake body
    const bounds = cells.reduce((b, c) => ({
      minX: Math.min(b.minX, c.x),
      minY: Math.min(b.minY, c.y),
      maxX: Math.max(b.maxX, c.x + c.w),
      maxY: Math.max(b.maxY, c.y + c.h)
    }), { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity });

    // Add grid with pattern
    const slitGroup = this.gSnake.append("g")
      .attr("clip-path", "url(#snake-clip)");
    
    slitGroup.append("rect")
      .attr("x", bounds.minX)
      .attr("y", bounds.minY)
      .attr("width", bounds.maxX - bounds.minX)
      .attr("height", bounds.maxY - bounds.minY)
      .attr("fill", "url(#retro-grid-pattern)");
  }

  /**
   * Generates a simplified SVG path for the snake's body using quadratic curves.
   * Creates smooth curves by placing control points at a fixed distance
   * perpendicular to the direction of movement.
   * 
   * @param segments Array of snake body segments to connect
   * @returns SVG path string using M, L, and Q commands
   */
  static buildSnakePath(segments: SmoothSegment[]) {
    if (segments.length < 2) return "";
    
    // Convert grid positions to pixel coordinates
    const points = segments.map(s => ({ 
      x: s.pos.x * CELL + CELL / 2, 
      y: s.pos.y * CELL + CELL / 2 
    }));

    // Start at the first point
    let path = `M ${points[0].x} ${points[0].y}`;

    // For two points, just draw a line
    if (points.length === 2) {
      return path + ` L ${points[1].x} ${points[1].y}`;
    }

    // For 3+ points, use smooth quadratic curves
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      
      // Calculate midpoint between points
      const mid = {
        x: (prev.x + curr.x) / 2,
        y: (prev.y + curr.y) / 2
      };

      // Draw quadratic curve to midpoint, using current point as control point
      path += ` Q ${curr.x} ${curr.y}, ${mid.x} ${mid.y}`;
    }

    // Final line to last point
    const last = points[points.length - 1];
    path += ` L ${last.x} ${last.y}`;

    return path;
  }

  /**
   * Interpolates between old and new snake segment positions for smooth animation.
   * Uses linear interpolation (lerp) to create in-between positions based on animation progress.
   * 
   * @param segments New target positions for snake segments
   * @param oldSegs Previous positions of snake segments
   * @param animProg Animation progress from 0 to 1
   * @returns Array of segments with interpolated positions
   */
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
          y: oldPos.y + (newPos.y - oldPos.y) * animProg
        }
      };
    });
  }

  /**
   * Creates a simplified SVG path for the snake's head using an ellipse-based shape.
   * Combines two paths:
   * 1. Main head shape: Modified ellipse with a pointed front
   * 2. Jaw curve: Small indentation for a more snake-like appearance
   * 
   * @param headPos Grid position of the head
   * @param angle Rotation angle in degrees
   * @returns Object with head path and positioning information
   */
  static createHead(headPos: Vec, angle: number) {
    const cx = headPos.x * CELL + CELL / 2;
    const cy = headPos.y * CELL + CELL / 2;
    const len = CELL * 0.75, width = CELL * 0.6;
    
    // Create teardrop shape for head
    const tip = { x: cx + len/2, y: cy };           // Pointed tip
    const back = { x: cx - len/3, y: cy };          // Back of head
    const bulge = width * 0.6;                      // Max width point
    const bulgePoint = { x: cx, y: cy };            // Point of maximum width
    
    const headPath = `
      M ${tip.x} ${cy}
      C ${tip.x} ${cy - bulge}, ${bulgePoint.x} ${cy - bulge}, ${back.x} ${cy - width/3}
      C ${cx - len/2} ${cy - width/4}, ${cx - len/2} ${cy + width/4}, ${back.x} ${cy + width/3}
      C ${bulgePoint.x} ${cy + bulge}, ${tip.x} ${cy + bulge}, ${tip.x} ${cy}
      Z`;
      
    return { cx, cy, headPath, len, width, angle };
  }

  /**
   * Sets up SVG gradient definitions for the snake's body.
   * Creates a vertical gradient with three color stops:
   * 1. Light head color (40% brighter) at top
   * 2. Original head color at 40% down
   * 3. Dark body color (30% darker) at bottom
   * 
   * @param svg The SVG element to add gradient definitions to
   * @param skin Colors for the snake's appearance
   */
  /**
   * Draws the snake's tail with animation
   * @param segments Snake body segments
   * @param color Tail color
   * @param now Current timestamp for animation
   */
  private drawTail(segments: SmoothSegment[], color: string, now: number) {
    const tail = segments[segments.length - 1];
    const prevTail = segments[segments.length - 2];
    
    // Convert to pixel coordinates
    const [tailX, tailY] = [tail.pos.x * CELL + CELL / 2, tail.pos.y * CELL + CELL / 2];
    
    // Calculate angle from movement direction
    const angle = Math.atan2(
      tail.pos.y - prevTail.pos.y,
      tail.pos.x - prevTail.pos.x
    ) * 180 / Math.PI;
    
    // tail wiggle
    const wiggle = Math.sin(now / 500) * 50;
    
    this.gSnake.append("ellipse")
      .attr("cx", tailX)
      .attr("cy", tailY)
      .attr("rx", CELL * 0.12)
      .attr("ry", CELL * 0.3)
      .attr("fill", color)
      .attr("transform", `rotate(${angle + wiggle} ${tailX} ${tailY})`);
  }

  static setupGradients(svg: d3.Selection<SVGSVGElement, unknown, any, any>, skin: SnakeSkin) {
    let defs = svg.select<SVGDefsElement>("defs");
    if (defs.empty()) defs = svg.append<SVGDefsElement>("defs");
    defs.selectAll("linearGradient").remove();
    const grad = defs.append("linearGradient")
      .attr("id", "snake-body-gradient")
      .attr("x1", "0%").attr("y1", "0%").attr("x2", "0%").attr("y2", "100%");
    const head = d3.color(skin.head), body = d3.color(skin.body);
    if (head && body) {
      const lightHead = head.brighter(0.1), darkBody = body.darker(0.2);
      [{offset:"0%",color:lightHead.toString()},{offset:"40%",color:skin.head},{offset:"100%",color:darkBody.toString()}]
        .forEach(s => grad.append("stop").attr("offset", s.offset).attr("stop-color", s.color));
    }
  }
}
