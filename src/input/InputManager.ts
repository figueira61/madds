import Phaser from 'phaser';
import { ACTIONS, ActionState, type Action } from './actions';
import { KEY_BINDINGS, PAD_BUTTONS, STICK_DEADZONE } from './bindings';
import { hitTest, touchLayout, type TouchButton } from './touchLayout';
import { TouchControls } from './TouchControls';
import { GAME_W, GAME_H } from '../config';

export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return navigator.maxTouchPoints > 0 || 'ontouchstart' in window || window.matchMedia?.('(pointer: coarse)').matches;
}

/** Feeds keyboard, gamepad and touch into one ActionState. Call update() once per frame. */
export class InputManager {
  readonly state = new ActionState();
  private readonly keys = new Map<Action, Phaser.Input.Keyboard.Key[]>();
  private readonly touch: TouchControls | null;

  constructor(private readonly scene: Phaser.Scene, opts: { touchScale: number; touchOffsetX: number }) {
    const kb = scene.input.keyboard;
    if (kb) {
      for (const a of ACTIONS) this.keys.set(a, KEY_BINDINGS[a].map((k) => kb.addKey(k, true, false)));
    }
    this.touch = isTouchDevice() ? new TouchControls(scene, touchLayout(GAME_W, GAME_H, opts.touchScale, opts.touchOffsetX)) : null;
  }

  setVisible(a: 'bekas' | 'super', visible: boolean): void {
    this.touch?.setVisible(a, visible);
  }

  update(): void {
    this.state.endFrame();

    for (const a of ACTIONS) this.state.set('kb', a, this.keys.get(a)?.some((k) => k.isDown) ?? false);

    const pad = this.scene.input.gamepad?.pad1;
    for (const a of ACTIONS) {
      let down = pad ? (PAD_BUTTONS[a] ?? []).some((i) => pad.buttons[i]?.pressed) : false;
      if (pad && (a === 'left' || a === 'right')) {
        const x = pad.axes[0]?.getValue() ?? 0;
        down ||= a === 'left' ? x < -STICK_DEADZONE : x > STICK_DEADZONE;
      }
      this.state.set('pad', a, down);
    }

    if (this.touch) {
      const points = this.scene.input.manager.pointers.filter((p) => p.isDown).map((p) => ({ x: p.x, y: p.y }));
      const hit = hitTest(this.touch.visibleLayout(), points);
      for (const a of ACTIONS) this.state.set('touch', a, hit.has(a as TouchButton));
      this.touch.draw(hit, this.scene.time.now);
    }
  }

  destroy(): void {
    this.touch?.destroy();
  }
}
