import { describe, it, expect } from 'vitest';
import { unreachable } from '../../src/levels/reach';
import { LEVELS } from '../../src/levels/registry';
import type { LevelData } from '../../src/levels/format';

function level(tiles: string[], objects: LevelData['objects'] = [{ type: 'start', x: 0, y: 3 }]): LevelData {
  return { id: 't', name: 't', world: 1, kind: 'normal', music: 'world1', tiles, objects };
}

describe('unreachable', () => {
  it('plataforma 3 tiles acima do chão é alcançável', () => {
    expect(unreachable(level(['..........', '..........', '...===....', '..........', '..........', '##########']))).toEqual([]);
  });

  it('plataforma 4 tiles acima do chão sem outro apoio não é alcançável', () => {
    expect(unreachable(level(['...===....', '..........', '..........', '..........', '##########'])).join(' ')).toContain('(3,0)');
  });

  it('Bola Dourada demasiado alta é apontada', () => {
    const l = level(['..........', '..........', '..........', '..........', '..........', '..........', '..........', '##########'], [
      { type: 'start', x: 0, y: 6 },
      { type: 'golden-ball', x: 4, y: 0 },
    ]);
    expect(unreachable(l).join(' ')).toContain('golden-ball');
  });

  for (const [id, l] of Object.entries(LEVELS)) {
    it(`no nível ${id} tudo está ao alcance de um salto`, () => {
      expect(unreachable(l)).toEqual([]);
    });
  }
});
