import Phaser from 'phaser';
import { createMoveState, stepMovement, MADDS_PARAMS, type Contact, type MoveState } from '../systems/movement';
import type { ActionState } from '../input/actions';
import { synth } from '../audio/Synth';

/** Downward speed sent to the physics body while grounded, so Arcade keeps reporting the floor contact. */
const FLOOR_STICK = 60;

export type WallProbe = (side: -1 | 1) => boolean;

export class Madds extends Phaser.Physics.Arcade.Sprite {
  move: MoveState = createMoveState();
  adqc = false;
  /** Set by the scene while a non-movement animation (photo, cookie, hug, transform) is playing. */
  busy = false;
  private kickAnimUntil = 0;
  private hurtAnimUntil = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, private readonly wallProbe: WallProbe) {
    super(scene, x, y, 'madds', 0);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setOrigin(0.5, 1);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setSize(10, 20).setOffset(3, 4);
    this.setDepth(10);
  }

  get facing(): 1 | -1 {
    return this.move.facing;
  }

  get arcadeBody(): Phaser.Physics.Arcade.Body {
    return this.body as Phaser.Physics.Arcade.Body;
  }

  get onFloor(): boolean {
    return this.arcadeBody.blocked.down || this.arcadeBody.touching.down;
  }

  setAdqc(on: boolean): void {
    this.adqc = on;
  }

  playKick(): void {
    this.kickAnimUntil = this.scene.time.now + 180;
  }

  playHurt(): void {
    this.hurtAnimUntil = this.scene.time.now + 300;
  }

  resetMotion(): void {
    this.move = { ...createMoveState(), facing: this.move.facing };
    this.arcadeBody.setVelocity(0, 0);
  }

  update(dtMs: number, input: ActionState, speedMul: number): void {
    const body = this.arcadeBody;
    const contact: Contact = {
      onFloor: this.onFloor,
      wallLeft: body.blocked.left || this.wallProbe(-1),
      wallRight: body.blocked.right || this.wallProbe(1),
    };
    const wasGrounded = contact.onFloor;
    const prevVy = this.move.vy;
    this.move = stepMovement(
      this.move,
      {
        left: !this.busy && input.isDown('left'),
        right: !this.busy && input.isDown('right'),
        jumpPressed: !this.busy && input.justPressed('jump'),
        jumpHeld: input.isDown('jump'),
      },
      contact,
      dtMs,
      MADDS_PARAMS,
      speedMul,
    );
    if (this.move.vy < 0 && prevVy >= 0 && this.move.vy !== prevVy) synth.playSfx('jump');
    body.setVelocity(this.move.vx, wasGrounded && this.move.vy === 0 ? FLOOR_STICK : this.move.vy);
    this.setFlipX(this.move.facing < 0);
    if (!this.busy) this.animate(contact);
  }

  private animate(c: Contact): void {
    const key = this.adqc ? 'madds-adqc' : 'madds';
    const now = this.scene.time.now;
    let anim: string;
    if (now < this.hurtAnimUntil) anim = 'hurt';
    else if (now < this.kickAnimUntil) anim = 'kick';
    else if (this.move.wallSliding) anim = 'wall';
    else if (!c.onFloor) anim = this.move.vy < 0 ? 'jump' : 'fall';
    else if (Math.abs(this.move.vx) > 10) anim = 'run';
    else anim = 'idle';
    this.play(`${key}-${anim}`, true);
    // The wall frame shows her back; flip so she faces away from the wall.
    if (anim === 'wall') this.setFlipX(false);
  }
}
