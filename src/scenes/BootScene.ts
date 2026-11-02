import Phaser from 'phaser';
import { registerAllSheets } from '../art/registerSheets';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create(): void {
    registerAllSheets(this);
    const params = new URLSearchParams(location.search);
    this.scene.start('Level', { levelId: params.get('level') ?? 'test-room', bekasJoined: params.get('bekas') === '1' });
  }
}
