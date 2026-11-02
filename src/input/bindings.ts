import type { Action } from './actions';

/** Phaser key names per action. */
export const KEY_BINDINGS: Record<Action, string[]> = {
  left: ['LEFT', 'A'],
  right: ['RIGHT', 'D'],
  jump: ['SPACE', 'UP', 'W'],
  kick: ['X', 'J'],
  bekas: ['C', 'K'],
  super: ['V', 'L'],
  pause: ['ESC'],
};

/** Standard gamepad button indices per action. */
export const PAD_BUTTONS: Partial<Record<Action, number[]>> = {
  jump: [0],
  kick: [2],
  bekas: [3],
  super: [5],
  pause: [9],
  left: [14],
  right: [15],
};

export const STICK_DEADZONE = 0.3;
