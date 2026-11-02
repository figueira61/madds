import Phaser from 'phaser';
import { GAME_W, GAME_H } from '../config';
import { Menu, text } from '../ui/Menu';
import { synth } from '../audio/Synth';

/** End of Phase 1: Madds and Bekas walk together into the sunset. */
export class ContinuaScene extends Phaser.Scene {
  private menu?: Menu;

  constructor() {
    super('Continua');
  }

  create(): void {
    this.menu = undefined;
    const g = this.add.graphics();
    g.fillGradientStyle(0xff9a5a, 0xff9a5a, 0x6a3a7a, 0x6a3a7a, 1).fillRect(0, 0, GAME_W, GAME_H);
    g.fillStyle(0xffd34a, 1).fillCircle(GAME_W / 2, 170, 46);
    g.fillStyle(0x2c3a2a, 1).fillRect(0, 190, GAME_W, 80);
    for (let x = 0; x < GAME_W; x += 60) g.fillStyle(0x1f2a1e, 1).fillTriangle(x, 190, x + 30, 120 + ((x * 7) % 40), x + 60, 190);

    const madds = this.add.sprite(-30, 190, 'madds').setOrigin(0.5, 1).setScale(2).play('madds-run');
    const bekas = this.add.sprite(-70, 190, 'bekas').setOrigin(0.5, 1).setScale(2).play('bekas-run');
    this.tweens.add({ targets: [madds, bekas], x: '+=300', duration: 4500, ease: 'Linear', onComplete: () => {
      madds.play('madds-hug');
      bekas.play('bekas-wag');
    } });

    const title = text(this, GAME_W / 2, 40, 'Continua…', 28, '#ffffff').setAlpha(0);
    const sub = text(this, GAME_W / 2, 72, 'A aventura continua no Mundo 2: Cidade de Blocos', 10, '#ffffff').setAlpha(0);
    this.tweens.add({ targets: [title, sub], alpha: 1, delay: 1200, duration: 1200 });
    synth.playMusic('continua');
    this.time.delayedCall(2500, () => {
      this.menu = new Menu(this, GAME_W / 2, 240, [{ label: 'Voltar ao mapa', action: () => this.scene.start('WorldMap') }], 20, 12);
    });
  }

  update(): void {
    this.menu?.update();
  }
}
