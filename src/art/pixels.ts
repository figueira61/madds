export interface AnimDef {
  frames: number[];
  fps: number;
  repeat: number;
}

export interface SheetDef {
  key: string;
  frameW: number;
  frameH: number;
  /** Each frame is frameH rows of frameW palette characters. */
  frames: string[][];
  anims?: Record<string, AnimDef>;
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rowsToRGBA(rows: string[], palette: Record<string, string>): Uint8ClampedArray<ArrayBuffer> {
  const w = rows[0]?.length ?? 0;
  const out = new Uint8ClampedArray(w * rows.length * 4);
  rows.forEach((row, y) => {
    for (let x = 0; x < w; x++) {
      const ch = row[x];
      if (ch === '.' || ch === undefined) continue;
      const [r, g, b] = hexToRgb(palette[ch]);
      out.set([r, g, b, 255], (y * w + x) * 4);
    }
  });
  return out;
}

export function checkSheet(def: SheetDef, palette: Record<string, string>): string[] {
  const errors: string[] = [];
  def.frames.forEach((rows, f) => {
    if (rows.length !== def.frameH) errors.push(`${def.key}[${f}]: altura ${rows.length}, esperado ${def.frameH}`);
    rows.forEach((row, y) => {
      if (row.length !== def.frameW) errors.push(`${def.key}[${f}] linha ${y}: largura ${row.length}, esperado ${def.frameW}`);
      for (const ch of row) if (ch !== '.' && !(ch in palette)) errors.push(`${def.key}[${f}] linha ${y}: caractere '${ch}' fora da paleta`);
    });
  });
  for (const [name, a] of Object.entries(def.anims ?? {})) {
    for (const f of a.frames) if (f < 0 || f >= def.frames.length) errors.push(`${def.key}: anim '${name}' usa frame ${f} inexistente`);
  }
  return errors;
}

/** Replaces whole rows of a frame (by index), for small variations between frames. */
export function withRows(base: string[], changes: Record<number, string>): string[] {
  return base.map((row, i) => changes[i] ?? row);
}

/** Mirrors a frame horizontally. */
export function flipX(rows: string[]): string[] {
  return rows.map((r) => [...r].reverse().join(''));
}
