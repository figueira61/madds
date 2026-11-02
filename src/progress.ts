import type { SaveData } from './systems/saveStore';
import { LEVEL_ORDER } from './levels/registry';
import type { LevelData } from './levels/format';

export interface ResultLike {
  levelId: string;
  timeMs: number;
  falls: number;
  cromo: boolean;
}

/** Returns a new save with the level result merged in (best time, fewest falls, cromo kept once found). */
export function applyResult(save: SaveData, r: ResultLike, power: number): SaveData {
  const best = save.bestTimesMs[r.levelId];
  const falls = save.falls[r.levelId];
  return {
    ...save,
    completed: save.completed.includes(r.levelId) ? [...save.completed] : [...save.completed, r.levelId],
    cromos: r.cromo && !save.cromos.includes(r.levelId) ? [...save.cromos, r.levelId] : [...save.cromos],
    bestTimesMs: { ...save.bestTimesMs, [r.levelId]: best === undefined ? r.timeMs : Math.min(best, r.timeMs) },
    falls: { ...save.falls, [r.levelId]: falls === undefined ? r.falls : Math.min(falls, r.falls) },
    power,
    options: { ...save.options },
  };
}

export function isUnlocked(save: SaveData, id: string): boolean {
  const i = LEVEL_ORDER.indexOf(id);
  if (i <= 0) return i === 0;
  return save.completed.includes(LEVEL_ORDER[i - 1]);
}

export function hasBekas(save: SaveData): boolean {
  return save.completed.includes('1-boss');
}

/** Bekas is always there from World 2 on, even with a save that never beat the Hunter (dev links, old saves). */
export function bekasJoinedFor(save: SaveData, level: LevelData): boolean {
  return hasBekas(save) || level.world >= 2;
}

export function hasProgress(save: SaveData): boolean {
  return save.completed.length > 0;
}

/** Album order: every level of every world, the boss cromo after its world's levels. */
export const CROMO_IDS: readonly string[] = LEVEL_ORDER.filter((id) => !id.startsWith('test-'));

export interface GameSummary {
  totalTimeMs: number;
  falls: number;
  cromos: number;
  total: number;
}

/** For the credits: sum of best times and fewest falls per level, cromos found out of 12. */
export function gameSummary(save: SaveData): GameSummary {
  const sum = (m: Record<string, number>) => Object.values(m).reduce((a, b) => a + b, 0);
  return {
    totalTimeMs: sum(save.bestTimesMs),
    falls: sum(save.falls),
    cromos: CROMO_IDS.filter((id) => save.cromos.includes(id)).length,
    total: CROMO_IDS.length,
  };
}

export function albumState(save: SaveData): { owned: boolean[]; complete: boolean } {
  const owned = CROMO_IDS.map((id) => save.cromos.includes(id));
  return { owned, complete: owned.every(Boolean) };
}
