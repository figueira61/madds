import Phaser from 'phaser';
import { GAME_W } from '../config';
import { synth } from '../audio/Synth';

const CAR_TINTS = [0x4a8cff, 0xff5a4a, 0x5ccf5c, 0xffd34a, 0xc08aff];
const WARN_MS = 600;

/** A race car crossing the screen right to left. It can't be beaten: jump over it. */
export class Car extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, groundY: number, speed: number, tintIndex: number) {
    super(scene, x, groundY, 'car', 0);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setOrigin(0.5, 1).setDepth(9).setTint(CAR_TINTS[tintIndex % CAR_TINTS.length]).play('car-drive');
    (this.body as Phaser.Physics.Arcade.Body).setAllowGravity(false).setSize(28, 10).setOffset(2, 5).setVelocityX(-speed);
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);
    if (this.x < this.scene.cameras.main.scrollX - 64) this.destroy();
  }
}

/**
 * One 'car' object: while Madds is within ~25 tiles before it, a car comes every `every` ms,
 * announced by a "!" sign at the right edge of the screen 600 ms before.
 */
export class CarLane {
  private nextMs: number;
  private count = 0;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly x: number,
    private readonly groundY: number,
    private readonly everyMs: number,
    private readonly speed: number,
    delayMs: number,
    private readonly spawn: (car: Car) => void,
  ) {
    this.nextMs = delayMs;
  }

  update(dtMs: number, maddsX: number): void {
    const active = maddsX > this.x - 400 && maddsX < this.x;
    if (!active) return;
    this.nextMs -= dtMs;
    if (this.nextMs > 0) return;
    this.nextMs = this.everyMs;
    const cam = this.scene.cameras.main;
    const fromX = Math.min(this.x, cam.scrollX + GAME_W + 40);
    const sign = this.scene.add.image(cam.scrollX + GAME_W - 12, this.groundY - 20, 'car-warn').setDepth(20);
    this.scene.tweens.add({ targets: sign, alpha: 0.2, yoyo: true, repeat: 2, duration: WARN_MS / 6 });
    synth.playSfx('select');
    this.scene.time.delayedCall(WARN_MS, () => {
      sign.destroy();
      this.spawn(new Car(this.scene, fromX, this.groundY, this.speed, this.count++));
    });
  }
}
