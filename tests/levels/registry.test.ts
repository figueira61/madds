import { describe, it, expect } from 'vitest';
import { LEVELS, WORLD1_ORDER, nextLevel } from '../../src/levels/registry';
import { validateLevel } from '../../src/levels/validate';

describe('registry', () => {
  for (const [id, level] of Object.entries(LEVELS)) {
    if (id === 'test-room') continue;
    it(`o nível ${id} é válido`, () => {
      expect(validateLevel(level)).toEqual([]);
      expect(level.id).toBe(id);
    });
  }

  it('a sala de teste existe', () => {
    expect(LEVELS['test-room']).toBeDefined();
  });

  it('ordem do Mundo 1', () => {
    expect(WORLD1_ORDER).toEqual(['1-1', '1-2', '1-3', '1-boss']);
    expect(nextLevel('1-1')).toBe('1-2');
    expect(nextLevel('1-3')).toBe('1-boss');
    expect(nextLevel('1-boss')).toBeNull();
  });
});
