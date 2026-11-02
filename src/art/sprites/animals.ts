import { Grid } from '../raster';
import type { SheetDef } from '../pixels';

/** Caged animals of the sanctuary, 16×16, facing right. Frames: rabbit, squirrel, fox × (idle, cheer a, cheer b). */

function rabbit(hop: number): string[] {
  const g = new Grid(16, 16);
  const y = 9 - hop;
  g.ellipse(7, y + 2, 5, 4, 'W').ellipse(7, y + 1, 4, 3, 'w');
  g.ellipse(12, y - 1, 3, 3, 'w').set(13, y - 2, 'k').set(15, y - 1, 'R');
  g.rect(10, y - 7, 2, 5, 'w').rect(13, y - 7, 2, 5, 'w').set(11, y - 6, 'R').set(14, y - 6, 'R');
  g.ellipse(2, y + 1, 1, 1, 'w');
  g.rect(4, y + 6, 3, 1, 'W').rect(9, y + 6, 3, 1, 'W');
  return g.rows();
}

function squirrel(hop: number): string[] {
  const g = new Grid(16, 16);
  const y = 9 - hop;
  g.ellipse(3, y - 1, 3, 6, 'o').ellipse(3, y - 2, 2, 4, 'y'); // big tail
  g.ellipse(8, y + 2, 4, 4, 'o').ellipse(9, y + 3, 2, 2, 'y');
  g.ellipse(11, y - 2, 3, 3, 'o').set(12, y - 3, 'k').set(14, y - 2, 'T').set(10, y - 5, 'o').set(11, y - 6, 'o');
  g.rect(6, y + 6, 2, 1, 'T').rect(10, y + 6, 2, 1, 'T');
  return g.rows();
}

function fox(hop: number): string[] {
  const g = new Grid(16, 16);
  const y = 9 - hop;
  g.ellipse(2, y + 1, 2, 3, 'o').set(1, y + 3, 'w').set(2, y + 4, 'w'); // tail with white tip
  g.ellipse(7, y + 2, 5, 3, 'o').ellipse(8, y + 4, 3, 1, 'w');
  g.ellipse(12, y - 1, 3, 3, 'o').rect(13, y, 3, 2, 'w').set(15, y, 'k').set(12, y - 2, 'k');
  g.set(10, y - 4, 'o').set(11, y - 5, 'o').set(13, y - 4, 'o').set(14, y - 5, 'o');
  g.rect(4, y + 5, 2, 2, 'k').rect(9, y + 5, 2, 2, 'k');
  return g.rows();
}

export const ANIMALS_SHEET: SheetDef = {
  key: 'animals',
  frameW: 16,
  frameH: 16,
  frames: [rabbit(0), rabbit(3), rabbit(1), squirrel(0), squirrel(3), squirrel(1), fox(0), fox(3), fox(1)],
  anims: {
    'rabbit-idle': { frames: [0], fps: 1, repeat: -1 },
    'rabbit-cheer': { frames: [1, 2], fps: 6, repeat: -1 },
    'squirrel-idle': { frames: [3], fps: 1, repeat: -1 },
    'squirrel-cheer': { frames: [4, 5], fps: 6, repeat: -1 },
    'fox-idle': { frames: [6], fps: 1, repeat: -1 },
    'fox-cheer': { frames: [7, 8], fps: 6, repeat: -1 },
  },
};
