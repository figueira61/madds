import { Grid } from '../../art/raster';
import type { LevelData } from '../format';

/** Temporary flat level used until the real World 3 levels exist (removed in Task 8). */
export function placeholder(id: string, name: string, kind: 'normal' | 'boss'): LevelData {
  const tiles = new Grid(80, 17).rect(0, 15, 80, 2, '#').rect(20, 15, 3, 1, 'z').rows();
  const objects: LevelData['objects'] =
    kind === 'boss'
      ? [
          { type: 'start', x: 3, y: 14 },
          { type: 'boss-collector', x: 30, y: 14 },
          { type: 'minion-spawn', x: 20, y: 14 },
          { type: 'goal', x: 37, y: 14, props: { w: 2, h: 3 } },
        ]
      : [
          { type: 'start', x: 2, y: 14 },
          { type: 'checkpoint', x: 10, y: 14, id: 'c1' },
          { type: 'cromo', x: 20, y: 13 },
          { type: 'exit', x: 77, y: 14 },
          ...Array.from({ length: 10 }, (_, i) => ({ type: 'racer' as const, x: 12 + i * 2, y: 14 })),
        ];
  return { id, name, world: 3, kind, autoscroll: id === '3-1' ? 70 : undefined, music: kind === 'boss' ? 'final' : 'world3', tiles, objects };
}
