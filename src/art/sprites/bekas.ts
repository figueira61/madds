import { withRows, type SheetDef } from '../pixels';

/*
 * Bekas, 20×14, facing right: black dog with a white blaze on muzzle and forehead,
 * white chest and paws, semi-floppy ears.
 */

const STAND = [
  '..............kk....',
  '.............kkkk...',
  '............kkkwkk..',
  '............kkkwkWk.',
  '...........kkkwwwwwk',
  'k..........kkkkwwwk.',
  'kk.kkkkkkkkkkkkwR...',
  '.kkkkkkkkkkkkkww....',
  '..kkkkkkkkkkkwww....',
  '..kkkkkkkkkkwwww....',
  '..kkkk.kkkkkwww.....',
  '..kkk...kk..kww.....',
  '..kww...kw...ww.....',
  '..ww....ww...ww.....',
];

const WAG = withRows(STAND, { 4: 'k..........kkkwwwwwk', 5: 'k..........kkkkwwwk.', 6: '.k.kkkkkkkkkkkkwR...' });

const RUN1 = withRows(STAND, {
  10: '..kkkk.kkkkkwww.....',
  11: '.kkk.....kk..kww....',
  12: 'kww.......kw...ww...',
  13: 'ww.........ww...ww..',
});

const RUN2 = withRows(STAND, {
  10: '...kkkkkkkkkww......',
  11: '....kkk..kkww.......',
  12: '....kww..kww........',
  13: '....ww...ww.........',
});

const JUMP = withRows(STAND, {
  6: 'kk.kkkkkkkkkkkkwR...',
  10: '..kkkkkkkkkkwwww....',
  11: '.kww......kkwww.....',
  12: 'ww..........ww......',
  13: '....................',
});

const SIT = [
  '..............kk....',
  '.............kkkk...',
  '............kkkwkk..',
  '............kkkwkWk.',
  '...........kkkwwwwwk',
  '...........kkkkwwwk.',
  '..........kkkkwwR...',
  '.........kkkkkww....',
  '........kkkkkwww....',
  '.......kkkkkkwww....',
  '......kkkkkkkwww....',
  '.....kkkkkkk.ww.....',
  '....kkkkkkkk.ww.....',
  '..kkkwwkkkk..ww.....',
];

const SIT_BLINK = withRows(SIT, { 3: '............kkkwkkk.' });
const PAW = withRows(SIT, { 9: '.......kkkkkkwwwwww.', 10: '......kkkkkkkww..ww.', 11: '.....kkkkkkk.ww.....' });
const PAW_UP = withRows(SIT, { 8: '........kkkkkwwwwww.', 9: '.......kkkkkkwww.ww.', 10: '......kkkkkkkww.....', 11: '.....kkkkkkk.ww.....' });
const EAT = withRows(SIT, {
  2: '....................',
  3: '..............kk....',
  4: '.............kkkk...',
  5: '............kkkwkk..',
  6: '...........kkkkwwwk.',
  7: '.........kkkkkwwwwwk',
  8: '........kkkkkwwwukk.',
});
const EAT2 = withRows(EAT, { 8: '........kkkkkwwwwkk.' });
const SIT_WAG = withRows(SIT, { 12: '...kkkkkkkkk.ww.....', 13: '.kkkkwwkkkk..ww.....' });
const BARK = withRows(STAND, { 4: '...........kkkwwwwwk', 5: 'k..........kkkkwwwRR', 6: 'kk.kkkkkkkkkkkkwwww.' });
const DIG1 = withRows(STAND, { 2: '....................', 3: '............kk......', 4: '...........kkkkk....', 5: 'k..........kkkwkk...', 6: 'kk.kkkkkkkkkkkwwwk..', 7: '.kkkkkkkkkkkkwwwwwk.', 12: '..kww...kw...wtw....', 13: '..ww....ww..ttttt...' });
const DIG2 = withRows(DIG1, { 12: '..kww...kw..tww.t...', 13: '..ww....ww.ttwwtt...' });

export const BEKAS_SHEET: SheetDef = {
  key: 'bekas',
  frameW: 20,
  frameH: 14,
  frames: [STAND, WAG, RUN1, RUN2, JUMP, SIT, SIT_BLINK, PAW, PAW_UP, EAT, EAT2, SIT_WAG, BARK, DIG1, DIG2],
  anims: {
    idle: { frames: [0, 1], fps: 4, repeat: -1 },
    run: { frames: [2, 0, 3, 0], fps: 12, repeat: -1 },
    jump: { frames: [4], fps: 1, repeat: 0 },
    sit: { frames: [5, 5, 5, 6], fps: 2, repeat: -1 },
    paw: { frames: [7, 8], fps: 3, repeat: -1 },
    eat: { frames: [9, 10], fps: 4, repeat: -1 },
    wag: { frames: [5, 11], fps: 6, repeat: -1 },
    bark: { frames: [12, 0], fps: 6, repeat: 1 },
    celebrate: { frames: [4, 1], fps: 5, repeat: -1 },
    dig: { frames: [13, 14], fps: 8, repeat: -1 },
    sniff: { frames: [13, 0, 13, 0], fps: 5, repeat: 0 },
  },
};
