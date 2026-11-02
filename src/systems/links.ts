/** Pressure plates (on while held) and switches (toggle) that doors listen to, by id. */
export class LinkBoard {
  private readonly on = new Map<string, boolean>();

  setPlate(id: string, pressed: boolean): void {
    this.on.set(id, pressed);
  }

  toggleSwitch(id: string): void {
    this.on.set(id, !this.isOn(id));
  }

  isOn(id: string): boolean {
    return this.on.get(id) ?? false;
  }
}

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** A door may only shut when no body overlaps it (touching an edge does not count). */
export function doorCanClose(door: Box, bodies: Box[]): boolean {
  return !bodies.some((b) => b.x < door.x + door.w && b.x + b.w > door.x && b.y < door.y + door.h && b.y + b.h > door.y);
}
