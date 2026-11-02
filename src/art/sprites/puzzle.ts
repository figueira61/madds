import { Grid } from '../raster';
import type { SheetDef } from '../pixels';

const single = (key: string, w: number, h: number, frames: string[][], anims?: SheetDef['anims']): SheetDef => ({ key, frameW: w, frameH: h, frames, anims });

/** Crate of loose bricks: wooden box with coloured studs peeking out. */
function brickBox(open: boolean): string[] {
  const g = new Grid(16, 16).rect(0, 4, 16, 12, 'T').rect(1, 5, 14, 10, 'u').rect(1, 9, 14, 1, 'T').rect(7, 5, 1, 10, 'T');
  if (!open) g.rect(2, 2, 3, 3, 'x').rect(6, 1, 3, 4, 'y').rect(10, 2, 3, 3, 'b').set(3, 2, 'R').set(7, 1, 'w').set(11, 2, 'c');
  return g.rows();
}
export const BRICK_BOX_SHEET = single('brick-box', 16, 16, [brickBox(false), brickBox(true)]);

/** Pressure plate: raised (0) / pressed (1). */
export const PLATE_SHEET = single('plate', 16, 6, [
  new Grid(16, 6).rect(2, 1, 12, 3, 'x').rect(2, 1, 12, 1, 'R').rect(0, 4, 16, 2, 'M').rows(),
  new Grid(16, 6).rect(2, 3, 12, 1, 'X').rect(0, 4, 16, 2, 'M').rows(),
]);

/** Door segment (tiled vertically): metal with yellow-black hazard stripes. */
export const DOOR_SHEET = single('door', 16, 16, [
  new Grid(16, 16).rect(0, 0, 16, 16, 'M').rect(1, 0, 14, 16, 'm').rect(1, 6, 14, 4, 'k')
    .set(2, 6, 'y').set(3, 7, 'y').set(4, 8, 'y').set(5, 9, 'y').set(6, 6, 'y').set(7, 7, 'y').set(8, 8, 'y').set(9, 9, 'y').set(10, 6, 'y').set(11, 7, 'y').set(12, 8, 'y').set(13, 9, 'y')
    .rect(2, 1, 2, 2, 'g').rect(12, 1, 2, 2, 'g').rect(2, 13, 2, 2, 'g').rect(12, 13, 2, 2, 'g').rows(),
]);

/** Wall switch hit with the ball: off (red, lever left) / on (green, lever right). */
function lever(on: boolean): string[] {
  const g = new Grid(12, 16).rect(1, 4, 10, 12, 'M').rect(2, 5, 8, 10, 'm').ellipse(5.5, 12, 2.5, 1.5, 'K');
  const knob = on ? 'v' : 'x';
  const dx = on ? 1 : -1;
  for (let i = 0; i < 6; i++) g.set(Math.round(5.5 + dx * i * 0.6), 11 - i, 'k');
  g.ellipse(5.5 + dx * 3.6, 4, 2, 2, knob);
  return g.rows();
}
export const SWITCH_SHEET = single('switch', 12, 16, [lever(false), lever(true)]);

/** Factory press head (2 tiles wide). */
export const PRESS_SHEET = single('press', 32, 14, [
  new Grid(32, 14).rect(0, 0, 32, 10, 'M').rect(1, 1, 30, 8, 'm').rect(0, 10, 32, 4, 'k')
    .rect(2, 11, 28, 2, 'y').set(6, 11, 'k').set(12, 11, 'k').set(18, 11, 'k').set(24, 11, 'k').rect(13, 3, 6, 4, 'g').rows(),
]);
