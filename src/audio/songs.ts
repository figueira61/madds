import type { Song } from './notes';

export type MusicName = 'title' | 'world1' | 'world2' | 'world3' | 'boss' | 'final' | 'transform' | 'reunion' | 'continua';

const repeat = (s: string, n: number) => Array(n).fill(s).join(' ');

/** Eighth-note rock bass: root and octave alternating for one 4-beat bar. */
const bassBar = (root: string, octave: string) => repeat(`${root}:0.5 ${octave}:0.5`, 4);
const ROCK_BEAT = repeat('C2:0.5 C6:0.5 C4:0.5 C6:0.5', 2);

const WORLD1_LEAD = [
  'E5:0.5 G5:0.5 A5:1 G5:0.5 E5:0.5 D5:1',
  'C5:0.5 D5:0.5 E5:1 G5:1 R:1',
  'A5:0.5 A5:0.5 G5:0.5 E5:0.5 D5:1 E5:1',
  'C5:2 R:1 G4:1',
  'F5:0.5 F5:0.5 E5:0.5 F5:0.5 A5:1 G5:1',
  'E5:0.5 D5:0.5 C5:1 D5:1 E5:1',
  'G5:1 A5:0.5 B5:0.5 C6:1 B5:0.5 A5:0.5',
  'G5:2 R:2',
].join(' ');

const WORLD1_BASS = [
  bassBar('C3', 'C4'), bassBar('C3', 'C4'), bassBar('A2', 'A3'), bassBar('C3', 'C4'),
  bassBar('F2', 'F3'), bassBar('C3', 'C4'), bassBar('G2', 'G3'), bassBar('G2', 'G3'),
].join(' ');

/** World 2: bouncy, mechanical — staccato eighths over a walking bass, like pieces clicking into place. */
const WORLD2_LEAD = [
  'D5:0.5 R:0.5 D5:0.5 F5:0.5 A5:0.5 R:0.5 G5:0.5 F5:0.5',
  'E5:0.5 R:0.5 E5:0.5 G5:0.5 C6:1 A5:1',
  'D5:0.5 R:0.5 D5:0.5 F5:0.5 A5:0.5 C6:0.5 D6:0.5 C6:0.5',
  'A5:1 G5:0.5 E5:0.5 F5:2',
  'G5:0.5 R:0.5 G5:0.5 A#5:0.5 D6:0.5 R:0.5 C6:0.5 A#5:0.5',
  'A5:0.5 R:0.5 A5:0.5 C6:0.5 F5:1 A5:1',
  'G5:0.5 A5:0.5 A#5:0.5 A5:0.5 G5:0.5 F5:0.5 E5:0.5 C5:0.5',
  'D5:2 R:1 A4:1',
].join(' ');

const WORLD2_BASS = [
  bassBar('D3', 'D4'), bassBar('C3', 'C4'), bassBar('D3', 'D4'), bassBar('F2', 'F3'),
  bassBar('G2', 'G3'), bassBar('F2', 'F3'), bassBar('C3', 'C4'), bassBar('D3', 'D4'),
].join(' ');

const CLICK_BEAT = repeat('C2:0.5 C7:0.25 C7:0.25 C4:0.5 C7:0.5', 2);

/** World 3: racing — fast driving bass and a bright, chanting lead like a stadium crowd. */
const WORLD3_LEAD = [
  'E5:0.5 E5:0.5 G5:0.5 E5:0.5 B5:1 A5:1',
  'G5:0.5 F#5:0.5 E5:0.5 D5:0.5 E5:2',
  'E5:0.5 E5:0.5 G5:0.5 E5:0.5 C6:1 B5:1',
  'A5:0.5 G5:0.5 F#5:0.5 G5:0.5 A5:2',
  'C6:1 B5:0.5 A5:0.5 G5:1 E5:1',
  'D5:0.5 E5:0.5 G5:0.5 A5:0.5 B5:2',
  'C6:0.5 C6:0.5 B5:0.5 A5:0.5 G5:0.5 A5:0.5 B5:1',
  'E6:2 R:1 B4:1',
].join(' ');

const WORLD3_BASS = [
  bassBar('E2', 'E3'), bassBar('E2', 'E3'), bassBar('C3', 'C4'), bassBar('D3', 'D4'),
  bassBar('A2', 'A3'), bassBar('G2', 'G3'), bassBar('C3', 'C4'), bassBar('B2', 'B3'),
].join(' ');

/** Final boss: heroic minor-key march that turns major at the end of the loop. */
const FINAL_LEAD = [
  'A4:0.5 C5:0.5 E5:1 A5:1 G5:0.5 E5:0.5',
  'F5:1 E5:0.5 D5:0.5 E5:2',
  'A4:0.5 C5:0.5 E5:1 A5:1 B5:0.5 C6:0.5',
  'B5:1 G#5:1 E5:2',
  'F5:0.5 F5:0.5 A5:1 C6:1 A5:1',
  'G5:0.5 G5:0.5 B5:1 D6:1 B5:1',
  'C6:1 B5:0.5 A5:0.5 G#5:1 B5:1',
  'A5:3 E5:1',
].join(' ');

const FINAL_BASS = [
  bassBar('A2', 'A3'), bassBar('D2', 'D3'), bassBar('A2', 'A3'), bassBar('E2', 'E3'),
  bassBar('F2', 'F3'), bassBar('G2', 'G3'), bassBar('E2', 'E3'), bassBar('A2', 'A3'),
].join(' ');

const BOSS_LEAD = [
  'A4:0.5 A4:0.5 C5:0.5 A4:0.5 E5:0.5 D5:0.5 C5:0.5 B4:0.5',
  'A4:0.5 A4:0.5 C5:0.5 A4:0.5 F5:1 E5:1',
  'A4:0.5 A4:0.5 C5:0.5 A4:0.5 E5:0.5 D5:0.5 C5:0.5 D5:0.5',
  'E5:0.5 G#4:0.5 B4:0.5 E5:0.5 G#5:1 R:1',
].join(' ');

const BOSS_BASS = [bassBar('A2', 'A3'), bassBar('F2', 'F3'), bassBar('A2', 'A3'), bassBar('E2', 'E3')].join(' ');

export const SONGS: Record<MusicName, Song> = {
  title: {
    bpm: 120,
    loop: true,
    tracks: [
      { wave: 'square', volume: 0.12, notes: WORLD1_LEAD },
      { wave: 'triangle', volume: 0.22, notes: WORLD1_BASS },
    ],
  },
  world1: {
    bpm: 144,
    loop: true,
    tracks: [
      { wave: 'square', volume: 0.1, notes: WORLD1_LEAD },
      { wave: 'triangle', volume: 0.22, notes: WORLD1_BASS },
      { wave: 'noise', volume: 0.05, notes: repeat(ROCK_BEAT, 8) },
    ],
  },
  world2: {
    bpm: 132,
    loop: true,
    tracks: [
      { wave: 'square', volume: 0.09, notes: WORLD2_LEAD },
      { wave: 'triangle', volume: 0.22, notes: WORLD2_BASS },
      { wave: 'noise', volume: 0.05, notes: repeat(CLICK_BEAT, 8) },
    ],
  },
  world3: {
    bpm: 160,
    loop: true,
    tracks: [
      { wave: 'square', volume: 0.09, notes: WORLD3_LEAD },
      { wave: 'triangle', volume: 0.22, notes: WORLD3_BASS },
      { wave: 'noise', volume: 0.06, notes: repeat(ROCK_BEAT, 8) },
    ],
  },
  final: {
    bpm: 150,
    loop: true,
    tracks: [
      { wave: 'sawtooth', volume: 0.07, notes: FINAL_LEAD },
      { wave: 'triangle', volume: 0.24, notes: FINAL_BASS },
      { wave: 'noise', volume: 0.06, notes: repeat(ROCK_BEAT, 8) },
    ],
  },
  boss: {
    bpm: 172,
    loop: true,
    tracks: [
      { wave: 'sawtooth', volume: 0.07, notes: BOSS_LEAD },
      { wave: 'triangle', volume: 0.24, notes: BOSS_BASS },
      { wave: 'noise', volume: 0.06, notes: repeat(ROCK_BEAT, 4) },
    ],
  },
  transform: {
    bpm: 240,
    loop: false,
    tracks: [
      { wave: 'square', volume: 0.14, notes: 'C5:0.5 E5:0.5 G5:0.5 C6:0.5 E6:0.5 G6:0.5 C6:0.5 G6:2' },
      { wave: 'triangle', volume: 0.2, notes: 'C3:1 G3:1 C4:1 C4:3' },
    ],
  },
  reunion: {
    bpm: 88,
    loop: true,
    tracks: [
      { wave: 'triangle', volume: 0.25, notes: 'G4:1 B4:1 D5:2 C5:1 B4:1 A4:2 G4:1 B4:1 D5:1 G5:1 F#5:2 G5:2' },
      { wave: 'square', volume: 0.05, notes: 'G3:4 C4:4 G3:4 D4:4' },
    ],
  },
  continua: {
    bpm: 100,
    loop: true,
    tracks: [
      { wave: 'square', volume: 0.08, notes: 'E5:1 D5:0.5 C5:0.5 D5:1 G4:1 C5:1 E5:1 G5:2 A5:1 G5:0.5 E5:0.5 F5:1 D5:1 C5:4' },
      { wave: 'triangle', volume: 0.2, notes: `${bassBar('C3', 'G3')} ${bassBar('G2', 'D3')} ${bassBar('F2', 'C3')} ${bassBar('C3', 'G3')}` },
    ],
  },
};
