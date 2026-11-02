import { Grid } from '../../art/raster';
import type { LevelData } from '../format';

/*
 * 2-3 Torre do Puzzle (30×70, vertical). Four co-op rooms stacked, climbed through hatches:
 *  1 (rows 53–67) Bekas holds a plate so Madds can pass the door to the climbing column.
 *    The cromo is in an alcove sealed by reinforced blocks (A.D.Q.C. kick).
 *  2 (rows 37–51) the switch hides behind a 1-tile slot: only the ball fits. It opens the column door.
 *  3 (rows 21–35) a trail of scents: each sniff reveals the next hidden platforms for both of them.
 *  4 (rows 5–19)  switch → door to the brick crates → stairs → Bekas on the plate → door → exit.
 */
const g = new Grid(30, 70)
  .rect(0, 0, 1, 70, '#')
  .rect(29, 0, 1, 70, '#')
  .rect(0, 0, 30, 5, '#')
  .rect(0, 68, 30, 2, '#')
  // slabs between rooms, each with a hatch
  .rect(1, 52, 28, 1, '#')
  .rect(22, 52, 2, 1, '.')
  .rect(1, 36, 28, 1, '#')
  .rect(25, 36, 2, 1, '.')
  .rect(1, 20, 28, 1, '#')
  .rect(4, 20, 2, 1, '.')
  // room 1: cromo alcove, wall with the door, climbing column
  .rect(1, 53, 4, 13, '#')
  .rect(4, 66, 1, 2, 'B')
  .rect(19, 53, 1, 12, '#')
  .rect(21, 65, 3, 1, '=')
  .rect(25, 62, 3, 1, '=')
  .rect(21, 59, 3, 1, '=')
  .rect(25, 56, 3, 1, '=')
  .rect(22, 55, 3, 1, '=')
  // room 2: solid left block, switch chamber, slot at (20, 51), column with its door
  .rect(1, 37, 14, 15, '#')
  .rect(20, 37, 1, 14, '#')
  .rect(24, 37, 1, 12, '#')
  .rect(25, 49, 2, 1, '=')
  .rect(27, 46, 2, 1, '=')
  .rect(25, 43, 2, 1, '=')
  .rect(27, 41, 2, 1, '=')
  .rect(25, 38, 2, 1, '=')
  // room 3: hidden staircase
  .rect(20, 34, 2, 1, 'h')
  .rect(17, 32, 2, 1, 'h')
  .rect(14, 30, 2, 1, 'h')
  .rect(11, 28, 2, 1, 'h')
  .rect(8, 26, 2, 1, 'h')
  .rect(5, 24, 2, 1, 'h')
  .rect(4, 22, 2, 1, 'h')
  // room 4: door B, crate stairs, ledge with the plate, door A, climb to the exit
  .rect(7, 5, 1, 12, '#')
  .rect(11, 18, 2, 2, 'g')
  .rect(13, 16, 2, 4, 'g')
  .rect(15, 16, 14, 4, '#')
  .rect(22, 5, 1, 8, '#')
  .rect(25, 13, 3, 1, '=')
  .rect(23, 10, 2, 1, '=')
  .rect(25, 7, 4, 1, '#');

export const L2_3: LevelData = {
  id: '2-3',
  name: 'Torre do Puzzle',
  world: 2,
  kind: 'normal',
  music: 'world2',
  tiles: g.rows(),
  objects: [
    // room 1
    { type: 'start', x: 6, y: 67 },
    { type: 'cromo', x: 2, y: 67 },
    { type: 'bekas-zone', x: 1, y: 53, props: { w: 19, h: 16 } },
    { type: 'paw-sign', x: 7, y: 67 },
    { type: 'plate', x: 10, y: 67, id: 'p1' },
    { type: 'minifig', x: 13, y: 67 },
    { type: 'minifig', x: 16, y: 67 },
    { type: 'door', x: 19, y: 67, props: { link: 'p1', h: 3 } },
    { type: 'heli', x: 24, y: 60, props: { range: 2 } },
    // room 2
    { type: 'checkpoint', x: 21, y: 51, id: 'c1' },
    { type: 'switch', x: 17, y: 51, id: 's2' },
    { type: 'door', x: 24, y: 51, props: { link: 's2', h: 3 } },
    { type: 'heli', x: 26, y: 44, props: { range: 1 } },
    { type: 'golden-ball', x: 28, y: 44 },
    // room 3
    { type: 'checkpoint', x: 24, y: 35, id: 'c2' },
    { type: 'bekas-zone', x: 1, y: 21, props: { w: 28, h: 16 } },
    { type: 'paw-sign', x: 27, y: 35 },
    { type: 'scent', x: 22, y: 35 },
    { type: 'scent', x: 17, y: 31 },
    { type: 'scent', x: 12, y: 27 },
    { type: 'scent', x: 8, y: 25 },
    { type: 'minifig', x: 10, y: 35 },
    { type: 'heli', x: 14, y: 26, props: { range: 2 } },
    { type: 'heli', x: 20, y: 25, props: { range: 2 } },
    // room 4
    { type: 'checkpoint', x: 2, y: 19, id: 'c3' },
    { type: 'bekas-zone', x: 1, y: 5, props: { w: 28, h: 16 } },
    { type: 'switch', x: 1, y: 19, id: 's4' },
    { type: 'door', x: 7, y: 19, props: { link: 's4', h: 3 } },
    { type: 'brick-box', x: 8, y: 19, props: { bx: 11, by: 18, bw: 2, bh: 2 } },
    { type: 'brick-box', x: 9, y: 19, props: { bx: 13, by: 16, bw: 2, bh: 4 } },
    { type: 'plate', x: 16, y: 15, id: 'p4' },
    { type: 'minifig', x: 18, y: 15 },
    { type: 'door', x: 22, y: 15, props: { link: 'p4', h: 3 } },
    { type: 'minifig', x: 26, y: 15 },
    { type: 'heli', x: 25, y: 11, props: { range: 2 } },
    { type: 'exit', x: 27, y: 6 },
  ],
};
