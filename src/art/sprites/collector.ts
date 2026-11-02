import { Grid } from '../raster';
import type { SheetDef } from '../pixels';

/**
 * The Collector, 32×40, facing right: purple velvet coat, top hat with a gold band, monocle,
 * curled moustache. Frames: 0–1 hovering on his golden throne, 2 throwing, 3 hurt,
 * 4–5 goalkeeper (arms out / arms up), 6 defeated (on his knees), 7–8 running away.
 */
function body(g: Grid, ox: number, oy: number, arms: 'side' | 'throw' | 'out' | 'up' | 'down'): void {
  g.rect(ox + 11, oy + 0, 10, 9, 'P').rect(ox + 9, oy + 8, 14, 2, 'P').rect(ox + 11, oy + 6, 10, 1, 'l'); // hat
  g.ellipse(ox + 16, oy + 13, 5, 4, 's'); // face
  g.rect(ox + 13, oy + 12, 2, 1, 'k').ellipse(ox + 19, oy + 12, 1.5, 1.5, 'l').set(ox + 19, oy + 12, 'G'); // eye + monocle
  g.rect(ox + 12, oy + 15, 9, 1, 'K').set(ox + 11, oy + 14, 'K').set(ox + 21, oy + 14, 'K'); // moustache
  g.rect(ox + 10, oy + 17, 12, 10, 'p').rect(ox + 15, oy + 17, 2, 8, 'w').rect(ox + 15, oy + 18, 2, 4, 'x'); // coat, shirt, tie
  const arm = (x: number, y: number, w: number, h: number) => g.rect(ox + x, oy + y, w, h, 'P');
  if (arms === 'side') { arm(7, 18, 3, 8); arm(22, 18, 3, 8); }
  if (arms === 'throw') { arm(7, 18, 3, 8); arm(22, 12, 3, 7).rect(ox + 22, oy + 9, 3, 3, 's'); }
  if (arms === 'out') { arm(2, 18, 8, 3); arm(22, 18, 8, 3); g.rect(ox + 0, oy + 18, 2, 3, 'w').rect(ox + 30, oy + 18, 2, 3, 'w'); }
  if (arms === 'up') { arm(7, 9, 3, 9); arm(22, 9, 3, 9); g.rect(ox + 7, oy + 6, 3, 3, 'w').rect(ox + 22, oy + 6, 3, 3, 'w'); }
  if (arms === 'down') { arm(8, 20, 3, 6); arm(21, 20, 3, 6); }
}

function hover(flame: number): string[] {
  const g = new Grid(32, 40);
  body(g, 0, 0, 'side');
  g.rect(6, 26, 20, 5, 'l').rect(6, 26, 20, 1, 'w').rect(4, 22, 3, 9, 'L').rect(25, 22, 3, 9, 'L'); // throne
  g.rect(10, 31, 12, 2, 'L');
  g.rect(12, 33, 3, 3 + flame, 'o').rect(18, 33, 3, 4 - flame, 'o').set(13, 35, 'y').set(19, 35, 'y'); // jets
  return g.rows();
}

function standing(arms: 'throw' | 'out' | 'up' | 'side', step = 0): string[] {
  const g = new Grid(32, 40);
  body(g, 0, 5, arms === 'side' ? 'side' : arms);
  g.rect(11, 32, 4, 6 - step, 'K').rect(17, 32, 4, 6 + step - 1, 'K').rect(10, 38 - step, 6, 2, 'k').rect(16, 37 + step, 6, 2, 'k');
  return g.rows();
}

function hurt(): string[] {
  const g = new Grid(32, 40);
  body(g, 1, 6, 'up');
  g.rect(12, 33, 4, 5, 'K').rect(17, 33, 4, 5, 'K').rect(11, 38, 6, 2, 'k').rect(16, 38, 6, 2, 'k');
  g.set(4, 4, 'y').set(27, 6, 'y').set(25, 2, 'w');
  return g.rows();
}

function defeated(): string[] {
  const g = new Grid(32, 40);
  body(g, 0, 10, 'down');
  g.rect(9, 36, 14, 4, 'K'); // kneeling
  g.rect(24, 32, 6, 1, 'P').rect(25, 26, 4, 6, 'P'); // hat fallen off to the side
  return g.rows();
}

export const COLLECTOR_SHEET: SheetDef = {
  key: 'collector',
  frameW: 32,
  frameH: 40,
  frames: [hover(0), hover(1), standing('throw'), hurt(), standing('out'), standing('up'), defeated(), standing('side', 0), standing('side', 1)],
  anims: {
    hover: { frames: [0, 1], fps: 8, repeat: -1 },
    keeper: { frames: [4, 5], fps: 3, repeat: -1 },
    run: { frames: [7, 8], fps: 10, repeat: -1 },
  },
};

/** The big trophy he drops when beaten (and Madds lifts at the end). */
export const TROPHY_SHEET: SheetDef = {
  key: 'trophy',
  frameW: 16,
  frameH: 20,
  frames: [
    new Grid(16, 20)
      .rect(2, 0, 12, 2, 'l').rect(3, 2, 10, 6, 'L').rect(4, 2, 8, 5, 'l').set(5, 3, 'w')
      .rect(0, 2, 2, 4, 'L').rect(14, 2, 2, 4, 'L').rect(1, 6, 2, 1, 'L').rect(13, 6, 2, 1, 'L')
      .rect(6, 8, 4, 5, 'L').rect(4, 13, 8, 2, 'l').rect(3, 15, 10, 5, 'T').rect(5, 16, 6, 2, 'l').rows(),
  ],
};
