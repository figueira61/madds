import type Phaser from 'phaser';
import { LEVELS } from './levels/registry';
import { gameState } from './gameState';
import { hasBekas } from './progress';
import type { LevelSceneData } from './scenes/LevelScene';

/** Starts a level, playing its intro cutscene the first time. */
export function enterLevel(scene: Phaser.Scene, id: string): void {
  const save = gameState.save;
  const level = LEVELS[id];
  const data: LevelSceneData = { levelId: id, bekasJoined: hasBekas(save) };
  if (level?.intro && !save.completed.includes(id)) {
    scene.scene.start('Cutscene', { id: level.intro, next: { scene: 'Level', data } });
  } else {
    scene.scene.start('Level', data);
  }
}

export function formatTime(ms: number): string {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
