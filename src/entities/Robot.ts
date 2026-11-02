import Phaser from 'phaser';
import type { Madds } from './Madds';
import type { Boss } from './Boss';
import { Net, arcVelocity } from './Hunter';
import { synth } from '../audio/Synth';

export const ROBOT_MAX_HP = 12;
const HIT_INVULN_MS = 600;
const STOMP_WARN_MS = 500;
const WAVE_SPEED = 140;
const WAVE_LIFE_MS = 2600;

interface PhaseTuning {
  walkSpeed: number;
  throwEveryMs: number;
  bricks: number;
  /** 0 = never stomps. */
  stompEveryMs: number;
}

const PHASES: Record<1 | 2 | 3, PhaseTuning> = {
  1: { walkSpeed: 45, throwEveryMs: 2000, bricks: 1, stompEveryMs: 0 },
  2: { walkSpeed: 45, throwEveryMs: 2000, bricks: 1, stompEveryMs: 4000 },
  3: { walkSpeed: 70, throwEveryMs: 2000, bricks: 3, stompEveryMs: 3000 },
};

/** Shockwave of the stomp: slides along the floor, jump over it. */
export class Shockwave extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number, dir: 1 | -1) {
    super(scene, x, y, 'shockwave', 0);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false).setSize(14, 8).setOffset(1, 2).setVelocityX(dir * WAVE_SPEED);
    this.setOrigin(0.5, 1).setDepth(9).setFlipX(dir < 0).play('shockwave-roll');
    scene.time.delayedCall(WAVE_LIFE_MS, () => this.active && this.destroy());
  }
}

/**
 * The Block Robot: walks and throws bricks; from phase 2 it stomps, sending a shockwave each way;
 * phase 3 is faster and throws fans of 3. Every hit knocks pieces off its body.
 */
export class Robot extends Phaser.Physics.Arcade.Sprite implements Boss {
  hp = ROBOT_MAX_HP;
  readonly maxHp = ROBOT_MAX_HP;
  readonly displayName = 'Robô de Blocos';
  defeated = false;
  private dir: 1 | -1 = -1;
  private throwMs = 1500;
  private stompMs = 3000;
  private stompWarnMs = 0;
  private invulnMs = 0;
  private actionLockMs = 0;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    private readonly madds: Madds,
    private readonly minX: number,
    private readonly maxX: number,
    private readonly throwBrick: (shot: Net) => void,
    private readonly sendWave: (wave: Shockwave) => void,
  ) {
    super(scene, x, y, 'robot', 0);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setOrigin(0.5, 1).setDepth(8);
    (this.body as Phaser.Physics.Arcade.Body).setSize(24, 36).setOffset(4, 4);
    this.play('robot-walk-0');
  }

  get phase(): 1 | 2 | 3 {
    return this.hp > 8 ? 1 : this.hp > 4 ? 2 : 3;
  }

  /** 0..3: how broken it looks. */
  private get damageLook(): 0 | 1 | 2 | 3 {
    return Math.min(3, Math.floor((ROBOT_MAX_HP - this.hp) / 3)) as 0 | 1 | 2 | 3;
  }

  get vulnerable(): boolean {
    return !this.defeated && this.invulnMs <= 0;
  }

  hit(damage: number): void {
    if (!this.vulnerable) return;
    this.hp = Math.max(0, this.hp - damage);
    this.invulnMs = HIT_INVULN_MS;
    this.actionLockMs = 300;
    this.stompWarnMs = 0;
    synth.playSfx('break');
    this.scene.cameras.main.shake(100, 0.005);
    this.dropPieces(3);
    this.emit('boss-hit', this.hp);
    if (this.hp === 0) this.defeat();
  }

  /** Coloured bricks fly off the body. */
  private dropPieces(n: number): void {
    const colours = [0xff5a4a, 0xffd34a, 0x4a8cff, 0x9a9ca6];
    for (let i = 0; i < n; i++) {
      const piece = this.scene.add.rectangle(this.x + Phaser.Math.Between(-10, 10), this.y - Phaser.Math.Between(14, 34), 6, 4, Phaser.Utils.Array.GetRandom(colours)).setDepth(12);
      this.scene.tweens.add({
        targets: piece,
        x: piece.x + Phaser.Math.Between(-50, 50),
        y: this.y + 2,
        angle: Phaser.Math.Between(-360, 360),
        duration: 600,
        ease: 'Quad.easeIn',
        onComplete: () => this.scene.tweens.add({ targets: piece, alpha: 0, delay: 800, duration: 300, onComplete: () => piece.destroy() }),
      });
    }
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);
    if (this.defeated) return;
    const body = this.body as Phaser.Physics.Arcade.Body;
    const tune = PHASES[this.phase];
    this.invulnMs -= delta;
    this.actionLockMs -= delta;
    this.setAlpha(this.invulnMs > 0 && Math.floor(time / 60) % 2 === 0 ? 0.4 : 1);

    if (this.stompWarnMs > 0) {
      this.stompWarnMs -= delta;
      body.setVelocityX(0);
      this.x += Math.floor(time / 40) % 2 === 0 ? 0.5 : -0.5;
      if (this.stompWarnMs <= 0) this.stomp();
      return;
    }
    if (this.actionLockMs > 0) {
      body.setVelocityX(0);
      return;
    }

    if (this.x < this.minX) this.dir = 1;
    if (this.x > this.maxX) this.dir = -1;
    body.setVelocityX(this.dir * tune.walkSpeed);
    this.setFlipX(this.madds.x < this.x);
    this.play(`robot-walk-${this.damageLook}`, true);

    this.throwMs -= delta;
    if (this.throwMs <= 0) {
      this.throwMs = tune.throwEveryMs;
      this.throwBricks(tune.bricks);
    }
    if (tune.stompEveryMs > 0 && body.blocked.down) {
      this.stompMs -= delta;
      if (this.stompMs <= 0) {
        this.stompMs = tune.stompEveryMs;
        this.stompWarnMs = STOMP_WARN_MS;
        this.anims.stop();
        this.setFrame(this.damageLook * 3 + 2);
      }
    }
  }

  private stomp(): void {
    synth.playSfx('stomp');
    this.scene.cameras.main.shake(160, 0.008);
    this.sendWave(new Shockwave(this.scene, this.x - 14, this.y, -1));
    this.sendWave(new Shockwave(this.scene, this.x + 14, this.y, 1));
    this.actionLockMs = 400;
  }

  private throwBricks(count: number): void {
    this.actionLockMs = 300;
    const fromX = this.x;
    const fromY = this.y - 34;
    const spread = count === 1 ? [0] : [-50, 0, 50];
    for (const s of spread) {
      const { vx, vy } = arcVelocity(fromX, fromY, this.madds.x + s, this.madds.y - 10);
      this.throwBrick(new Net(this.scene, fromX, fromY, vx, vy, 'brick-shot'));
    }
  }

  private defeat(): void {
    this.defeated = true;
    (this.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
    this.setAlpha(1).clearTint();
    this.anims.stop();
    this.setFrame(9);
    this.emit('boss-defeated');
  }

  /** Falls apart into a shower of bricks; the little core runs away to the right. */
  leave(levelWidthPx: number, onDone: () => void): void {
    (this.body as Phaser.Physics.Arcade.Body).setEnable(false);
    this.dropPieces(18);
    synth.playSfx('break');
    this.setVisible(false);
    const core = this.scene.add.sprite(this.x, this.y, 'robot-core').setOrigin(0.5, 1).setDepth(8).play('robot-core-run');
    this.scene.tweens.add({ targets: core, x: levelWidthPx + 30, duration: 1400, delay: 500, onComplete: () => { core.destroy(); onDone(); } });
  }
}
