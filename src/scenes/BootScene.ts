import Phaser from 'phaser';
import { registerAllSheets } from '../art/registerSheets';
import { synth } from '../audio/Synth';
import { gameState } from '../gameState';
import { hasBekas } from '../progress';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create(): void {
    registerAllSheets(this);
    const o = gameState.save.options;
    synth.setVolumes(o.music, o.sfx);
    // ?level=<id> jumps straight into a level (testing); ?bekas=1 forces Bekas to join.
    const params = new URLSearchParams(location.search);
    const level = params.get('level');
    if (level) {
      synth.unlock();
      this.scene.start('Level', { levelId: level, bekasJoined: params.get('bekas') === '1' || hasBekas(gameState.save) });
    } else {
      this.scene.start('Title');
    }
  }
}
