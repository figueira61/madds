import type { SheetDef } from './pixels';
import { TILES_SHEET } from './sprites/tiles';

/** Every sprite sheet in the game. Pure data: safe to import from tests. */
export const ALL_SHEETS: SheetDef[] = [TILES_SHEET];
