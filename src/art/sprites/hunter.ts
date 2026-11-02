import { Grid } from '../raster';
import type { SheetDef } from '../pixels';

/** The Hunter, the Collector's henchman: 24×32, khaki hat, green vest, net bag. Faces right. */

type Pose = 'idle' | 'walk1' | 'walk2' | 'throw1' | 'throw2' | 'jump' | 'hurt' | 'defeated';

function hunter(pose: Pose): string[] {
  const g = new Grid(24, 32);
  const dy = pose === 'jump' ? -1 : 0;
  // legs
  if (pose === 'walk1') g.rect(7, 23, 4, 7, 'F').rect(14, 23, 4, 6, 'F').rect(5, 29, 6, 2, 'T').rect(14, 28, 6, 2, 'T');
  else if (pose === 'walk2') g.rect(9, 23, 4, 6, 'F').rect(12, 23, 4, 7, 'F').rect(9, 28, 6, 2, 'T').rect(12, 29, 6, 2, 'T');
  else if (pose === 'jump') g.rect(7, 22, 4, 5, 'F').rect(14, 22, 4, 5, 'F').rect(6, 26, 6, 2, 'T').rect(14, 26, 6, 2, 'T');
  else g.rect(8, 23, 4, 7, 'F').rect(13, 23, 4, 7, 'F').rect(7, 29, 6, 2, 'T').rect(13, 29, 6, 2, 'T');
  // body and vest
  g.rect(6, 13 + dy, 13, 11, 'f').rect(7, 14 + dy, 4, 9, 'V').rect(14, 14 + dy, 4, 9, 'V').rect(6, 22 + dy, 13, 2, 'T');
  g.rect(8, 16 + dy, 2, 2, 'n').rect(15, 16 + dy, 2, 2, 'n');
  // head
  g.ellipse(13, 9 + dy, 4, 4, 's').rect(14, 11 + dy, 4, 1, 'T').rect(12, 12 + dy, 5, 1, 'z');
  g.set(15, 8 + dy, pose === 'hurt' || pose === 'defeated' ? 'X' : 'k');
  // hat
  g.ellipse(12, 5 + dy, 6, 2, 'f').rect(5, 6 + dy, 15, 1, 'F');
  // arms
  if (pose === 'throw1') g.rect(2, 9 + dy, 4, 3, 'f').rect(1, 7 + dy, 3, 3, 's').rect(0, 3 + dy, 5, 5, 'u');
  else if (pose === 'throw2') g.rect(18, 12 + dy, 5, 3, 'f').rect(21, 12 + dy, 3, 3, 's');
  else if (pose === 'hurt') g.rect(3, 10 + dy, 3, 5, 'f').rect(19, 10 + dy, 3, 5, 'f');
  else g.rect(4, 14 + dy, 3, 7, 'f').rect(18, 14 + dy, 3, 7, 'f').rect(4, 20 + dy, 3, 2, 's').rect(18, 20 + dy, 3, 2, 's');
  // net bag on the back
  if (pose !== 'throw1') g.rect(1, 14 + dy, 4, 7, 'u').set(2, 16 + dy, 'T').set(3, 18 + dy, 'T');
  if (pose === 'defeated') g.set(10, 1, 'y').set(16, 0, 'y').set(19, 2, 'y'); // dizzy stars
  return g.rows();
}

export const HUNTER_SHEET: SheetDef = {
  key: 'hunter',
  frameW: 24,
  frameH: 32,
  frames: (['idle', 'walk1', 'walk2', 'throw1', 'throw2', 'jump', 'hurt', 'defeated'] as Pose[]).map(hunter),
  anims: {
    idle: { frames: [0], fps: 1, repeat: -1 },
    walk: { frames: [1, 2], fps: 6, repeat: -1 },
    throw: { frames: [3, 4], fps: 6, repeat: 0 },
    jump: { frames: [5], fps: 1, repeat: 0 },
    hurt: { frames: [6], fps: 1, repeat: 0 },
    defeated: { frames: [7], fps: 1, repeat: 0 },
  },
};

function net(phase: number): string[] {
  const g = new Grid(12, 12);
  g.ellipse(5.5, 5.5, 5, 5, 'u');
  for (let i = 0; i < 12; i++) {
    for (let j = 0; j < 12; j++) {
      const lattice = phase === 0 ? (i + j) % 3 === 0 || (i - j + 12) % 3 === 0 : i % 3 === 0 || j % 3 === 0;
      if (!lattice && g.rows()[j][i] === 'u') g.set(i, j, '.');
    }
  }
  g.set(0, 5, 'M').set(11, 6, 'M');
  return g.rows();
}

export const NET_SHEET: SheetDef = {
  key: 'net',
  frameW: 12,
  frameH: 12,
  frames: [net(0), net(1)],
  anims: { spin: { frames: [0, 1], fps: 10, repeat: -1 } },
};
