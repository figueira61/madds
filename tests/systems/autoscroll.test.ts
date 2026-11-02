import { describe, it, expect } from 'vitest';
import { stepAutoscroll, behindEdge, clampRight } from '../../src/systems/autoscroll';
import { Boost, BOOST_MS, BOOST_MUL } from '../../src/systems/boost';

describe('autoscroll', () => {
  it('avança à velocidade dada e para no fim do nível', () => {
    expect(stepAutoscroll(0, 70, 40, 5000)).toBeCloseTo(2.8);
    expect(stepAutoscroll(4999, 70, 40, 5000)).toBe(5000);
  });

  it('um dt enorme (separador em segundo plano) não salta mais de 50 ms', () => {
    expect(stepAutoscroll(0, 100, 5000, 5000)).toBeCloseTo(5);
  });

  it('só fica para trás quando o corpo inteiro saiu pela esquerda', () => {
    expect(behindEdge(101, 100)).toBe(false);
    expect(behindEdge(100, 100)).toBe(true);
  });

  it('a Madds nunca sai pela direita', () => {
    expect(clampRight(1000, 500, 480)).toBe(972);
    expect(clampRight(600, 500, 480)).toBe(600);
  });
});

describe('Boost', () => {
  it('dura 900 ms e reinicia ao ser apanhado de novo', () => {
    const b = new Boost();
    expect(b.mul).toBe(1);
    b.trigger();
    expect(b.mul).toBe(BOOST_MUL);
    b.update(BOOST_MS - 100);
    b.trigger();
    b.update(BOOST_MS - 100);
    expect(b.mul).toBe(BOOST_MUL);
    b.update(200);
    expect(b.mul).toBe(1);
  });
});
