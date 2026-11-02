import { Grid } from '../raster';
import type { SheetDef } from '../pixels';

function ball(turn: number, body: string, patch: string, shine: string): string[] {
  const g = new Grid(8, 8).ellipse(3.5, 3.5, 3.5, 3.5, body);
  const patches = turn === 0 ? [[3, 3], [1, 1], [5, 1], [1, 5], [5, 5]] : [[3, 1], [1, 3], [5, 3], [3, 5]];
  for (const [x, y] of patches) g.set(x, y, patch).set(x + 1, y, patch);
  return g.set(2, 1, shine).rows();
}

const single = (key: string, w: number, h: number, frames: string[][], anims?: SheetDef['anims']): SheetDef => ({ key, frameW: w, frameH: h, frames, anims });

export const BALL_SHEET = single('ball', 8, 8, [ball(0, 'w', 'k', 'w'), ball(1, 'w', 'k', 'w')], { spin: { frames: [0, 1], fps: 12, repeat: -1 } });

export const GOLDEN_BALL_SHEET = single('golden-ball', 8, 8, [ball(0, 'l', 'L', 'w'), ball(1, 'l', 'L', 'y')], { shine: { frames: [0, 1], fps: 4, repeat: -1 } });

function cromo(shine: boolean): string[] {
  const g = new Grid(12, 14).rect(0, 0, 12, 14, 'L').rect(1, 1, 10, 12, 'b');
  g.ellipse(5.5, 5, 2, 2, 's').rect(4, 7, 4, 4, 'c').rect(3, 3, 6, 2, 'h'); // little player figure
  g.rect(1, 11, 10, 2, 'w').rect(4, 11, 4, 1, 'b');
  if (shine) g.set(9, 2, 'w').set(10, 1, 'w').set(8, 1, 'y');
  return g.rows();
}
export const CROMO_SHEET = single('cromo', 12, 14, [cromo(false), cromo(true)], { shine: { frames: [0, 0, 1], fps: 4, repeat: -1 } });

function cage(open: boolean): string[] {
  const g = new Grid(24, 24).rect(0, 0, 24, 2, 'M').rect(0, 22, 24, 2, 'M');
  for (let x = 0; x < 24; x += 4) if (!open || x < 4) g.rect(x, 2, 2, 20, 'm');
  g.rect(22, 2, 2, 20, 'm');
  if (open) g.rect(4, 2, 2, 20, 'M');
  else g.rect(16, 10, 5, 5, 'l').rect(17, 8, 3, 2, 'L').set(18, 12, 'k'); // padlock
  return g.rows();
}
export const CAGE_SHEET = single('cage', 24, 24, [cage(false), cage(true)]);

function checkpoint(raised: boolean): string[] {
  const g = new Grid(16, 24).rect(3, 2, 2, 22, 'M').rect(1, 22, 6, 2, 'T');
  const y = raised ? 2 : 15;
  g.rect(5, y, 9, 6, 'b').rect(5, y + 2, 9, 2, 'w').set(13, y + 1, 'B');
  return g.rows();
}
export const CHECKPOINT_SHEET = single('checkpoint', 16, 24, [checkpoint(false), checkpoint(true)]);

function exitSign(): string[] {
  const g = new Grid(16, 24).rect(7, 10, 2, 14, 'T');
  g.rect(0, 2, 16, 9, 'u').rect(0, 2, 16, 1, 'T').rect(0, 10, 16, 1, 'T');
  g.rect(3, 6, 7, 1, 'w').rect(9, 4, 1, 5, 'w').rect(10, 5, 1, 3, 'w').set(11, 6, 'w');
  return g.rows();
}
export const EXIT_SHEET = single('exit', 16, 24, [exitSign()]);

function log(): string[] {
  const g = new Grid(48, 10).rect(2, 1, 44, 8, 't').rect(2, 1, 44, 1, 'u').rect(2, 8, 44, 1, 'T');
  g.ellipse(2, 4.5, 2, 4, 'u').ellipse(2, 4.5, 1, 2, 'T').ellipse(45, 4.5, 2, 4, 'u').ellipse(45, 4.5, 1, 2, 'T');
  for (const x of [10, 22, 34]) g.rect(x, 3, 5, 1, 'T');
  return g.rows();
}
export const LOG_SHEET = single('log', 48, 10, [log()]);

export const COOKIE_SHEET = single('cookie', 6, 6, [new Grid(6, 6).ellipse(2.5, 2.5, 2.5, 2.5, 'u').set(1, 2, 'T').set(3, 1, 'T').set(3, 4, 'T').rows()]);

export const PHOTO_SHEET = single('photo', 8, 6, [
  new Grid(8, 6).rect(0, 0, 8, 6, 'w').rect(1, 1, 6, 4, 'a').ellipse(4, 3, 2, 2, 'k').rect(4, 2, 1, 3, 'w').rows(),
]);

export const HEART_PARTICLE_SHEET = single('heart-particle', 7, 6, [
  ['.xx.xx.', 'xRxxxxx', 'xxxxxxx', '.xxxxx.', '..xxx..', '...x...'],
]);

function paw(): string[] {
  const g = new Grid(16, 16).rect(0, 0, 16, 16, 'u').rect(0, 0, 16, 1, 'T').rect(0, 15, 16, 1, 'T');
  g.ellipse(8, 10, 3, 3, 'k');
  for (const [x, y] of [[4, 6], [7, 4], [10, 4], [12, 7]]) g.ellipse(x, y, 1, 1, 'k');
  return g.rows();
}
export const BEKAS_SIGN_SHEET = single('bekas-sign', 16, 16, [paw()]);

function heart(full: boolean): string[] {
  const g = new Grid(12, 11);
  const fill = full ? 'x' : 'K';
  g.ellipse(3, 3, 3, 3, 'k').ellipse(8, 3, 3, 3, 'k');
  for (let y = 4; y < 11; y++) g.rect(y - 4, y, 12 - 2 * (y - 4), 1, 'k');
  g.ellipse(3, 3, 2, 2, fill).ellipse(8, 3, 2, 2, fill);
  for (let y = 4; y < 10; y++) g.rect(y - 3, y, 10 - 2 * (y - 4), 1, fill);
  if (full) g.set(2, 2, 'w');
  return g.rows();
}
export const HEART_SHEET = single('heart', 12, 11, [heart(true), heart(false)]);

export const PARTICLE_SHEET = single('particle', 3, 3, [
  ['.w.', 'www', '.w.'],
  ['.y.', 'yly', '.y.'],
  ['.c.', 'cbc', '.c.'],
  ['tT.', 'Ttu', '.u.'],
  ['mM.', 'Mmg', '.g.'],
]);
