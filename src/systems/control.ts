export type Who = 'madds' | 'bekas';

/** Who the player controls. Bekas can only be picked inside a Bekas zone, but can always be left. */
export class ControlSwitch {
  active: Who = 'madds';
  private inZone = false;

  /** Called every frame: is the active character inside a Bekas zone? */
  setInZone(inZone: boolean): void {
    this.inZone = inZone;
  }

  get buttonVisible(): boolean {
    return this.inZone || this.active === 'bekas';
  }

  /** Switches when the button is available and the scene allows it (on the floor, not frozen). */
  toggle(canSwitch: boolean): boolean {
    if (!this.buttonVisible || !canSwitch) return false;
    this.active = this.active === 'madds' ? 'bekas' : 'madds';
    return true;
  }

  reset(): void {
    this.active = 'madds';
  }
}
