import Phaser from 'phaser';
import { GAME_W, GAME_H } from '../config';
import { Menu, text, type MenuItem } from '../ui/Menu';
import { gameState } from '../gameState';
import { albumState, CROMO_IDS } from '../progress';
import { LEVELS } from '../levels/registry';
import { CROMO_ART } from '../story/album';
import { SECRET_MESSAGE } from '../story/personal';

const CARD_W = 66;
const CARD_H = 86;
const COLS = 6;

/** The cromo album: 12 cards; missing ones show where to find them. All 12 unlock the secret message. */
export class AlbumScene extends Phaser.Scene {
  private menu!: Menu;
  private overlay: Phaser.GameObjects.Container | null = null;

  constructor() {
    super('Album');
  }

  create(): void {
    this.overlay = null;
    this.add.rectangle(0, 0, GAME_W, GAME_H, 0x1b2a3a).setOrigin(0);
    const state = albumState(gameState.save);
    const count = state.owned.filter(Boolean).length;
    text(this, GAME_W / 2, 14, `Álbum de cromos  ${count} / ${CROMO_IDS.length}`, 12, '#ffd34a');

    const left = (GAME_W - COLS * (CARD_W + 6) + 6) / 2;
    CROMO_IDS.forEach((id, i) => {
      const x = left + (i % COLS) * (CARD_W + 6);
      const y = 30 + Math.floor(i / COLS) * (CARD_H + 6);
      this.card(x, y, id, state.owned[i]);
    });

    const items: MenuItem[] = [{ label: 'Voltar', action: () => this.scene.start('Title') }];
    if (state.complete) items.unshift({ label: 'Mensagem secreta', action: () => this.showSecret() });
    this.menu = new Menu(this, GAME_W / 2, GAME_H - (items.length > 1 ? 34 : 18), items, 16, 11);
  }

  update(): void {
    if (!this.overlay) this.menu.update();
  }

  private card(x: number, y: number, id: string, owned: boolean): void {
    const art = CROMO_ART[id];
    const g = this.add.graphics();
    g.fillStyle(0x10121c, 1).fillRoundedRect(x, y, CARD_W, CARD_H, 4);
    if (!owned) {
      g.lineStyle(1, 0x62646e, 1).strokeRoundedRect(x, y, CARD_W, CARD_H, 4);
      text(this, x + CARD_W / 2, y + 34, '?', 26, '#62646e');
      text(this, x + CARD_W / 2, y + CARD_H - 12, LEVELS[id]?.name ?? id, 7, '#9a9ca6').setWordWrapWidth(CARD_W - 6).setAlign('center');
      return;
    }
    g.fillStyle(art.colour, 1).fillRoundedRect(x + 3, y + 3, CARD_W - 6, CARD_H - 22, 3);
    g.lineStyle(2, 0xffd34a, 1).strokeRoundedRect(x, y, CARD_W, CARD_H, 4);
    const img = this.add.image(x + CARD_W / 2, y + 3 + (CARD_H - 22) / 2, art.texture, art.frame);
    img.setScale(Math.min(2, (CARD_W - 14) / img.width, (CARD_H - 30) / img.height));
    text(this, x + CARD_W / 2, y + CARD_H - 10, art.title, 7, '#ffffff').setWordWrapWidth(CARD_W - 4).setAlign('center');
  }

  private showSecret(): void {
    const bg = this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W - 40, GAME_H - 40, 0x10121c, 0.96).setStrokeStyle(2, 0xffd34a);
    const msg = text(this, GAME_W / 2, GAME_H / 2 - 10, SECRET_MESSAGE, 11, '#ffffff').setWordWrapWidth(GAME_W - 80).setAlign('center');
    const close = text(this, GAME_W / 2, GAME_H - 36, 'Fechar', 11, '#ffd34a').setInteractive({ useHandCursor: true });
    this.overlay = this.add.container(0, 0, [bg, msg, close]).setDepth(200);
    const shut = () => {
      this.overlay?.destroy();
      this.overlay = null;
      this.input.keyboard?.off('keydown', shut);
    };
    close.on('pointerdown', shut);
    this.time.delayedCall(200, () => this.input.keyboard?.once('keydown', shut));
  }
}
