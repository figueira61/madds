import type { LevelData } from './format';
import { TEST_ROOM } from './world1/test-room';
import { L1_1 } from './world1/l1-1';
import { L1_2 } from './world1/l1-2';
import { L1_3 } from './world1/l1-3';
import { L1_BOSS } from './world1/l1-boss';
import { L2_1 } from './world2/l2-1';
import { L2_2 } from './world2/l2-2';
import { L2_3 } from './world2/l2-3';
import { L2_BOSS } from './world2/l2-boss';
import { TEST_PUZZLE } from './world2/test-puzzle';

export const LEVELS: Record<string, LevelData> = {
  'test-room': TEST_ROOM,
  'test-puzzle': TEST_PUZZLE,
  '1-1': L1_1,
  '1-2': L1_2,
  '1-3': L1_3,
  '1-boss': L1_BOSS,
  '2-1': L2_1,
  '2-2': L2_2,
  '2-3': L2_3,
  '2-boss': L2_BOSS,
};

export type WorldId = 1 | 2 | 3;

export const WORLD_ORDER: Record<WorldId, readonly string[]> = {
  1: ['1-1', '1-2', '1-3', '1-boss'],
  2: ['2-1', '2-2', '2-3', '2-boss'],
  3: [],
};

export const WORLD1_ORDER = WORLD_ORDER[1];

/** Every level in play order, across worlds. */
export const LEVEL_ORDER: readonly string[] = [...WORLD_ORDER[1], ...WORLD_ORDER[2], ...WORLD_ORDER[3]];

export function worldOf(id: string): WorldId | null {
  for (const w of [1, 2, 3] as const) if (WORLD_ORDER[w].includes(id)) return w;
  return null;
}

export function firstLevelOf(world: number): string | null {
  return WORLD_ORDER[world as WorldId]?.[0] ?? null;
}

/** Next level in the same world; null after the world's boss. */
export function nextLevel(id: string): string | null {
  const w = worldOf(id);
  if (!w) return null;
  const order = WORLD_ORDER[w];
  const i = order.indexOf(id);
  return i < order.length - 1 ? order[i + 1] : null;
}
