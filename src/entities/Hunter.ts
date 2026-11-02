import Phaser from 'phaser';
import type { Madds } from './Madds';
import { synth } from '../audio/Synth';

export const HUNTER_MAX_HP = 12;
const HIT_INVULN_MS = 600;
const NET_FLIGHT_S = 0.9;
const NET_GRAVITY = 600;

interface PhaseTuning {
  walkSpeed: number;
  throwEveryMs: number;
  nets: number;
}

const PHASES: Record<1 | 2 | 3, PhaseTuning> = {
  1: { walkSpeed: 50, throwEveryMs: 2200, nets: 1 },
  2: { walkSpeed: 80, throwEveryMs: 1800, nets: 1 },
  3: { walkSpeed: 90, throwEveryMs: 2000, nets: 3 },
};

/** Net thrown in an arc; the scene destroys it on contact with Madds or the ground. */
export class Net extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number, vx: number, vy: number) {
    super(scene, x, y, 'net', 0);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCircle(5, 1, 1).setGravityY(NET_GRAVITY - 900).setVelocity(vx, vy);
    this.setDepth(9).play('net-spin');
  }
}

/** The Hunter: three phases (walk + nets, jumps, net fans + charges). Emits 'hunter-defeated' on the scene. */
export class Hunter extends Phaser.Physics.Arcade.Sprite {
  hp = HUNTER_MAX_HP;
  defeated = false;
  private dir: 1 | -1 = -1;
  private throwMs = 1500;
  private jumpMs = 3000;
  private chargeMs = 5000;
  private chargeState: 'none' | 'warn' | 'run' = 'none';
  private chargeLeftMs = 0;
  private invulnMs = 0;
  private actionLockMs = 0;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    private readonly madds: Madds,
    private readonly minX: number,
    private readonly maxX: number,
    private readonly throwNet: (net: Net) => void,
  ) {
    super(scene, x, y, 'hunter', 0);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setOrigin(0.5, 1).setDepth(8);
    (this.body as Phaser.Physics.Arcade.Body).setSize(14, 28).setOffset(5, 4);
    this.play('hunter-idle');
  }

  get phase(): 1 | 2 | 3 {
    return this.hp > 8 ? 1 : this.hp > 4 ? 2 : 3;
  }

  get vulnerable(): boolean {
    return !this.defeated && this.invulnMs <= 0;
  }

  hit(damage: number): void {
    if (!this.vulnerable) return;
    this.hp = Math.max(0, this.hp - damage);
    this.invulnMs = HIT_INVULN_MS;
    this.actionLockMs = 300;
    this.chargeState = 'none';
    synth.playSfx('enemy');
    this.play('hunter-hurt', true);
    this.scene.cameras.main.shake(100, 0.005);
    this.emit('hunter-hit', this.hp);
    if (this.hp === 0) this.defeat();
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);
    if (this.defeated) return;
    const body = this.body as Phaser.Physics.Arcade.Body;
    const tune = PHASES[this.phase];
    this.invulnMs -= delta;
    this.actionLockMs -= delta;
    this.setAlpha(this.invulnMs > 0 && Math.floor(time / 60) % 2 === 0 ? 0.4 : 1);
    if (this.actionLockMs > 0) {
      body.setVelocityX(0);
      return;
    }

    if (this.chargeState !== 'none') {
      this.updateCharge(delta, body);
      return;
    }

    if (this.x < this.minX) this.dir = 1;
    if (this.x > this.maxX) this.dir = -1;
    body.setVelocityX(this.dir * tune.walkSpeed);
    this.setFlipX(this.madds.x < this.x);
    const grounded = body.blocked.down;
    this.play(grounded ? 'hunter-walk' : 'hunter-jump', true);

    this.throwMs -= delta;
    if (this.throwMs <= 0) {
      this.throwMs = tune.throwEveryMs;
      this.throwNets(tune.nets);
    }

    if (this.phase >= 2 && grounded) {
      this.jumpMs -= delta;
      if (this.jumpMs <= 0) {
        this.jumpMs = 2600 + Math.random() * 1200;
        body.setVelocityY(-400);
      }
    }

    if (this.phase === 3 && grounded) {
      this.chargeMs -= delta;
      if (this.chargeMs <= 0) {
        this.chargeMs = 4500 + Math.random() * 1500;
        this.chargeState = 'warn';
        this.chargeLeftMs = 400;
      }
    }
  }

  private updateCharge(delta: number, body: Phaser.Physics.Arcade.Body): void {
    this.chargeLeftMs -= delta;
    if (this.chargeState === 'warn') {
      body.setVelocityX(0);
      this.setTint(Math.floor(this.chargeLeftMs / 60) % 2 === 0 ? 0xff8080 : 0xffffff);
      if (this.chargeLeftMs <= 0) {
        this.chargeState = 'run';
        this.chargeLeftMs = 800;
        this.dir = this.madds.x < this.x ? -1 : 1;
        this.clearTint();
      }
      return;
    }
    body.setVelocityX(this.dir * 200);
    this.play('hunter-walk', true);
    if (this.chargeLeftMs <= 0 || body.blocked.left || body.blocked.right) this.chargeState = 'none';
  }

  private throwNets(count: number): void {
    this.actionLockMs = 350;
    this.play('hunter-throw', true);
    const fromX = this.x;
    const fromY = this.y - 26;
    const dx = this.madds.x - fromX;
    const dy = this.madds.y - 10 - fromY;
    const spread = count === 1 ? [0] : [-50, 0, 50];
    for (const s of spread) {
      const vx = (dx + s) / NET_FLIGHT_S;
      const vy = (dy - 0.5 * NET_GRAVITY * NET_FLIGHT_S * NET_FLIGHT_S) / NET_FLIGHT_S;
      this.throwNet(new Net(this.scene, fromX, fromY, vx, vy));
    }
  }

  private defeat(): void {
    this.defeated = true;
    (this.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
    this.setAlpha(1).clearTint();
    this.play('hunter-defeated');
    this.emit('hunter-defeated');
  }
}
