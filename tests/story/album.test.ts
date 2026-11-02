import { describe, it, expect } from 'vitest';
import { CROMO_IDS } from '../../src/progress';
import { CROMO_ART } from '../../src/story/album';
import { PERSONAL_TEXTS_PROVISIONAL, DEDICATION, SECRET_MESSAGE } from '../../src/story/personal';

describe('álbum e textos pessoais', () => {
  it('cada cromo tem ilustração e título', () => {
    for (const id of CROMO_IDS) expect(CROMO_ART[id]?.title, id).toBeTruthy();
  });

  it('dedicatória e mensagem secreta nunca vazias (aviso se ainda provisórias)', () => {
    expect(DEDICATION.trim()).not.toBe('');
    expect(SECRET_MESSAGE.trim()).not.toBe('');
    if (PERSONAL_TEXTS_PROVISIONAL) console.warn('AVISO: a dedicatória e a mensagem secreta ainda são provisórias (src/story/personal.ts).');
  });
});
