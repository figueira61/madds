import type { SheetDef } from './pixels';
import { TILES_SHEET } from './sprites/tiles';
import { MADDS_SHEET } from './sprites/madds';
import { MADDS_ADQC_SHEET, TRANSFORM_SHEET } from './sprites/maddsAdqc';
import { PORTRAITS_SHEET } from './sprites/portraits';
import { BEKAS_SHEET } from './sprites/bekas';
import { BEETLE_SHEET, BIRD_SHEET, MINIFIG_SHEET, HELI_SHEET } from './sprites/enemies';
import { HUNTER_SHEET, NET_SHEET } from './sprites/hunter';
import { ANIMALS_SHEET } from './sprites/animals';
import * as props from './sprites/props';
import * as puzzle from './sprites/puzzle';
import * as race from './sprites/race';
import { COLLECTOR_SHEET, TROPHY_SHEET } from './sprites/collector';
import { ROBOT_SHEET, ROBOT_CORE_SHEET, BRICK_SHOT_SHEET, SHOCKWAVE_SHEET } from './sprites/robot';

/** Every sprite sheet in the game. Pure data: safe to import from tests. */
export const ALL_SHEETS: SheetDef[] = [
  TILES_SHEET, MADDS_SHEET, MADDS_ADQC_SHEET, TRANSFORM_SHEET, PORTRAITS_SHEET,
  BEKAS_SHEET, BEETLE_SHEET, BIRD_SHEET, MINIFIG_SHEET, HELI_SHEET, HUNTER_SHEET, NET_SHEET, ANIMALS_SHEET,
  props.BALL_SHEET, props.GOLDEN_BALL_SHEET, props.CROMO_SHEET, props.CAGE_SHEET, props.CHECKPOINT_SHEET,
  props.EXIT_SHEET, props.LOG_SHEET, props.COOKIE_SHEET, props.PHOTO_SHEET, props.HEART_PARTICLE_SHEET,
  props.BEKAS_SIGN_SHEET, props.HEART_SHEET, props.PARTICLE_SHEET,
  COLLECTOR_SHEET, TROPHY_SHEET,
  race.RACER_SHEET, race.DRONE_SHEET, race.CAR_SHEET, race.CAR_WARN_SHEET, race.PIT_SHEET, race.TROPHY_SHOT_SHEET, race.GOAL_SHEET,
  ROBOT_SHEET, ROBOT_CORE_SHEET, BRICK_SHOT_SHEET, SHOCKWAVE_SHEET,
  puzzle.BRICK_BOX_SHEET, puzzle.PLATE_SHEET, puzzle.DOOR_SHEET, puzzle.SWITCH_SHEET, puzzle.PRESS_SHEET,
];
