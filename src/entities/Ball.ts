import Phaser from 'phaser';
import type { Madds } from './Madds';
import { synth } from '../audio/Synth';

const KICK_SPEED = 260;
const POWER_KICK_SPEED = 360;
const KICK_LIFT = 20;
const MAX_BOUNCES = 3;
const FLIGHT_MS = 2500;
const RETURN_SPEED = 420;
const CATCH_AFTER_MS = 200;

type BallState = 'held' | 'flight' | 'return';

/** Madds' football: one at a time, bounces off walls up to 3 times, then flies back to her. */
export class Ball extends Phaser.Physics.Arcade.Sprite {
  /** Enemies defeated during the current flight (0 for the first). */
  chainIndex = 0;
  powered = false;
  private mode: BallState = 'held';
  private flightMs = 0;
  private bounces = 0;

  constructor(scene: Phaser.Scene, private readonly owner: Madds) {
    super(scene, owner.x, owner.y, 'ball', 0);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    const body = this.arcadeBody;
    body.setCircle(4).setBounce(1, 0.6).setGravityY(-600).setMaxVelocity(500, 500);
    this.setDepth(11).setVisible(false);
    body.setEnable(false);
  }

  get arcadeBody(): Phaser.Physics.Arcade.Body {
    return this.body as Phaser.Physics.Arcade.Body;
  }

  get inFlight(): boolean {
    return this.mode === 'flight';
  }

  get available(): boolean {
    return this.mode === 'held';
  }

  kick(from: Madds, powered: boolean): boolean {
    if (this.mode !== 'held') return false;
    this.mode = 'flight';
    this.powered = powered;
    this.chainIndex = 0;
    this.flightMs = 0;
    this.bounces = 0;
    const body = this.arcadeBody;
    body.setEnable(true);
    body.reset(from.x + from.facing * 9, from.y - 8);
    body.setVelocity(from.facing * (powered ? POWER_KICK_SPEED : KICK_SPEED), from.onFloor ? -KICK_LIFT : 0);
    body.setAllowGravity(true);
    this.setVisible(true).setTint(powered ? 0x9fc4ff : 0xffffff);
    this.play('ball-spin', true);
    synth.playSfx('kick');
    return true;
  }

  recall(): void {
    if (this.mode !== 'flight') return;
    this.mode = 'return';
    this.arcadeBody.setAllowGravity(false);
  }

  /** Knocks through an enemy losing some speed, so one kick can chain enemies lined up (max 3 hits before it returns). */
  ricochet(): void {
    if (this.mode !== 'flight') return;
    const body = this.arcadeBody;
    body.setVelocity(body.velocity.x * 0.8, body.velocity.y);
    this.bounces += 1;
    synth.playSfx('bounce');
    if (this.bounces > MAX_BOUNCES) this.recall();
  }

  /** Called by the scene when the ball hits a wall or the floor. */
  onBounce(): void {
    if (this.mode !== 'flight') return;
    if (this.arcadeBody.blocked.left || this.arcadeBody.blocked.right) {
      this.bounces += 1;
      synth.playSfx('bounce');
      if (this.bounces > MAX_BOUNCES) this.recall();
    }
  }

  update(dtMs: number): void {
    if (this.mode === 'held') return;
    const body = this.arcadeBody;
    if (this.mode === 'flight') {
      this.flightMs += dtMs;
      if (this.flightMs >= FLIGHT_MS) this.recall();
      else if (this.flightMs > CATCH_AFTER_MS && this.closeToOwner(12)) this.catch();
      return;
    }
    const dx = this.owner.x - this.x;
    const dy = this.owner.y - 12 - this.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 12) {
      this.catch();
      return;
    }
    body.setVelocity((dx / dist) * RETURN_SPEED, (dy / dist) * RETURN_SPEED);
  }

  /** While returning the ball passes through walls. */
  get collidesWithWorld(): boolean {
    return this.mode === 'flight';
  }

  private closeToOwner(r: number): boolean {
    return Phaser.Math.Distance.Between(this.x, this.y, this.owner.x, this.owner.y - 12) < r;
  }

  private catch(): void {
    this.mode = 'held';
    this.arcadeBody.setVelocity(0, 0).setEnable(false);
    this.setVisible(false);
  }
}
