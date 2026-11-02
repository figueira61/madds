import Phaser from 'phaser';
import { GAME_W, GAME_H } from '../config';
import { CUTSCENES, SPEAKER_NAME, type CutsceneId } from '../story/cutscenes';
import { PORTRAIT_FRAME } from '../art/sprites/portraits';
import { InputManager } from '../input/InputManager';
import { text } from '../ui/Menu';
import { synth } from '../audio/Synth';
import { gameState } from '../gameState';

export interface CutsceneData {
  id: CutsceneId;
  next: { scene: string; data?: object };
}

const CHAR_MS = 28;

/** Dialogue with portraits and typewriter text. Jump/kick/tap advance; pause skips everything. */
export class CutsceneScene extends Phaser.Scene {
  private cfg!: CutsceneData;
  private index = 0;
  private shown = 0;
  private typing = false;
  private controls!: InputManager;
  private portrait!: Phaser.GameObjects.Image;
  private nameText!: Phaser.GameObjects.Text;
  private body!: Phaser.GameObjects.Text;
  private hint!: Phaser.GameObjects.Text;
  private typeTimer: Phaser.Time.TimerEvent | null = null;

  constructor() {
    super('Cutscene');
  }

  init(data: CutsceneData): void {
    this.cfg = data;
    this.index = 0;
  }

  create(): void {
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1b2a3a, 0x1b2a3a, 0x2c5a2a, 0x2c5a2a, 1).fillRect(0, 0, GAME_W, GAME_H);
    for (let i = 0; i < 40; i++) bg.fillStyle(0xffffff, 0.15).fillCircle((i * 97) % GAME_W, (i * 53) % 150, 1);

    this.portrait = this.add.image(80, 150, 'portraits', 0).setScale(2);
    const box = this.add.graphics();
    box.fillStyle(0x0b1020, 0.9).fillRoundedRect(140, 150, 326, 104, 8);
    box.lineStyle(2, 0xffffff, 0.8).strokeRoundedRect(140, 150, 326, 104, 8);
    this.nameText = text(this, 150, 164, '', 11, '#ffd34a').setOrigin(0, 0.5);
    this.body = this.add
      .text(152, 178, '', { fontFamily: 'monospace', fontSize: '11px', color: '#ffffff', wordWrap: { width: 304 }, lineSpacing: 3, resolution: 4 })
      .setOrigin(0, 0);
    this.hint = text(this, 450, 244, '▼', 10, '#ffffff');
    text(this, GAME_W - 8, 10, 'Pausa: saltar cena', 8, '#cfd6e6').setOrigin(1, 0.5);

    this.controls = new InputManager(this, gameState.save.options);
    this.input.on('pointerdown', () => this.advance());
    if (this.cfg.id === 'w1-reunion') synth.playMusic('reunion');
    this.events.once('shutdown', () => this.controls.destroy());
    this.showLine();
  }

  update(): void {
    this.controls.update();
    const s = this.controls.state;
    if (s.justPressed('pause')) this.finish();
    else if (s.justPressed('jump') || s.justPressed('kick')) this.advance();
    this.hint.setVisible(!this.typing && Math.floor(this.time.now / 400) % 2 === 0);
  }

  private showLine(): void {
    const line = CUTSCENES[this.cfg.id][this.index];
    this.portrait.setVisible(!!line.portrait);
    if (line.portrait) this.portrait.setFrame(PORTRAIT_FRAME[line.portrait]);
    this.nameText.setText(SPEAKER_NAME[line.speaker]);
    this.body.setColor(line.speaker === 'narrador' ? '#cfe3ff' : '#ffffff').setFontStyle(line.speaker === 'narrador' ? 'italic' : 'normal');
    if (line.speaker === 'bekas') synth.playSfx('bark');
    this.shown = 0;
    this.typing = true;
    this.body.setText('');
    this.typeTimer?.remove(false);
    this.typeTimer = this.time.addEvent({
      delay: CHAR_MS,
      repeat: line.text.length - 1,
      callback: () => {
        this.shown += 1;
        this.body.setText(line.text.slice(0, this.shown));
        if (this.shown >= line.text.length) this.typing = false;
      },
    });
  }

  private advance(): void {
    const line = CUTSCENES[this.cfg.id][this.index];
    if (this.typing) {
      this.typeTimer?.remove(false);
      this.body.setText(line.text);
      this.typing = false;
      return;
    }
    synth.playSfx('select');
    this.index += 1;
    if (this.index >= CUTSCENES[this.cfg.id].length) this.finish();
    else this.showLine();
  }

  private finish(): void {
    this.scene.start(this.cfg.next.scene, this.cfg.next.data);
  }
}
