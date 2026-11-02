import { describe, it, expect } from 'vitest';
import { needsRotate } from '../../src/robustness/orientation';

describe('needsRotate', () => {
  it('telemóvel na vertical pede para rodar', () => {
    expect(needsRotate(390, 844, true)).toBe(true);
  });

  it('telemóvel na horizontal joga', () => {
    expect(needsRotate(844, 390, true)).toBe(false);
  });

  it('computador nunca pede para rodar', () => {
    expect(needsRotate(800, 1200, false)).toBe(false);
  });
});
