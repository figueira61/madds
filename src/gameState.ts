import type Phaser from 'phaser';
import { SaveStore, browserStorage, type SaveData } from './systems/saveStore';
import type { LevelResult } from './scenes/LevelScene';

/** The single save shared by every scene. */
class GameState {
  readonly store = new SaveStore(browserStorage());
  save: SaveData = this.store.load();

  persist(): void {
    this.store.save(this.save);
  }

  onLevelComplete(scene: Phaser.Scene, result: LevelResult, power: number): void {
    console.info('level-complete', result, power);
    scene.time.delayedCall(800, () => scene.scene.restart());
  }
}

export const gameState = new GameState();
