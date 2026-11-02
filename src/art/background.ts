import Phaser from 'phaser';
import { GAME_W, GAME_H } from '../config';

/** Three parallax layers for the forest: sky gradient, distant hills, tree silhouettes. */
export function drawForestBackground(scene: Phaser.Scene, worldWidthPx: number, worldHeightPx = GAME_H): void {
  const sky = scene.add.graphics().setScrollFactor(0).setDepth(-30);
  sky.fillGradientStyle(0x7ec8f0, 0x7ec8f0, 0xd6f0e0, 0xd6f0e0, 1);
  sky.fillRect(0, 0, GAME_W, GAME_H);

  const layer = (factor: number, depth: number, draw: (g: Phaser.GameObjects.Graphics, width: number) => void) => {
    const g = scene.add.graphics().setScrollFactor(factor).setDepth(depth);
    draw(g, worldWidthPx * factor + GAME_W);
    // Vertical levels: keep layers anchored to the bottom of the view.
    g.y = Math.max(0, worldHeightPx - GAME_H) * factor;
  };

  layer(0.15, -20, (g, width) => {
    g.fillStyle(0x9fd3b4, 1);
    for (let x = -60; x < width; x += 140) g.fillEllipse(x, GAME_H - 40, 220, 150);
  });

  layer(0.35, -15, (g, width) => {
    g.fillStyle(0x5c9e6a, 1);
    for (let x = 0; x < width; x += 46) {
      const h = 90 + ((x * 37) % 50);
      g.fillTriangle(x, GAME_H - h, x - 22, GAME_H - 20, x + 22, GAME_H - 20);
      g.fillRect(x - 22, GAME_H - 20, 44, 20);
    }
  });

  layer(0.6, -10, (g, width) => {
    g.fillStyle(0x2f6b3c, 1);
    for (let x = 20; x < width; x += 90) {
      const h = 120 + ((x * 53) % 60);
      g.fillRect(x - 4, GAME_H - h + 30, 8, h);
      g.fillCircle(x, GAME_H - h + 30, 26);
      g.fillCircle(x - 16, GAME_H - h + 46, 18);
      g.fillCircle(x + 16, GAME_H - h + 46, 18);
    }
  });
}
