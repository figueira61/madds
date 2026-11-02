import Phaser from 'phaser';
import { GAME_W, GAME_H } from '../config';
import { LEVELS, WORLD1_ORDER } from '../levels/registry';
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

/** World 1 path with four nodes; Worlds 2 and 3 shown as "coming soon" islands. */
export class WorldMapScene extends Phaser.Scene {
  private index = 0;
  private controls!: InputManager;
  private marker!: Phaser.GameObjects.Sprite;
  private info!: Phaser.GameObjects.Text;
  private title!: Phaser.GameObjects.Text;
  private escKey!: Phaser.Input.Keyboard.Key;

  constructor() {
    super('WorldMap');
  }

  create(): void {
    const save = gameState.save;
    const g = this.add.graphics();
    g.fillGradientStyle(0x7ec8f0, 0x7ec8f0, 0x3fa4e0, 0x3fa4e0, 1).fillRect(0, 0, GAME_W, GAME_H);
    // World 1 island
    g.fillStyle(0x45913a, 1).fillEllipse(200, 165, 360, 170);
    g.fillStyle(0x6cbf4f, 1).fillEllipse(200, 158, 340, 150);
    for (let i = 0; i < 14; i++) g.fillStyle(0x2f6b3c, 1).fillCircle(40 + ((i * 53) % 320), 110 + ((i * 37) % 100), 8);
    // path
    g.lineStyle(6, 0xa8763f, 1);
    g.beginPath();
    g.moveTo(NODES[0].x, NODES[0].y);
    NODES.slice(1).forEach((n) => g.lineTo(n.x, n.y));
    g.strokePath();
    // future worlds
    g.fillStyle(0x9a9ca6, 1).fillEllipse(430, 70, 80, 50);
    g.fillStyle(0xd99a1a, 1).fillEllipse(430, 200, 80, 50);
    text(this, 430, 70, 'Mundo 2\nEm breve', 8, '#ffffff').setAlign('center');
    text(this, 430, 200, 'Mundo 3\nEm breve', 8, '#ffffff').setAlign('center');

    text(this, 200, 22, 'Mundo 1 — Santuário dos Animais', 12, '#ffd34a');

    WORLD1_ORDER.forEach((id, i) => {
      const n = NODES[i];
      const unlocked = isUnlocked(save, id);
      const done = save.completed.includes(id);
      g.fillStyle(0x1a1a24, 1).fillCircle(n.x, n.y, 11);
      g.fillStyle(done ? 0xffd34a : unlocked ? 0xffffff : 0x62646e, 1).fillCircle(n.x, n.y, 9);
      text(this, n.x, n.y, id === '1-boss' ? '!' : id.slice(2), 10, '#1a1a24').setStroke('#ffffff', 0);
      if (save.cromos.includes(id)) this.add.image(n.x + 12, n.y - 12, 'cromo', 0).setScale(0.75);
      this.add.zone(n.x, n.y, 30, 30).setInteractive().on('pointerdown', () => {
        if (this.index === i) this.enter();
        else this.select(i);
      });
    });

    this.marker = this.add.sprite(0, 0, 'madds').setOrigin(0.5, 1).play('madds-idle');
    if (hasBekas(save)) this.add.sprite(0, 0, 'bekas').setName('bekas').setOrigin(0.5, 1).play('bekas-sit');
    this.title = text(this, GAME_W / 2, 236, '', 12, '#ffffff');
    this.info = text(this, GAME_W / 2, 254, '', 9, '#ffffff');
    const back = text(this, 30, 14, '◀ Título', 9).setInteractive().on('pointerdown', () => this.scene.start('Title'));
    back.setPadding(4);

    this.controls = new InputManager(this, save.options);
    this.events.once('shutdown', () => this.controls.destroy());
    this.escKey = this.input.keyboard!.addKey('ESC');
    const firstOpen = WORLD1_ORDER.findIndex((id) => !save.completed.includes(id) && isUnlocked(save, id));
    this.select(firstOpen >= 0 ? firstOpen : WORLD1_ORDER.length - 1);
    synth.playMusic('title');
  }

  update(): void {
    this.controls.update();
    const s = this.controls.state;
    if (s.justPressed('right')) this.select(Math.min(this.index + 1, WORLD1_ORDER.length - 1));
    if (s.justPressed('left')) this.select(Math.max(this.index - 1, 0));
    if (s.justPressed('jump') || s.justPressed('kick')) this.enter();
    if (Phaser.Input.Keyboard.JustDown(this.escKey)) this.scene.start('Title');
  }

  private select(i: number): void {
    const id = WORLD1_ORDER[i];
    if (!isUnlocked(gameState.save, id)) return;
    if (i !== this.index) synth.playSfx('select');
    this.index = i;
    const n = NODES[i];
    this.marker.setPosition(n.x, n.y - 8);
    const bekas = this.children.getByName('bekas') as Phaser.GameObjects.Sprite | null;
    bekas?.setPosition(n.x + 14, n.y - 6);
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
    const id = WORLD1_ORDER[this.index];
    if (!LEVELS[id] || !isUnlocked(gameState.save, id)) return;
    synth.playSfx('select');
    enterLevel(this, id);
  }
}
