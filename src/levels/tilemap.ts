import Phaser from 'phaser';
import { TILE } from '../config';
import { TILE_FRAME } from '../art/sprites/tiles';
import type { LevelData } from './format';

export interface BuiltMap {
  map: Phaser.Tilemaps.Tilemap;
  layer: Phaser.Tilemaps.TilemapLayer;
  widthPx: number;
  heightPx: number;
}

const SOLID = new Set(['#', 'B', 'M']);

function frameFor(rows: string[], x: number, y: number): number {
  const above = y > 0 ? rows[y - 1][x] : '.';
  switch (rows[y][x]) {
    case '#':
      return SOLID.has(above) ? TILE_FRAME.ground : TILE_FRAME.groundTop;
    case '=':
      return TILE_FRAME.platform;
    case '^':
      return TILE_FRAME.spikes;
    case '~':
      return above === '~' ? TILE_FRAME.waterDeep : TILE_FRAME.waterA;
    case 'B':
      return TILE_FRAME.reinforced;
    case 'M':
      return TILE_FRAME.softDirt;
    default:
      return -1;
  }
}

/** Turns the level's character grid into a Phaser tilemap with collisions (one-way '=' platforms). */
export function buildTilemap(scene: Phaser.Scene, level: LevelData): BuiltMap {
  const rows = level.tiles;
  const data = rows.map((row, y) => [...row].map((_, x) => frameFor(rows, x, y)));
  const map = scene.make.tilemap({ data, tileWidth: TILE, tileHeight: TILE });
  const tileset = map.addTilesetImage('tiles', 'tiles', TILE, TILE, 0, 0)!;
  const layer = map.createLayer(0, tileset, 0, 0) as Phaser.Tilemaps.TilemapLayer;
  layer.setCollision([TILE_FRAME.ground, TILE_FRAME.groundTop, TILE_FRAME.reinforced, TILE_FRAME.softDirt]);
  layer.forEachTile((t) => {
    if (t.index === TILE_FRAME.platform) t.setCollision(false, false, true, false);
  });
  return { map, layer, widthPx: rows[0].length * TILE, heightPx: rows.length * TILE };
}

/** Alternates the frame of the surface water tiles for a simple wave animation. */
export function animateWater(layer: Phaser.Tilemaps.TilemapLayer, phase: 0 | 1): void {
  layer.forEachTile((t) => {
    if (t.index === TILE_FRAME.waterA || t.index === TILE_FRAME.waterB) t.index = phase === 0 ? TILE_FRAME.waterA : TILE_FRAME.waterB;
  });
}
