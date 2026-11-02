/**
 * Level format. Tiles are one character each:
 * '.' empty, '#' ground, '=' one-way platform, '^' spikes, '~' water (deadly),
 * 'B' reinforced block (breaks with the powered kick), 'M' soft dirt (the controlled Bekas digs it),
 * 'g' ghost brick (solid once its brick-box is kicked), '<' '>' conveyor belts (solid, push at 60 px/s),
 * 'h' hidden platform (appears as a one-way platform when Bekas sniffs a nearby scent),
 * 'z' boost pad (solid; standing on it gives a burst of speed).
 */
export type TileChar = '.' | '#' | '=' | '^' | '~' | 'B' | 'M' | 'g' | '<' | '>' | 'h' | 'z';
export const TILE_CHARS: readonly TileChar[] = ['.', '#', '=', '^', '~', 'B', 'M', 'g', '<', '>', 'h', 'z'];
export const SOLID_TILES: readonly TileChar[] = ['#', 'B', 'M', '<', '>', 'z'];
/** Tiles that will become standable during play (built bricks, revealed platforms). */
export const LATENT_TILES: readonly TileChar[] = ['g', 'h'];

/** Hidden platforms within this many tiles of a scent are revealed when Bekas sniffs it. */
export const SCENT_RADIUS = 6;

export type ObjectType =
  | 'start' | 'exit' | 'checkpoint' | 'beetle' | 'bird' | 'cage' | 'golden-ball'
  | 'cromo' | 'log' | 'boss-hunter' | 'minion-spawn' | 'sign'
  | 'brick-box' | 'press' | 'plate' | 'switch' | 'door' | 'scent' | 'bekas-zone' | 'paw-sign'
  | 'minifig' | 'heli' | 'boss-robot'
  | 'racer' | 'drone' | 'car' | 'goal' | 'boss-collector';

export const BOSS_TYPES: readonly ObjectType[] = ['boss-hunter', 'boss-robot', 'boss-collector'];
export const ENEMY_TYPES: readonly ObjectType[] = ['beetle', 'bird', 'minifig', 'heli', 'racer', 'drone'];

/**
 * x, y in tiles (the tile the object stands in). Exceptions: 'press' hangs from row y and slams
 * down to the floor 3 rows below; 'bekas-zone' x, y is its top-left corner.
 */
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
  music: 'world1' | 'world2' | 'world3' | 'boss' | 'final';
  /** The camera moves on its own at this speed (px/s); falling behind its left edge is a fall. */
  autoscroll?: number;
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
    if (ENEMY_TYPES.includes(o.type)) total += 15;
    else if (o.type === 'cage') total += 10;
    else if (o.type === 'golden-ball') total += 20;
  }
  return total;
}
