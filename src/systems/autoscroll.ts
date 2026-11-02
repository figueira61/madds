const MAX_DT_MS = 50;

/** Moves the camera on by speed × dt (dt capped like movement), stopping at the end of the level. */
export function stepAutoscroll(camX: number, speedPxS: number, dtMs: number, maxCamX: number): number {
  return Math.min(maxCamX, camX + (speedPxS * Math.min(dtMs, MAX_DT_MS)) / 1000);
}

/** True once the whole body has left the screen on the left. */
export function behindEdge(bodyRight: number, camX: number): boolean {
  return bodyRight <= camX;
}

/** Keeps a body's x inside the right edge of the view. */
export function clampRight(x: number, camX: number, viewW: number, margin = 8): number {
  return Math.min(x, camX + viewW - margin);
}
