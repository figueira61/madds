import { Grid } from '../../art/raster';
import type { LevelData } from '../format';

/** Dev room for the World 2 props (?level=test-puzzle). Not part of the game. */
const g = new Grid(64, 17)
  .rect(0, 15, 64, 2, '#')
  .rect(9, 12, 3, 3, 'g')
  .rect(14, 15, 5, 1, '>')
  .rect(26, 0, 1, 12, '#')
  .rect(38, 0, 1, 12, '#')
  .rect(40, 0, 6, 12, '#')
  .rect(46, 11, 3, 1, 'h')
  .rect(52, 13, 1, 2, 'M')
  .rect(55, 12, 4, 2, '#');

export const TEST_PUZZLE: LevelData = {
  id: 'test-puzzle',
  name: 'Sala de testes 2',
  world: 2,
  kind: 'normal',
  music: 'world2',
  tiles: g.rows(),
  objects: [
    { type: 'start', x: 2, y: 14 },
    { type: 'brick-box', x: 6, y: 14, props: { bx: 9, by: 12, bw: 3, bh: 3 } },
    { type: 'bekas-zone', x: 19, y: 8, props: { w: 8, h: 7 } },
    { type: 'paw-sign', x: 20, y: 14 },
    { type: 'plate', x: 23, y: 14, id: 'p1' },
    { type: 'door', x: 26, y: 14, props: { link: 'p1', h: 3 } },
    { type: 'switch', x: 34, y: 14, id: 's1' },
    { type: 'door', x: 38, y: 14, props: { link: 's1', h: 3 } },
    { type: 'press', x: 42, y: 12 },
    { type: 'scent', x: 48, y: 14 },
    { type: 'bekas-zone', x: 44, y: 8, props: { w: 16, h: 7 } },
    { type: 'checkpoint', x: 30, y: 14, id: 'c1' },
    { type: 'cromo', x: 47, y: 10 },
    { type: 'exit', x: 62, y: 14 },
  ],
};
