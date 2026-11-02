import { Grid } from '../../art/raster';
import type { LevelData } from '../format';

/*
 * 1-2 Copas das Árvores (30×110, vertical). Climb from the forest floor to the canopy.
 * Every step up is at most 3 tiles (a full jump is ~3.7). Introduces the wall jump in two
 * trunk chimneys. Golden Balls sit on risky side ledges; the cromo on a ledge by the edge.
 */
const g = new Grid(30, 110)
  .rect(0, 108, 30, 2, '#')
  .rect(0, 0, 1, 108, '#')
  .rect(29, 0, 1, 108, '#')
  // A: zigzag up from the floor
  .rect(3, 105, 5, 1, '=')
  .rect(9, 102, 5, 1, '=')
  .rect(15, 99, 5, 1, '=')
  .rect(21, 96, 5, 1, '=')
  .rect(27, 99, 2, 1, '=')
  .rect(22, 93, 3, 1, '=')
  // B: first chimney (interior x22–24); narrow shaft x26–28 on its right with a ledge
  .rect(21, 72, 1, 20, '#')
  .rect(25, 70, 1, 22, '#')
  .rect(27, 78, 2, 1, '=')
  .rect(14, 71, 7, 1, '=')
  // C: platforms to the left, with drone birds
  .rect(8, 68, 4, 1, '=')
  .rect(3, 65, 4, 1, '=')
  .rect(9, 62, 4, 1, '=')
  .rect(15, 59, 4, 1, '=')
  .rect(21, 56, 4, 1, '=')
  // D: long branch into the second chimney (interior x10–12)
  .rect(10, 53, 11, 1, '=')
  .rect(9, 30, 1, 21, '#')
  .rect(13, 28, 1, 23, '#')
  .rect(3, 30, 6, 1, '=')
  // E: canopy
  .rect(10, 27, 4, 1, '=')
  .rect(16, 24, 4, 1, '=')
  .rect(22, 21, 4, 1, '=')
  .rect(26, 18, 2, 1, '=')
  .rect(15, 18, 4, 1, '=')
  .rect(8, 15, 4, 1, '=')
  .rect(3, 12, 4, 1, '=')
  .rect(9, 9, 4, 1, '=')
  .rect(15, 6, 5, 1, '=');

export const L1_2: LevelData = {
  id: '1-2',
  name: 'Copas das Árvores',
  world: 1,
  kind: 'normal',
  music: 'world1',
  tiles: g.rows(),
  objects: [
    { type: 'start', x: 3, y: 107 },
    { type: 'beetle', x: 15, y: 107 },
    { type: 'cage', x: 24, y: 107, id: 'a', props: { species: 'fox' } },
    { type: 'golden-ball', x: 28, y: 98 },
    { type: 'checkpoint', x: 23, y: 92, id: 'c1' },
    { type: 'bird', x: 12, y: 80, props: { range: 3 } },
    { type: 'golden-ball', x: 28, y: 77 },
    { type: 'checkpoint', x: 16, y: 70, id: 'c2' },
    { type: 'cage', x: 4, y: 64, id: 'b', props: { species: 'squirrel' } },
    { type: 'bird', x: 6, y: 62, props: { range: 2 } },
    { type: 'beetle', x: 16, y: 58 },
    { type: 'bird', x: 18, y: 57, props: { range: 3 } },
    { type: 'checkpoint', x: 22, y: 55, id: 'c3' },
    { type: 'beetle', x: 18, y: 52 },
    { type: 'checkpoint', x: 5, y: 29, id: 'c4' },
    { type: 'bird', x: 20, y: 22, props: { range: 3 } },
    { type: 'bird', x: 12, y: 13, props: { range: 2 } },
    { type: 'bird', x: 6, y: 10, props: { range: 2 } },
    { type: 'cromo', x: 27, y: 17 },
    { type: 'exit', x: 17, y: 5 },
  ],
};
