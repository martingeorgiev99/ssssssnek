import { vec, eq } from "./types";
import type { Vec } from "./types";

export class Snake {
  private segments: Vec[] = [];

  constructor(start: Vec, length = 3) {
    this.segments = [start];
    for (let i = 1; i < length; i++) {
      this.segments.push(vec(start.x - i, start.y));
    }
  }

  head(): Vec {
    return this.segments[0];
  }

  body(): Vec[] {
    return this.segments;
  }

  contains(p: Vec, skipHead = false): boolean {
    return this.segments.some((s, i) => {
      return (skipHead ? i > 0 : true) && eq(s, p);
    });
  }

  move(next: Vec, grow: boolean) {
    this.segments.unshift(next);
    if (!grow) this.segments.pop();
  }

  reset(start: Vec, length = 3) {
    this.segments = [start];
    for (let i = 1; i < length; i++) {
      this.segments.push(vec(start.x - i, start.y));
    }
  }
}
