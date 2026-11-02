import Phaser from 'phaser';

export interface Enemy extends Phaser.Physics.Arcade.Sprite {
  alive: boolean;
  defeat(): void;
}

/** Plays the death animation, pops the enemy up and fades it out. */
function knockOut(e: Phaser.Physics.Arcade.Sprite, deadAnim: string): void {
  const body = e.body as Phaser.Physics.Arcade.Body;
  body.setEnable(false);
  e.play(deadAnim);
  e.scene.tweens.add({ targets: e, y: e.y - 10, alpha: 0, duration: 600, ease: 'Quad.easeOut', onComplete: () => e.destroy() });
}

export type WalkerSkin = 'beetle' | 'minifig';
export type FlyerSkin = 'bird' | 'heli';

/** Clockwork beetle (World 1) or block figure (World 2): walks and turns around at walls and ledges. */
export class Beetle extends Phaser.Physics.Arcade.Sprite implements Enemy {
  alive = true;
  private dir: 1 | -1 = -1;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    private readonly isGround: (x: number, y: number) => boolean,
    private readonly speed = 40,
    private readonly skin: WalkerSkin = 'beetle',
  ) {
    super(scene, x, y, skin, 0);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setOrigin(0.5, 1).setDepth(8);
    (this.body as Phaser.Physics.Arcade.Body).setSize(14, 9).setOffset(1, 3);
    this.play(`${skin}-walk`);
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);
    if (!this.alive) return;
    const body = this.body as Phaser.Physics.Arcade.Body;
    const ahead = this.x + this.dir * 8;
    if ((this.dir < 0 && body.blocked.left) || (this.dir > 0 && body.blocked.right) || (body.blocked.down && !this.isGround(ahead, this.y + 4))) {
      this.dir = this.dir === 1 ? -1 : 1;
    }
    body.setVelocityX(this.dir * this.speed);
    this.setFlipX(this.dir < 0);
  }

  defeat(): void {
    if (!this.alive) return;
    this.alive = false;
    knockOut(this, `${this.skin}-dead`);
  }
}

/** Drone bird (World 1) or block helicopter (World 2): hovers back and forth on a sine path. props.range = half-width in tiles. */
export class Bird extends Phaser.Physics.Arcade.Sprite implements Enemy {
  alive = true;
  private t = Math.random() * Math.PI * 2;

  constructor(scene: Phaser.Scene, private readonly x0: number, private readonly y0: number, private readonly rangePx: number, private readonly skin: FlyerSkin = 'bird') {
    super(scene, x0, y0, skin, 0);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(8);
    (this.body as Phaser.Physics.Arcade.Body).setAllowGravity(false).setSize(12, 8).setOffset(2, 2);
    this.play(`${skin}-fly`);
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);
    if (!this.alive) return;
    this.t += delta / 1000;
    const vx = Math.cos(this.t * 0.9);
    this.setPosition(this.x0 + Math.sin(this.t * 0.9) * this.rangePx, this.y0 + Math.sin(this.t * 2.4) * 6);
    this.setFlipX(vx < 0);
  }

  defeat(): void {
    if (!this.alive) return;
    this.alive = false;
    knockOut(this, `${this.skin}-dead`);
  }
}
