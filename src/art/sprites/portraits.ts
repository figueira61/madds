import { Grid } from '../raster';
import type { SheetDef } from '../pixels';

/** 48×48 dialogue portraits, composed from shapes. */

type Expression = 'neutral' | 'determined' | 'surprised' | 'happy' | 'sad' | 'hands';

function maddsBase(): Grid {
  const g = new Grid(48, 48);
  // long wavy hair behind
  g.ellipse(24, 22, 19, 18, 'h').rect(5, 22, 38, 26, 'h');
  for (const y of [26, 33, 40, 46]) g.ellipse(5, y, 3, 4, 'h').ellipse(42, y, 3, 4, 'h');
  for (const y of [24, 31, 38, 45]) g.set(6, y, 'j').set(7, y + 1, 'j').set(41, y, 'j').set(40, y + 1, 'j');
  // t-shirt with tiger patch
  g.ellipse(24, 51, 19, 9, 'k').ellipse(24, 47, 5, 3, 'o').ellipse(24, 47, 2, 1, 'y');
  // neck and face
  g.rect(20, 33, 8, 7, 'S').ellipse(24, 24, 12, 13, 's');
  for (let y = 18; y < 33; y++) g.set(12 + Math.abs(y - 25) / 3, y, 'S');
  // fringe
  g.ellipse(17, 12, 10, 6, 'h').ellipse(31, 11, 9, 5, 'h').ellipse(24, 9, 12, 5, 'h');
  g.rect(14, 8, 1, 6, 'H').rect(20, 6, 1, 5, 'H').rect(30, 7, 1, 5, 'H').rect(35, 9, 1, 4, 'H');
  // glasses
  for (const x of [13, 27]) g.rect(x, 20, 9, 8, 'g').rect(x + 1, 21, 7, 6, 'G');
  g.rect(22, 22, 5, 1, 'g').rect(11, 22, 2, 1, 'g').rect(36, 22, 2, 1, 'g');
  // nose
  g.rect(24, 29, 2, 1, 'S').set(25, 28, 'S');
  return g;
}

function eyes(g: Grid, e: Expression): void {
  for (const cx of [17, 31]) {
    if (e === 'happy') {
      g.set(cx - 2, 24, 'k').set(cx - 1, 23, 'k').set(cx, 23, 'k').set(cx + 1, 23, 'k').set(cx + 2, 24, 'k');
    } else if (e === 'surprised' || e === 'hands') {
      g.rect(cx - 2, 22, 5, 4, 'w').rect(cx - 1, 23, 2, 2, 'k');
    } else {
      g.rect(cx - 1, 23, 2, 3, 'k').set(cx, 23, 'w');
    }
  }
  if (e === 'determined') {
    g.rect(14, 18, 3, 1, 'j').rect(17, 19, 3, 1, 'j').rect(28, 19, 3, 1, 'j').rect(31, 18, 3, 1, 'j');
  }
  if (e === 'sad') {
    g.rect(14, 19, 3, 1, 'j').rect(17, 18, 3, 1, 'j').rect(28, 18, 3, 1, 'j').rect(31, 19, 3, 1, 'j');
    g.rect(15, 28, 1, 2, 'q');
  }
}

function mouth(g: Grid, e: Expression): void {
  switch (e) {
    case 'happy':
    case 'neutral':
      g.ellipse(24, 32, 6, 3, 'r').rect(18, 29, 13, 3, 's').rect(19, 32, 11, 1, 'w');
      if (e === 'happy') g.rect(15, 29, 3, 1, 'R').rect(31, 29, 3, 1, 'R');
      break;
    case 'determined':
      g.rect(20, 32, 9, 1, 'r').set(29, 31, 'r');
      break;
    case 'surprised':
    case 'hands':
      g.ellipse(24, 33, 2, 2, 'r').rect(24, 33, 1, 1, 'X');
      break;
    case 'sad':
      g.rect(21, 33, 7, 1, 'r').set(20, 34, 'r').set(28, 34, 'r');
      break;
  }
  if (e === 'hands') g.ellipse(11, 31, 4, 5, 's').ellipse(37, 31, 4, 5, 's').rect(9, 33, 5, 1, 'S').rect(35, 33, 5, 1, 'S');
}

function madds(e: Expression): string[] {
  const g = maddsBase();
  eyes(g, e);
  mouth(g, e);
  return g.rows();
}

function bekas(): string[] {
  const g = new Grid(48, 48);
  g.ellipse(24, 46, 16, 8, 'w'); // white chest
  g.ellipse(9, 22, 6, 11, 'k').ellipse(39, 22, 6, 11, 'k'); // floppy ears
  g.ellipse(24, 22, 14, 14, 'k');
  g.rect(22, 8, 5, 22, 'w'); // white blaze
  g.ellipse(24, 33, 9, 7, 'w'); // muzzle
  g.ellipse(24, 28, 3, 2, 'k').set(23, 27, 'K'); // nose
  g.rect(24, 31, 1, 3, 'k').rect(19, 34, 11, 1, 'k');
  g.ellipse(24, 37, 3, 3, 'R').rect(24, 36, 1, 3, 'r'); // tongue
  for (const cx of [16, 32]) g.ellipse(cx, 21, 2, 2, 'K').set(cx - 1, 20, 'w');
  return g.rows();
}

function hunter(): string[] {
  const g = new Grid(48, 48);
  g.ellipse(24, 50, 20, 10, 'V').rect(22, 40, 4, 8, 'F'); // vest
  g.rect(19, 32, 10, 8, 'S').ellipse(24, 24, 11, 12, 's');
  g.ellipse(24, 31, 9, 5, 'z'); // stubble
  g.rect(18, 29, 12, 2, 'T').set(17, 30, 'T').set(30, 30, 'T'); // moustache
  g.rect(19, 33, 10, 1, 'X');
  g.rect(16, 22, 6, 1, 'T').rect(27, 22, 6, 1, 'T'); // frowning brows
  g.rect(17, 24, 4, 1, 'k').rect(28, 24, 4, 1, 'k');
  g.ellipse(24, 12, 13, 7, 'f').rect(6, 15, 36, 3, 'F'); // hat and brim
  g.rect(12, 13, 24, 1, 'F');
  return g.rows();
}

function robot(): string[] {
  const g = new Grid(48, 48);
  g.rect(8, 38, 32, 10, 'x').rect(8, 38, 32, 1, 'R'); // red brick shoulders
  g.rect(10, 8, 28, 28, 'm').rect(10, 8, 28, 2, 'W').rect(10, 34, 28, 2, 'M'); // head
  for (let x = 12; x + 4 <= 38; x += 7) g.rect(x, 5, 4, 3, 'W'); // studs
  g.rect(14, 16, 7, 6, 'x').rect(27, 16, 7, 6, 'x').rect(15, 17, 2, 2, 'R').rect(28, 17, 2, 2, 'R'); // eyes
  g.rect(16, 27, 16, 3, 'k');
  for (let x = 17; x < 32; x += 3) g.rect(x, 27, 1, 3, 'g'); // grille mouth
  g.rect(22, 0, 4, 5, 'M').ellipse(24, 1, 2, 1, 'x'); // antenna
  return g.rows();
}

function collector(): string[] {
  const g = new Grid(48, 48);
  g.ellipse(24, 52, 22, 12, 'p').rect(20, 40, 8, 8, 'w').rect(23, 41, 2, 7, 'x'); // coat, shirt, tie
  g.rect(19, 33, 10, 7, 'S').ellipse(24, 26, 11, 11, 's');
  g.rect(16, 23, 6, 1, 'k').rect(27, 23, 6, 1, 'k'); // eyebrows raised
  g.rect(18, 25, 3, 2, 'k').ellipse(30, 26, 3, 3, 'l').ellipse(30, 26, 2, 2, 'G').set(30, 26, 'k'); // eye + monocle
  g.rect(32, 28, 1, 8, 'l');
  g.rect(17, 31, 14, 2, 'K').set(16, 30, 'K').set(15, 29, 'K').set(31, 30, 'K').set(32, 29, 'K'); // curled moustache
  g.rect(20, 35, 8, 1, 'X'); // smirk
  g.rect(13, 13, 22, 3, 'P').rect(16, 0, 16, 13, 'P').rect(16, 10, 16, 2, 'l'); // top hat with gold band
  return g.rows();
}

export const PORTRAIT_FRAME = {
  'madds-neutral': 0,
  'madds-determined': 1,
  'madds-surprised': 2,
  'madds-happy': 3,
  'madds-sad': 4,
  'madds-hands': 5,
  'bekas-happy': 6,
  hunter: 7,
  robot: 8,
  collector: 9,
} as const;

export type PortraitName = keyof typeof PORTRAIT_FRAME;

export const PORTRAITS_SHEET: SheetDef = {
  key: 'portraits',
  frameW: 48,
  frameH: 48,
  frames: [madds('neutral'), madds('determined'), madds('surprised'), madds('happy'), madds('sad'), madds('hands'), bekas(), hunter(), robot(), collector()],
};
