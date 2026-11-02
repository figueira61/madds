import { BOSS_TYPES, MIN_POWER_POTENTIAL, SCENT_RADIUS, SOLID_TILES, TILE_CHARS, powerPotential, type LevelData, type LevelObject, type ObjectType, type TileChar } from './format';

const ID_TYPES: readonly ObjectType[] = ['checkpoint', 'cage', 'plate', 'switch'];

/** Brick boxes, doors, scents and Bekas zones. */
function world2Errors(l: LevelData, ids: Set<string>): string[] {
  const errors: string[] = [];
  const width = l.tiles[0]?.length ?? 0;
  const height = l.tiles.length;
  const num = (o: LevelObject, k: string) => Number(o.props?.[k] ?? 0);
  const boxes = l.objects.filter((o) => o.type === 'brick-box');
  const covered = new Set<string>();
  for (const b of boxes) {
    const [bx, by, bw, bh] = [num(b, 'bx'), num(b, 'by'), num(b, 'bw'), num(b, 'bh')];
    let ok = bw > 0 && bh > 0;
    for (let y = by; y < by + bh; y++)
      for (let x = bx; x < bx + bw; x++) {
        if (l.tiles[y]?.[x] !== 'g') ok = false;
        else covered.add(`${x},${y}`);
      }
    if (!ok) errors.push(`caixa em (${b.x},${b.y}) cobre tiles que não são peças`);
  }
  const scents = l.objects.filter((o) => o.type === 'scent');
  l.tiles.forEach((row, y) =>
    [...row].forEach((ch, x) => {
      if (ch === 'g' && !covered.has(`${x},${y}`)) errors.push(`peça fantasma em (${x},${y}) sem caixa`);
      if (ch === 'h' && !scents.some((s) => Math.hypot(s.x - x, s.y - y) <= SCENT_RADIUS)) errors.push(`plataforma escondida em (${x},${y}) sem cheiro`);
    }),
  );
  for (const d of l.objects.filter((o) => o.type === 'door')) {
    const link = String(d.props?.link ?? '');
    if (!ids.has(link) || !l.objects.some((o) => (o.type === 'plate' || o.type === 'switch') && o.id === link)) {
      errors.push(`porta em (${d.x},${d.y}) ligada a '${link}' que não existe`);
    }
  }
  for (const z of l.objects.filter((o) => o.type === 'bekas-zone')) {
    if (z.x + num(z, 'w') > width || z.y + num(z, 'h') > height || num(z, 'w') <= 0 || num(z, 'h') <= 0) errors.push(`zona da Bekas fora do mapa em (${z.x},${z.y})`);
  }
  return errors;
}

/** Returns the list of problems (in Portuguese) found in a level; [] means valid. */
export function validateLevel(l: LevelData): string[] {
  const errors: string[] = [];
  const width = l.tiles[0]?.length ?? 0;
  const height = l.tiles.length;
  const count = (t: ObjectType) => l.objects.filter((o) => o.type === t).length;

  l.tiles.forEach((row, y) => {
    if (row.length !== width) errors.push(`linha ${y} tem comprimento ${row.length}, esperado ${width}`);
    for (const ch of row) {
      if (!TILE_CHARS.includes(ch as TileChar)) errors.push(`caractere desconhecido '${ch}' na linha ${y}`);
    }
  });

  if (count('start') !== 1) errors.push(`precisa de exatamente 1 start (tem ${count('start')})`);

  for (const o of l.objects) {
    if (o.x < 0 || o.y < 0 || o.x >= width || o.y >= height) {
      errors.push(`${o.type} em (${o.x},${o.y}) está fora do mapa`);
    } else if (o.type !== 'log' && o.type !== 'door' && o.type !== 'bekas-zone' && SOLID_TILES.includes(l.tiles[o.y][o.x] as TileChar)) {
      errors.push(`${o.type} em (${o.x},${o.y}) está dentro de um tile sólido`);
    }
  }

  const ids = new Set<string>();
  for (const o of l.objects) {
    if (!ID_TYPES.includes(o.type)) continue;
    if (!o.id) errors.push(`${o.type} em (${o.x},${o.y}) não tem id`);
    else if (ids.has(o.id)) errors.push(`id repetido '${o.id}'`);
    else ids.add(o.id);
  }

  errors.push(...world2Errors(l, ids));

  if (l.kind === 'normal') {
    if (count('exit') < 1) errors.push('precisa de pelo menos 1 exit');
    if (count('checkpoint') < 1) errors.push('precisa de pelo menos 1 checkpoint');
    if (count('cromo') !== 1) errors.push(`precisa de exatamente 1 cromo (tem ${count('cromo')})`);
    const potential = powerPotential(l);
    if (potential < MIN_POWER_POTENTIAL) errors.push(`potencial de poder ${potential}% abaixo de ${MIN_POWER_POTENTIAL}%`);
  } else {
    if (count('cromo') !== 0) errors.push('arena de boss não pode ter cromo colocado');
    if (l.objects.filter((o) => BOSS_TYPES.includes(o.type)).length !== 1) errors.push('arena precisa de exatamente 1 boss');
    if (count('minion-spawn') < 1) errors.push('arena precisa de pelo menos 1 minion-spawn');
  }

  return errors;
}
