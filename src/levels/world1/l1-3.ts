import { Grid } from '../../art/raster';
import type { LevelData } from '../format';

/*
 * 1-3 Rio das Cascatas (220×17). Rivers crossed on drifting logs and stepping stones,
 * a waterfall climbed on vertical logs, and a last fast river. The cromo sits above the
 * final bank on an optional climb guarded by a drone bird.
 */
const g = new Grid(220, 17)
  .rect(0, 15, 220, 2, '#')
  // river 1
  .rect(16, 15, 25, 2, '~')
  // river 2 with stepping stones
  .rect(61, 15, 30, 2, '~')
  .rect(64, 13, 2, 2, '#')
  .rect(70, 12, 2, 3, '#')
  .rect(76, 13, 2, 2, '#')
  .rect(82, 11, 2, 4, '#')
  .rect(87, 13, 2, 2, '#')
  // waterfall pool and the cliff
  .rect(111, 15, 15, 2, '~')
  .rect(126, 8, 25, 9, '#')
  // river 3 (fast logs)
  .rect(151, 15, 35, 2, '~')
  // optional climb to the cromo
  .rect(195, 12, 3, 1, '=')
  .rect(200, 9, 3, 1, '=');

export const L1_3: LevelData = {
  id: '1-3',
  name: 'Rio das Cascatas',
  world: 1,
  kind: 'normal',
  music: 'world1',
  tiles: g.rows(),
  objects: [
    { type: 'start', x: 2, y: 14 },
    { type: 'beetle', x: 10, y: 14 },
    { type: 'cage', x: 13, y: 14, id: 'a', props: { species: 'rabbit' } },
    { type: 'log', x: 18, y: 13, props: { dx: 5, speed: 40 } },
    { type: 'log', x: 28, y: 13, props: { dy: -3, speed: 30 } },
    { type: 'golden-ball', x: 30, y: 6 },
    { type: 'log', x: 34, y: 13, props: { dx: 5, speed: 45 } },
    { type: 'checkpoint', x: 43, y: 14, id: 'c1' },
    { type: 'beetle', x: 48, y: 14 },
    { type: 'beetle', x: 55, y: 14 },
    { type: 'bird', x: 73, y: 8, props: { range: 3 } },
    { type: 'bird', x: 79, y: 6, props: { range: 2 } },
    { type: 'cage', x: 82, y: 10, id: 'b', props: { species: 'fox' } },
    { type: 'checkpoint', x: 93, y: 14, id: 'c2' },
    { type: 'beetle', x: 100, y: 14 },
    { type: 'log', x: 113, y: 13, props: { dy: -4, speed: 30 } },
    { type: 'log', x: 120, y: 9, props: { dy: 4, speed: 30 } },
    { type: 'checkpoint', x: 128, y: 7, id: 'c3' },
    { type: 'beetle', x: 136, y: 7 },
    { type: 'bird', x: 142, y: 3, props: { range: 3 } },
    { type: 'cage', x: 147, y: 7, id: 'c', props: { species: 'squirrel' } },
    { type: 'log', x: 154, y: 13, props: { dx: 6, speed: 50 } },
    { type: 'log', x: 165, y: 13, props: { dx: 6, speed: 55 } },
    { type: 'bird', x: 170, y: 9, props: { range: 4 } },
    { type: 'log', x: 177, y: 13, props: { dx: 5, speed: 60 } },
    { type: 'checkpoint', x: 188, y: 14, id: 'c4' },
    { type: 'beetle', x: 192, y: 14 },
    { type: 'bird', x: 201, y: 6, props: { range: 2 } },
    { type: 'cromo', x: 201, y: 8 },
    { type: 'beetle', x: 208, y: 14 },
    { type: 'exit', x: 216, y: 14 },
  ],
};
