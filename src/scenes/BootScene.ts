import Phaser from 'phaser';
import { registerAllSheets } from '../art/registerSheets';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create(): void {
    registerAllSheets(this);
    this.cameras.main.setBackgroundColor('#6a8caf');
    const row = (y: number, items: [string, string | number][]) =>
      items.forEach(([key, a], i) => {
        const s = this.add.sprite(24 + i * 34, y, key);
        if (typeof a === 'string') s.play(`${key}-${a}`);
        else s.setFrame(a);
        s.setScale(2);
      });
    row(30, [['bekas', 'idle'], ['bekas', 'run'], ['bekas', 'sit'], ['bekas', 'paw'], ['bekas', 'eat'], ['bekas', 'wag'], ['bekas', 'bark'], ['bekas', 'jump'], ['bekas', 'dig']]);
    row(80, [['beetle', 'walk'], ['beetle', 'dead'], ['bird', 'fly'], ['bird', 'dead'], ['net', 'spin'], ['animals', 'rabbit-cheer'], ['animals', 'squirrel-cheer'], ['animals', 'fox-cheer']]);
    row(140, [['hunter', 'idle'], ['hunter', 'walk'], ['hunter', 3], ['hunter', 4], ['hunter', 'jump'], ['hunter', 'hurt'], ['hunter', 'defeated']]);
    row(210, [['ball', 'spin'], ['golden-ball', 'shine'], ['cromo', 'shine'], ['cage', 0], ['cage', 1], ['checkpoint', 0], ['checkpoint', 1], ['exit', 0], ['cookie', 0], ['photo', 0], ['heart-particle', 0], ['bekas-sign', 0], ['heart', 0], ['heart', 1]]);
    this.add.image(420, 250, 'log').setScale(1);
  }
}
