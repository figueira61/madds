import type Phaser from 'phaser';
import { needsRotate } from './orientation';
import { isTouchDevice } from '../input/InputManager';
import { synth } from '../audio/Synth';
import type { LevelScene } from '../scenes/LevelScene';

/** Pauses the running level when the phone is upright or the tab is hidden, and shows a rotate hint. */
export class OrientationGuard {
  private readonly overlay: HTMLDivElement;
  private readonly onResize = () => this.check();
  private readonly onVisibility = () => this.visibility();

  constructor(private readonly game: Phaser.Game) {
    this.overlay = document.createElement('div');
    this.overlay.innerHTML = '<div style="font-size:56px;animation:madds-rot 1.6s ease-in-out infinite">📱</div><div>Roda o telemóvel para jogar</div>';
    Object.assign(this.overlay.style, {
      position: 'fixed', inset: '0', display: 'none', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px',
      background: '#0b1020', color: '#ffd34a', font: 'bold 18px monospace', textAlign: 'center', zIndex: '10',
    });
    const style = document.createElement('style');
    style.textContent = '@keyframes madds-rot { 0%,30% { transform: rotate(0) } 60%,100% { transform: rotate(-90deg) } }';
    document.head.appendChild(style);
    document.body.appendChild(this.overlay);
    window.addEventListener('resize', this.onResize);
    window.addEventListener('orientationchange', this.onResize);
    document.addEventListener('visibilitychange', this.onVisibility);
    this.check();
  }

  destroy(): void {
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('orientationchange', this.onResize);
    document.removeEventListener('visibilitychange', this.onVisibility);
    this.overlay.remove();
  }

  private check(): void {
    const rotate = needsRotate(window.innerWidth, window.innerHeight, isTouchDevice());
    this.overlay.style.display = rotate ? 'flex' : 'none';
    if (rotate) this.pauseLevel();
  }

  private visibility(): void {
    if (document.hidden) {
      this.pauseLevel();
      synth.suspend();
    } else {
      synth.resume();
    }
  }

  private pauseLevel(): void {
    const level = this.game.scene.getScene('Level') as LevelScene | null;
    if (level && this.game.scene.isActive('Level') && !this.game.scene.isPaused('Level')) level.openPause();
  }
}
