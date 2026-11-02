import { describe, it, expect } from 'vitest';
import { Health } from '../../src/systems/health';

describe('Health', () => {
  it('perde corações, fica invulnerável 1 s e morre ao terceiro golpe', () => {
    const h = new Health();
    expect(h.hearts).toBe(3);
    expect(h.hit()).toBe('hurt');
    expect(h.hearts).toBe(2);
    expect(h.invulnerable).toBe(true);
    expect(h.hit()).toBe('ignored');
    h.update(1000);
    expect(h.invulnerable).toBe(false);
    expect(h.hit()).toBe('hurt');
    h.update(1000);
    expect(h.hit()).toBe('dead');
    expect(h.hearts).toBe(0);
  });

  it('refill volta aos 3 corações', () => {
    const h = new Health();
    h.hit();
    h.refill();
    expect(h.hearts).toBe(3);
    expect(h.invulnerable).toBe(false);
  });
});
