import { Grid } from '../../art/raster';
import type { LevelData } from '../format';

/*
 * 1-1 Entrada da Floresta (200×17). Teaches run, jump and kick without text,
 * then ramps up: spike runs under platforms, water pits, a high plateau.
 * Cromo: inside the plateau cave, behind a reinforced block (needs the A.D.Q.C. kick).
 */
const g = new Grid(200, 17)
  .rect(0, 15, 200, 2, '#')
  // first pit
  .rect(22, 15, 2, 2, '.')
  // steps
  .rect(30, 14, 3, 1, '#')
  .rect(34, 13, 3, 2, '#')
  // spike run under platforms
  .rect(50, 14, 13, 1, '^')
  .rect(50, 12, 3, 1, '=')
  .rect(55, 11, 3, 1, '=')
  .rect(60, 12, 3, 1, '=')
  // raised block with a cage
  .rect(90, 12, 6, 3, '#')
  // water pits with an island
  .rect(102, 15, 3, 2, '~')
  .rect(109, 15, 3, 2, '~')
  // stairs to the plateau
  .rect(126, 13, 5, 2, '#')
  .rect(131, 11, 5, 4, '#')
  .rect(136, 9, 15, 6, '#')
  // secret cave in the plateau, sealed by a reinforced block
  .rect(139, 12, 11, 3, '.')
  .rect(150, 13, 1, 2, 'B')
  // final spike run
  .rect(160, 14, 11, 1, '^')
  .rect(161, 12, 2, 1, '=')
  .rect(165, 11, 2, 1, '=')
  .rect(169, 12, 2, 1, '=');

export const L1_1: LevelData = {
  id: '1-1',
  name: 'Entrada da Floresta',
  world: 1,
  kind: 'normal',
  music: 'world1',
  intro: 'w1-intro',
  tiles: g.rows(),
  objects: [
    { type: 'start', x: 2, y: 14 },
    { type: 'beetle', x: 14, y: 14 },
    { type: 'beetle', x: 38, y: 14 },
    { type: 'cage', x: 42, y: 14, id: 'a', props: { species: 'rabbit' } },
    { type: 'checkpoint', x: 46, y: 14, id: 'c1' },
    { type: 'bird', x: 56, y: 6, props: { range: 3 } },
    { type: 'golden-ball', x: 56, y: 7 },
    { type: 'checkpoint', x: 72, y: 14, id: 'c2' },
    { type: 'beetle', x: 80, y: 14 },
    { type: 'beetle', x: 83, y: 14 },
    { type: 'beetle', x: 86, y: 14 },
    { type: 'cage', x: 93, y: 11, id: 'b', props: { species: 'squirrel' } },
    { type: 'beetle', x: 107, y: 14 },
    { type: 'checkpoint', x: 120, y: 14, id: 'c3' },
    { type: 'beetle', x: 143, y: 8 },
    { type: 'bird', x: 146, y: 4, props: { range: 3 } },
    { type: 'cromo', x: 141, y: 14 },
    { type: 'checkpoint', x: 155, y: 14, id: 'c4' },
    { type: 'exit', x: 195, y: 14 },
  ],
};
