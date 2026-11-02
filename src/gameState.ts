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
    scene.time.delayedCall(600, () => scene.scene.start('Results', { result, power }));
  }
}

export const gameState = new GameState();
