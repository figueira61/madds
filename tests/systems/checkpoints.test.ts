import { describe, it, expect } from 'vitest';
import { Checkpoints } from '../../src/systems/checkpoints';

describe('Checkpoints', () => {
  it('começa no início e passa para o checkpoint alcançado', () => {
    const c = new Checkpoints({ x: 1, y: 2 });
    expect(c.respawn).toEqual({ x: 1, y: 2 });
    expect(c.reach('a', { x: 10, y: 5 })).toBe(true);
    expect(c.respawn).toEqual({ x: 10, y: 5 });
    expect(c.reach('a', { x: 10, y: 5 })).toBe(false);
  });

  it('conta as quedas', () => {
    const c = new Checkpoints({ x: 0, y: 0 });
    c.recordFall();
    c.recordFall();
    expect(c.falls).toBe(2);
  });
});
