import Phaser from 'phaser';
import type { Rect, TouchButton, TouchLayout } from './touchLayout';

const DEPTH = 1000;

/** Draws the on-screen buttons. Purely visual: hit testing is done by InputManager. */
export class TouchControls {
  private readonly gfx: Phaser.GameObjects.Graphics;
  private readonly hidden = new Set<TouchButton>(['bekas', 'super']);
  private pressed = new Set<string>();

  constructor(scene: Phaser.Scene, private layout: TouchLayout) {
    this.gfx = scene.add.graphics().setScrollFactor(0).setDepth(DEPTH);
  }

  setLayout(layout: TouchLayout): void {
    this.layout = layout;
  }

  setVisible(b: TouchButton, visible: boolean): void {
    if (visible) this.hidden.delete(b);
    else this.hidden.add(b);
  }

  visibleLayout(): Partial<TouchLayout> {
    const out: Partial<TouchLayout> = {};
    for (const [k, r] of Object.entries(this.layout) as [TouchButton, Rect][]) if (!this.hidden.has(k)) out[k] = r;
    return out;
  }

  draw(pressed: Set<string>, time: number): void {
    this.pressed = pressed;
    const g = this.gfx.clear();
    for (const [name, r] of Object.entries(this.visibleLayout()) as [TouchButton, Rect][]) {
      const down = this.pressed.has(name);
      const glow = name === 'super' ? 0.25 + 0.2 * Math.sin(time / 150) : 0;
      g.fillStyle(name === 'super' ? 0x2f6fe0 : 0xffffff, (down ? 0.35 : 0.1) + glow);
      g.lineStyle(2, 0xffffff, down ? 0.8 : 0.35);
      const cx = r.x + r.w / 2;
      const cy = r.y + r.h / 2;
      if (name === 'super' || name === 'pause') {
        g.fillRoundedRect(r.x, r.y, r.w, r.h, 6).strokeRoundedRect(r.x, r.y, r.w, r.h, 6);
      } else {
        g.fillCircle(cx, cy, r.w / 2).strokeCircle(cx, cy, r.w / 2);
      }
      this.icon(g, name, cx, cy, r.w);
    }
  }

  private icon(g: Phaser.GameObjects.Graphics, name: TouchButton, cx: number, cy: number, size: number): void {
    const s = size * 0.22;
    g.fillStyle(0xffffff, 0.6);
    switch (name) {
      case 'left':
        g.fillTriangle(cx - s, cy, cx + s * 0.7, cy - s, cx + s * 0.7, cy + s);
        break;
      case 'right':
        g.fillTriangle(cx + s, cy, cx - s * 0.7, cy - s, cx - s * 0.7, cy + s);
        break;
      case 'jump':
        g.fillTriangle(cx, cy - s, cx - s, cy + s * 0.7, cx + s, cy + s * 0.7);
        break;
      case 'kick':
        g.fillCircle(cx, cy, s * 0.9);
        g.fillStyle(0x222222, 0.9).fillCircle(cx, cy, s * 0.35);
        break;
      case 'bekas':
        g.fillCircle(cx, cy + s * 0.3, s * 0.55);
        for (const dx of [-0.7, 0, 0.7]) g.fillCircle(cx + dx * s, cy - s * 0.55, s * 0.25);
        break;
      case 'super':
        g.fillTriangle(cx - s * 0.2, cy - s, cx - s * 0.8, cy + s * 0.1, cx + s * 0.1, cy + s * 0.1);
        g.fillTriangle(cx + s * 0.2, cy + s, cx + s * 0.8, cy - s * 0.1, cx - s * 0.1, cy - s * 0.1);
        break;
      case 'pause':
        g.fillRect(cx - s * 1.1, cy - s * 1.2, s * 0.7, s * 2.4).fillRect(cx + s * 0.4, cy - s * 1.2, s * 0.7, s * 2.4);
        break;
    }
  }

  destroy(): void {
    this.gfx.destroy();
  }
}
