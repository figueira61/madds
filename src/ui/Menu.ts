import Phaser from 'phaser';
import { synth } from '../audio/Synth';

export interface MenuItem {
  label: string;
  action: () => void;
  enabled?: boolean;
}

export const FONT = 'monospace';

export function text(scene: Phaser.Scene, x: number, y: number, s: string, size = 12, color = '#ffffff'): Phaser.GameObjects.Text {
  return scene.add
    .text(x, y, s, { fontFamily: FONT, fontSize: `${size}px`, fontStyle: 'bold', color, stroke: '#1a1a24', strokeThickness: 3, resolution: 4 })
    .setOrigin(0.5);
}

/**
 * Vertical menu driven by keyboard (↑/↓/W/S, Enter/Space/X), gamepad (D-pad, A) or touch/click on an item.
 * Call update() every frame.
 */
export class Menu {
  private index = 0;
  private readonly labels: Phaser.GameObjects.Text[];
  private readonly keys: Record<'up' | 'down' | 'ok', Phaser.Input.Keyboard.Key[]>;
  private padPrev = { up: false, down: false, ok: false };
  private ready = false;

  constructor(private readonly scene: Phaser.Scene, x: number, y: number, private readonly items: MenuItem[], spacing = 22, size = 14) {
    this.labels = items.map((it, i) => {
      const t = text(scene, x, y + i * spacing, it.label, size, it.enabled === false ? '#7a7f8c' : '#ffffff').setDepth(100);
      t.setInteractive({ useHandCursor: true }).on('pointerdown', () => {
        this.index = i;
        this.refresh();
        this.choose();
      });
      return t;
    });
    const kb = scene.input.keyboard!;
    this.keys = {
      up: [kb.addKey('UP'), kb.addKey('W')],
      down: [kb.addKey('DOWN'), kb.addKey('S')],
      ok: [kb.addKey('ENTER'), kb.addKey('SPACE'), kb.addKey('X')],
    };
    while (this.items[this.index]?.enabled === false) this.index += 1;
    this.refresh();
    // Ignore the key press that opened this menu.
    scene.time.delayedCall(150, () => (this.ready = true));
  }

  update(): void {
    if (!this.ready) return;
    const pressed = (ks: Phaser.Input.Keyboard.Key[]) => ks.some((k) => Phaser.Input.Keyboard.JustDown(k));
    const pad = this.scene.input.gamepad?.pad1;
    const now = { up: !!pad?.buttons[12]?.pressed, down: !!pad?.buttons[13]?.pressed, ok: !!pad?.buttons[0]?.pressed };
    const edge = (k: 'up' | 'down' | 'ok') => now[k] && !this.padPrev[k];
    if (pressed(this.keys.up) || edge('up')) this.move(-1);
    if (pressed(this.keys.down) || edge('down')) this.move(1);
    if (pressed(this.keys.ok) || edge('ok')) this.choose();
    this.padPrev = now;
  }

  destroy(): void {
    this.labels.forEach((l) => l.destroy());
  }

  private move(d: number): void {
    let i = this.index;
    do i = (i + d + this.items.length) % this.items.length;
    while (this.items[i].enabled === false && i !== this.index);
    this.index = i;
    synth.playSfx('select');
    this.refresh();
  }

  private choose(): void {
    const item = this.items[this.index];
    if (item.enabled === false) return;
    synth.playSfx('select');
    item.action();
  }

  private refresh(): void {
    this.labels.forEach((l, i) => {
      const selected = i === this.index;
      l.setText(selected ? `> ${this.items[i].label} <` : this.items[i].label);
      l.setColor(this.items[i].enabled === false ? '#7a7f8c' : selected ? '#ffd34a' : '#ffffff');
    });
  }
}
