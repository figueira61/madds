import Phaser from 'phaser';
import { registerAllSheets } from '../art/registerSheets';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create(): void {
    registerAllSheets(this);
    this.cameras.main.setBackgroundColor('#6a8caf');
    const anims = ['idle', 'run', 'jump', 'fall', 'wall', 'kick', 'hurt', 'photo', 'cookie', 'hug'];
    anims.forEach((a, i) => this.add.sprite(20 + i * 22, 30, 'madds').setScale(1).play(`madds-${a}`));
    ['idle', 'run', 'jump', 'wall', 'kick', 'hurt'].forEach((a, i) => this.add.sprite(20 + i * 22, 62, 'madds-adqc').play(`madds-adqc-${a}`));
    this.add.sprite(160, 62, 'transform').play('transform-play').on('animationcomplete', (_: unknown, __: unknown, s: Phaser.GameObjects.Sprite) => s.play('transform-play'));
    for (let i = 0; i < 8; i++) this.add.image(28 + i * 54, 130, 'portraits', i);
    this.add.sprite(60, 220, 'madds').setScale(3).play('madds-idle');
    this.add.sprite(130, 220, 'madds-adqc').setScale(3).play('madds-adqc-idle');
    this.add.image(200, 220, 'madds-adqc', 7).setScale(3);
  }
}
