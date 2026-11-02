/** A small character canvas for composing sprites from shapes. */
export class Grid {
  private readonly px: string[][];

  constructor(readonly w: number, readonly h: number) {
    this.px = Array.from({ length: h }, () => Array.from({ length: w }, () => '.'));
  }

  set(x: number, y: number, ch: string): this {
    if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.px[y][x] = ch;
    return this;
  }

  rect(x: number, y: number, w: number, h: number, ch: string): this {
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) this.set(i, j, ch);
    return this;
  }

  ellipse(cx: number, cy: number, rx: number, ry: number, ch: string): this {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const dx = (x - cx) / rx;
        const dy = (y - cy) / ry;
        if (dx * dx + dy * dy <= 1) this.set(x, y, ch);
      }
    }
    return this;
  }

  paste(rows: string[], x: number, y: number): this {
    rows.forEach((row, j) => [...row].forEach((ch, i) => ch !== '.' && this.set(x + i, y + j, ch)));
    return this;
  }

  rows(): string[] {
    return this.px.map((r) => r.join(''));
  }
}
