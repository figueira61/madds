/**
 * Level format. Tiles are one character each:
 * '.' empty, '#' ground, '=' one-way platform, '^' spikes, '~' water (deadly),
 * 'B' reinforced block (breaks with the powered kick), 'M' soft dirt (Bekas digs it in Phase 2; solid for now).
 */
export type TileChar = '.' | '#' | '=' | '^' | '~' | 'B' | 'M';
export const TILE_CHARS: readonly TileChar[] = ['.', '#', '=', '^', '~', 'B', 'M'];
export const SOLID_TILES: readonly TileChar[] = ['#', 'B', 'M'];

export type ObjectType =
  | 'start' | 'exit' | 'checkpoint' | 'beetle' | 'bird' | 'cage' | 'golden-ball'
  | 'cromo' | 'log' | 'boss-hunter' | 'minion-spawn' | 'sign';

/** x, y in tiles. */
export interface LevelObject {
  type: ObjectType;
  x: number;
  y: number;
  id?: string;
  props?: Record<string, number | string>;
}

export interface LevelData {
  id: string;
  name: string;
  world: 1 | 2 | 3;
  kind: 'normal' | 'boss';
  music: 'world1' | 'boss';
  tiles: string[];
  objects: LevelObject[];
  /** Cutscene ids played before / after the level. */
  intro?: string;
  outro?: string;
}

export const MIN_POWER_POTENTIAL = 150;

export function powerPotential(l: LevelData): number {
  let total = 0;
  for (const o of l.objects) {
    if (o.type === 'beetle' || o.type === 'bird') total += 15;
    else if (o.type === 'cage') total += 10;
    else if (o.type === 'golden-ball') total += 20;
  }
  return total;
}
