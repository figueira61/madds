import type Phaser from 'phaser';

/**
 * What the level needs from any boss. Bosses emit 'boss-hit' (hp) and 'boss-defeated' on themselves,
 * and leave() plays their exit before the level completes.
 */
export interface Boss extends Phaser.Physics.Arcade.Sprite {
  hp: number;
  readonly maxHp: number;
  readonly displayName: string;
  defeated: boolean;
  readonly vulnerable: boolean;
  hit(damage: number): void;
  leave(levelWidthPx: number, onDone: () => void): void;
}
