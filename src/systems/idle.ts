export class IdleTimer {
  static readonly LONG_MS = 5000;
  private ms = 0;

  update(dtMs: number, anyInput: boolean): void {
    this.ms = anyInput ? 0 : this.ms + dtMs;
  }

  get idleMs(): number {
    return this.ms;
  }

  get isLongIdle(): boolean {
    return this.ms >= IdleTimer.LONG_MS;
  }
}
