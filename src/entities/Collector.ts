import Phaser from 'phaser';
import type { Madds } from './Madds';
import type { Boss } from './Boss';
import { Net, arcVelocity } from './Hunter';
import { synth } from '../audio/Synth';

export const COLLECTOR_MAX_HP = 9;
/** From this HP down he stands in goal and only goals hurt him. */
export const GOAL_PHASE_HP = 3;
const HIT_INVULN_MS = 600;
const HOVER_HEIGHT = 30;
const SWOOP_WARN_MS = 500;
const KEEPER_PERIOD_MS = 2400;

/**
 * The Collector. Phase 1 (9–7): hovers on his throne throwing trophies — jump-kick him.
 * Phase 2 (6–4): also swoops down at Madds. Phase 3 (3–1): flies into goal and keeps;
 * he patrols the goal line and saves any ball that hits him — score past him three times.
 */
export class Collector extends Phaser.Physics.Arcade.Sprite implements Boss {
  hp = COLLECTOR_MAX_HP;
  readonly maxHp = COLLECTOR_MAX_HP;
  readonly displayName = 'O Colecionador';
  defeated = false;
  /** Slower in goal while Madds is A.D.Q.C. (set by the scene each frame). */
  keeperSlow = false;
  private dir: 1 | -1 = -1;
  private throwMs = 1600;
  private swoopMs = 4000;
  private swoop: 'none' | 'warn' | 'dive' | 'rise' = 'none';
  private swoopLeftMs = 0;
  private invulnMs = 0;
  private keeperT = 0;
  private inGoal = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    private readonly groundY: number,
    private readonly madds: Madds,
    private readonly minX: number,
    private readonly maxX: number,
    /** Goal mouth in world px: he keeps on its line. */
    private readonly goal: { x: number; y: number; w: number; h: number },
    private readonly throwTrophy: (shot: Net) => void,
  ) {
    super(scene, x, groundY - HOVER_HEIGHT, 'collector', 0);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setOrigin(0.5, 1).setDepth(8);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false).setSize(20, 34).setOffset(6, 4);
    this.play('collector-hover');
  }

  get phase(): 1 | 2 | 3 {
    return this.hp > 6 ? 1 : this.hp > GOAL_PHASE_HP ? 2 : 3;
  }

  /** True once he is standing in goal: only goals count from then on. */
  get keeping(): boolean {
    return this.inGoal;
  }

  get vulnerable(): boolean {
    return !this.defeated && this.invulnMs <= 0 && !this.inGoal;
  }

  hit(damage: number): void {
    if (!this.vulnerable) return;
    this.takeHit(Math.min(damage, this.hp - GOAL_PHASE_HP > 0 ? this.hp - GOAL_PHASE_HP : damage));
  }

  /** A goal: costs him one point whatever the kick. */
  conceded(): void {
    if (this.defeated) return;
    this.takeHit(1);
  }

  private takeHit(damage: number): void {
    this.hp = Math.max(0, this.hp - damage);
    this.invulnMs = HIT_INVULN_MS;
    this.swoop = 'none';
    synth.playSfx('enemy');
    this.scene.cameras.main.shake(100, 0.005);
    if (!this.inGoal) this.setFrame(3);
    this.emit('boss-hit', this.hp);
    if (this.hp === 0) this.defeat();
    else if (this.hp <= GOAL_PHASE_HP && !this.inGoal) this.goToGoal();
  }

  private goToGoal(): void {
    this.inGoal = true;
    const body = this.body as Phaser.Physics.Arcade.Body;
    // Smaller save area in goal: leaves room for both a low and a high shot.
    body.setVelocity(0, 0).setSize(20, 28).setOffset(6, 10);
    this.emit('boss-keeper');
    this.scene.tweens.add({
      targets: this,
      x: this.goal.x + 6,
      y: this.groundY,
      duration: 900,
      ease: 'Sine.easeInOut',
      onComplete: () => this.play('collector-keeper'),
    });
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);
    if (this.defeated) return;
    const body = this.body as Phaser.Physics.Arcade.Body;
    this.invulnMs -= delta;
    this.setAlpha(this.invulnMs > 0 && Math.floor(time / 60) % 2 === 0 ? 0.4 : 1);

    if (this.inGoal) {
      if (this.scene.tweens.isTweening(this)) return;
      // Patrols the goal line up and down; slower when Madds is A.D.Q.C.
      this.keeperT += delta * (this.keeperSlow ? 0.6 : 1);
      const k = (Math.sin((this.keeperT / KEEPER_PERIOD_MS) * Math.PI * 2) + 1) / 2;
      this.y = this.groundY - k * (this.goal.h - 26);
      this.setFlipX(true);
      return;
    }

    this.setFlipX(this.madds.x < this.x);
    if (this.swoop !== 'none') {
      this.updateSwoop(delta, body);
      return;
    }
    if (this.invulnMs <= 0) this.play('collector-hover', true);
    if (this.x < this.minX) this.dir = 1;
    if (this.x > this.maxX) this.dir = -1;
    body.setVelocity(this.dir * (this.phase === 1 ? 55 : 75), 0);
    this.y += ((this.groundY - HOVER_HEIGHT + Math.sin(time / 300) * 4) - this.y) * 0.1;

    this.throwMs -= delta;
    if (this.throwMs <= 0) {
      this.throwMs = this.phase === 1 ? 1800 : 2200;
      this.throwTrophies(this.phase === 1 ? 1 : 2);
    }
    if (this.phase === 2) {
      this.swoopMs -= delta;
      if (this.swoopMs <= 0) {
        this.swoopMs = 4200;
        this.swoop = 'warn';
        this.swoopLeftMs = SWOOP_WARN_MS;
      }
    }
  }

  private updateSwoop(delta: number, body: Phaser.Physics.Arcade.Body): void {
    this.swoopLeftMs -= delta;
    if (this.swoop === 'warn') {
      body.setVelocity(0, 0);
      this.setTint(Math.floor(this.swoopLeftMs / 60) % 2 === 0 ? 0xff8080 : 0xffffff);
      if (this.swoopLeftMs <= 0) {
        this.clearTint();
        this.swoop = 'dive';
        this.swoopLeftMs = 700;
        const dx = this.madds.x - this.x;
        body.setVelocity(Phaser.Math.Clamp(dx / 0.7, -220, 220), (this.groundY - this.y) / 0.35);
      }
      return;
    }
    if (this.swoop === 'dive') {
      if (this.y >= this.groundY) {
        this.y = this.groundY;
        body.setVelocityY(0);
      }
      if (this.swoopLeftMs <= 0) {
        this.swoop = 'rise';
        this.swoopLeftMs = 500;
        body.setVelocity(0, -HOVER_HEIGHT / 0.5);
      }
      return;
    }
    if (this.swoopLeftMs <= 0) {
      this.swoop = 'none';
      body.setVelocity(0, 0);
    }
  }

  private throwTrophies(count: number): void {
    this.setFrame(2);
    const fromX = this.x;
    const fromY = this.y - 30;
    const spread = count === 1 ? [0] : [-40, 40];
    for (const s of spread) {
      const { vx, vy } = arcVelocity(fromX, fromY, this.madds.x + s, this.madds.y - 10);
      this.throwTrophy(new Net(this.scene, fromX, fromY, vx, vy, 'trophy-shot'));
    }
  }

  private defeat(): void {
    this.defeated = true;
    (this.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
    this.scene.tweens.killTweensOf(this);
    this.setAlpha(1).clearTint();
    this.anims.stop();
    this.y = this.groundY;
    this.setFrame(6);
    this.emit('boss-defeated');
  }

  /** Leaves the trophy behind and runs off to the right. */
  leave(levelWidthPx: number, onDone: () => void): void {
    (this.body as Phaser.Physics.Arcade.Body).setEnable(false);
    const trophy = this.scene.add.image(this.x - 20, this.groundY, 'trophy').setOrigin(0.5, 1).setDepth(7);
    this.scene.tweens.add({ targets: trophy, y: this.groundY - 6, yoyo: true, repeat: -1, duration: 500 });
    this.setFlipX(false).play('collector-run');
    this.scene.tweens.add({ targets: this, x: levelWidthPx + 40, duration: 1400, onComplete: onDone });
  }
}
