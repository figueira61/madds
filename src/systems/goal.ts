import type { Box } from './links';

/** A goal counts when the ball's centre is inside the goal mouth. */
export function isGoal(ball: Box, goal: Box): boolean {
  const cx = ball.x + ball.w / 2;
  const cy = ball.y + ball.h / 2;
  return cx > goal.x && cx < goal.x + goal.w && cy > goal.y && cy < goal.y + goal.h;
}

/** Goals in the Collector's last phase: at most one per ball flight, three to win. */
export class GoalTracker {
  readonly needed = 3;
  scored = 0;
  private lastFlight = -1;

  get done(): boolean {
    return this.scored >= this.needed;
  }

  tryScore(flightId: number): boolean {
    if (this.done || flightId === this.lastFlight) return false;
    this.lastFlight = flightId;
    this.scored += 1;
    return true;
  }
}
