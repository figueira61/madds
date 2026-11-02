import { Grid } from '../../art/raster';
import type { LevelData } from '../format';

const g = new Grid(30, 17)
  .rect(0, 15, 30, 2, '#')
  .rect(0, 0, 1, 15, '#')
  .rect(29, 0, 1, 15, '#')
  .rect(5, 12, 6, 1, '=')
  .rect(19, 12, 6, 1, '=')
  .rect(12, 9, 6, 1, '=');

/** 2-boss Fábrica Central: arena for the Block Robot. Low platforms to hop its shockwaves and bricks. */
export const L2_BOSS: LevelData = {
  id: '2-boss',
  name: 'Fábrica Central',
  world: 2,
  kind: 'boss',
  music: 'boss',
  tiles: g.rows(),
  intro: 'w2-preboss',
  outro: 'w2-outro',
  objects: [
    { type: 'start', x: 3, y: 14 },
    { type: 'boss-robot', x: 24, y: 14 },
    { type: 'minion-spawn', x: 7, y: 11 },
    { type: 'minion-spawn', x: 22, y: 11 },
  ],
};
