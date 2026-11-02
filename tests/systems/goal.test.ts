import { describe, it, expect } from 'vitest';
import { isGoal, GoalTracker } from '../../src/systems/goal';

describe('isGoal', () => {
  const goal = { x: 100, y: 50, w: 32, h: 48 };
  it('conta com o centro da bola dentro da baliza', () => {
    expect(isGoal({ x: 104, y: 70, w: 8, h: 8 }, goal)).toBe(true);
  });
  it('não conta fora nem com metade da bola na trave', () => {
    expect(isGoal({ x: 80, y: 70, w: 8, h: 8 }, goal)).toBe(false);
    expect(isGoal({ x: 94, y: 70, w: 8, h: 8 }, goal)).toBe(false);
    expect(isGoal({ x: 110, y: 44, w: 8, h: 8 }, goal)).toBe(false);
  });
});

describe('GoalTracker', () => {
  it('um golo por voo, e para nos 3', () => {
    const g = new GoalTracker();
    expect(g.tryScore(1)).toBe(true);
    expect(g.tryScore(1)).toBe(false);
    expect(g.tryScore(2)).toBe(true);
    expect(g.tryScore(3)).toBe(true);
    expect(g.done).toBe(true);
    expect(g.tryScore(4)).toBe(false);
    expect(g.scored).toBe(3);
  });
});
