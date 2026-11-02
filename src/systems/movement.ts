export interface MoveParams {
  maxSpeed: number;
  accel: number;
  decel: number;
  gravity: number;
  maxFallSpeed: number;
  jumpSpeed: number;
  jumpCut: number;
  coyoteMs: number;
  bufferMs: number;
  wallSlideMax: number;
  wallJumpVx: number;
  wallJumpVy: number;
  wallLockMs: number;
  canWallJump: boolean;
}

export const MADDS_PARAMS: MoveParams = {
  maxSpeed: 150,
  accel: 1500,
  decel: 1800,
  gravity: 900,
  /** Arcade only catches tiles overlapped by ≤16 px per step, so falls are capped well below 960 px/s. */
  maxFallSpeed: 600,
  jumpSpeed: 330,
  jumpCut: 0.5,
  coyoteMs: 100,
  bufferMs: 120,
  wallSlideMax: 60,
  wallJumpVx: 180,
  wallJumpVy: 300,
  wallLockMs: 150,
  canWallJump: true,
};

/** Bekas when the player controls her: lower jump, no wall jump. */
export const BEKAS_PARAMS: MoveParams = { ...MADDS_PARAMS, jumpSpeed: 260, canWallJump: false };

export interface MoveInput {
  left: boolean;
  right: boolean;
  jumpPressed: boolean;
  jumpHeld: boolean;
}

export interface Contact {
  onFloor: boolean;
  wallLeft: boolean;
  wallRight: boolean;
}

export interface MoveState {
  vx: number;
  vy: number;
  facing: 1 | -1;
  sinceFloorMs: number;
  sinceJumpPressMs: number;
  wallLockMs: number;
  jumpCutDone: boolean;
  wallSliding: boolean;
}

const MAX_DT_MS = 50;

export function createMoveState(): MoveState {
  return {
    vx: 0,
    vy: 0,
    facing: 1,
    sinceFloorMs: Infinity,
    sinceJumpPressMs: Infinity,
    wallLockMs: 0,
    jumpCutDone: true,
    wallSliding: false,
  };
}

function approach(value: number, target: number, delta: number): number {
  if (value < target) return Math.min(value + delta, target);
  return Math.max(value - delta, target);
}

/**
 * Advances one frame of platformer movement. Pure: returns a new state.
 * y grows downwards (Phaser convention); gravity is applied here, not by the physics body.
 * Order: timers → horizontal → jump / wall jump → jump cut → gravity → wall slide.
 */
export function stepMovement(
  s: MoveState,
  input: MoveInput,
  c: Contact,
  dtMs: number,
  p: MoveParams,
  speedMul = 1,
): MoveState {
  const dt = Math.min(dtMs, MAX_DT_MS);
  const sec = dt / 1000;
  const n: MoveState = { ...s };

  n.sinceFloorMs = c.onFloor ? 0 : n.sinceFloorMs + dt;
  n.sinceJumpPressMs = input.jumpPressed ? 0 : n.sinceJumpPressMs + dt;
  n.wallLockMs = Math.max(0, n.wallLockMs - dt);

  const dir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  if (n.wallLockMs === 0) {
    if (dir !== 0) {
      n.facing = dir as 1 | -1;
      n.vx = approach(n.vx, dir * p.maxSpeed * speedMul, p.accel * sec);
    } else {
      n.vx = approach(n.vx, 0, p.decel * sec);
    }
  }

  const wantsJump = n.sinceJumpPressMs <= p.bufferMs;
  const touchingWall = !c.onFloor && (c.wallLeft || c.wallRight);
  let jumped = false;
  if (wantsJump && n.sinceFloorMs <= p.coyoteMs) {
    n.vy = -p.jumpSpeed;
    jumped = true;
  } else if (wantsJump && touchingWall && p.canWallJump) {
    const away = c.wallRight ? -1 : 1;
    n.vx = away * p.wallJumpVx;
    n.vy = -p.wallJumpVy;
    n.facing = away;
    n.wallLockMs = p.wallLockMs;
    jumped = true;
  }
  if (jumped) {
    n.sinceJumpPressMs = Infinity;
    n.sinceFloorMs = Infinity;
    n.jumpCutDone = false;
    n.wallSliding = false;
    return n;
  }

  if (!input.jumpHeld && !n.jumpCutDone && n.vy < 0) {
    n.vy *= p.jumpCut;
    n.jumpCutDone = true;
  }

  if (!c.onFloor) n.vy = Math.min(n.vy + p.gravity * sec, p.maxFallSpeed);
  else if (n.vy > 0) n.vy = 0;

  const pushingIntoWall = (c.wallRight && input.right) || (c.wallLeft && input.left);
  n.wallSliding = touchingWall && pushingIntoWall && n.vy > 0;
  if (n.wallSliding && n.vy > p.wallSlideMax) n.vy = p.wallSlideMax;

  return n;
}
