import Phaser from 'phaser';
import { GAME_W, GAME_H } from '../config';
import { LEVELS, nextLevel } from '../levels/registry';
import { Menu, text } from '../ui/Menu';
import { synth } from '../audio/Synth';
import { gameState } from '../gameState';
import { applyResult } from '../progress';
import { enterLevel, formatTime } from '../flow';
import type { LevelResult } from './LevelScene';
import type { CutsceneId } from '../story/cutscenes';

export interface ResultsData {
  result: LevelResult;
  power: number;
}

export class ResultsScene extends Phaser.Scene {
  private menu!: Menu;

  constructor() {
    super('Results');
  }

  create(data: ResultsData): void {
    const r = data.result;
    const level = LEVELS[r.levelId];
    const firstClear = !gameState.save.completed.includes(r.levelId);
    gameState.save = applyResult(gameState.save, r, data.power);
    gameState.persist();
    synth.stopMusic();
    synth.playSfx('goal');

    this.add.rectangle(0, 0, GAME_W, GAME_H, 0x1b2a3a).setOrigin(0);
    text(this, GAME_W / 2, 34, 'NÍVEL CONCLUÍDO!', 20, '#ffd34a');
    text(this, GAME_W / 2, 58, level?.name ?? r.levelId, 11);

    const rows: [string, string][] = [
      ['Tempo', formatTime(r.timeMs)],
      ['Quedas', String(r.falls)],
      ['Cromo', r.cromo ? '✓ Apanhado!' : '✗'],
    ];
    if (r.animalsTotal > 0) rows.push(['Animais libertados', `${r.animalsFreed} / ${r.animalsTotal}`]);
    rows.forEach(([k, v], i) => {
      text(this, GAME_W / 2 - 10, 90 + i * 18, k, 11, '#cfd6e6').setOrigin(1, 0.5);
      text(this, GAME_W / 2 + 10, 90 + i * 18, v, 11, '#ffffff').setOrigin(0, 0.5);
    });
    if (r.cromo) this.add.sprite(GAME_W / 2 + 110, 126, 'cromo').setScale(2).play('cromo-shine');

    const outro = level?.outro as CutsceneId | undefined;
    const next = nextLevel(r.levelId);
    const items = [];
    if (outro && firstClear) {
      items.push({ label: 'Continuar', action: () => this.scene.start('Cutscene', { id: outro, next: { scene: 'Continua' } }) });
    } else if (next && LEVELS[next]) {
      items.push({ label: 'Próximo nível', action: () => enterLevel(this, next) });
    }
    items.push({ label: 'Mapa', action: () => this.scene.start('WorldMap') });
    items.push({ label: 'Repetir nível', action: () => enterLevel(this, r.levelId) });
    this.menu = new Menu(this, GAME_W / 2, 176, items, 20, 12);
  }

  update(): void {
    this.menu.update();
  }
}
