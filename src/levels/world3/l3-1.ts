import { Grid } from '../../art/raster';
import type { LevelData } from '../format';

/*
 * 3-1 Boxes (180×17, the screen scrolls on its own at 70 px/s). The pit lane: holes, tyre
 * stacks, parked-car blocks and debris. Falling behind the left edge counts as a fall.
 * The cromo is on a detour up over the tyres that costs time; the Golden Ball sits over a gap.
 */
const g = new Grid(180, 17)
  .rect(0, 15, 180, 2, '#')
  .rect(17, 15, 3, 2, '.')
  .rect(24, 12, 3, 1, '=')
  .rect(28, 12, 4, 3, '#')
  .rect(34, 15, 4, 2, '.')
  .rect(50, 12, 4, 1, '=')
  .rect(62, 14, 7, 1, '^')
  .rect(64, 12, 2, 1, '=')
  // cromo detour
  .rect(71, 12, 2, 3, '#')
  .rect(74, 9, 3, 1, '=')
  .rect(79, 8, 3, 1, '=')
  .rect(94, 15, 4, 2, '.')
  // staircase of parked cars
  .rect(112, 13, 3, 2, '#')
  .rect(116, 11, 3, 4, '#')
  .rect(120, 9, 3, 6, '#')
  .rect(140, 14, 4, 1, '^')
  .rect(150, 15, 4, 2, '.');

export const L3_1: LevelData = {
  id: '3-1',
  name: 'Boxes',
  world: 3,
  kind: 'normal',
  music: 'world3',
  intro: 'w3-intro',
  autoscroll: 70,
  tiles: g.rows(),
  objects: [
    { type: 'start', x: 4, y: 14 },
    { type: 'racer', x: 10, y: 14 },
    { type: 'checkpoint', x: 42, y: 14, id: 'c1' },
    { type: 'racer', x: 48, y: 14 },
    { type: 'drone', x: 52, y: 9, props: { range: 2 } },
    { type: 'racer', x: 55, y: 14 },
    { type: 'cromo', x: 80, y: 7 },
    { type: 'checkpoint', x: 85, y: 14, id: 'c2' },
    { type: 'golden-ball', x: 95, y: 11 },
    { type: 'drone', x: 118, y: 6, props: { range: 2 } },
    { type: 'racer', x: 126, y: 14 },
    { type: 'checkpoint', x: 132, y: 14, id: 'c3' },
    { type: 'racer', x: 145, y: 14 },
    { type: 'drone', x: 155, y: 9, props: { range: 3 } },
    { type: 'racer', x: 158, y: 14 },
    { type: 'racer', x: 164, y: 14 },
    { type: 'exit', x: 176, y: 14 },
  ],
};
