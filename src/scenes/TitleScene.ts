import Phaser from 'phaser';
import { GAME_W, GAME_H } from '../config';
import { drawForestBackground } from '../art/background';
import { Menu, text } from '../ui/Menu';
import { synth } from '../audio/Synth';
import { gameState } from '../gameState';
import { hasBekas, hasProgress } from '../progress';
import { defaultSave } from '../systems/saveStore';
import { enterLevel } from '../flow';

export class TitleScene extends Phaser.Scene {
  private menu: Menu | null = null;
  private prompt: Phaser.GameObjects.Text | null = null;

  constructor() {
    super('Title');
  }

  create(): void {
    this.menu = null;
    drawForestBackground(this, GAME_W);
    this.add.rectangle(0, GAME_H - 30, GAME_W, 30, 0x45913a).setOrigin(0);
    this.add.rectangle(0, GAME_H - 26, GAME_W, 26, 0x8a5a32).setOrigin(0);

    const title = text(this, GAME_W / 2, 52, 'MADDS', 46, '#ffd34a').setStroke('#2457c9', 10);
    this.tweens.add({ targets: title, y: 56, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    text(this, GAME_W / 2, 88, 'e a grande aventura', 11, '#ffffff');

    const save = gameState.save;
    this.add.sprite(GAME_W / 2 - 14, GAME_H - 30, 'madds').setOrigin(0.5, 1).setScale(2).play('madds-idle');
    if (hasBekas(save)) this.add.sprite(GAME_W / 2 + 26, GAME_H - 30, 'bekas').setOrigin(0.5, 1).setScale(2).setFlipX(true).play('bekas-wag');

    if (synth.unlocked) {
      this.showMenu();
    } else {
      this.prompt = text(this, GAME_W / 2, 150, 'Toca no ecrã ou carrega numa tecla', 11);
      this.tweens.add({ targets: this.prompt, alpha: 0.3, duration: 600, yoyo: true, repeat: -1 });
      const start = () => {
        synth.unlock();
        this.prompt?.destroy();
        this.showMenu();
      };
      this.input.once('pointerdown', start);
      this.input.keyboard?.once('keydown', start);
    }
  }

  update(): void {
    this.menu?.update();
  }

  private showMenu(): void {
    if (this.menu) return;
    synth.playMusic('title');
    const save = gameState.save;
    const progress = hasProgress(save);
    this.menu = new Menu(this, GAME_W / 2, 124, [
      { label: 'Continuar', action: () => this.scene.start('WorldMap'), enabled: progress },
      { label: 'Novo jogo', action: () => (progress ? this.confirmNewGame() : this.newGame()) },
      { label: 'Opções', action: () => this.openOptions() },
    ]);
  }

  private confirmNewGame(): void {
    this.menu?.destroy();
    const warn = text(this, GAME_W / 2, 118, 'Apagar o progresso e começar de novo?', 11, '#ffd34a');
    this.menu = new Menu(this, GAME_W / 2, 140, [
      { label: 'Não', action: () => { warn.destroy(); this.menu?.destroy(); this.menu = null; this.showMenu(); } },
      { label: 'Sim, começar de novo', action: () => this.newGame() },
    ]);
  }

  private newGame(): void {
    gameState.save = { ...defaultSave(), options: { ...gameState.save.options } };
    gameState.persist();
    enterLevel(this, '1-1');
  }

  private openOptions(): void {
    this.scene.pause();
    this.scene.launch('Options', { onClose: () => this.scene.resume() });
  }
}
