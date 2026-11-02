export type PressPhase = 'up' | 'warn' | 'down';

export const PRESS_PERIOD_MS = 2400;
const WARN_MS = 400;
const DOWN_MS = 600;

/** Where a press is in its cycle: up, then 400 ms of shaking, then 600 ms slammed down. */
export function pressPhase(tMs: number, periodMs = PRESS_PERIOD_MS, offsetMs = 0): PressPhase {
  const t = (((tMs + offsetMs) % periodMs) + periodMs) % periodMs;
  if (t >= periodMs - DOWN_MS) return 'down';
  if (t >= periodMs - DOWN_MS - WARN_MS) return 'warn';
  return 'up';
}
