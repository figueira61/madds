/** Phones held upright show a "rotate" overlay; desktops never do. */
export function needsRotate(w: number, h: number, touch: boolean): boolean {
  return touch && h > w;
}
