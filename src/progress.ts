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
