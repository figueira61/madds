import { Grid } from '../../art/raster';
import type { LevelData } from '../format';

const g = new Grid(100, 17)
  .rect(0, 15, 100, 2, '#')
  .rect(20, 14, 3, 1, '^')
  .rect(30, 15, 6, 2, '~')
  .rect(12, 11, 5, 1, '=')
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
    { type: 'exit', x: 95, y: 14 },
  ],
};
