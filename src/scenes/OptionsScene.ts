import Phaser from 'phaser';
import { GAME_W, GAME_H } from '../config';
import { Menu, text } from '../ui/Menu';
import { synth } from '../audio/Synth';
import { gameState } from '../gameState';
import { TouchControls } from '../input/TouchControls';
import { touchLayout } from '../input/touchLayout';

const clamp = (v: number, lo: number, hi: number) => Math.round(Math.min(hi, Math.max(lo, v)) * 100) / 100;
const bar = (v: number) => `[${'|'.repeat(Math.round(v * 10)).padEnd(10, '.')}]`;

/** Volumes and touch-button size/offset, with a live preview of the buttons. Saves on every change. */
export class OptionsScene extends Phaser.Scene {
  private menu!: Menu;
  private preview!: TouchControls;
  private onClose!: () => void;
  private escKey!: Phaser.Input.Keyboard.Key;

  constructor() {
    super('Options');
  }

  init(data: { onClose: () => void }): void {
    this.onClose = data.onClose;
  }

  create(): void {
    this.add.rectangle(0, 0, GAME_W, GAME_H, 0x0b1020, 0.97).setOrigin(0);
    text(this, GAME_W / 2, 30, 'OPÇÕES', 20, '#ffd34a');
    text(this, GAME_W / 2, 52, '◀ ▶ para ajustar · toca para mudar', 8, '#cfd6e6');
    const o = gameState.save.options;
    this.preview = new TouchControls(this, touchLayout(GAME_W, GAME_H, o.touchScale, o.touchOffsetX));
    this.preview.setVisible('super', true);
    this.preview.draw(new Set(), 0);

    const labels = () => [
      `Música   ${bar(o.music)}`,
      `Efeitos  ${bar(o.sfx)}`,
      `Botões   ${Math.round(o.touchScale * 100)}%`,
      `Afastar  ${o.touchOffsetX > 0 ? '+' : ''}${o.touchOffsetX}`,
    ];
    const change = (fn: (dir: -1 | 1) => void) => (dir: -1 | 1) => {
      fn(dir);
      this.apply();
      labels().forEach((l, i) => this.menu.setLabel(i, l));
    };
    const cycle = (adjust: (dir: -1 | 1) => void, atMax: () => boolean, toMin: () => void) => () => {
      if (atMax()) {
        toMin();
        this.apply();
        labels().forEach((l, i) => this.menu.setLabel(i, l));
      } else adjust(1);
    };
    const music = change((d) => (o.music = clamp(o.music + d * 0.1, 0, 1)));
    const sfx = change((d) => (o.sfx = clamp(o.sfx + d * 0.1, 0, 1)));
    const scale = change((d) => (o.touchScale = clamp(o.touchScale + d * 0.25, 0.75, 1.5)));
    const offset = change((d) => (o.touchOffsetX = clamp(o.touchOffsetX + d * 10, -40, 40)));
    const l = labels();
    this.menu = new Menu(this, GAME_W / 2, 84, [
      { label: l[0], adjust: music, action: cycle(music, () => o.music >= 1, () => (o.music = 0)) },
      { label: l[1], adjust: sfx, action: cycle(sfx, () => o.sfx >= 1, () => (o.sfx = 0)) },
      { label: l[2], adjust: scale, action: cycle(scale, () => o.touchScale >= 1.5, () => (o.touchScale = 0.75)) },
      { label: l[3], adjust: offset, action: cycle(offset, () => o.touchOffsetX >= 40, () => (o.touchOffsetX = -40)) },
      { label: 'Voltar', action: () => this.close() },
    ], 20, 12);
    this.escKey = this.input.keyboard!.addKey('ESC');
  }

  update(): void {
    this.menu.update();
    if (Phaser.Input.Keyboard.JustDown(this.escKey)) this.close();
  }

  private apply(): void {
    const o = gameState.save.options;
    synth.setVolumes(o.music, o.sfx);
    this.preview.setLayout(touchLayout(GAME_W, GAME_H, o.touchScale, o.touchOffsetX));
    this.preview.draw(new Set(), 0);
    gameState.persist();
  }

  private close(): void {
    this.scene.stop();
    this.onClose();
  }
}
