import Phaser from 'phaser';
import { GAME_W, GAME_H } from '../config';
import { Menu, text } from '../ui/Menu';
import { synth } from '../audio/Synth';
import { gameState } from '../gameState';
import { gameSummary } from '../progress';
import { formatTime } from '../flow';
import { DEDICATION } from '../story/personal';

/** Rolling credits: title, the dedication, the player's summary, then back to the map or the album. */
export class CreditsScene extends Phaser.Scene {
  private menu?: Menu;

  constructor() {
    super('Credits');
  }

  create(): void {
    this.menu = undefined;
    this.add.rectangle(0, 0, GAME_W, GAME_H, 0x10121c).setOrigin(0);
    const sum = gameSummary(gameState.save);
    const lines: [string, number, string][] = [
      ['MADDS', 30, '#ffd34a'],
      ['e a grande aventura', 11, '#ffffff'],
      ['', 10, '#ffffff'],
      ...DEDICATION.split('\n').map((l): [string, number, string] => [l, 11, '#ffd9a0']),
      ['', 10, '#ffffff'],
      ['— O teu jogo —', 11, '#8fb0da'],
      [`Tempo total: ${formatTime(sum.totalTimeMs)}`, 10, '#ffffff'],
      [`Quedas: ${sum.falls}`, 10, '#ffffff'],
      [`Cromos: ${sum.cromos} / ${sum.total}`, 10, '#ffffff'],
      ['', 10, '#ffffff'],
      ['— Elenco —', 11, '#8fb0da'],
      ['Madds, avançada n.º 11 da A.D.Q.C.', 10, '#ffffff'],
      ['Bekas, a melhor parceira do mundo', 10, '#ffffff'],
      ['O Caçador, o Robô de Blocos e O Colecionador', 10, '#ffffff'],
      ['', 10, '#ffffff'],
      ['Feito com muito carinho para a Madds', 11, '#ffd34a'],
      ['Obrigado por jogares!', 12, '#ffffff'],
    ];
    const roll = this.add.container(0, GAME_H + 10);
    let y = 0;
    for (const [s, size, colour] of lines) {
      roll.add(text(this, GAME_W / 2, y, s, size, colour));
      y += size + 8;
    }
    const height = y;
    // Ends centred, or with the last line just above the menu when the text is taller than the screen.
    const endY = Math.min(GAME_H / 2 - height / 2 - 20, GAME_H - 56 - height);
    synth.playMusic('reunion');
    this.tweens.add({
      targets: roll,
      y: endY,
      duration: 14000,
      ease: 'Linear',
      onComplete: () => this.showMenu(),
    });
    this.input.once('pointerdown', () => {
      this.tweens.killTweensOf(roll);
      roll.y = endY;
      this.showMenu();
    });
  }

  update(): void {
    this.menu?.update();
  }

  private showMenu(): void {
    if (this.menu) return;
    this.menu = new Menu(this, GAME_W / 2, GAME_H - 40, [
      { label: 'Ver o álbum', action: () => this.scene.start('Album') },
      { label: 'Voltar ao mapa', action: () => this.scene.start('WorldMap') },
    ], 18, 11);
  }
}
