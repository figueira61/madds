export interface Note {
  freq: number | null;
  beats: number;
}

export type Wave = 'square' | 'triangle' | 'sawtooth' | 'noise';

export interface Song {
  bpm: number;
  loop: boolean;
  tracks: { wave: Wave; volume: number; notes: string }[];
}

const SEMITONES: Record<string, number> = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 };

/** Frequency of a note like 'A4' or 'C#5' (A4 = 440 Hz). */
export function noteFreq(name: string): number {
  const m = /^([A-G]#?)(\d)$/.exec(name);
  if (!m || !(m[1] in SEMITONES)) throw new Error(`nota inválida: ${name}`);
  const midi = (Number(m[2]) + 1) * 12 + SEMITONES[m[1]];
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/** Parses "C4:1 E4:0.5 R:1" (note:beats, R = rest). */
export function parseNotes(s: string): Note[] {
  return s.trim().split(/\s+/).map((tok) => {
    const [name, beatsStr] = tok.split(':');
    const beats = Number(beatsStr);
    if (!Number.isFinite(beats) || beats <= 0) throw new Error(`duração inválida: ${tok}`);
    return { freq: name === 'R' ? null : noteFreq(name), beats };
  });
}
