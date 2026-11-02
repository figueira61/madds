const INVULNERABLE_MS = 1000;

export class Health {
  private current: number;
  private invulnMs = 0;

  constructor(private readonly max = 3) {
    this.current = max;
  }

  get hearts(): number {
    return this.current;
  }

  get invulnerable(): boolean {
    return this.invulnMs > 0;
  }

  hit(): 'hurt' | 'dead' | 'ignored' {
    if (this.invulnerable || this.current === 0) return 'ignored';
    this.current -= 1;
    if (this.current === 0) return 'dead';
    this.invulnMs = INVULNERABLE_MS;
    return 'hurt';
  }

  update(dtMs: number): void {
    this.invulnMs = Math.max(0, this.invulnMs - dtMs);
  }

  refill(): void {
    this.current = this.max;
    this.invulnMs = 0;
  }
}
