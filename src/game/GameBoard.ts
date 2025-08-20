import { vec } from "./types";
import type { Vec } from "./types";
import { COLS, ROWS, CELL } from "./constants";

export class GameBoard {
  readonly cols = COLS;
  readonly rows = ROWS;
  readonly cell = CELL;

  isInside(p: Vec) {
    return p.x >= 0 && p.y >= 0 && p.x < this.cols && p.y < this.rows;
  }

  center(): Vec {
    return vec((this.cols / 2) | 0, (this.rows / 2) | 0);
  }

  widthPx() {
    return this.cols * this.cell;
  }
  heightPx() {
    return this.rows * this.cell;
  }
}
