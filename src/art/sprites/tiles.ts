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

export const TILE_FRAME = {
  groundTop: 0,
  ground: 1,
  platform: 2,
  spikes: 3,
  waterA: 4,
  waterB: 5,
  reinforced: 6,
  softDirt: 7,
} as const;

export const TILES_SHEET: SheetDef = {
  key: 'tiles',
  frameW: 16,
  frameH: 16,
  frames: [groundTop, ground, platform, spikes, water(0), water(1), reinforced, softDirt],
};
