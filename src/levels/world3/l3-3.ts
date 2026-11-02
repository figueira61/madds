import { Grid } from '../../art/raster';
import type { LevelData } from '../format';

/*
 * 3-3 Bancadas do Estádio (30×80, vertical). Start under the stands: the gate is shut, so Bekas
 * climbs two seats and slips through the gap above it to the plate on the other side. Then a long
 * zigzag climb up the stands (drones patrol them) to the hatch onto the pitch level and the exit.
 * The cromo sits on a ledge off the route near the top; the Golden Ball by the left wall.
 */
const g = new Grid(30, 80)
  .rect(0, 0, 1, 80, '#')
  .rect(29, 0, 1, 80, '#')
  .rect(0, 0, 30, 1, '#')
  .rect(0, 78, 30, 2, '#')
  // the gate: wall with a 1-tile gap at (14, 74) above the door
  .rect(14, 60, 1, 14, '#')
  .rect(8, 76, 2, 1, '=')
  .rect(10, 75, 4, 1, '=')
  // right-hand climb behind the gate
  .rect(20, 75, 8, 1, '=')
  .rect(15, 72, 8, 1, '=')
  .rect(20, 69, 8, 1, '=')
  .rect(15, 66, 8, 1, '=')
  .rect(20, 63, 8, 1, '=')
  .rect(15, 60, 8, 1, '=')
  // the stands: left and right in turn
  .rect(2, 57, 11, 1, '=')
  .rect(15, 54, 13, 1, '=')
  .rect(2, 51, 11, 1, '=')
  .rect(15, 48, 13, 1, '=')
  .rect(2, 45, 11, 1, '=')
  .rect(15, 42, 13, 1, '=')
  .rect(2, 39, 11, 1, '=')
  .rect(15, 36, 13, 1, '=')
  .rect(2, 33, 11, 1, '=')
  .rect(15, 30, 13, 1, '=')
  .rect(2, 27, 11, 1, '=')
  .rect(15, 24, 13, 1, '=')
  .rect(2, 21, 11, 1, '=')
  .rect(15, 18, 13, 1, '=')
  .rect(27, 21, 2, 1, '#')
  // pitch level with the hatch at x16–17
  .rect(1, 15, 28, 1, '#')
  .rect(16, 15, 2, 1, '.');

export const L3_3: LevelData = {
  id: '3-3',
  name: 'Bancadas do Estádio',
  world: 3,
  kind: 'normal',
  music: 'world3',
  tiles: g.rows(),
  objects: [
    { type: 'start', x: 3, y: 77 },
    { type: 'bekas-zone', x: 1, y: 60, props: { w: 19, h: 19 } },
    { type: 'paw-sign', x: 5, y: 77 },
    { type: 'door', x: 14, y: 77, props: { link: 'p1', h: 3 } },
    { type: 'plate', x: 20, y: 77, id: 'p1' },
    { type: 'racer', x: 24, y: 77 },
    { type: 'checkpoint', x: 16, y: 77, id: 'c1' },
    { type: 'drone', x: 20, y: 62, props: { range: 3 } },
    { type: 'checkpoint', x: 8, y: 56, id: 'c2' },
    { type: 'drone', x: 7, y: 50, props: { range: 3 } },
    { type: 'drone', x: 20, y: 44, props: { range: 3 } },
    { type: 'checkpoint', x: 20, y: 35, id: 'c3' },
    { type: 'golden-ball', x: 1, y: 30 },
    { type: 'drone', x: 7, y: 32, props: { range: 3 } },
    { type: 'drone', x: 20, y: 26, props: { range: 3 } },
    { type: 'cromo', x: 28, y: 19 },
    { type: 'checkpoint', x: 20, y: 14, id: 'c4' },
    { type: 'drone', x: 10, y: 9, props: { range: 3 } },
    { type: 'drone', x: 8, y: 70, props: { range: 2 } },
    { type: 'racer', x: 6, y: 14 },
    { type: 'racer', x: 12, y: 14 },
    { type: 'exit', x: 26, y: 14 },
  ],
};
