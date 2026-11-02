import { describe, it, expect } from 'vitest';
import { touchLayout, hitTest, type Rect } from '../../src/input/touchLayout';

function overlaps(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
}

describe('touchLayout', () => {
  it('posições base a escala 1', () => {
    const l = touchLayout(480, 270, 1, 0);
    expect(l.jump).toEqual({ x: 412, y: 198, w: 56, h: 56 });
    expect(l.left).toEqual({ x: 16, y: 206, w: 48, h: 48 });
    expect(l.pause).toEqual({ x: 448, y: 8, w: 24, h: 24 });
  });

  it('escala os tamanhos e mantém tudo dentro do ecrã sem sobreposições', () => {
    expect(touchLayout(480, 270, 1.5, 0).jump.w).toBe(84);
    for (const scale of [0.75, 1, 1.25, 1.5]) {
      for (const offset of [-40, 0, 40]) {
        const rects = Object.values(touchLayout(480, 270, scale, offset));
        for (const r of rects) {
          expect(r.x).toBeGreaterThanOrEqual(0);
          expect(r.y).toBeGreaterThanOrEqual(0);
          expect(r.x + r.w).toBeLessThanOrEqual(480);
          expect(r.y + r.h).toBeLessThanOrEqual(270);
        }
        for (let i = 0; i < rects.length; i++)
          for (let j = i + 1; j < rects.length; j++) expect(overlaps(rects[i], rects[j])).toBe(false);
      }
    }
  });

  it('o afastamento puxa os grupos para dentro', () => {
    const l = touchLayout(480, 270, 1, 20);
    expect(l.left.x).toBe(36);
    expect(l.jump.x).toBe(392);
  });
});

describe('hitTest', () => {
  it('dois dedos ao mesmo tempo', () => {
    const l = touchLayout(480, 270, 1, 0);
    expect(hitTest(l, [{ x: 40, y: 230 }, { x: 440, y: 226 }])).toEqual(new Set(['left', 'jump']));
  });

  it('toque fora dos botões não ativa nada', () => {
    expect(hitTest(touchLayout(480, 270, 1, 0), [{ x: 240, y: 100 }]).size).toBe(0);
  });
});
