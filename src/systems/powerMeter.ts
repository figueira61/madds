export const POWER = {
  enemy: 15,
  chainBonus: 5,
  animal: 10,
  goldenBall: 20,
  damage: 30,
  durationMs: 12000,
  speedMul: 1.3,
  bossDamageMul: 2,
} as const;

/** A.D.Q.C. power bar: fills by merit, drops on damage, never drains with time. */
export class PowerMeter {
  private charge: number;
  private remainingMs = 0;

  constructor(initial = 0) {
    this.charge = clamp(initial);
  }

  get active(): boolean {
    return this.remainingMs > 0;
  }

  /** 0–100. While the super is active it is the remaining time as a percentage. */
  get value(): number {
    return this.active ? (this.remainingMs / POWER.durationMs) * 100 : this.charge;
  }

  enemyDefeated(chainIndex: number): void {
    this.add(POWER.enemy + (chainIndex > 0 ? POWER.chainBonus : 0));
  }

  animalFreed(): void {
    this.add(POWER.animal);
  }

  goldenBall(): void {
    this.add(POWER.goldenBall);
  }

  damaged(): void {
    this.add(-POWER.damage);
  }

  canActivate(): boolean {
    return !this.active && this.charge === 100;
  }

  activate(): boolean {
    if (!this.canActivate()) return false;
    this.remainingMs = POWER.durationMs;
    this.charge = 0;
    return true;
  }

  update(dtMs: number): void {
    if (this.active) this.remainingMs = Math.max(0, this.remainingMs - dtMs);
  }

  onDeath(): void {
    if (this.active) this.remainingMs = 0;
  }

  private add(amount: number): void {
    if (!this.active) this.charge = clamp(this.charge + amount);
  }
}

function clamp(v: number): number {
  return Math.max(0, Math.min(100, v));
}
