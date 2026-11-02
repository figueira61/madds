import type { LevelData } from './format';
import { TEST_ROOM } from './world1/test-room';
import { L1_1 } from './world1/l1-1';
import { L1_2 } from './world1/l1-2';
import { L1_3 } from './world1/l1-3';
import { L1_BOSS } from './world1/l1-boss';

export const LEVELS: Record<string, LevelData> = {
  'test-room': TEST_ROOM,
  '1-1': L1_1,
  '1-2': L1_2,
  '1-3': L1_3,
  '1-boss': L1_BOSS,
};

export const WORLD1_ORDER: readonly string[] = ['1-1', '1-2', '1-3', '1-boss'];

export function nextLevel(id: string): string | null {
  const i = WORLD1_ORDER.indexOf(id);
  return i >= 0 && i < WORLD1_ORDER.length - 1 ? WORLD1_ORDER[i + 1] : null;
}
