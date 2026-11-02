import { describe, it, expect } from 'vitest';
import { GAME_W, GAME_H, TILE } from '../src/config';

describe('config', () => {
  it('usa a resolução lógica 480×270 com tiles de 16 px', () => {
    expect(GAME_W).toBe(480);
    expect(GAME_H).toBe(270);
    expect(TILE).toBe(16);
  });
});
