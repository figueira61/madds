import { describe, it, expect } from 'vitest';
import { noteFreq, parseNotes } from '../../src/audio/notes';
import { SONGS } from '../../src/audio/songs';

describe('notes', () => {
  it('A4 = 440 Hz e C4 ≈ 261.63 Hz', () => {
    expect(noteFreq('A4')).toBe(440);
    expect(noteFreq('C4')).toBeCloseTo(261.63, 2);
    expect(noteFreq('A#3')).toBeCloseTo(233.08, 2);
  });

  it('parseNotes lê notas e pausas', () => {
    const n = parseNotes('C4:1 R:0.5');
    expect(n).toHaveLength(2);
    expect(n[0].freq).toBeCloseTo(261.63, 2);
    expect(n[0].beats).toBe(1);
    expect(n[1]).toEqual({ freq: null, beats: 0.5 });
  });

  it('nota inválida lança erro', () => {
    expect(() => parseNotes('H4:1')).toThrow();
  });

  it('as faixas de cada música em loop têm a mesma duração', () => {
    for (const [name, song] of Object.entries(SONGS)) {
      if (!song.loop) continue;
      const lengths = song.tracks.map((t) => parseNotes(t.notes).reduce((s, n) => s + n.beats, 0));
      expect(new Set(lengths).size, name).toBe(1);
    }
  });

  it('todas as faixas de todas as músicas são válidas', () => {
    for (const [name, song] of Object.entries(SONGS)) {
      for (const t of song.tracks) expect(() => parseNotes(t.notes), name).not.toThrow();
    }
  });
});
