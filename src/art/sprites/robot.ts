import { Grid } from '../raster';
import type { SheetDef } from '../pixels';

/**
 * The Block Robot, built from stolen bricks. Four looks, one per quarter of HP lost:
 * every hit knocks pieces off until the glowing core shows. Pose: 0/1 walk, 2 stomp (arms up).
 */
function robot(damage: 0 | 1 | 2 | 3, pose: 0 | 1 | 2): string[] {
  const g = new Grid(32, 40);
  const stud = (x: number, y: number, w: number, c: string) => { for (let sx = x + 1; sx + 2 <= x + w; sx += 4) g.rect(sx, y - 1, 2, 1, c); };
  // legs (blue)
  const lift = pose === 1 ? 1 : 0;
  g.rect(8, 30 - lift, 6, 10 + lift, 'b').rect(18, 30 + lift - 1, 6, 10 - lift + 1, 'b');
  g.rect(8, 30 - lift, 6, 1, 'c').rect(18, 29 + lift, 6, 1, 'c');
  g.rect(7, 38, 8, 2, 'B').rect(17, 38, 8, 2, 'B');
  // body (red), core window
  g.rect(5, 16, 22, 14, 'x').rect(5, 16, 22, 1, 'R').rect(5, 29, 22, 1, 'X');
  g.rect(12, 20, 8, 6, 'X').rect(13, 21, 6, 4, damage >= 3 ? 'l' : 'K');
  if (damage >= 3) g.set(15, 22, 'w').set(16, 22, 'y');
  // arms (yellow): raised for the stomp
  const armY = pose === 2 ? 8 : 17;
  if (damage < 1) g.rect(1, armY, 4, 12, 'y').rect(1, armY, 4, 1, 'w').rect(0, armY + 11, 6, 3, 'L');
  if (damage < 2) g.rect(27, armY, 4, 12, 'y').rect(27, armY, 4, 1, 'w').rect(26, armY + 11, 6, 3, 'L');
  // head (grey) with red eyes, studs on top
  g.rect(9, 5, 14, 11, 'm').rect(9, 5, 14, 1, 'W').rect(9, 15, 14, 1, 'M');
  g.rect(11, 9, 3, 3, 'x').rect(18, 9, 3, 3, 'x').set(12, 10, 'R').set(19, 10, 'R');
  g.rect(12, 13, 8, 1, 'k');
  if (damage < 2) stud(9, 5, 14, 'W');
  // missing pieces: holes in the body show the frame underneath
  if (damage >= 2) g.rect(5, 16, 5, 6, '.').rect(22, 24, 5, 6, '.').rect(9, 5, 4, 3, '.');
  if (damage >= 3) g.rect(5, 22, 4, 8, '.').rect(23, 16, 4, 8, '.').rect(19, 5, 4, 4, '.').rect(10, 30, 3, 3, '.');
  return g.rows();
}

const FRAMES: string[][] = [];
for (const d of [0, 1, 2, 3] as const) for (const p of [0, 1, 2] as const) FRAMES.push(robot(d, p));

export const ROBOT_SHEET: SheetDef = {
  key: 'robot',
  frameW: 32,
  frameH: 40,
  frames: FRAMES,
  anims: {
    'walk-0': { frames: [0, 1], fps: 4, repeat: -1 },
    'walk-1': { frames: [3, 4], fps: 4, repeat: -1 },
    'walk-2': { frames: [6, 7], fps: 5, repeat: -1 },
    'walk-3': { frames: [9, 10], fps: 6, repeat: -1 },
  },
};

/** The little core robot left after the defeat: it runs away. */
export const ROBOT_CORE_SHEET: SheetDef = {
  key: 'robot-core',
  frameW: 12,
  frameH: 12,
  frames: [0, 1].map((f) => new Grid(12, 12).rect(2, 2, 8, 6, 'M').rect(3, 3, 6, 4, 'l').set(4, 4, 'w').rect(3, 8, 2, 4 - f, 'K').rect(7, 8, 2, 3 + f, 'K').rect(5, 0, 2, 2, 'M').rows()),
  anims: { run: { frames: [0, 1], fps: 10, repeat: -1 } },
};

export const BRICK_SHOT_SHEET: SheetDef = {
  key: 'brick-shot',
  frameW: 8,
  frameH: 8,
  frames: [new Grid(8, 8).rect(0, 2, 8, 6, 'x').rect(0, 2, 8, 1, 'R').rect(1, 1, 2, 1, 'R').rect(5, 1, 2, 1, 'R').rect(0, 7, 8, 1, 'X').rows()],
};

/** Shockwave of the stomp, sliding along the floor. */
export const SHOCKWAVE_SHEET: SheetDef = {
  key: 'shockwave',
  frameW: 16,
  frameH: 10,
  frames: [0, 1].map((f) => {
    const g = new Grid(16, 10);
    for (let x = 0; x < 16; x++) {
      const h = Math.round(4 + 4 * Math.abs(Math.sin((x + f * 4) / 3)));
      g.rect(x, 10 - h, 1, h, x % 3 === f ? 'W' : 'm');
    }
    return g.rows();
  }),
  anims: { roll: { frames: [0, 1], fps: 12, repeat: -1 } },
};
