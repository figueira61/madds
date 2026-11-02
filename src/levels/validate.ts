import { MIN_POWER_POTENTIAL, SOLID_TILES, TILE_CHARS, powerPotential, type LevelData, type ObjectType, type TileChar } from './format';

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
    } else if (o.type !== 'log' && SOLID_TILES.includes(l.tiles[o.y][o.x] as TileChar)) {
      errors.push(`${o.type} em (${o.x},${o.y}) está dentro de um tile sólido`);
    }
  }

  const ids = new Set<string>();
  for (const o of l.objects) {
    if (o.type !== 'checkpoint' && o.type !== 'cage') continue;
    if (!o.id) errors.push(`${o.type} em (${o.x},${o.y}) não tem id`);
    else if (ids.has(o.id)) errors.push(`id repetido '${o.id}'`);
    else ids.add(o.id);
  }

  if (l.kind === 'normal') {
    if (count('exit') < 1) errors.push('precisa de pelo menos 1 exit');
    if (count('checkpoint') < 1) errors.push('precisa de pelo menos 1 checkpoint');
    if (count('cromo') !== 1) errors.push(`precisa de exatamente 1 cromo (tem ${count('cromo')})`);
    const potential = powerPotential(l);
    if (potential < MIN_POWER_POTENTIAL) errors.push(`potencial de poder ${potential}% abaixo de ${MIN_POWER_POTENTIAL}%`);
  } else {
    if (count('cromo') !== 0) errors.push('arena de boss não pode ter cromo colocado');
    if (count('boss-hunter') !== 1) errors.push('arena precisa de exatamente 1 boss');
    if (count('minion-spawn') < 1) errors.push('arena precisa de pelo menos 1 minion-spawn');
  }

  return errors;
}
