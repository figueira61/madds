import Phaser from 'phaser';
import { synth } from '../audio/Synth';

export type Species = 'rabbit' | 'squirrel' | 'fox';
const SPECIES: Species[] = ['rabbit', 'squirrel', 'fox'];

/** A cage with a trapped animal; kicking the ball at it opens the padlock. */
export class Cage extends Phaser.Physics.Arcade.Image {
  opened = false;
  private readonly animal: Phaser.GameObjects.Sprite;

  constructor(scene: Phaser.Scene, x: number, footY: number, readonly id: string, readonly species: Species) {
    super(scene, x, footY - 12, 'cage', 0);
    scene.add.existing(this);
    scene.physics.add.existing(this, true);
    this.setDepth(6);
    this.animal = scene.add.sprite(x - 2, footY - 10, 'animals').play(`animals-${species}-idle`).setDepth(5);
  }

  static speciesFor(index: number, prop?: number | string): Species {
    return SPECIES.includes(prop as Species) ? (prop as Species) : SPECIES[index % SPECIES.length];
  }

  open(): void {
    if (this.opened) return;
    this.opened = true;
    this.setFrame(1);
    synth.playSfx('animal');
    this.animal.play(`animals-${this.species}-cheer`);
    this.scene.tweens.add({
      targets: this.animal,
      x: this.animal.x + 60,
      y: this.animal.y - 6,
      alpha: 0,
      delay: 900,
      duration: 900,
      onComplete: () => this.animal.destroy(),
    });
  }
}

/** Golden Ball or cromo: bobs in place until collected. */
export class Pickup extends Phaser.Physics.Arcade.Sprite {
  taken = false;

  constructor(scene: Phaser.Scene, x: number, y: number, readonly kind: 'golden-ball' | 'cromo') {
    super(scene, x, y, kind, 0);
    scene.add.existing(this);
    scene.physics.add.existing(this, true);
    this.setDepth(7);
    this.play(`${kind}-shine`);
    scene.tweens.add({ targets: this, y: y - 3, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }

  collect(): void {
    if (this.taken) return;
    this.taken = true;
    (this.body as Phaser.Physics.Arcade.StaticBody).enable = false;
    this.scene.tweens.killTweensOf(this);
    this.scene.tweens.add({ targets: this, y: this.y - 20, alpha: 0, scale: 1.6, duration: 400, onComplete: () => this.destroy() });
  }
}

/** Floating log that glides back and forth. props: dx, dy (tiles), speed (px/s). */
export class LogPlatform extends Phaser.Physics.Arcade.Image {
  private readonly from: Phaser.Math.Vector2;
  private readonly to: Phaser.Math.Vector2;
  private t = 0;
  private dir = 1;
  prevX = 0;
  prevY = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, dxPx: number, dyPx: number, private readonly speed: number) {
    super(scene, x, y, 'log');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false).setImmovable(true);
    body.checkCollision.down = false;
    body.checkCollision.left = false;
    body.checkCollision.right = false;
    this.setDepth(4);
    this.from = new Phaser.Math.Vector2(x, y);
    this.to = new Phaser.Math.Vector2(x + dxPx, y + dyPx);
    this.prevX = x;
    this.prevY = y;
  }

  step(dtMs: number): void {
    this.prevX = this.x;
    this.prevY = this.y;
    const len = Phaser.Math.Distance.BetweenPoints(this.from, this.to);
    if (len === 0) return;
    this.t += (this.dir * this.speed * dtMs) / 1000 / len;
    if (this.t >= 1 || this.t <= 0) {
      this.t = Phaser.Math.Clamp(this.t, 0, 1);
      this.dir *= -1;
    }
    const e = Phaser.Math.Easing.Sine.InOut(this.t);
    const nx = Phaser.Math.Linear(this.from.x, this.to.x, e);
    const ny = Phaser.Math.Linear(this.from.y, this.to.y, e);
    (this.body as Phaser.Physics.Arcade.Body).reset(nx, ny);
  }
}
