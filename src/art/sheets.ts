import type { SheetDef } from './pixels';
import { TILES_SHEET } from './sprites/tiles';
import { MADDS_SHEET } from './sprites/madds';
import { MADDS_ADQC_SHEET, TRANSFORM_SHEET } from './sprites/maddsAdqc';
import { PORTRAITS_SHEET } from './sprites/portraits';

/** Every sprite sheet in the game. Pure data: safe to import from tests. */
export const ALL_SHEETS: SheetDef[] = [TILES_SHEET, MADDS_SHEET, MADDS_ADQC_SHEET, TRANSFORM_SHEET, PORTRAITS_SHEET];
