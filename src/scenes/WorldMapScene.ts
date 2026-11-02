import Phaser from 'phaser';
import { GAME_W } from '../config';
import { LEVELS, LEVEL_ORDER, WORLD_ORDER, worldOf, type WorldId } from '../levels/registry';
import { InputManager } from '../input/InputManager';
import { text } from '../ui/Menu';
import { synth } from '../audio/Synth';
import { gameState } from '../gameState';
import { hasBekas, isUnlocked } from '../progress';
import { enterLevel, formatTime } from '../flow';

const NODES = [
  { x: 70, y: 190 },
  { x: 160, y: 140 },
  { x: 250, y: 180 },
  { x: 330, y: 120 },
];

const WORLD_NAMES: Record<WorldId, string> = {
  1: 'Mundo 1 — Santuário dos Animais',
  2: 'Mundo 2 — Cidade de Blocos',
  3: 'Mundo 3 — Estádio & Circuito',
};

/** Where the small islands of the other worlds sit on the right of the page. */
const SIDE_SLOTS = [
  { x: 430, y: 70 },
  { x: 430, y: 200 },
];

export interface WorldMapData {
  /** Level to select on open; defaults to the first unlocked level not yet completed. */
  select?: string;
}

/** One page per world: its island with the level path, plus small islands to jump to the other worlds. */
export class WorldMapScene extends Phaser.Scene {
  private world: WorldId = 1;
  private index = 0;
  private controls!: InputManager;
  private marker!: Phaser.GameObjects.Sprite;
  private bekas: Phaser.GameObjects.Sprite | null = null;
  private info!: Phaser.GameObjects.Text;
  private title!: Phaser.GameObjects.Text;
  private escKey!: Phaser.Input.Keyboard.Key;

  constructor() {
    super('WorldMap');
  }

  create(data?: WorldMapData): void {
    const save = gameState.save;
    const firstOpen = LEVEL_ORDER.find((id) => LEVELS[id] && !save.completed.includes(id) && isUnlocked(save, id));
    const selected = data?.select && isUnlocked(save, data.select) ? data.select : firstOpen ?? [...LEVEL_ORDER].reverse().find((id) => isUnlocked(save, id))!;
    this.world = worldOf(selected) ?? 1;
    const order = WORLD_ORDER[this.world];

    const g = this.add.graphics();
    g.fillGradientStyle(0x7ec8f0, 0x7ec8f0, 0x3fa4e0, 0x3fa4e0, 1).fillRect(0, 0, GAME_W, 270);
    this.drawIsland(g, this.world);
    g.lineStyle(6, 0xa8763f, 1);
    g.beginPath();
    g.moveTo(NODES[0].x, NODES[0].y);
    NODES.slice(1, order.length).forEach((n) => g.lineTo(n.x, n.y));
    g.strokePath();
    this.drawOtherWorlds(g);

    text(this, 200, 22, WORLD_NAMES[this.world], 12, '#ffd34a');

    order.forEach((id, i) => {
      const n = NODES[i];
      const unlocked = isUnlocked(save, id);
      const done = save.completed.includes(id);
      g.fillStyle(0x1a1a24, 1).fillCircle(n.x, n.y, 11);
      g.fillStyle(done ? 0xffd34a : unlocked ? 0xffffff : 0x62646e, 1).fillCircle(n.x, n.y, 9);
      text(this, n.x, n.y, id.endsWith('-boss') ? '!' : id.slice(2), 10, '#1a1a24').setStroke('#ffffff', 0);
      if (save.cromos.includes(id)) this.add.image(n.x + 12, n.y - 12, 'cromo', 0).setScale(0.75);
      this.add.zone(n.x, n.y, 30, 30).setInteractive().on('pointerdown', () => {
        if (this.index === i) this.enter();
        else this.select(i);
      });
    });

    this.marker = this.add.sprite(0, 0, 'madds').setOrigin(0.5, 1).play('madds-idle');
    this.bekas = hasBekas(save) || this.world >= 2 ? this.add.sprite(0, 0, 'bekas').setOrigin(0.5, 1).play('bekas-sit') : null;
    this.title = text(this, GAME_W / 2, 236, '', 12, '#ffffff');
    this.info = text(this, GAME_W / 2, 254, '', 9, '#ffffff');
    const back = text(this, 30, 14, '◀ Título', 9).setInteractive().on('pointerdown', () => this.scene.start('Title'));
    back.setPadding(4);

    this.controls = new InputManager(this, save.options);
    this.events.once('shutdown', () => this.controls.destroy());
    this.escKey = this.input.keyboard!.addKey('ESC');
    this.index = -1;
    this.select(order.indexOf(selected));
    synth.playMusic('title');
  }

  update(): void {
    this.controls.update();
    const s = this.controls.state;
    if (s.justPressed('right')) this.step(1);
    if (s.justPressed('left')) this.step(-1);
    if (s.justPressed('jump') || s.justPressed('kick')) this.enter();
    if (Phaser.Input.Keyboard.JustDown(this.escKey)) this.scene.start('Title');
  }

  /** Moves along the path; past either end it turns the page to the neighbouring world. */
  private step(d: 1 | -1): void {
    const order = WORLD_ORDER[this.world];
    const i = this.index + d;
    if (i >= 0 && i < order.length) {
      this.select(i);
      return;
    }
    const neighbour = LEVEL_ORDER[LEVEL_ORDER.indexOf(order[this.index]) + d];
    if (neighbour && LEVELS[neighbour] && isUnlocked(gameState.save, neighbour)) {
      synth.playSfx('select');
      this.scene.restart({ select: neighbour });
    }
  }

  private drawIsland(g: Phaser.GameObjects.Graphics, world: WorldId): void {
    if (world === 3) {
      // Stadium: stands around, the race track, and the pitch in the middle.
      g.fillStyle(0x4a4e66, 1).fillEllipse(200, 160, 370, 180);
      g.fillStyle(0x3a3a48, 1).fillEllipse(200, 160, 330, 150);
      g.fillStyle(0xff5a4a, 1).fillEllipse(200, 160, 300, 128);
      g.fillStyle(0x3a3a48, 1).fillEllipse(200, 160, 292, 120);
      g.fillStyle(0x3f8a3a, 1).fillEllipse(200, 160, 240, 90);
      g.lineStyle(2, 0xffffff, 0.8).strokeEllipse(200, 160, 236, 86).lineBetween(200, 117, 200, 203).strokeCircle(200, 160, 14);
      return;
    }
    if (world === 2) {
      g.fillStyle(0x8a8f9c, 1).fillRoundedRect(25, 85, 350, 150, 18);
      g.fillStyle(0xd8dce6, 1).fillRoundedRect(30, 80, 340, 140, 16);
      const colours = [0xff5a4a, 0xffd34a, 0x4a8cff, 0x5ccf5c, 0xff9a3a];
      for (let i = 0; i < 12; i++) {
        const x = 45 + ((i * 61) % 300);
        const y = 95 + ((i * 43) % 100);
        g.fillStyle(colours[i % colours.length], 1).fillRect(x, y, 22, 14);
        g.fillRect(x + 3, y - 3, 5, 3).fillRect(x + 13, y - 3, 5, 3);
      }
      return;
    }
    g.fillStyle(0x45913a, 1).fillEllipse(200, 165, 360, 170);
    g.fillStyle(0x6cbf4f, 1).fillEllipse(200, 158, 340, 150);
    for (let i = 0; i < 14; i++) g.fillStyle(0x2f6b3c, 1).fillCircle(40 + ((i * 53) % 320), 110 + ((i * 37) % 100), 8);
  }

  private drawOtherWorlds(g: Phaser.GameObjects.Graphics): void {
    const others = ([1, 2, 3] as WorldId[]).filter((w) => w !== this.world);
    const colour: Record<WorldId, number> = { 1: 0x6cbf4f, 2: 0xff9a3a, 3: 0xd99a1a };
    others.forEach((w, i) => {
      const { x, y } = SIDE_SLOTS[i];
      const first = WORLD_ORDER[w][0];
      const exists = !!first && !!LEVELS[first];
      const open = exists && isUnlocked(gameState.save, first);
      g.fillStyle(open ? colour[w] : 0x9a9ca6, 1).fillEllipse(x, y, 80, 50);
      text(this, x, y, `Mundo ${w}\n${!exists ? 'Em breve' : open ? 'Ir ▶' : 'Bloqueado'}`, 8, '#ffffff').setAlign('center');
      if (open) {
        this.add.zone(x, y, 80, 50).setInteractive().on('pointerdown', () => {
          synth.playSfx('select');
          const target = WORLD_ORDER[w].find((id) => !gameState.save.completed.includes(id) && isUnlocked(gameState.save, id)) ?? first;
          this.scene.restart({ select: target });
        });
      }
    });
  }

  private select(i: number): void {
    const id = WORLD_ORDER[this.world][i];
    if (!id || !isUnlocked(gameState.save, id)) return;
    if (i !== this.index && this.index >= 0) synth.playSfx('select');
    this.index = i;
    const n = NODES[i];
    this.marker.setPosition(n.x, n.y - 8);
    this.bekas?.setPosition(n.x + 14, n.y - 6);
    const save = gameState.save;
    const level = LEVELS[id];
    this.title.setText(level ? level.name : id);
    const best = save.bestTimesMs[id];
    const parts = [
      best !== undefined ? `Melhor tempo ${formatTime(best)}` : 'Por jogar',
      `Cromo ${save.cromos.includes(id) ? '✓' : '✗'}`,
    ];
    if (save.falls[id] !== undefined) parts.push(`Quedas ${save.falls[id]}`);
    this.info.setText(parts.join('   ·   '));
  }

  private enter(): void {
    const id = WORLD_ORDER[this.world][this.index];
    if (!id || !LEVELS[id] || !isUnlocked(gameState.save, id)) return;
    synth.playSfx('select');
    enterLevel(this, id);
  }
}
