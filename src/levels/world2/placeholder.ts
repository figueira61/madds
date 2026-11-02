import { Grid } from '../../art/raster';
import type { LevelData } from '../format';

/** Temporary flat level used until the real World 2 levels exist (removed in Task 10). */
export function placeholder(id: string, name: string, kind: 'normal' | 'boss'): LevelData {
  const tiles = new Grid(40, 17).rect(0, 15, 40, 2, '#').rows();
  const objects: LevelData['objects'] =
    kind === 'boss'
      ? [{ type: 'start', x: 3, y: 14 }, { type: 'boss-robot', x: 30, y: 14 }, { type: 'minion-spawn', x: 20, y: 14 }]
      : [
          { type: 'start', x: 2, y: 14 },
          { type: 'checkpoint', x: 10, y: 14, id: 'c1' },
          { type: 'cromo', x: 20, y: 13 },
          { type: 'exit', x: 37, y: 14 },
          ...Array.from({ length: 10 }, (_, i) => ({ type: 'beetle' as const, x: 12 + i * 2, y: 14 })),
        ];
  return { id, name, world: 2, kind, music: kind === 'boss' ? 'boss' : 'world2', tiles, objects };
}
