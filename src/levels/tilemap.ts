import Phaser from 'phaser';
import { TILE } from '../config';
import { TILE_FRAME } from '../art/sprites/tiles';
import { SCENT_RADIUS, type LevelData } from './format';

export interface BuiltMap {
  map: Phaser.Tilemaps.Tilemap;
  layer: Phaser.Tilemaps.TilemapLayer;
  widthPx: number;
  heightPx: number;
}

const SOLID = new Set(['#', 'B', 'M', '<', '>', 'z']);
const COLLIDING = [
  TILE_FRAME.ground, TILE_FRAME.groundTop, TILE_FRAME.reinforced, TILE_FRAME.softDirt,
  TILE_FRAME.brick, TILE_FRAME.brickTop, TILE_FRAME.conveyorLA, TILE_FRAME.conveyorLB, TILE_FRAME.conveyorRA, TILE_FRAME.conveyorRB,
  TILE_FRAME.trackTop, TILE_FRAME.track, TILE_FRAME.boostA, TILE_FRAME.boostB,
];
const ONE_WAY = new Set<number>([TILE_FRAME.platform, TILE_FRAME.brickPlatform, TILE_FRAME.hidden, TILE_FRAME.bleacher]);
/** Brick colours, chosen per two-tile brick so neighbouring bricks differ. */
const BRICK_TINTS = [0xff5a4a, 0xffd34a, 0x4a8cff, 0x5ccf5c, 0xff9a3a];
const GHOST_ALPHA = 0.45;

export function brickTint(x: number, y: number): number {
  // Rows are staggered by one tile, like a brick wall.
  const h = (Math.floor((x + (y % 2)) / 2) * 2 + y * 3) % BRICK_TINTS.length;
  return BRICK_TINTS[h];
}

function frameFor(rows: string[], x: number, y: number, world: number): number {
  const above = y > 0 ? rows[y - 1][x] : '.';
  const city = world === 2;
  const stadium = world === 3;
  switch (rows[y][x]) {
    case '#':
      if (city) return SOLID.has(above) ? TILE_FRAME.brick : TILE_FRAME.brickTop;
      if (stadium) return SOLID.has(above) ? TILE_FRAME.track : TILE_FRAME.trackTop;
      return SOLID.has(above) ? TILE_FRAME.ground : TILE_FRAME.groundTop;
    case '=':
      return city ? TILE_FRAME.brickPlatform : stadium ? TILE_FRAME.bleacher : TILE_FRAME.platform;
    case '^':
      return TILE_FRAME.spikes;
    case '~':
      return above === '~' ? TILE_FRAME.waterDeep : TILE_FRAME.waterA;
    case 'B':
      return TILE_FRAME.reinforced;
    case 'M':
      return TILE_FRAME.softDirt;
    case '<':
      return TILE_FRAME.conveyorLA;
    case '>':
      return TILE_FRAME.conveyorRA;
    case 'g':
      return TILE_FRAME.ghost;
    case 'z':
      return TILE_FRAME.boostA;
    default:
      return -1;
  }
}

function setOneWay(t: Phaser.Tilemaps.Tile): void {
  t.setCollision(false, false, true, false);
}

/** Turns the level's character grid into a Phaser tilemap with collisions (one-way platforms). */
export function buildTilemap(scene: Phaser.Scene, level: LevelData): BuiltMap {
  const rows = level.tiles;
  const data = rows.map((row, y) => [...row].map((_, x) => frameFor(rows, x, y, level.world)));
  const map = scene.make.tilemap({ data, tileWidth: TILE, tileHeight: TILE });
  const tileset = map.addTilesetImage('tiles', 'tiles', TILE, TILE, 0, 0)!;
  const layer = map.createLayer(0, tileset, 0, 0) as Phaser.Tilemaps.TilemapLayer;
  layer.setCollision(COLLIDING);
  layer.forEachTile((t) => {
    if (ONE_WAY.has(t.index)) setOneWay(t);
    if (t.index === TILE_FRAME.brick || t.index === TILE_FRAME.brickTop || t.index === TILE_FRAME.brickPlatform) t.tint = brickTint(t.x, t.y);
    if (t.index === TILE_FRAME.ghost) t.alpha = GHOST_ALPHA;
  });
  return { map, layer, widthPx: rows[0].length * TILE, heightPx: rows.length * TILE };
}

/** Alternates the frame of the surface water tiles for a simple wave animation. */
export function animateWater(layer: Phaser.Tilemaps.TilemapLayer, phase: 0 | 1): void {
  layer.forEachTile((t) => {
    if (t.index === TILE_FRAME.waterA || t.index === TILE_FRAME.waterB) t.index = phase === 0 ? TILE_FRAME.waterA : TILE_FRAME.waterB;
  });
}

/** Moves the chevrons of every conveyor belt and boost pad. */
export function animateConveyors(layer: Phaser.Tilemaps.TilemapLayer, phase: 0 | 1): void {
  layer.forEachTile((t) => {
    if (t.index === TILE_FRAME.boostA || t.index === TILE_FRAME.boostB) t.index = phase === 0 ? TILE_FRAME.boostA : TILE_FRAME.boostB;
    if (t.index === TILE_FRAME.conveyorLA || t.index === TILE_FRAME.conveyorLB) t.index = phase === 0 ? TILE_FRAME.conveyorLA : TILE_FRAME.conveyorLB;
    else if (t.index === TILE_FRAME.conveyorRA || t.index === TILE_FRAME.conveyorRB) t.index = phase === 0 ? TILE_FRAME.conveyorRA : TILE_FRAME.conveyorRB;
  });
}

/** -1 / 1 when the tile is a conveyor pushing left / right, else 0. */
export function conveyorDir(t: Phaser.Tilemaps.Tile | null): -1 | 0 | 1 {
  if (!t) return 0;
  if (t.index === TILE_FRAME.conveyorLA || t.index === TILE_FRAME.conveyorLB) return -1;
  if (t.index === TILE_FRAME.conveyorRA || t.index === TILE_FRAME.conveyorRB) return 1;
  return 0;
}

const BUILD_STEP_MS = 60;

/** Turns the ghost bricks of a rectangle into solid bricks, bottom row first, one every 60 ms. */
export function buildBricks(
  scene: Phaser.Scene,
  layer: Phaser.Tilemaps.TilemapLayer,
  rect: { x: number; y: number; w: number; h: number },
  onTile?: (x: number, y: number) => void,
): void {
  let i = 0;
  for (let y = rect.y + rect.h - 1; y >= rect.y; y--) {
    for (let x = rect.x; x < rect.x + rect.w; x++) {
      const tx = x;
      const ty = y;
      scene.time.delayedCall(i++ * BUILD_STEP_MS, () => {
        if (layer.getTileAt(tx, ty)?.index !== TILE_FRAME.ghost) return;
        const above = layer.getTileAt(tx, ty - 1);
        const covered = !!above && above.collides && !ONE_WAY.has(above.index);
        const t = layer.putTileAt(covered ? TILE_FRAME.brick : TILE_FRAME.brickTop, tx, ty);
        t.tint = brickTint(tx, ty);
        // The brick below loses its studs once covered.
        const below = layer.getTileAt(tx, ty + 1);
        if (below?.index === TILE_FRAME.brickTop) below.index = TILE_FRAME.brick;
        onTile?.(tx, ty);
      });
    }
  }
}

/** Shows every hidden platform within SCENT_RADIUS tiles of (cx, cy); returns how many appeared. */
export function revealHidden(layer: Phaser.Tilemaps.TilemapLayer, rows: string[], cx: number, cy: number): number {
  let n = 0;
  rows.forEach((row, y) =>
    [...row].forEach((ch, x) => {
      if (ch !== 'h' || Math.hypot(x - cx, y - cy) > SCENT_RADIUS) return;
      if (layer.getTileAt(x, y)?.index === TILE_FRAME.hidden) return;
      setOneWay(layer.putTileAt(TILE_FRAME.hidden, x, y));
      n++;
    }),
  );
  return n;
}

export function isBoost(t: Phaser.Tilemaps.Tile | null): boolean {
  return !!t && (t.index === TILE_FRAME.boostA || t.index === TILE_FRAME.boostB);
}
