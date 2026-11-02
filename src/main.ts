import Phaser from 'phaser';
import { GAME_W, GAME_H } from './config';
import { BootScene } from './scenes/BootScene';
import { TitleScene } from './scenes/TitleScene';
import { WorldMapScene } from './scenes/WorldMapScene';
import { CutsceneScene } from './scenes/CutsceneScene';
import { LevelScene } from './scenes/LevelScene';
import { HudScene } from './scenes/HudScene';
import { PauseScene } from './scenes/PauseScene';
import { OptionsScene } from './scenes/OptionsScene';
import { ResultsScene } from './scenes/ResultsScene';
import { ContinuaScene } from './scenes/ContinuaScene';
import { FinaleScene } from './scenes/FinaleScene';
import { CreditsScene } from './scenes/CreditsScene';
import { AlbumScene } from './scenes/AlbumScene';
import { OrientationGuard } from './robustness/OrientationGuard';

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: GAME_W,
  height: GAME_H,
  pixelArt: true,
  roundPixels: true,
  backgroundColor: '#1b2a3a',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  input: { activePointers: 4, gamepad: true },
  physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 900 }, debug: false } },
  scene: [BootScene, TitleScene, WorldMapScene, CutsceneScene, LevelScene, HudScene, PauseScene, OptionsScene, ResultsScene, ContinuaScene, FinaleScene, CreditsScene, AlbumScene],
});

new OrientationGuard(game);

if (import.meta.env.DEV) (window as unknown as { __game: Phaser.Game }).__game = game;
