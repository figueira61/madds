import type { Action } from './actions';

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type TouchButton = 'left' | 'right' | 'jump' | 'kick' | 'bekas' | 'super' | 'pause';
export type TouchLayout = Record<TouchButton, Rect>;

const BASE_W = 480;
const BASE_H = 270;

type Anchor = 'bottom-left' | 'bottom-right' | 'top-right';
const BASE: Record<TouchButton, Rect & { anchor: Anchor }> = {
  left: { x: 16, y: 206, w: 48, h: 48, anchor: 'bottom-left' },
  right: { x: 72, y: 206, w: 48, h: 48, anchor: 'bottom-left' },
  jump: { x: 412, y: 198, w: 56, h: 56, anchor: 'bottom-right' },
  kick: { x: 352, y: 214, w: 44, h: 44, anchor: 'bottom-right' },
  bekas: { x: 352, y: 162, w: 40, h: 40, anchor: 'bottom-right' },
  super: { x: 408, y: 140, w: 52, h: 40, anchor: 'bottom-right' },
  pause: { x: 448, y: 8, w: 24, h: 24, anchor: 'top-right' },
};

/**
 * Scales each button around its anchored screen corner (margins scale too) and moves the
 * left / right groups inwards by offsetX (outwards when negative, never off-screen).
 */
export function touchLayout(w: number, h: number, scale: number, offsetX: number): TouchLayout {
  const out = {} as TouchLayout;
  for (const [name, b] of Object.entries(BASE) as [TouchButton, Rect & { anchor: Anchor }][]) {
    const bw = b.w * scale;
    const bh = b.h * scale;
    const leftMargin = b.x * scale;
    const rightMargin = (BASE_W - b.x - b.w) * scale;
    const topMargin = b.y * scale;
    const bottomMargin = (BASE_H - b.y - b.h) * scale;
    const x = b.anchor === 'bottom-left' ? leftMargin : w - rightMargin - bw;
    const y = b.anchor === 'top-right' ? topMargin : h - bottomMargin - bh;
    out[name] = { x, y, w: bw, h: bh };
  }
  shiftGroup(out, ['left', 'right'], offsetX, w);
  shiftGroup(out, ['jump', 'kick', 'bekas', 'super'], -offsetX, w);
  return out;
}

function shiftGroup(l: TouchLayout, names: TouchButton[], dx: number, w: number): void {
  const minX = Math.min(...names.map((n) => l[n].x));
  const maxX = Math.max(...names.map((n) => l[n].x + l[n].w));
  const clamped = Math.max(-minX, Math.min(w - maxX, dx));
  for (const n of names) l[n].x += clamped;
}

export function hitTest(layout: Partial<TouchLayout>, points: { x: number; y: number }[]): Set<Action> {
  const hit = new Set<Action>();
  for (const p of points) {
    for (const [name, r] of Object.entries(layout) as [TouchButton, Rect][]) {
      if (p.x >= r.x && p.x < r.x + r.w && p.y >= r.y && p.y < r.y + r.h) hit.add(name);
    }
  }
  return hit;
}
