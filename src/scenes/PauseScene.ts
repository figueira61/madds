import Phaser from 'phaser';
import { GAME_W, GAME_H } from '../config';
import { Menu, text } from '../ui/Menu';

export type PauseChoice = 'resume' | 'restart' | 'map' | 'options';

/** Overlay menu shown over the paused LevelScene. */
export class PauseScene extends Phaser.Scene {
  private menu!: Menu;
  private escKey!: Phaser.Input.Keyboard.Key;
  private onChoice!: (c: PauseChoice) => void;

  constructor() {
    super('Pause');
  }

  init(data: { onChoice: (c: PauseChoice) => void }): void {
    this.onChoice = data.onChoice;
  }

  create(): void {
    this.add.rectangle(0, 0, GAME_W, GAME_H, 0x0b1020, 0.7).setOrigin(0);
    text(this, GAME_W / 2, 60, 'PAUSA', 24, '#ffd34a');
    const pick = (c: PauseChoice) => () => this.onChoice(c);
    this.menu = new Menu(this, GAME_W / 2, 110, [
      { label: 'Continuar', action: pick('resume') },
      { label: 'Recomeçar nível', action: pick('restart') },
      { label: 'Voltar ao mapa', action: pick('map'), enabled: !!this.scene.get('WorldMap') },
      { label: 'Opções', action: pick('options'), enabled: !!this.scene.get('Options') },
    ]);
    this.escKey = this.input.keyboard!.addKey('ESC');
  }

  update(): void {
    this.menu.update();
    const pad = this.input.gamepad?.pad1;
    if (Phaser.Input.Keyboard.JustDown(this.escKey) || pad?.buttons[1]?.pressed) this.onChoice('resume');
  }
}
