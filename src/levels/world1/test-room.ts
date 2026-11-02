import { Grid } from '../../art/raster';
import type { LevelData } from '../format';

const g = new Grid(100, 17)
  .rect(0, 15, 100, 2, '#')
  .rect(20, 14, 3, 1, '^')
  .rect(30, 15, 6, 2, '~')
  .rect(12, 12, 5, 1, '=')
  .rect(38, 10, 6, 1, '=')
  .rect(46, 0, 1, 13, '#')
  .rect(50, 4, 2, 11, '#')
  .rect(70, 13, 1, 2, 'B')
  .rect(76, 12, 8, 1, '=');

/** Sandbox used during development: every mechanic in one room. Open with ?level=test-room. */
export const TEST_ROOM: LevelData = {
  id: 'test-room',
  name: 'Sala de Teste',
  world: 1,
  kind: 'normal',
  music: 'world1',
  tiles: g.rows(),
  objects: [
    { type: 'start', x: 2, y: 14 },
    { type: 'checkpoint', x: 25, y: 14, id: 'c1' },
    { type: 'checkpoint', x: 60, y: 14, id: 'c2' },
    { type: 'cromo', x: 80, y: 10 },
    { type: 'cage', x: 8, y: 14, id: 'a' },
    { type: 'golden-ball', x: 14, y: 11 },
    { type: 'bird', x: 40, y: 7, props: { range: 3 } },
    { type: 'log', x: 30, y: 13, props: { dx: 4, speed: 40 } },
    { type: 'beetle', x: 62, y: 14 },
    { type: 'beetle', x: 64, y: 14 },
    { type: 'beetle', x: 66, y: 14 },
    { type: 'exit', x: 95, y: 14 },
  ],
};
