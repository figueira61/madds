import { withRows, type SheetDef } from '../pixels';

/*
 * Madds, 16×24, facing right. Long wavy brown hair (h/H/j), grey glasses (g/G/k),
 * big smile, black tiger t-shirt (k/o/y), wide denim (d/D), black sneakers with white soles.
 */

const HEAD = [
  '....jjjjjjj.....',
  '...jhhHHHhhj....',
  '..jhhHHhhhhhj...',
  '.jhhhhhhhhhhhj..',
  '.jhhhhsssssshj..',
  '.jhhhsssssssshj.',
  '.jhhhgGkgsgGkgj.',
  '.jhhhsssssssSsj.',
  '.jhhhssrwwwrssj.',
  '.jhhhhsssssshhj.',
  '.jhhhhhSsShhhj..',
];

const TORSO = [
  '.jhhkkkkkkkkhhj.',
  '.jhkkkkookkkkhj.',
  '.jhskkoyyokkks..',
  '.jhskkkookkkks..',
  '..jskkkkkkkkks..',
];

const LEGS_STAND = [
  '...sDDDDDDDDs...',
  '...dddddddddd...',
  '...ddddDDdddd...',
  '...dddd..dddd...',
  '..ddddd..ddddd..',
  '..ddddd..ddddd..',
  '..kkkkk..kkkkk..',
  '..wwwwww.wwwwww.',
];

const LEGS_RUN1 = [
  '...sDDDDDDDDs...',
  '...dddddddddd...',
  '..dddddddddddd..',
  '..dddd....dddd..',
  '.dddd......dddd.',
  '.dddd......dddd.',
  'kkkk........kkkk',
  'www..........www',
];

const LEGS_RUN2 = [
  '...sDDDDDDDDs...',
  '...dddddddddd...',
  '....dddddddd....',
  '.....dddddd.....',
  '.....dddddd.....',
  '.....dddddd.....',
  '....kkkkkkk.....',
  '....wwwwwww.....',
];

const LEGS_JUMP = [
  '...sDDDDDDDDs...',
  '...dddddddddd...',
  '..dddddddddddd..',
  '..ddddd.dddddd..',
  '...kkkk..dddd...',
  '...wwww..kkkk...',
  '.........wwww...',
  '................',
];

const LEGS_KICK_WINDUP = [
  '...sDDDDDDDDs...',
  '..dddddddddd....',
  '.ddddd.dddd.....',
  'kdddd..dddd.....',
  'wkk....dddd.....',
  '.......dddd.....',
  '.......kkkkk....',
  '.......wwwwww...',
];

const LEGS_KICK = [
  '...sDDDDDDDDs...',
  '...dddddddddddd.',
  '...dddd.....dddk',
  '...dddd......kkw',
  '...dddd.........',
  '..ddddd.........',
  '..kkkkk.........',
  '..wwwwww........',
];

function frame(head: string[], torso: string[], legs: string[]): string[] {
  return [...head, ...torso, ...legs];
}

const HEAD_WIND = withRows(HEAD, { 0: '..j.jjjjjjj.....', 1: '.j.jhhHHHhhj....' });
const HEAD_HURT = withRows(HEAD, { 6: '.jhhhgGGgsgGGgj.', 8: '.jhhhssssrrsssj.' });
const HEAD_SAD = withRows(HEAD, { 8: '.jhhhsssssrsssj.' });
const HEAD_SAD_BLINK = withRows(HEAD_SAD, { 6: '.jhhhgGGgsgGGgj.' });
const HEAD_HAPPY = withRows(HEAD, { 6: '.jhhhgGGgsgGGgj.', 7: '.jhhhRssssssRsj.' });

const TORSO_PHOTO = withRows(TORSO, { 1: '.jhkkkkookkwkkw.', 2: '.jhskkoyyoswwww.' });
const TORSO_COOKIE = withRows(TORSO, { 3: '.jhskkkookkkksu.' });
const TORSO_GIVE = withRows(TORSO, { 3: '.jhskkkookkkkss.' });
const TORSO_HUG = withRows(TORSO, { 2: '.jhkkkoyyokkkss.', 3: '.jhkkkkookkkkss.' });

const BACK = [
  '....jjjjjjj.....',
  '...jhhHHHhhj....',
  '..jhhhHhhhhhj...',
  '..jhhhhhhHhhj...',
  '..jhhHhhhhhhj...',
  '..jhhhhhhhhhj...',
  '..jhhhhhHhhhj...',
  '..jhhhhhhhhhj...',
  '..jhHhhhhhhhj...',
  '..jhhhhhhhHhj...',
  '..jhhhHhhhhhj...',
  '.jhhhhhhhhhhhj..',
  '.jhhHhhhhHhhhj..',
  '.sjhhhhhhhhhjs..',
  '.skjhhhhhhhjks..',
  '..kkjhjhjhjkk...',
];

export const MADDS_FRAMES = [
  frame(HEAD, TORSO, LEGS_STAND), // 0 idle a
  frame(withRows(HEAD, { 1: '...jhhHHHhhj....', 3: '.jhhhHhhhhhhhj..' }), withRows(TORSO, { 0: '.jhhkkkkkkkkhHj.' }), LEGS_STAND), // 1 idle b
  frame(HEAD_WIND, TORSO, LEGS_RUN1), // 2 run 1
  frame(HEAD, TORSO, LEGS_RUN2), // 3 run 2
  frame(HEAD_WIND, TORSO, withRows(LEGS_RUN1, { 2: '..ddddDDDDdddd..' })), // 4 run 3
  frame(HEAD, TORSO, LEGS_JUMP), // 5 jump
  frame(HEAD_WIND, TORSO, LEGS_STAND), // 6 fall
  [...BACK, ...LEGS_STAND], // 7 wall
  frame(HEAD, TORSO, LEGS_KICK_WINDUP), // 8 kick a
  frame(HEAD, TORSO, LEGS_KICK), // 9 kick b
  frame(HEAD_HURT, TORSO, LEGS_STAND), // 10 hurt
  frame(HEAD_SAD, TORSO_PHOTO, LEGS_STAND), // 11 photo a
  frame(HEAD_SAD_BLINK, TORSO_PHOTO, LEGS_STAND), // 12 photo b
  frame(HEAD, TORSO_COOKIE, LEGS_STAND), // 13 cookie a
  frame(HEAD_HAPPY, TORSO_GIVE, LEGS_STAND), // 14 cookie b
  frame(HEAD_HAPPY, TORSO_HUG, LEGS_STAND), // 15 hug a
  frame(withRows(HEAD_HAPPY, { 8: '.jhhhsrwwwwrssj.' }), TORSO_HUG, LEGS_STAND), // 16 hug b
];

export const MADDS_ANIMS: SheetDef['anims'] = {
  idle: { frames: [0, 0, 0, 1], fps: 3, repeat: -1 },
  run: { frames: [2, 3, 4, 3], fps: 10, repeat: -1 },
  jump: { frames: [5], fps: 1, repeat: 0 },
  fall: { frames: [6], fps: 1, repeat: 0 },
  wall: { frames: [7], fps: 1, repeat: 0 },
  kick: { frames: [8, 9, 9], fps: 16, repeat: 0 },
  hurt: { frames: [10], fps: 1, repeat: 0 },
  photo: { frames: [11, 11, 11, 12], fps: 2, repeat: -1 },
  cookie: { frames: [13, 14], fps: 2, repeat: 0 },
  hug: { frames: [15, 16], fps: 3, repeat: -1 },
};

export const MADDS_SHEET: SheetDef = { key: 'madds', frameW: 16, frameH: 24, frames: MADDS_FRAMES, anims: MADDS_ANIMS };
