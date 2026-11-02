import { Grid } from '../../art/raster';
import type { LevelData } from '../format';

const g = new Grid(30, 17)
  .rect(0, 15, 30, 2, '#')
  .rect(0, 0, 1, 15, '#')
  .rect(29, 0, 1, 15, '#')
  .rect(5, 12, 6, 1, '=')
  .rect(14, 12, 6, 1, '=');

/** 3-boss Relvado: the pitch. Platforms to jump-kick the hovering Collector; the goal on the right. */
export const L3_BOSS: LevelData = {
  id: '3-boss',
  name: 'Relvado',
  world: 3,
  kind: 'boss',
  music: 'final',
  tiles: g.rows(),
  intro: 'w3-preboss',
  outro: 'w3-outro',
  objects: [
    { type: 'start', x: 3, y: 14 },
    { type: 'boss-collector', x: 20, y: 14 },
    { type: 'minion-spawn', x: 7, y: 11 },
    { type: 'minion-spawn', x: 16, y: 11 },
    { type: 'goal', x: 26, y: 14, props: { w: 2, h: 3 } },
  ],
};
