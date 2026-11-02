import { Grid } from '../../art/raster';
import type { LevelData } from '../format';

/*
 * 3-2 Grande Prémio (240×17). The race track: boost pads before gaps too long to jump without
 * them, race cars crossing (announced by a "!" at the screen edge — jump them or wait on the
 * platforms), pit boards as checkpoints. The Golden Ball floats mid-way over the longest boost
 * jump; the cromo is in a pit garage sealed by reinforced blocks (A.D.Q.C. kick).
 */
const g = new Grid(240, 17)
  .rect(0, 15, 240, 2, '#')
  .rect(14, 15, 4, 1, 'z')
  .rect(22, 15, 8, 2, '.')
  // ramp up, boost on the plateau, long gap
  .rect(44, 14, 1, 1, '#')
  .rect(45, 13, 1, 2, '#')
  .rect(46, 12, 7, 3, '#')
  .rect(49, 12, 4, 1, 'z')
  .rect(53, 15, 8, 2, '.')
  // pit garage with the cromo, sealed by reinforced blocks
  .rect(100, 12, 5, 1, '#')
  .rect(104, 13, 1, 2, '#')
  .rect(100, 13, 1, 2, 'B')
  // the big boost jump
  .rect(106, 15, 4, 1, 'z')
  .rect(114, 15, 9, 2, '.')
  // safe platforms above the car lane
  .rect(140, 12, 4, 1, '=')
  .rect(150, 12, 4, 1, '=')
  // final straight
  .rect(180, 15, 4, 1, 'z')
  .rect(188, 15, 8, 2, '.')
  .rect(200, 15, 4, 1, 'z')
  .rect(208, 15, 9, 2, '.');

export const L3_2: LevelData = {
  id: '3-2',
  name: 'Grande Prémio',
  world: 3,
  kind: 'normal',
  music: 'world3',
  tiles: g.rows(),
  objects: [
    { type: 'start', x: 2, y: 14 },
    { type: 'racer', x: 8, y: 14 },
    { type: 'checkpoint', x: 32, y: 14, id: 'c1' },
    { type: 'car', x: 42, y: 14, props: { every: 3000, speed: 260 } },
    { type: 'racer', x: 62, y: 14 },
    { type: 'drone', x: 66, y: 9, props: { range: 3 } },
    { type: 'racer', x: 70, y: 14 },
    { type: 'checkpoint', x: 78, y: 14, id: 'c2' },
    { type: 'car', x: 96, y: 14, props: { every: 2600, speed: 280 } },
    { type: 'cromo', x: 102, y: 14 },
    { type: 'golden-ball', x: 117, y: 10 },
    { type: 'checkpoint', x: 128, y: 14, id: 'c3' },
    { type: 'racer', x: 135, y: 14 },
    { type: 'drone', x: 145, y: 8, props: { range: 3 } },
    { type: 'racer', x: 150, y: 14 },
    { type: 'car', x: 162, y: 14, props: { every: 2200, speed: 300 } },
    { type: 'drone', x: 165, y: 9, props: { range: 3 } },
    { type: 'checkpoint', x: 175, y: 14, id: 'c4' },
    { type: 'racer', x: 220, y: 14 },
    { type: 'racer', x: 226, y: 14 },
    { type: 'exit', x: 236, y: 14 },
  ],
};
