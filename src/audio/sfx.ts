import type { Wave } from './notes';

export type SfxName =
  | 'jump' | 'kick' | 'bounce' | 'hurt' | 'enemy' | 'animal' | 'golden' | 'cromo' | 'bark'
  | 'adqc' | 'goal' | 'checkpoint' | 'power-full' | 'select' | 'break' | 'clink' | 'fall'
  | 'dig' | 'sniff' | 'build' | 'door' | 'press' | 'switch' | 'stomp';

/** One sweep: frequency glides from `from` to `to` over `ms`, starting `at` ms after the trigger. */
export interface SfxStep {
  wave: Wave;
  from: number;
  to: number;
  ms: number;
  vol: number;
  at?: number;
}

const arp = (wave: Wave, freqs: number[], stepMs: number, vol: number): SfxStep[] =>
  freqs.map((f, i) => ({ wave, from: f, to: f, ms: stepMs, vol, at: i * stepMs }));

export const SFX: Record<SfxName, SfxStep[]> = {
  jump: [{ wave: 'square', from: 300, to: 620, ms: 110, vol: 0.12 }],
  kick: [{ wave: 'noise', from: 900, to: 300, ms: 70, vol: 0.25 }, { wave: 'triangle', from: 180, to: 80, ms: 90, vol: 0.3 }],
  bounce: [{ wave: 'triangle', from: 420, to: 300, ms: 50, vol: 0.18 }],
  hurt: [{ wave: 'sawtooth', from: 400, to: 120, ms: 220, vol: 0.14 }],
  enemy: [{ wave: 'square', from: 700, to: 200, ms: 120, vol: 0.12 }, { wave: 'noise', from: 2000, to: 800, ms: 100, vol: 0.1 }],
  animal: arp('square', [660, 880, 990, 1320], 70, 0.1),
  golden: arp('square', [988, 1319, 1568, 1976], 55, 0.1),
  cromo: arp('triangle', [784, 988, 1175, 1568, 1976], 80, 0.22),
  bark: [{ wave: 'sawtooth', from: 520, to: 260, ms: 80, vol: 0.16 }, { wave: 'sawtooth', from: 560, to: 280, ms: 90, vol: 0.14, at: 130 }],
  adqc: [...arp('square', [523, 659, 784, 1047, 1319, 1568], 60, 0.13), { wave: 'noise', from: 4000, to: 1000, ms: 400, vol: 0.12, at: 360 }],
  goal: [...arp('square', [523, 659, 784, 1047], 90, 0.13), { wave: 'noise', from: 1500, to: 600, ms: 700, vol: 0.1, at: 360 }],
  checkpoint: arp('triangle', [523, 784, 1047], 90, 0.22),
  'power-full': arp('square', [1047, 1319, 1047, 1319, 1568], 50, 0.09),
  select: [{ wave: 'square', from: 880, to: 880, ms: 40, vol: 0.08 }],
  break: [{ wave: 'noise', from: 1200, to: 200, ms: 260, vol: 0.25 }],
  dig: [{ wave: 'noise', from: 600, to: 200, ms: 120, vol: 0.18 }, { wave: 'noise', from: 500, to: 150, ms: 120, vol: 0.14, at: 150 }],
  sniff: [{ wave: 'noise', from: 3000, to: 2400, ms: 60, vol: 0.06 }, { wave: 'noise', from: 3000, to: 2400, ms: 60, vol: 0.06, at: 120 }, { wave: 'noise', from: 3000, to: 2400, ms: 60, vol: 0.06, at: 240 }],
  build: arp('square', [392, 523, 659, 784], 50, 0.1),
  door: [{ wave: 'square', from: 180, to: 260, ms: 200, vol: 0.1 }],
  press: [{ wave: 'noise', from: 400, to: 60, ms: 220, vol: 0.3 }, { wave: 'triangle', from: 120, to: 40, ms: 200, vol: 0.3 }],
  switch: [{ wave: 'square', from: 1200, to: 1200, ms: 30, vol: 0.1 }, { wave: 'square', from: 1600, to: 1600, ms: 40, vol: 0.1, at: 50 }],
  stomp: [{ wave: 'noise', from: 300, to: 50, ms: 400, vol: 0.35 }, { wave: 'triangle', from: 90, to: 30, ms: 350, vol: 0.35 }],
  clink: [{ wave: 'square', from: 1600, to: 1500, ms: 45, vol: 0.07 }, { wave: 'square', from: 2100, to: 2000, ms: 60, vol: 0.05, at: 40 }],
  fall: [{ wave: 'triangle', from: 700, to: 90, ms: 450, vol: 0.2 }],
};
