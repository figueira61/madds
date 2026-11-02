import Phaser from 'phaser';
import { GAME_W, GAME_H } from '../config';
import { text } from '../ui/Menu';
import { synth } from '../audio/Synth';
import { InputManager } from '../input/InputManager';
import { gameState } from '../gameState';

/** The ending: friends from every world gather while Madds lifts the trophy with Bekas. */
export class FinaleScene extends Phaser.Scene {
  private controls!: InputManager;
  private canLeave = false;

  constructor() {
    super('Finale');
  }

  create(): void {
    this.canLeave = false;
    const g = this.add.graphics();
    g.fillGradientStyle(0x1a1a48, 0x1a1a48, 0x4a3a7a, 0x4a3a7a, 1).fillRect(0, 0, GAME_W, GAME_H);
    g.fillStyle(0x3f8a3a, 1).fillRect(0, 200, GAME_W, 70);
    g.fillStyle(0xffffff, 0.8).fillRect(0, 200, GAME_W, 2);
    for (let i = 0; i < 40; i++) g.fillStyle(0xffffff, 0.6).fillRect((i * 97) % GAME_W, (i * 53) % 150, 1, 1);

    // Madds and Bekas in the middle; the trophy goes up over her head.
    const madds = this.add.sprite(GAME_W / 2 - 10, 200, 'madds-adqc').setOrigin(0.5, 1).setScale(2).play('madds-adqc-idle');
    const bekas = this.add.sprite(GAME_W / 2 + 26, 200, 'bekas').setOrigin(0.5, 1).setScale(2).setFlipX(true).play('bekas-celebrate');
    const trophy = this.add.image(madds.x, 200, 'trophy').setOrigin(0.5, 1).setScale(2).setAlpha(0);
    this.tweens.add({ targets: trophy, y: 140, alpha: 1, duration: 900, delay: 800, ease: 'Back.easeOut' });
    this.tweens.add({ targets: trophy, y: 134, yoyo: true, repeat: -1, duration: 500, delay: 1800 });
    this.time.delayedCall(900, () => synth.playSfx('bark'));
    void bekas;

    // Friends from every world run in from both sides.
    const friends: [string, number, string][] = [
      ['animals', 0, 'animals-rabbit-cheer'],
      ['animals', 3, 'animals-squirrel-cheer'],
      ['animals', 6, 'animals-fox-cheer'],
      ['minifig', 0, 'minifig-walk'],
      ['minifig', 0, 'minifig-walk'],
    ];
    friends.forEach(([tex, frame, anim], i) => {
      const fromLeft = i < 3;
      const s = this.add.sprite(fromLeft ? -30 : GAME_W + 30, 200, tex, frame).setOrigin(0.5, 1).setScale(1.5).setFlipX(!fromLeft);
      s.play(anim);
      const targetX = fromLeft ? 70 + i * 40 : GAME_W - 70 - (i - 3) * 40;
      this.tweens.add({ targets: s, x: targetX, duration: 1600, delay: 1200 + i * 250 });
    });

    // Fireworks.
    this.time.addEvent({ delay: 450, loop: true, callback: () => this.firework() });

    const title = text(this, GAME_W / 2, 40, 'CAMPEÃ!', 28, '#ffd34a').setStroke('#2457c9', 8).setAlpha(0);
    this.tweens.add({ targets: title, alpha: 1, duration: 800, delay: 1800 });
    const prompt = text(this, GAME_W / 2, 240, 'Carrega para continuar', 9).setAlpha(0);
    this.time.delayedCall(4500, () => {
      this.canLeave = true;
      this.tweens.add({ targets: prompt, alpha: 1, duration: 400, yoyo: true, repeat: -1 });
    });

    synth.playMusic('continua');
    this.controls = new InputManager(this, { ...gameState.save.options, touch: false });
    this.events.once('shutdown', () => this.controls.destroy());
    this.input.on('pointerdown', () => this.leave());
  }

  update(): void {
    this.controls.update();
    if (this.controls.state.justPressed('jump') || this.controls.state.justPressed('kick')) this.leave();
  }

  private leave(): void {
    if (!this.canLeave) return;
    this.canLeave = false;
    this.scene.start('Credits');
  }

  private firework(): void {
    const x = Phaser.Math.Between(40, GAME_W - 40);
    const y = Phaser.Math.Between(30, 110);
    const colours = [0xffd34a, 0xff5a4a, 0x5a8cf0, 0xffffff, 0x5ccf5c];
    const c = Phaser.Utils.Array.GetRandom(colours);
    for (let i = 0; i < 12; i++) {
      const a = (Math.PI * 2 * i) / 12;
      const p = this.add.rectangle(x, y, 2, 2, c);
      this.tweens.add({ targets: p, x: x + Math.cos(a) * 26, y: y + Math.sin(a) * 26 + 6, alpha: 0, duration: 800, onComplete: () => p.destroy() });
    }
  }
}
