export const BOOST_MUL = 1.6;
export const BOOST_MS = 900;

/** Burst of speed from a boost pad; stepping on another pad restarts it. */
export class Boost {
  private leftMs = 0;

  trigger(): void {
    this.leftMs = BOOST_MS;
  }

  update(dtMs: number): void {
    this.leftMs = Math.max(0, this.leftMs - dtMs);
  }

  get mul(): number {
    return this.leftMs > 0 ? BOOST_MUL : 1;
  }
}
