import Phaser from 'phaser';
import { GAME_W, GAME_H } from '../config';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create(): void {
    this.add.text(GAME_W / 2, GAME_H / 2, 'Madds', { fontFamily: 'monospace', fontSize: '32px', color: '#ffffff' }).setOrigin(0.5);
  }
}
