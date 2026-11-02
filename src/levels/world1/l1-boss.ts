import { Grid } from '../../art/raster';
import type { LevelData } from '../format';

const g = new Grid(30, 17)
  .rect(0, 15, 30, 2, '#')
  .rect(0, 0, 1, 15, '#')
  .rect(29, 0, 1, 15, '#')
  .rect(5, 12, 6, 1, '=')
  .rect(19, 12, 6, 1, '=')
  .rect(12, 9, 6, 1, '=');

/** 1-boss Clareira: arena for the Hunter. Fixed camera (the map is one screen wide). */
export const L1_BOSS: LevelData = {
  id: '1-boss',
  name: 'Clareira do Caçador',
  world: 1,
  kind: 'boss',
  music: 'boss',
  tiles: g.rows(),
  intro: 'w1-preboss',
  outro: 'w1-reunion',
  objects: [
    { type: 'start', x: 3, y: 14 },
    { type: 'boss-hunter', x: 24, y: 14 },
    { type: 'minion-spawn', x: 7, y: 11 },
    { type: 'minion-spawn', x: 22, y: 11 },
  ],
};
