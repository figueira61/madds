import Phaser from 'phaser';
import { TILE } from '../config';
import { pressPhase, PRESS_PERIOD_MS, type PressPhase } from '../systems/press';
import { synth } from '../audio/Synth';

/** Crate of bricks: a kick with the ball builds its ghost bricks into a solid staircase or bridge. */
export class BrickBox extends Phaser.Physics.Arcade.Sprite {
  opened = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'brick-box', 0);
    scene.add.existing(this);
    scene.physics.add.existing(this, true);
    this.setOrigin(0.5, 1).setDepth(5);
    (this.body as Phaser.Physics.Arcade.StaticBody).updateFromGameObject();
  }

  /** Returns false if it was already open. */
  open(): boolean {
    if (this.opened) return false;
    this.opened = true;
    this.setFrame(1);
    synth.playSfx('build');
    return true;
  }
}

/** Pressure plate: pressed while anyone stands on it. */
export class Plate extends Phaser.GameObjects.Image {
  pressed = false;

  constructor(scene: Phaser.Scene, x: number, y: number, readonly linkId: string) {
    super(scene, x, y, 'plate', 0);
    scene.add.existing(this);
    this.setOrigin(0.5, 1).setDepth(4);
  }

  /** The area a foot has to be in to press it. */
  get zone(): Phaser.Geom.Rectangle {
    return new Phaser.Geom.Rectangle(this.x - 7, this.y - 8, 14, 9);
  }

  setPressed(on: boolean): void {
    if (on === this.pressed) return;
    this.pressed = on;
    this.setFrame(on ? 1 : 0);
    synth.playSfx('select');
  }
}

/** Door h tiles tall, standing on (x, y): slides up out of the way while its plate/switch is on. */
export class Door extends Phaser.GameObjects.TileSprite {
  isOpen = false;
  private readonly closedY: number;

  constructor(scene: Phaser.Scene, x: number, y: number, readonly linkId: string, private readonly tilesHigh: number) {
    super(scene, x, y, TILE, tilesHigh * TILE, 'door');
    scene.add.existing(this);
    scene.physics.add.existing(this, true);
    this.setOrigin(0.5, 1).setDepth(-1);
    (this.body as Phaser.Physics.Arcade.StaticBody).updateFromGameObject();
    this.closedY = y;
  }

  get box(): { x: number; y: number; w: number; h: number } {
    return { x: this.x - TILE / 2, y: this.closedY - this.tilesHigh * TILE, w: TILE, h: this.tilesHigh * TILE };
  }

  setOpen(open: boolean): void {
    if (open === this.isOpen) return;
    this.isOpen = open;
    synth.playSfx('door');
    const body = this.body as Phaser.Physics.Arcade.StaticBody;
    if (open) body.enable = false;
    this.scene.tweens.killTweensOf(this);
    this.scene.tweens.add({
      targets: this,
      y: open ? this.closedY - this.tilesHigh * TILE + 3 : this.closedY,
      duration: 250,
      onComplete: () => {
        if (!open) {
          body.enable = true;
          body.updateFromGameObject();
        }
      },
    });
  }
}

/** Wall switch: the ball flips it. */
export class Switch extends Phaser.Physics.Arcade.Sprite {
  /** Named `lit`: `on` is Phaser's event method. */
  lit = false;
  private readyAt = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, readonly linkId: string) {
    super(scene, x, y, 'switch', 0);
    scene.add.existing(this);
    scene.physics.add.existing(this, true);
    this.setOrigin(0.5, 1).setDepth(4);
    (this.body as Phaser.Physics.Arcade.StaticBody).updateFromGameObject();
  }

  /** Flips the lever (ignored for 400 ms after a flip so one kick counts once). Returns true if flipped. */
  flip(): boolean {
    if (this.scene.time.now < this.readyAt) return false;
    this.readyAt = this.scene.time.now + 400;
    this.lit = !this.lit;
    this.setFrame(this.lit ? 1 : 0);
    synth.playSfx('switch');
    return true;
  }
}

const PRESS_DROP = 2 * TILE;

/** Factory press hanging from (x, y): shakes, then slams 2 tiles down. Deadly only while down. */
export class Press extends Phaser.GameObjects.Container {
  phase: PressPhase = 'up';
  private readonly head: Phaser.GameObjects.Image;
  private readonly stem: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, x: number, private readonly topY: number, private readonly periodMs = PRESS_PERIOD_MS, private readonly offsetMs = 0) {
    super(scene, x, topY);
    this.stem = scene.add.rectangle(0, 0, 6, 2, 0x62646e).setOrigin(0.5, 0);
    this.head = scene.add.image(0, 2, 'press').setOrigin(0.5, 0);
    this.add([this.stem, this.head]);
    scene.add.existing(this);
    this.setDepth(6);
  }

  /** Where the head is right now, in world coordinates. */
  get hitBox(): Phaser.Geom.Rectangle {
    return new Phaser.Geom.Rectangle(this.x - 15, this.topY + this.head.y, 30, 14);
  }

  step(timeMs: number): void {
    const next = pressPhase(timeMs, this.periodMs, this.offsetMs);
    if (next === 'down' && this.phase !== 'down') {
      synth.playSfx('press');
      this.scene.cameras.main.shake(60, 0.003);
    }
    this.phase = next;
    const drop = next === 'down' ? PRESS_DROP : 0;
    this.head.y = 2 + drop;
    this.head.x = next === 'warn' ? (Math.floor(timeMs / 40) % 2 === 0 ? -1 : 1) : 0;
    this.stem.height = 2 + drop;
  }
}

/** Scent trail: sparkles rise from it until Bekas sniffs it. */
export class Scent {
  sniffed = false;
  private readonly timer: Phaser.Time.TimerEvent;

  constructor(private readonly scene: Phaser.Scene, readonly x: number, readonly y: number, readonly tileX: number, readonly tileY: number) {
    this.timer = scene.time.addEvent({ delay: 280, loop: true, callback: () => this.puff() });
  }

  private puff(): void {
    const p = this.scene.add.image(this.x + Phaser.Math.Between(-6, 6), this.y - 2, 'particle', 2).setDepth(7).setAlpha(0.8);
    this.scene.tweens.add({ targets: p, y: p.y - 14, x: p.x + Phaser.Math.Between(-4, 4), alpha: 0, duration: 900, onComplete: () => p.destroy() });
  }

  consume(): void {
    this.sniffed = true;
    this.timer.remove(false);
  }
}
