import { describe, it, expect } from 'vitest';
import { LEVELS, WORLD1_ORDER, WORLD_ORDER, nextLevel, worldOf, firstLevelOf } from '../../src/levels/registry';
import { validateLevel } from '../../src/levels/validate';

describe('registry', () => {
  for (const [id, level] of Object.entries(LEVELS)) {
    if (id.startsWith('test-')) continue;
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

  it('ordem do Mundo 2 e fronteiras entre mundos', () => {
    expect(WORLD_ORDER[2]).toEqual(['2-1', '2-2', '2-3', '2-boss']);
    expect(nextLevel('2-1')).toBe('2-2');
    expect(nextLevel('2-boss')).toBeNull();
    expect(worldOf('2-3')).toBe(2);
    expect(worldOf('nada')).toBeNull();
    expect(firstLevelOf(2)).toBe('2-1');
  });

  it('ordem do Mundo 3', () => {
    expect(WORLD_ORDER[3]).toEqual(['3-1', '3-2', '3-3', '3-boss']);
    expect(nextLevel('3-3')).toBe('3-boss');
    expect(nextLevel('3-boss')).toBeNull();
    expect(firstLevelOf(3)).toBe('3-1');
  });
});
