import Phaser from 'phaser';
import { registerAllSheets } from '../art/registerSheets';
import { drawForestBackground } from '../art/background';
import { TILES_SHEET } from '../art/sprites/tiles';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create(): void {
    registerAllSheets(this);
    drawForestBackground(this, 960);
    TILES_SHEET.frames.forEach((_, i) => this.add.image(40 + i * 40, 200, 'tiles', i).setScale(2));
  }
}
