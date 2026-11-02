import Phaser from 'phaser';
import { GAME_W, GAME_H } from '../config';

type Layer = (factor: number, depth: number, draw: (g: Phaser.GameObjects.Graphics, width: number) => void) => void;

function parallax(scene: Phaser.Scene, worldWidthPx: number, worldHeightPx: number): Layer {
  return (factor, depth, draw) => {
    const g = scene.add.graphics().setScrollFactor(factor).setDepth(depth);
    draw(g, worldWidthPx * factor + GAME_W);
    // Vertical levels: keep layers anchored to the bottom of the view.
    g.y = Math.max(0, worldHeightPx - GAME_H) * factor;
  };
}

/** Picks the background of a world: forest (1), block city (2). */
export function drawBackground(scene: Phaser.Scene, world: number, worldWidthPx: number, worldHeightPx = GAME_H): void {
  if (world === 2) drawCityBackground(scene, worldWidthPx, worldHeightPx);
  else drawForestBackground(scene, worldWidthPx, worldHeightPx);
}

const CITY_COLOURS = [0xff7a6a, 0xffd86a, 0x6aa4ff, 0x7ad87a, 0xffaa5a, 0xc08aff];

/** Studded block on top of a building, like the top of a toy brick. */
function studs(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number): void {
  for (let sx = x + 4; sx + 6 <= x + w; sx += 10) g.fillRect(sx, y - 3, 6, 3);
}

/** Block city: pale skyline, toy-brick buildings with windows, and a crane. */
export function drawCityBackground(scene: Phaser.Scene, worldWidthPx: number, worldHeightPx = GAME_H): void {
  const sky = scene.add.graphics().setScrollFactor(0).setDepth(-30);
  sky.fillGradientStyle(0x8fd4ff, 0x8fd4ff, 0xfff0d6, 0xfff0d6, 1);
  sky.fillRect(0, 0, GAME_W, GAME_H);
  const layer = parallax(scene, worldWidthPx, worldHeightPx);

  layer(0.15, -20, (g, width) => {
    g.fillStyle(0xc6dcef, 1);
    for (let x = -20; x < width; x += 54) {
      const h = 80 + ((x * 31) % 70);
      g.fillRect(x, GAME_H - h, 40, h);
      studs(g, x, GAME_H - h, 40);
    }
  });

  layer(0.35, -15, (g, width) => {
    for (let x = 0, i = 0; x < width; x += 70, i++) {
      const w = 50 + ((x * 13) % 20);
      const h = 70 + ((x * 37) % 80);
      const top = GAME_H - h;
      g.fillStyle(CITY_COLOURS[i % CITY_COLOURS.length], 1);
      g.fillRect(x, top, w, h);
      studs(g, x, top, w);
      g.fillStyle(0xffffff, 0.55);
      for (let wy = top + 10; wy < GAME_H - 30; wy += 18) for (let wx = x + 7; wx + 8 < x + w; wx += 14) g.fillRect(wx, wy, 8, 9);
    }
  });

  layer(0.6, -10, (g, width) => {
    for (let x = 140; x < width; x += 420) {
      g.fillStyle(0xffc23a, 1);
      g.fillRect(x, GAME_H - 200, 8, 200);
      g.fillRect(x - 40, GAME_H - 200, 110, 6);
      g.lineStyle(1, 0x5a4a2a, 1).lineBetween(x + 60, GAME_H - 194, x + 60, GAME_H - 150);
      g.fillStyle(0x4a8cff, 1).fillRect(x + 54, GAME_H - 150, 12, 8);
    }
    for (let x = 60; x < width; x += 160) {
      g.fillStyle(0x3f9a4a, 1).fillRect(x, GAME_H - 60, 22, 40);
      studs(g, x, GAME_H - 60, 22);
      g.fillStyle(0x7a4a2a, 1).fillRect(x + 8, GAME_H - 20, 6, 20);
    }
  });
}

/** Three parallax layers for the forest: sky gradient, distant hills, tree silhouettes. */
export function drawForestBackground(scene: Phaser.Scene, worldWidthPx: number, worldHeightPx = GAME_H): void {
  const sky = scene.add.graphics().setScrollFactor(0).setDepth(-30);
  sky.fillGradientStyle(0x7ec8f0, 0x7ec8f0, 0xd6f0e0, 0xd6f0e0, 1);
  sky.fillRect(0, 0, GAME_W, GAME_H);

  const layer = parallax(scene, worldWidthPx, worldHeightPx);

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
