import { describe, it, expect } from 'vitest';
import { ActionState } from '../../src/input/actions';

describe('ActionState', () => {
  it('justPressed só no primeiro frame', () => {
    const a = new ActionState();
    a.set('kb', 'left', true);
    expect(a.isDown('left')).toBe(true);
    expect(a.justPressed('left')).toBe(true);
    a.endFrame();
    expect(a.justPressed('left')).toBe(false);
    expect(a.isDown('left')).toBe(true);
  });

  it('várias fontes: largar uma não larga a ação', () => {
    const a = new ActionState();
    a.set('kb', 'jump', true);
    a.set('touch', 'jump', true);
    a.set('kb', 'jump', false);
    expect(a.isDown('jump')).toBe(true);
    a.set('touch', 'jump', false);
    expect(a.isDown('jump')).toBe(false);
  });

  it('carregar de novo noutra fonte enquanto premido não repete justPressed', () => {
    const a = new ActionState();
    a.set('kb', 'kick', true);
    a.endFrame();
    a.set('pad', 'kick', true);
    expect(a.justPressed('kick')).toBe(false);
  });

  it('anyDown', () => {
    const a = new ActionState();
    expect(a.anyDown()).toBe(false);
    a.set('touch', 'right', true);
    expect(a.anyDown()).toBe(true);
  });
});
