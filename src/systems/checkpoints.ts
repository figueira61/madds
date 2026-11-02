export interface Point {
  x: number;
  y: number;
}

export class Checkpoints {
  private current: Point;
  private readonly reached = new Set<string>();
  private fallCount = 0;

  constructor(start: Point) {
    this.current = { ...start };
  }

  /** Returns true only the first time a checkpoint is reached. */
  reach(id: string, at: Point): boolean {
    if (this.reached.has(id)) return false;
    this.reached.add(id);
    this.current = { ...at };
    return true;
  }

  get respawn(): Point {
    return { ...this.current };
  }

  get falls(): number {
    return this.fallCount;
  }

  recordFall(): void {
    this.fallCount += 1;
  }
}
