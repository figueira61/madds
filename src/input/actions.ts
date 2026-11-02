export type Action = 'left' | 'right' | 'jump' | 'kick' | 'bekas' | 'super' | 'pause';
export const ACTIONS: readonly Action[] = ['left', 'right', 'jump', 'kick', 'bekas', 'super', 'pause'];

/** Merges several input sources ('kb', 'pad', 'touch'): an action is down while any source holds it. */
export class ActionState {
  private readonly holders = new Map<Action, Set<string>>();
  private readonly wasDown = new Set<Action>();

  set(source: string, a: Action, down: boolean): void {
    let set = this.holders.get(a);
    if (!set) {
      set = new Set();
      this.holders.set(a, set);
    }
    if (down) set.add(source);
    else set.delete(source);
  }

  isDown(a: Action): boolean {
    return (this.holders.get(a)?.size ?? 0) > 0;
  }

  justPressed(a: Action): boolean {
    return this.isDown(a) && !this.wasDown.has(a);
  }

  anyDown(): boolean {
    return ACTIONS.some((a) => this.isDown(a));
  }

  endFrame(): void {
    this.wasDown.clear();
    for (const a of ACTIONS) if (this.isDown(a)) this.wasDown.add(a);
  }
}
