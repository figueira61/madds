import type { SheetDef } from '../pixels';

/** Deterministic pseudo-random noise so tiles look the same on every run. */
function noise(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function dirt(seed: number, base: string, dark: string, light: string): string[] {
  const rnd = noise(seed);
  return Array.from({ length: 16 }, () =>
    Array.from({ length: 16 }, () => {
      const r = rnd();
      return r < 0.1 ? dark : r > 0.93 ? light : base;
    }).join(''),
  );
}

const groundTop = (() => {
  const rows = dirt(7, 't', 'T', 'u');
  rows[0] = 'vvvvvvvvvvvvvvvv';
  rows[1] = 'vvVvvvvvVvvvvvVv';
  rows[2] = 'VVnVVVVVnVVVVVnV';
  rows[3] = 'tnTttnttTnttntTt';
  rows[4] = rows[4].replace(/^(.{2})./, '$1n');
  return rows;
})();

const ground = dirt(11, 't', 'T', 'u');

const platform = [
  'TuuuuuuTuuuuuuuT',
  'Tuttttt Tttttttu'.replace(' ', 'T'),
  'TttttttTtttttttT',
  'TTTTTTTTTTTTTTTT',
  '.T............T.',
  '.T............T.',
  ...Array.from({ length: 10 }, () => '................'),
];

const spikes = [
  ...Array.from({ length: 6 }, () => '................'),
  '...w.......w....',
  '...W.......W....',
  '..wmM.....wmM...',
  '..wmM.....wmM...',
  '.wmmmM...wmmmM..',
  '.wmmmM...wmmmM..',
  'wmmmmmM.wmmmmmM.',
  'wmmmmmMMwmmmmmMM',
  'MMMMMMMMMMMMMMMM',
  'MMMMMMMMMMMMMMMM',
];

function water(phase: number): string[] {
  const top = phase === 0 ? 'qqaaaaqqqqaaaaqq' : 'aaqqqqaaaaqqqqaa';
  const second = phase === 0 ? 'aqaaaaaqaqaaaaaq' : 'aaaqaqaaaaaqaqaa';
  return [top, second, ...Array.from({ length: 14 }, (_, i) => (i % 5 === 2 ? 'aaaAaaaaaaaAaaaa' : 'aaaaaaaaaaaaaaaa').replace(/a/g, i > 6 ? 'A' : 'a'))];
}

const reinforced = [
  'MMMMMMMMMMMMMMMM',
  'MmmmmmmmMmmmmmmM',
  'MmwmmmmmMmmmmwmM',
  'MmmmmmmmMmmmmmmM',
  'MmmmmgmmMmmmmmmM',
  'MmmmmmgmMmmgmmmM',
  'MmmmmmmmMmmmmmmM',
  'MMMMMMMMMMMMMMMM',
  'MmmmMmmmmmmmMmmM',
  'MmmmMmmmmgmmMmmM',
  'MmwmMmmmmmgmMmwM',
  'MmmmMmmmmmmmMmmM',
  'MmmmMmmgmmmmMmmM',
  'MmmmMmmmgmmmMmmM',
  'MmmmMmmmmmmmMmmM',
  'MMMMMMMMMMMMMMMM',
];

const softDirt = dirt(23, 'u', 't', 'y');

const waterDeep = Array.from({ length: 16 }, (_, i) => (i % 6 === 3 ? 'AAAaAAAAAAAaAAAA' : 'AAAAAAAAAAAAAAAA'));

// --- World 2: bricks are drawn in light greys and tinted per brick by the tilemap. ---
const STUDS = ['..wwww....wwww..', '.wWWWWg..wWWWWg.', '.gggggg..gggggg.'];
const brickBody = (rows: number) => ['wwwwwwwwwwwwwwwW', ...Array.from({ length: rows - 2 }, (_, i) => (i === Math.floor(rows / 2) - 1 ? 'WWWWWWWgWWWWWWWg' : 'WWWWWWWWWWWWWWWg')), 'gggggggggggggggg'];
const brickTop = [...STUDS, ...brickBody(13)];
const brick = brickBody(16);
const brickPlatform = [...STUDS, ...brickBody(6), ...Array.from({ length: 7 }, () => '................')];
const hidden = [...STUDS.map((r) => r.replace(/[wWg]/g, 'c')), 'GGGGGGGGGGGGGGGc', 'GlGGGGGGcGGGGlGc', 'GGGGlGGGcGGGGGGc', 'GGGGGGGGcGGlGGGc', 'GGGGGGGGGGGGGGGc', 'cccccccccccccccc', ...Array.from({ length: 7 }, () => '................')];
const ghost = (() => {
  const rows = Array.from({ length: 16 }, () => Array(16).fill('.'));
  for (let i = 0; i < 16; i += 2) {
    rows[3][i] = 'w'; rows[15][i] = 'w'; rows[i + 1 < 16 ? i + 1 : 15][0] = 'w'; rows[i + 1 < 16 ? i + 1 : 15][15] = 'w';
  }
  for (const x of [2, 4, 10, 12]) rows[0][x] = 'w';
  return rows.map((r) => r.join(''));
})();
/** Conveyor belt: chevrons point the way it pushes; phase shifts them 4 px for the animation. */
function conveyor(dir: -1 | 1, phase: 0 | 1): string[] {
  const chevron = (row: number) => Array.from({ length: 16 }, (_, x) => {
    const p = (((dir > 0 ? x : 15 - x) - phase * 4 - Math.abs(row - 2)) % 8 + 8) % 8;
    return p === 0 || p === 1 ? 'y' : 'K';
  }).join('');
  return [
    'kkkkkkkkkkkkkkkk',
    chevron(1), chevron(2), chevron(3),
    'kkkkkkkkkkkkkkkk',
    'MmmmmmmmmmmmmmmM',
    'MmkkmmmmmmmmkkmM',
    'MkKKkmmmmmmkKKkM',
    'MkKKkmmmmmmkKKkM',
    'MmkkmmmmmmmmkkmM',
    'MmmmmmmmmmmmmmmM',
    'MMMMMMMMMMMMMMMM',
    'MyykkyykkyykkyyM',
    'MkyykkyykkyykkyM',
    'MMMMMMMMMMMMMMMM',
    'kkkkkkkkkkkkkkkk',
  ];
}

// --- World 3: race track and stadium. ---
const asphalt = (seed: number) => dirt(seed, 'K', 'k', 'M');
const trackTop = (() => {
  const rows = asphalt(31);
  rows[0] = 'xxxxwwwwxxxxwwww';
  rows[1] = 'xxxxwwwwxxxxwwww';
  rows[2] = 'kkkkkkkkkkkkkkkk';
  return rows;
})();
const track = asphalt(37);
const bleacher = [
  'cccccccccccccccc',
  'bbbbbbbbbbbbbbbb',
  'bbbbbbbbbbbbbbbb',
  'BBBBBBBBBBBBBBBB',
  'MMMMMMMMMMMMMMMM',
  '.M............M.',
  ...Array.from({ length: 10 }, () => '................'),
];
/** Boost pad: chevrons pointing right, shifted 4 px per phase. */
function boostPad(phase: 0 | 1): string[] {
  const rows = asphalt(41);
  rows[0] = 'llllllllllllllll';
  for (let y = 3; y < 13; y++) {
    rows[y] = [...rows[y]].map((c, x) => {
      const p = (((x - phase * 4 + Math.abs(y - 8)) % 8) + 8) % 8;
      return p < 2 ? (y < 6 || y > 10 ? 'o' : 'y') : c;
    }).join('');
  }
  return rows;
}

export const TILE_FRAME = {
  groundTop: 0,
  ground: 1,
  platform: 2,
  spikes: 3,
  waterA: 4,
  waterB: 5,
  reinforced: 6,
  softDirt: 7,
  waterDeep: 8,
  brickTop: 9,
  brick: 10,
  conveyorLA: 11,
  conveyorLB: 12,
  conveyorRA: 13,
  conveyorRB: 14,
  ghost: 15,
  hidden: 16,
  brickPlatform: 17,
  trackTop: 18,
  track: 19,
  bleacher: 20,
  boostA: 21,
  boostB: 22,
} as const;

export const TILES_SHEET: SheetDef = {
  key: 'tiles',
  frameW: 16,
  frameH: 16,
  frames: [
    groundTop, ground, platform, spikes, water(0), water(1), reinforced, softDirt, waterDeep,
    brickTop, brick, conveyor(-1, 0), conveyor(-1, 1), conveyor(1, 0), conveyor(1, 1), ghost, hidden, brickPlatform,
    trackTop, track, bleacher, boostPad(0), boostPad(1),
  ],
};
