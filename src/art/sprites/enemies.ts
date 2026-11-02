import { Grid } from '../raster';
import type { SheetDef } from '../pixels';

/** The Collector's robot creatures: a clockwork beetle and a drone bird. Both face right. */

function beetle(step: number): string[] {
  const g = new Grid(16, 12);
  g.ellipse(7, 6, 6, 4, 'X').ellipse(7, 5, 5, 3, 'x').rect(7, 2, 1, 7, 'X'); // shell
  g.set(4, 4, 'w').set(10, 4, 'w');
  g.ellipse(13, 7, 2, 2, 'M').set(14, 6, 'l'); // head with yellow eye
  g.rect(15, 4, 1, 2, 'M').set(14, 3, 'M'); // antenna
  const legs = step === 0 ? [2, 6, 10] : [3, 7, 11];
  for (const x of legs) g.rect(x, 10, 1, 2, 'k');
  for (const x of legs) g.set(x + (step === 0 ? 1 : -1), 11, 'k');
  return g.rows();
}

function beetleDead(): string[] {
  const g = new Grid(16, 12);
  g.ellipse(7, 9, 6, 2, 'X').ellipse(7, 9, 5, 1, 'x');
  g.set(3, 6, 'M').set(9, 5, 'M').set(12, 7, 'l').set(6, 4, 'g');
  return g.rows();
}

function bird(wingUp: boolean): string[] {
  const g = new Grid(16, 12);
  g.ellipse(7, 7, 5, 3, 'M').ellipse(7, 6, 4, 2, 'm');
  g.ellipse(12, 5, 2, 2, 'm').set(13, 5, 'x'); // head with red eye
  g.rect(14, 6, 2, 1, 'l'); // beak
  g.rect(1, 6, 2, 1, 'M').set(0, 5, 'M'); // tail
  if (wingUp) g.rect(5, 1, 4, 3, 'g').rect(6, 0, 2, 1, 'g');
  else g.rect(5, 8, 4, 3, 'g').rect(6, 11, 2, 1, 'g');
  g.rect(6, 10, 1, 1, 'K');
  return g.rows();
}

function birdDead(): string[] {
  const g = new Grid(16, 12);
  g.ellipse(7, 8, 5, 3, 'M').set(12, 7, 'k').set(11, 6, 'k').set(13, 6, 'k');
  g.set(4, 3, 'y').set(10, 2, 'y');
  return g.rows();
}

export const BEETLE_SHEET: SheetDef = {
  key: 'beetle',
  frameW: 16,
  frameH: 12,
  frames: [beetle(0), beetle(1), beetleDead()],
  anims: { walk: { frames: [0, 1], fps: 6, repeat: -1 }, dead: { frames: [2], fps: 1, repeat: 0 } },
};

export const BIRD_SHEET: SheetDef = {
  key: 'bird',
  frameW: 16,
  frameH: 12,
  frames: [bird(true), bird(false), birdDead()],
  anims: { fly: { frames: [0, 1], fps: 8, repeat: -1 }, dead: { frames: [2], fps: 1, repeat: 0 } },
};


/** World 2: a walking block figure (stud on the head, red brick body) and a block helicopter. */
function minifig(step: number): string[] {
  const g = new Grid(16, 12);
  g.rect(6, 0, 4, 1, 'L'); // stud
  g.rect(5, 1, 6, 4, 'y').set(9, 2, 'k').set(7, 2, 'k').rect(7, 4, 3, 1, 'L'); // head, eyes, frown
  g.rect(4, 5, 8, 4, 'x').rect(4, 5, 8, 1, 'R').rect(3, 6, 1, 2, 'x').rect(12, 6, 1, 2, 'x'); // body, arms
  g.rect(3, 8, 1, 1, 'y').rect(12, 8, 1, 1, 'y'); // hands
  if (step === 0) g.rect(5, 9, 2, 3, 'b').rect(9, 9, 2, 3, 'b');
  else g.rect(4, 9, 2, 3, 'b').rect(10, 9, 2, 3, 'b');
  return g.rows();
}

function minifigDead(): string[] {
  const g = new Grid(16, 12);
  g.rect(2, 9, 6, 3, 'x').rect(9, 10, 4, 2, 'b').rect(11, 6, 4, 3, 'y').set(12, 7, 'k').rect(12, 5, 2, 1, 'L');
  return g.rows();
}

function heli(rotor: number): string[] {
  const g = new Grid(16, 12);
  if (rotor === 0) g.rect(1, 0, 14, 1, 'K');
  else g.rect(5, 0, 6, 1, 'K');
  g.rect(7, 1, 2, 2, 'M'); // mast
  g.rect(4, 3, 8, 5, 'b').rect(4, 3, 8, 1, 'c').rect(9, 4, 3, 2, 'G'); // cabin + window
  g.rect(0, 4, 4, 2, 'b').rect(0, 2, 1, 3, 'x'); // tail
  g.rect(4, 9, 9, 1, 'K').set(5, 8, 'K').set(11, 8, 'K'); // skids
  return g.rows();
}

function heliDead(): string[] {
  const g = new Grid(16, 12);
  g.rect(3, 7, 9, 4, 'b').rect(9, 8, 2, 2, 'G').set(2, 4, 'K').set(13, 3, 'K').set(6, 5, 'g');
  return g.rows();
}

export const MINIFIG_SHEET: SheetDef = {
  key: 'minifig',
  frameW: 16,
  frameH: 12,
  frames: [minifig(0), minifig(1), minifigDead()],
  anims: { walk: { frames: [0, 1], fps: 6, repeat: -1 }, dead: { frames: [2], fps: 1, repeat: 0 } },
};

export const HELI_SHEET: SheetDef = {
  key: 'heli',
  frameW: 16,
  frameH: 12,
  frames: [heli(0), heli(1), heliDead()],
  anims: { fly: { frames: [0, 1], fps: 14, repeat: -1 }, dead: { frames: [2], fps: 1, repeat: 0 } },
};
