import { Grid } from '../../art/raster';
import type { LevelData } from '../format';

/*
 * 2-1 Bairro das Peças (200×17). Teaches brick crates: the first builds an obvious step, the
 * second a bridge over spikes that is too long to jump. A short Bekas section: she digs through
 * soft dirt to a plate that opens the door. Golden Ball on a bridge from a crate on a high ledge;
 * the cromo sits in a dirt-sealed alcove only Bekas can reach (she picks it up herself).
 */
const g = new Grid(200, 17)
  .rect(0, 15, 200, 2, '#')
  // crate 1 → step up onto the wall; crate 2 on the wall → bridge over the spikes
  .rect(23, 12, 2, 3, 'g')
  .rect(25, 10, 10, 5, '#')
  .rect(35, 14, 10, 1, '^')
  .rect(35, 13, 10, 1, 'g')
  // side platforms
  .rect(54, 12, 4, 1, '=')
  .rect(60, 10, 4, 1, '=')
  // Bekas section: dirt plug, alcove with the plate, door for Madds
  .rect(79, 12, 5, 2, '#')
  .rect(83, 14, 1, 1, '#')
  .rect(79, 14, 1, 1, 'M')
  .rect(86, 0, 1, 12, '#')
  // spikes with stepping platforms; a crate on a ledge builds the Golden Ball bridge high above
  // them (row 7 leaves room to keep jumping between the platforms underneath)
  .rect(102, 14, 9, 1, '^')
  .rect(100, 12, 2, 1, '=')
  .rect(104, 12, 2, 1, '=')
  .rect(108, 12, 2, 1, '=')
  .rect(96, 10, 2, 1, '=')
  .rect(99, 7, 10, 1, 'g')
  // crate 4 → stairs onto the second wall; the cromo alcove is carved into it
  .rect(136, 12, 3, 3, 'g')
  .rect(139, 9, 12, 5, '#')
  .rect(139, 14, 8, 1, '#')
  .rect(150, 14, 1, 1, 'M')
  // last spikes
  .rect(178, 14, 4, 1, '^');

export const L2_1: LevelData = {
  id: '2-1',
  name: 'Bairro das Peças',
  world: 2,
  kind: 'normal',
  music: 'world2',
  intro: 'w2-intro',
  tiles: g.rows(),
  objects: [
    { type: 'start', x: 2, y: 14 },
    { type: 'minifig', x: 10, y: 14 },
    { type: 'minifig', x: 16, y: 14 },
    { type: 'brick-box', x: 20, y: 14, props: { bx: 23, by: 12, bw: 2, bh: 3 } },
    { type: 'brick-box', x: 33, y: 9, props: { bx: 35, by: 13, bw: 10, bh: 1 } },
    { type: 'checkpoint', x: 47, y: 14, id: 'c1' },
    { type: 'minifig', x: 50, y: 14 },
    { type: 'heli', x: 56, y: 8, props: { range: 3 } },
    { type: 'minifig', x: 58, y: 14 },
    { type: 'minifig', x: 64, y: 14 },
    { type: 'bekas-zone', x: 72, y: 4, props: { w: 15, h: 12 } },
    { type: 'paw-sign', x: 74, y: 14 },
    { type: 'plate', x: 81, y: 14, id: 'p1' },
    { type: 'door', x: 86, y: 14, props: { link: 'p1', h: 3 } },
    { type: 'checkpoint', x: 90, y: 14, id: 'c2' },
    { type: 'brick-box', x: 97, y: 9, props: { bx: 99, by: 7, bw: 10, bh: 1 } },
    { type: 'golden-ball', x: 104, y: 6 },
    { type: 'checkpoint', x: 114, y: 14, id: 'c3' },
    { type: 'minifig', x: 118, y: 14 },
    { type: 'heli', x: 124, y: 8, props: { range: 3 } },
    { type: 'minifig', x: 128, y: 14 },
    { type: 'brick-box', x: 133, y: 14, props: { bx: 136, by: 12, bw: 3, bh: 3 } },
    { type: 'cromo', x: 148, y: 14 },
    { type: 'bekas-zone', x: 147, y: 8, props: { w: 14, h: 8 } },
    { type: 'paw-sign', x: 153, y: 14 },
    { type: 'checkpoint', x: 157, y: 14, id: 'c4' },
    { type: 'minifig', x: 165, y: 14 },
    { type: 'heli', x: 170, y: 9, props: { range: 3 } },
    { type: 'minifig', x: 175, y: 14 },
    { type: 'minifig', x: 185, y: 14 },
    { type: 'exit', x: 196, y: 14 },
  ],
};
