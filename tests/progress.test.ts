import { describe, it, expect } from 'vitest';
import { applyResult, isUnlocked, hasBekas, hasProgress, bekasJoinedFor, gameSummary, albumState, CROMO_IDS } from '../src/progress';
import { LEVELS } from '../src/levels/registry';
import { defaultSave } from '../src/systems/saveStore';

const result = (over = {}) => ({ levelId: '1-1', timeMs: 60000, falls: 3, cromo: false, animalsFreed: 2, animalsTotal: 2, ...over });

describe('applyResult', () => {
  it('marca o nível como concluído uma só vez', () => {
    let s = applyResult(defaultSave(), result(), 40);
    s = applyResult(s, result(), 40);
    expect(s.completed).toEqual(['1-1']);
    expect(s.power).toBe(40);
  });

  it('guarda o melhor tempo e o mínimo de quedas', () => {
    let s = applyResult(defaultSave(), result({ timeMs: 60000, falls: 3 }), 0);
    s = applyResult(s, result({ timeMs: 70000, falls: 1 }), 0);
    s = applyResult(s, result({ timeMs: 50000, falls: 5 }), 0);
    expect(s.bestTimesMs['1-1']).toBe(50000);
    expect(s.falls['1-1']).toBe(1);
  });

  it('o cromo fica gravado mesmo que a repetição não o apanhe', () => {
    let s = applyResult(defaultSave(), result({ cromo: true }), 0);
    s = applyResult(s, result({ cromo: false }), 0);
    expect(s.cromos).toEqual(['1-1']);
  });

  it('não altera o save original', () => {
    const original = defaultSave();
    applyResult(original, result(), 10);
    expect(original).toEqual(defaultSave());
  });
});

describe('desbloqueio e Bekas', () => {
  it('1-1 sempre aberto; os seguintes depois do anterior', () => {
    const s = defaultSave();
    expect(isUnlocked(s, '1-1')).toBe(true);
    expect(isUnlocked(s, '1-2')).toBe(false);
    const after = applyResult(s, result(), 0);
    expect(isUnlocked(after, '1-2')).toBe(true);
    expect(isUnlocked(after, '1-3')).toBe(false);
  });

  it('a Bekas junta-se depois do boss do Mundo 1', () => {
    expect(hasBekas(defaultSave())).toBe(false);
    expect(hasBekas(applyResult(defaultSave(), result({ levelId: '1-boss' }), 0))).toBe(true);
  });

  it('hasProgress', () => {
    expect(hasProgress(defaultSave())).toBe(false);
    expect(hasProgress(applyResult(defaultSave(), result(), 0))).toBe(true);
  });
});

describe('mundos', () => {
  const w1 = () => ({ ...defaultSave(), completed: ['1-1', '1-2', '1-3', '1-boss'] });

  it('o 2-1 desbloqueia com o boss do Mundo 1', () => {
    expect(isUnlocked(w1(), '2-1')).toBe(true);
    expect(isUnlocked(w1(), '2-2')).toBe(false);
    expect(isUnlocked(defaultSave(), '2-1')).toBe(false);
  });

  it('a Bekas está sempre presente a partir do Mundo 2', () => {
    expect(bekasJoinedFor(defaultSave(), LEVELS['2-1'])).toBe(true);
    expect(bekasJoinedFor(defaultSave(), LEVELS['1-1'])).toBe(false);
    expect(bekasJoinedFor(w1(), LEVELS['1-1'])).toBe(true);
  });
});

describe('final e álbum', () => {
  it('resumo soma os melhores tempos, as quedas e conta os cromos', () => {
    const s = { ...defaultSave(), bestTimesMs: { '1-1': 60000, '2-1': 30000 }, falls: { '1-1': 2, '2-1': 3 }, cromos: ['1-1', '2-boss'] };
    expect(gameSummary(s)).toEqual({ totalTimeMs: 90000, falls: 5, cromos: 2, total: 12 });
    expect(gameSummary(defaultSave())).toEqual({ totalTimeMs: 0, falls: 0, cromos: 0, total: 12 });
  });

  it('12 cromos: um por nível e um por boss', () => {
    expect(CROMO_IDS).toHaveLength(12);
    expect(new Set(CROMO_IDS).size).toBe(12);
  });

  it('álbum completo só com os 12', () => {
    expect(albumState({ ...defaultSave(), cromos: CROMO_IDS.slice(0, 11) }).complete).toBe(false);
    const full = albumState({ ...defaultSave(), cromos: [...CROMO_IDS] });
    expect(full.complete).toBe(true);
    expect(full.owned.every(Boolean)).toBe(true);
  });
});
