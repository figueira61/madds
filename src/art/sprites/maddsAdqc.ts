import { withRows, type SheetDef } from '../pixels';
import { MADDS_FRAMES } from './madds';

/*
 * Madds in the A.D.Q.C. kit, 16×24, facing right: ponytail, glasses, blue shirt with white
 * V-collar and trims, white crest, number 11 on the back, blue shorts and high socks, black boots.
 */

const HEAD = [
  '....jjjjjjj.....',
  '...jhhHHHhhj....',
  '..jhhHhhhhhhj...',
  '.jjhhhhhhhhhhj..',
  'jhjhhhssssssshj.',
  'jhjhhsssssssshj.',
  '.hjhhgGkgsgGkgj.',
  '.hjhhsssssssSsj.',
  '..jhhssrwwwrssj.',
  '...jhhsssssshj..',
  '.....jSsSsj.....',
];

const HEAD_SWING = withRows(HEAD, { 3: '.jjhhhhhhhhhhj..', 4: '.jjhhhssssssshj.', 5: '..jhhsssssssshj.', 6: 'jhjhhgGkgsgGkgj.', 7: 'jhjhhsssssssSsj.' });
const HEAD_HURT = withRows(HEAD, { 6: '.hjhhgGGgsgGGgj.', 8: '..jhhssssrrsssj.' });

const TORSO = [
  '..wbbbbwwbbbbw..',
  '..wbbbbbwbbbbw..',
  '..sbbbbbbbwbbs..',
  '..sbbbbbbbbbbs..',
  '..sBbbbbbbbbBs..',
];

const LEGS_STAND = [
  '...sbbbbbbbbs...',
  '....bbbbbbbb....',
  '....bbb..bbb....',
  '....sss..sss....',
  '....bbb..bbb....',
  '....bbb..bbb....',
  '...kkkk..kkkk...',
  '...kKkK..kKkK...',
];

const LEGS_RUN1 = [
  '...sbbbbbbbbs...',
  '...bbbbbbbbbb...',
  '..bbbb....bbbb..',
  '..sss......sss..',
  '.bbb........bbb.',
  '.bbb........bbb.',
  'kkkk........kkkk',
  'KkK..........kKK',
];

const LEGS_RUN2 = [
  '...sbbbbbbbbs...',
  '....bbbbbbbb....',
  '.....bbbbbb.....',
  '.....ssssss.....',
  '......bbbb......',
  '......bbbb......',
  '.....kkkkk......',
  '.....kKkKk......',
];

const LEGS_JUMP = [
  '...sbbbbbbbbs...',
  '....bbbbbbbb....',
  '...bbbb.bbbb....',
  '...sss...sss....',
  '..bbbb...bbbb...',
  '..kkkk...kkkk...',
  '..KkK.....KkK...',
  '................',
];

const LEGS_KICK_WINDUP = [
  '...sbbbbbbbbs...',
  '...bbbbbbbbb....',
  '..bbbb..bbb.....',
  '.sss....sss.....',
  'kbb.....bbb.....',
  'Kk......bbb.....',
  '.......kkkk.....',
  '.......kKkK.....',
];

const LEGS_KICK = [
  '...sbbbbbbbbs...',
  '....bbbbbbbbbbb.',
  '....bbb....sssbk',
  '....sss......kkK',
  '....bbb.........',
  '....bbb.........',
  '...kkkk.........',
  '...kKkK.........',
];

const BACK = [
  '....jjjjjjj.....',
  '...jhhHHHhhj....',
  '..jhhhHhhhhhj...',
  '..jhhhhhhhhhj...',
  '..jhhhhhhhhhj...',
  '..jhhhhhhhhhj...',
  '...jhhhhhhhj....',
  '....jhhhhhj.....',
  '.....jhhHj......',
  '......jhhj......',
  '......SjhS......',
  '..wbbbbjhbbbw...',
  '..wbbwbbwbbbw...',
  '..sbbwbbwbbbs...',
  '..sbbwbbwbbbs...',
  '..sbbbbbbbbbs...',
];

function frame(head: string[], torso: string[], legs: string[]): string[] {
  return [...head, ...torso, ...legs];
}

const ADQC_FRAMES = [
  frame(HEAD, TORSO, LEGS_STAND), // 0 idle a
  frame(HEAD_SWING, TORSO, LEGS_STAND), // 1 idle b
  frame(HEAD_SWING, TORSO, LEGS_RUN1), // 2 run 1
  frame(HEAD, TORSO, LEGS_RUN2), // 3 run 2
  frame(HEAD_SWING, TORSO, withRows(LEGS_RUN1, { 2: '..bbbBBBBBbbbb..' })), // 4 run 3
  frame(HEAD_SWING, TORSO, LEGS_JUMP), // 5 jump
  frame(HEAD, TORSO, LEGS_STAND), // 6 fall
  [...BACK, ...LEGS_STAND], // 7 wall (number 11 visible)
  frame(HEAD, TORSO, LEGS_KICK_WINDUP), // 8 kick a
  frame(HEAD_SWING, TORSO, LEGS_KICK), // 9 kick b
  frame(HEAD_HURT, TORSO, LEGS_STAND), // 10 hurt
];

const ANIMS: SheetDef['anims'] = {
  idle: { frames: [0, 0, 1, 0], fps: 3, repeat: -1 },
  run: { frames: [2, 3, 4, 3], fps: 12, repeat: -1 },
  jump: { frames: [5], fps: 1, repeat: 0 },
  fall: { frames: [6], fps: 1, repeat: 0 },
  wall: { frames: [7], fps: 1, repeat: 0 },
  kick: { frames: [8, 9, 9], fps: 16, repeat: 0 },
  hurt: { frames: [10], fps: 1, repeat: 0 },
};

export const MADDS_ADQC_SHEET: SheetDef = { key: 'madds-adqc', frameW: 16, frameH: 24, frames: ADQC_FRAMES, anims: ANIMS };

/** Replaces every opaque pixel with one colour (silhouette flashes). */
function silhouette(rows: string[], ch: string): string[] {
  return rows.map((r) => r.replace(/[^.]/g, ch));
}

/** Sprinkles sparkles over the transparent pixels around a frame. */
function sparkle(rows: string[]): string[] {
  const spots = [[1, 2], [14, 5], [0, 12], [15, 15], [2, 20], [13, 22]];
  return rows.map((r, y) => [...r].map((ch, x) => (ch === '.' && spots.some(([sx, sy]) => sx === x && sy === y) ? 'y' : ch)).join(''));
}

const MIXED = [...ADQC_FRAMES[0].slice(0, 11), ...MADDS_FRAMES[0].slice(11)];

export const TRANSFORM_SHEET: SheetDef = {
  key: 'transform',
  frameW: 16,
  frameH: 24,
  frames: [
    MADDS_FRAMES[7], // 0 spin (back)
    silhouette(MADDS_FRAMES[0], 'w'), // 1 white flash
    silhouette(MADDS_FRAMES[7], 'c'), // 2 blue flash
    MIXED, // 3 hair tied, kit appearing
    sparkle(ADQC_FRAMES[7]), // 4 back with the 11
    sparkle(ADQC_FRAMES[0]), // 5 ready
  ],
  anims: { play: { frames: [0, 1, 2, 1, 3, 4, 5, 5], fps: 6, repeat: 0 } },
};
