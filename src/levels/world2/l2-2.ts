import { Grid } from '../../art/raster';
import type { LevelData } from '../format';

/*
 * 2-2 Fábrica de Peças (220×17). Conveyor belts (against, then towards spikes), two low press
 * corridors with staggered timings (the second over a belt pushing back), and two Bekas
 * sections: a 1-tile hole high in a wall, and a tunnel under a block, each to a plate that opens
 * Madds' door. The cromo is up on hidden platforms that Bekas' nose reveals.
 */
const g = new Grid(220, 17)
  .rect(0, 15, 220, 2, '#')
  .rect(22, 15, 11, 1, '<')
  // press corridor 1
  .rect(40, 0, 22, 12, '#')
  .rect(64, 15, 11, 1, '>')
  .rect(76, 14, 4, 1, '^')
  // Bekas section 1: steps, ledge, the hole at (100, 8), door below
  .rect(90, 13, 7, 2, '#')
  .rect(92, 11, 5, 2, '#')
  .rect(94, 9, 3, 2, '#')
  .rect(97, 9, 3, 1, '=')
  .rect(100, 0, 1, 8, '#')
  .rect(100, 9, 1, 3, '#')
  // press corridor 2, over a belt pushing back
  .rect(112, 0, 20, 12, '#')
  .rect(112, 15, 20, 1, '<')
  // Bekas section 2: platforms up and over the block, tunnel underneath, door after it
  .rect(141, 12, 2, 1, '=')
  .rect(143, 9, 2, 1, '=')
  .rect(141, 6, 2, 1, '=')
  .rect(146, 4, 11, 10, '#')
  .rect(158, 0, 1, 12, '#')
  // scent room: one step, hidden platforms up to the cromo
  .rect(163, 13, 2, 2, '#')
  .rect(166, 11, 2, 1, 'h')
  .rect(168, 9, 2, 1, 'h')
  // last belt towards the spikes
  .rect(180, 15, 11, 1, '>')
  .rect(192, 14, 3, 1, '^');

export const L2_2: LevelData = {
  id: '2-2',
  name: 'Fábrica de Peças',
  world: 2,
  kind: 'normal',
  music: 'world2',
  tiles: g.rows(),
  objects: [
    { type: 'start', x: 2, y: 14 },
    { type: 'minifig', x: 10, y: 14 },
    { type: 'minifig', x: 16, y: 14 },
    { type: 'heli', x: 28, y: 9, props: { range: 3 } },
    { type: 'minifig', x: 30, y: 14 },
    { type: 'checkpoint', x: 37, y: 14, id: 'c1' },
    { type: 'press', x: 43, y: 12, props: { offset: 0 } },
    { type: 'press', x: 48, y: 12, props: { offset: 600 } },
    { type: 'press', x: 53, y: 12, props: { offset: 1200 } },
    { type: 'press', x: 58, y: 12, props: { offset: 1800 } },
    { type: 'minifig', x: 68, y: 14 },
    { type: 'golden-ball', x: 78, y: 11 },
    { type: 'checkpoint', x: 82, y: 14, id: 'c2' },
    { type: 'bekas-zone', x: 86, y: 3, props: { w: 21, h: 13 } },
    { type: 'paw-sign', x: 87, y: 14 },
    { type: 'plate', x: 103, y: 14, id: 'p2' },
    { type: 'door', x: 100, y: 14, props: { link: 'p2', h: 3 } },
    { type: 'checkpoint', x: 108, y: 14, id: 'c3' },
    { type: 'press', x: 114, y: 12, props: { offset: 0 } },
    { type: 'press', x: 119, y: 12, props: { offset: 800 } },
    { type: 'press', x: 124, y: 12, props: { offset: 1600 } },
    { type: 'press', x: 129, y: 12, props: { offset: 400 } },
    { type: 'minifig', x: 136, y: 14 },
    { type: 'bekas-zone', x: 139, y: 0, props: { w: 19, h: 16 } },
    { type: 'paw-sign', x: 139, y: 14 },
    { type: 'plate', x: 152, y: 14, id: 'p3' },
    { type: 'door', x: 158, y: 14, props: { link: 'p3', h: 3 } },
    { type: 'bekas-zone', x: 159, y: 4, props: { w: 17, h: 12 } },
    { type: 'paw-sign', x: 160, y: 14 },
    { type: 'scent', x: 167, y: 14 },
    { type: 'cromo', x: 169, y: 7 },
    { type: 'checkpoint', x: 172, y: 14, id: 'c4' },
    { type: 'minifig', x: 185, y: 14 },
    { type: 'heli', x: 196, y: 8, props: { range: 3 } },
    { type: 'minifig', x: 200, y: 14 },
    { type: 'minifig', x: 207, y: 14 },
    { type: 'exit', x: 216, y: 14 },
  ],
};
