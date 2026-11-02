import Phaser from 'phaser';
import { GAME_W } from '../config';
import { text } from '../ui/Menu';
import { synth } from '../audio/Synth';
import type { LevelScene } from './LevelScene';

const BAR_X = 50;
const BAR_Y = 8;
const BAR_W = 64;
const BAR_H = 8;

/** Hearts, power bar, cromo and boss bar. Reacts to LevelScene events instead of polling every frame. */
export class HudScene extends Phaser.Scene {
  private level!: LevelScene;
  private hearts: Phaser.GameObjects.Image[] = [];
  private bar!: Phaser.GameObjects.Graphics;
  private barLabel!: Phaser.GameObjects.Text;
  private cromo!: Phaser.GameObjects.Sprite;
  private bossBar!: Phaser.GameObjects.Graphics;
  private bossName!: Phaser.GameObjects.Text;
  private power = 0;
  private powerActive = false;
  private wasFull = false;

  constructor() {
    super('Hud');
  }

  init(data: { level: LevelScene }): void {
    this.level = data.level;
    this.hearts = [];
  }

  create(): void {
    for (let i = 0; i < 3; i++) this.hearts.push(this.add.image(10 + i * 13, 12, 'heart', 0));
    this.bar = this.add.graphics();
    this.barLabel = text(this, BAR_X + BAR_W / 2, BAR_Y + BAR_H + 7, 'A.D.Q.C.', 7, '#ffffff');
    this.cromo = this.add.sprite(GAME_W - 14, 13, 'cromo', 0).setTint(0x444444).setAlpha(0.6);
    this.bossBar = this.add.graphics();
    this.bossName = text(this, GAME_W / 2, 30, '', 8).setVisible(false);

    this.setHearts(this.level.health.hearts);
    this.setPower(this.level.power.value, this.level.power.active);
    this.setCromo(this.level.gotCromo);

    const ev = this.level.events;
    const on = <T extends unknown[]>(name: string, fn: (...args: T) => void) => {
      ev.on(name, fn, this);
      this.events.once('shutdown', () => ev.off(name, fn, this));
    };
    on('hud-hearts', (n: number) => this.setHearts(n));
    on('hud-power', (v: number, active: boolean) => this.setPower(v, active));
    on('hud-cromo', (got: boolean) => this.setCromo(got));
    on('hud-boss', (hp: number, max: number, name: string) => this.setBoss(hp, max, name));
    on('hud-adqc', () => this.shoutAdqc());
  }

  update(time: number): void {
    // Only the full-bar shimmer animates.
    if (this.power >= 100 && !this.powerActive) this.drawBar(0.6 + 0.4 * Math.sin(time / 120));
  }

  private setHearts(n: number): void {
    this.hearts.forEach((h, i) => h.setFrame(i < n ? 0 : 1));
  }

  private setPower(v: number, active: boolean): void {
    this.power = v;
    this.powerActive = active;
    const full = v >= 100 && !active;
    if (full && !this.wasFull) synth.playSfx('power-full');
    this.wasFull = full;
    this.drawBar(1);
  }

  private drawBar(glow: number): void {
    const g = this.bar.clear();
    g.fillStyle(0x1a1a24, 0.8).fillRect(BAR_X - 2, BAR_Y - 2, BAR_W + 4, BAR_H + 4);
    const color = this.powerActive ? 0x5a8cf0 : this.power >= 100 ? 0xffd34a : 0x2457c9;
    g.fillStyle(color, this.power >= 100 && !this.powerActive ? glow : 1).fillRect(BAR_X, BAR_Y, (BAR_W * this.power) / 100, BAR_H);
    g.lineStyle(1, 0xffffff, 0.9).strokeRect(BAR_X - 1, BAR_Y - 1, BAR_W + 2, BAR_H + 2);
    this.barLabel.setColor(this.power >= 100 && !this.powerActive ? '#ffd34a' : '#ffffff');
  }

  private setCromo(got: boolean): void {
    if (got) this.cromo.clearTint().setAlpha(1).play('cromo-shine');
    else this.cromo.setTint(0x444444).setAlpha(0.6);
  }

  private setBoss(hp: number, max: number, name: string): void {
    const g = this.bossBar.clear();
    this.bossName.setVisible(hp > 0).setText(name);
    if (hp <= 0) return;
    const w = 160;
    const x = GAME_W / 2 - w / 2;
    g.fillStyle(0x1a1a24, 0.8).fillRect(x - 2, 38, w + 4, 8);
    g.fillStyle(0xe04848, 1).fillRect(x, 40, (w * hp) / max, 4);
  }

  private shoutAdqc(): void {
    const t = text(this, GAME_W / 2, 120, 'A.D.Q.C.!', 36, '#ffffff').setStroke('#2457c9', 8).setScale(0.2).setAngle(-8);
    this.tweens.add({ targets: t, scale: 1, duration: 350, ease: 'Back.easeOut' });
    this.tweens.add({ targets: t, alpha: 0, scale: 1.3, delay: 1000, duration: 300, onComplete: () => t.destroy() });
  }
}
