import { Grid } from '../raster';
import type { SheetDef } from '../pixels';

const single = (key: string, w: number, h: number, frames: string[][], anims?: SheetDef['anims']): SheetDef => ({ key, frameW: w, frameH: h, frames, anims });

/** World 3 walker: a little go-kart with a helmeted robot driver. Faces right. */
function racer(step: number): string[] {
  const g = new Grid(16, 12);
  g.rect(2, 6, 12, 3, 'x').rect(2, 6, 12, 1, 'R').rect(12, 7, 3, 1, 'x'); // body + nose
  g.rect(0, 5, 2, 2, 'K'); // rear wing
  g.ellipse(7, 3, 2.5, 2.5, 'W').rect(8, 3, 2, 1, 'k'); // helmet + visor
  const spoke = step === 0 ? 'w' : 'K';
  for (const cx of [3, 12]) g.ellipse(cx, 9.5, 2, 2, 'k').set(cx, 9, spoke);
  return g.rows();
}

function racerDead(): string[] {
  const g = new Grid(16, 12);
  g.rect(2, 9, 12, 3, 'x').ellipse(4, 6, 2, 2, 'k').ellipse(12, 7, 2, 2, 'k').ellipse(8, 4, 2, 2, 'W').set(6, 1, 'g');
  return g.rows();
}

/** World 3 flyer: a camera drone with four rotors and a red lens. */
function drone(spin: number): string[] {
  const g = new Grid(16, 12);
  for (const x of [1, 11]) g.rect(x, 1, 4, 1, spin === 0 ? 'K' : 'g');
  g.rect(2, 2, 1, 2, 'M').rect(13, 2, 1, 2, 'M');
  g.rect(3, 3, 10, 4, 'm').rect(3, 3, 10, 1, 'W').rect(3, 6, 10, 1, 'M');
  g.ellipse(8, 8.5, 2, 2, 'K').set(8, 8, 'x').set(9, 8, 'R');
  return g.rows();
}

function droneDead(): string[] {
  const g = new Grid(16, 12);
  g.rect(3, 8, 10, 4, 'm').set(2, 5, 'K').set(13, 4, 'K').ellipse(9, 10, 1.5, 1.5, 'x');
  return g.rows();
}

export const RACER_SHEET = single('racer', 16, 12, [racer(0), racer(1), racerDead()], {
  walk: { frames: [0, 1], fps: 10, repeat: -1 },
  dead: { frames: [2], fps: 1, repeat: 0 },
});

export const DRONE_SHEET = single('drone', 16, 12, [drone(0), drone(1), droneDead()], {
  fly: { frames: [0, 1], fps: 16, repeat: -1 },
  dead: { frames: [2], fps: 1, repeat: 0 },
});

/** Race car (side view, facing left: it drives from right to left). Tinted per car by the scene. */
function car(wheel: number): string[] {
  const g = new Grid(32, 16);
  g.rect(3, 8, 26, 4, 'W').rect(3, 8, 26, 1, 'w').rect(0, 10, 4, 2, 'W'); // body + nose
  g.rect(27, 4, 4, 5, 'K').rect(26, 4, 6, 1, 'K'); // rear wing
  g.ellipse(14, 7, 3, 2, 'k').rect(15, 5, 2, 2, 'y'); // cockpit + helmet
  g.rect(18, 9, 5, 2, 'k').set(19, 9, 'w').set(21, 9, 'w'); // number plate
  const spoke = wheel === 0 ? 'M' : 'g';
  for (const cx of [6, 24]) g.ellipse(cx, 12.5, 3, 3, 'k').set(cx, 12, spoke);
  return g.rows();
}
export const CAR_SHEET = single('car', 32, 16, [car(0), car(1)], { drive: { frames: [0, 1], fps: 16, repeat: -1 } });

/** Warning sign shown at the screen edge before a car comes. */
export const CAR_WARN_SHEET = single('car-warn', 12, 12, [
  new Grid(12, 12).ellipse(5.5, 5.5, 5.5, 5.5, 'x').ellipse(5.5, 5.5, 4.5, 4.5, 'w').rect(5, 2, 2, 5, 'k').rect(5, 8, 2, 2, 'k').rows(),
]);

/** Pit-stop checkpoint: lollipop board, red (0) / green (1). */
function pitBoard(on: boolean): string[] {
  const g = new Grid(16, 24);
  g.rect(7, 9, 2, 15, 'M');
  g.ellipse(7.5, 5, 6, 5, 'k').ellipse(7.5, 5, 5, 4, on ? 'v' : 'x').rect(5, 4, 6, 2, 'w');
  return g.rows();
}
export const PIT_SHEET = single('pit', 16, 24, [pitBoard(false), pitBoard(true)]);

/** Golden trophy thrown by the Collector. */
export const TROPHY_SHOT_SHEET = single('trophy-shot', 8, 8, [
  new Grid(8, 8).rect(1, 0, 6, 1, 'l').rect(1, 1, 6, 3, 'L').rect(2, 1, 4, 2, 'l').set(0, 1, 'L').set(7, 1, 'L').rect(3, 4, 2, 2, 'L').rect(2, 6, 4, 2, 'T').rows(),
]);

/** Goal frame with a net (2 tiles wide, 3 tall), opening on the left. */
export const GOAL_SHEET = single('goal', 32, 48, [
  (() => {
    const g = new Grid(32, 48);
    for (let y = 2; y < 48; y += 4) g.rect(2, y, 30, 1, 'W');
    for (let x = 4; x < 32; x += 4) g.rect(x, 2, 1, 46, 'W');
    g.rect(0, 0, 32, 2, 'w').rect(0, 0, 2, 48, 'w').rect(30, 0, 2, 48, 'g');
    return g.rows();
  })(),
]);
