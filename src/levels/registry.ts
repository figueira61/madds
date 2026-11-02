import type { LevelData } from './format';
import { TEST_ROOM } from './world1/test-room';
import { L1_BOSS } from './world1/l1-boss';

export const LEVELS: Record<string, LevelData> = {
  'test-room': TEST_ROOM,
  '1-boss': L1_BOSS,
};

export const WORLD1_ORDER: readonly string[] = ['1-1', '1-2', '1-3', '1-boss'];

export function nextLevel(id: string): string | null {
  const i = WORLD1_ORDER.indexOf(id);
  return i >= 0 && i < WORLD1_ORDER.length - 1 ? WORLD1_ORDER[i + 1] : null;
}
