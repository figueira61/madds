import { SOLID_TILES, type LevelData, type TileChar } from './format';

/** A full jump rises ~3.7 tiles, so a surface may be at most this many rows above the one below it. */
const MAX_STEP_UP_ROWS = 3;
const MAX_GAP_TILES = 6;
/** Pickups count as reached when Madds' body (1.5 tiles) touches them at the top of a jump. */
const MAX_PICKUP_ROWS = 5;
const MAX_PICKUP_GAP = 4;

interface Surface {
  x: number;
  y: number;
}

const STANDABLE = new Set<string>([...SOLID_TILES, '=']);

function surfaces(l: LevelData): Surface[] {
  const out: Surface[] = [];
  l.tiles.forEach((row, y) =>
    [...row].forEach((ch, x) => {
      const above = y > 0 ? l.tiles[y - 1][x] : '.';
      if (STANDABLE.has(ch) && !SOLID_TILES.includes(above as TileChar)) out.push({ x, y });
    }),
  );
  // Moving logs: every tile along their path is a surface (3 tiles wide).
  for (const o of l.objects) {
    if (o.type !== 'log') continue;
    const dx = Number(o.props?.dx ?? 0);
    const dy = Number(o.props?.dy ?? 0);
    for (let x = Math.min(0, dx) - 1; x <= Math.max(0, dx) + 1; x++)
      for (let y = Math.min(0, dy); y <= Math.max(0, dy); y++) out.push({ x: o.x + x, y: o.y + y });
  }
  return out;
}

/** Contiguous runs of one-way platform tiles on the same row. */
function platformSegments(l: LevelData): { x0: number; x1: number; y: number }[] {
  const segs: { x0: number; x1: number; y: number }[] = [];
  l.tiles.forEach((row, y) => {
    let start = -1;
    for (let x = 0; x <= row.length; x++) {
      const isPlat = row[x] === '=';
      if (isPlat && start < 0) start = x;
      if (!isPlat && start >= 0) {
        segs.push({ x0: start, x1: x - 1, y });
        start = -1;
      }
    }
  });
  return segs;
}

/**
 * Heuristic reachability check (no physics): every one-way platform must have some other
 * surface no more than 3 rows below it and within 6 tiles; every pickup must be within jump
 * reach of a surface. Chimney walls count through their tops, logs along their path.
 */
export function unreachable(l: LevelData): string[] {
  const all = surfaces(l);
  const problems: string[] = [];

  for (const seg of platformSegments(l)) {
    const inSeg = (s: Surface) => s.y === seg.y && s.x >= seg.x0 && s.x <= seg.x1;
    const gap = (s: Surface) => (s.x < seg.x0 ? seg.x0 - s.x : s.x > seg.x1 ? s.x - seg.x1 : 0);
    const ok = all.some((s) => !inSeg(s) && s.y - seg.y <= MAX_STEP_UP_ROWS && gap(s) <= MAX_GAP_TILES);
    if (!ok) problems.push(`plataforma em (${seg.x0},${seg.y}) fora de alcance`);
  }

  for (const o of l.objects) {
    if (o.type !== 'golden-ball' && o.type !== 'cromo') continue;
    const ok = all.some((s) => s.y > o.y && s.y - o.y <= MAX_PICKUP_ROWS && Math.abs(s.x - o.x) <= MAX_PICKUP_GAP);
    if (!ok) problems.push(`${o.type} em (${o.x},${o.y}) fora de alcance`);
  }
  return problems;
}
