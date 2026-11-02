import Phaser from 'phaser';
import type { Madds } from './Madds';
import { synth } from '../audio/Synth';
import { createMoveState, stepMovement, BEKAS_PARAMS, type MoveState } from '../systems/movement';
import type { ActionState } from '../input/actions';

const FOLLOW_GAP = 28;
const RUN_SPEED = 170;
const JUMP_SPEED = 320;
const TELEPORT_DIST = 480;
/** Downward speed while grounded and controlled, so Arcade keeps reporting the floor (as for Madds). */
const FLOOR_STICK = 60;
const DIG_MS = 300;

/** Bekas: follows Madds everywhere, never takes damage, and plays the affection routine when Madds rests. */
export class Bekas extends Phaser.Physics.Arcade.Sprite {
  private affection: Phaser.Time.TimerEvent[] = [];
  private affectionObjects: Phaser.GameObjects.GameObject[] = [];
  inAffection = false;
  /** The player is driving her (Bekas sections). */
  controlled = false;
  /** Left somewhere by the player (e.g. on a pressure plate): stays put until Madds walks away. */
  parked = false;
  private move: MoveState = createMoveState();
  private digUntil = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, private readonly madds: Madds, private readonly mapHeight: number) {
    super(scene, x, y, 'bekas', 0);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setOrigin(0.5, 1).setDepth(9);
    (this.body as Phaser.Physics.Arcade.Body).setSize(16, 11).setOffset(2, 3).setMaxVelocity(1000, 600);
    this.play('bekas-idle');
  }

  get arcadeBody(): Phaser.Physics.Arcade.Body {
    return this.body as Phaser.Physics.Arcade.Body;
  }

  get onFloor(): boolean {
    return this.arcadeBody.blocked.down || this.arcadeBody.touching.down;
  }

  get facing(): 1 | -1 {
    return this.flipX ? -1 : 1;
  }

  /** Hands control to the player (true) or back to the follow AI (false). */
  setControlled(on: boolean): void {
    this.controlled = on;
    this.parked = !on;
    this.move = { ...createMoveState(), facing: this.facing };
    this.arcadeBody.setAllowGravity(!on).setVelocity(0, 0);
  }

  /** Player-driven movement with Bekas' own jump (260 px/s, no wall jump). */
  drive(dtMs: number, input: ActionState): void {
    const body = this.arcadeBody;
    const busy = this.scene.time.now < this.digUntil;
    const grounded = this.onFloor;
    this.move = stepMovement(
      this.move,
      { left: !busy && input.isDown('left'), right: !busy && input.isDown('right'), jumpPressed: !busy && input.justPressed('jump'), jumpHeld: input.isDown('jump') },
      { onFloor: grounded, wallLeft: body.blocked.left, wallRight: body.blocked.right },
      dtMs,
      BEKAS_PARAMS,
    );
    body.setVelocity(this.move.vx, grounded && this.move.vy === 0 ? FLOOR_STICK : this.move.vy);
    this.setFlipX(this.move.facing < 0);
    if (busy) return;
    if (!grounded) this.play('bekas-jump', true);
    else if (Math.abs(this.move.vx) > 10) this.play('bekas-run', true);
    else this.play('bekas-idle', true);
  }

  /** Digs the soft-dirt tile in front of her (or under her paws). Returns true if one was dug. */
  dig(isSoft: (tx: number, ty: number) => boolean, removeTile: (tx: number, ty: number) => void): boolean {
    if (this.scene.time.now < this.digUntil) return false;
    const front = { tx: Math.floor((this.x + this.facing * 12) / 16), ty: Math.floor((this.y - 6) / 16) };
    const below = { tx: Math.floor(this.x / 16), ty: Math.floor((this.y + 2) / 16) };
    const target = [front, below].find((t) => isSoft(t.tx, t.ty));
    this.digUntil = this.scene.time.now + DIG_MS;
    this.arcadeBody.setVelocityX(0);
    this.move = { ...this.move, vx: 0 };
    this.play('bekas-dig', true);
    if (!target) return false;
    removeTile(target.tx, target.ty);
    synth.playSfx('dig');
    return true;
  }

  /** Nose to the ground over a scent trail. */
  sniff(): void {
    this.digUntil = this.scene.time.now + 600;
    this.play('bekas-sniff', true);
    synth.playSfx('sniff');
  }

  follow(): void {
    if (this.inAffection || this.controlled) return;
    const m = this.madds;
    const body = this.arcadeBody;
    if (Phaser.Math.Distance.Between(this.x, this.y, m.x, m.y) > TELEPORT_DIST || this.y > this.mapHeight + 32) {
      this.poof();
      return;
    }
    if (this.parked) {
      this.arcadeBody.setVelocityX(0);
      this.play('bekas-sit', true);
      return;
    }
    const targetX = m.x - m.facing * FOLLOW_GAP;
    const dx = targetX - this.x;
    const grounded = body.blocked.down || body.touching.down;
    const maddsMoving = Math.abs(m.move.vx) > 10 || !m.onFloor;

    if (Math.abs(dx) > 6) {
      const speed = Math.min(RUN_SPEED, Math.abs(dx) * 5);
      body.setVelocityX(Math.sign(dx) * speed);
      this.setFlipX(dx < 0);
      const stuck = (dx < 0 && body.blocked.left) || (dx > 0 && body.blocked.right);
      const maddsAbove = m.y < this.y - 20 && Math.abs(m.x - this.x) < 64;
      if (grounded && (stuck || maddsAbove)) body.setVelocityY(-JUMP_SPEED);
    } else {
      body.setVelocityX(0);
      this.setFlipX(m.x < this.x);
    }

    if (!grounded) this.play('bekas-jump', true);
    else if (Math.abs(body.velocity.x) > 10) this.play('bekas-run', true);
    else if (!maddsMoving) this.play('bekas-sit', true);
    else this.play('bekas-idle', true);
  }

  /** Reappears next to Madds in a puff of sparkles. */
  poof(): void {
    const m = this.madds;
    this.parked = false;
    this.move = { ...createMoveState(), facing: this.move.facing };
    this.arcadeBody.reset(m.x - m.facing * 20, m.y - 2);
    for (let i = 0; i < 6; i++) {
      const p = this.scene.add.image(this.x, this.y - 6, 'particle', 0).setDepth(12);
      this.scene.tweens.add({ targets: p, x: this.x + Phaser.Math.Between(-14, 14), y: this.y - Phaser.Math.Between(4, 20), alpha: 0, duration: 400, onComplete: () => p.destroy() });
    }
  }

  /** Sit → paw → cookie → eat → hug → wag, looping until stopAffection(). */
  startAffection(): void {
    if (this.inAffection) return;
    this.inAffection = true;
    const m = this.madds;
    m.busy = true;
    this.arcadeBody.setVelocityX(0);
    const front = m.x + m.facing * 16;
    this.scene.tweens.add({ targets: this, x: front, duration: 300 });
    this.setFlipX(m.facing > 0);
    m.play('madds-idle', true);
    this.play('bekas-sit', true);

    const at = (ms: number, fn: () => void) => this.affection.push(this.scene.time.delayedCall(ms, fn));
    const cycle = (t0: number) => {
      at(t0, () => {
        this.play('bekas-paw', true);
        synth.playSfx('bark');
      });
      at(t0 + 1200, () => {
        m.play('madds-cookie', true);
        const cookie = this.scene.add.image(m.x + m.facing * 7, m.y - 9, 'cookie').setDepth(13);
        this.affectionObjects.push(cookie);
        this.scene.tweens.add({ targets: cookie, x: this.x + m.facing * 4, y: this.y - 8, duration: 400, delay: 300, onComplete: () => cookie.destroy() });
      });
      at(t0 + 2000, () => this.play('bekas-eat', true));
      at(t0 + 3200, () => {
        m.play('madds-hug', true);
        this.play('bekas-wag', true);
        for (let i = 0; i < 3; i++) {
          const h = this.scene.add.image(m.x + m.facing * 8, m.y - 22, 'heart-particle').setDepth(13).setAlpha(0);
          this.affectionObjects.push(h);
          this.scene.tweens.add({ targets: h, y: h.y - 22, x: h.x + (i - 1) * 8, alpha: { from: 1, to: 0 }, delay: i * 350, duration: 1100, onComplete: () => h.destroy() });
        }
      });
      at(t0 + 5200, () => m.play('madds-idle', true));
      at(t0 + 7200, () => cycle(0));
    };
    cycle(800);
  }

  stopAffection(): void {
    if (!this.inAffection) return;
    this.inAffection = false;
    this.affection.forEach((e) => e.remove(false));
    this.affection = [];
    this.affectionObjects.forEach((o) => o.active && o.destroy());
    this.affectionObjects = [];
    this.scene.tweens.killTweensOf(this);
    this.madds.busy = false;
  }
}
