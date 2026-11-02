import { describe, it, expect } from 'vitest';
import { pressPhase } from '../../src/systems/press';

describe('pressPhase', () => {
  it('ciclo de 2400 ms: em cima, aviso, em baixo', () => {
    expect(pressPhase(0, 2400, 0)).toBe('up');
    expect(pressPhase(1399, 2400, 0)).toBe('up');
    expect(pressPhase(1400, 2400, 0)).toBe('warn');
    expect(pressPhase(1800, 2400, 0)).toBe('down');
    expect(pressPhase(2400, 2400, 0)).toBe('up');
  });
  it('offset desloca o ciclo', () => {
    expect(pressPhase(1200, 2400, 600)).toBe('down');
    expect(pressPhase(1900, 2400, 600)).toBe('up');
  });
});
