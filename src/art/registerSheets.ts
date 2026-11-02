import Phaser from 'phaser';
import { rowsToRGBA, type SheetDef } from './pixels';
import { PALETTE } from './palette';
import { ALL_SHEETS } from './sheets';

/** Paints a sheet's frames side by side on a canvas and registers it as a texture with numbered frames and animations. */
export function registerSheet(scene: Phaser.Scene, def: SheetDef): void {
  if (scene.textures.exists(def.key)) return;
  const canvas = document.createElement('canvas');
  canvas.width = def.frameW * def.frames.length;
  canvas.height = def.frameH;
  const ctx = canvas.getContext('2d')!;
  def.frames.forEach((rows, i) => {
    const img = new ImageData(rowsToRGBA(rows, PALETTE), def.frameW, def.frameH);
    ctx.putImageData(img, i * def.frameW, 0);
  });
  const tex = scene.textures.addCanvas(def.key, canvas)!;
  def.frames.forEach((_, i) => tex.add(i, 0, i * def.frameW, 0, def.frameW, def.frameH));

  for (const [name, a] of Object.entries(def.anims ?? {})) {
    scene.anims.create({
      key: `${def.key}-${name}`,
      frames: a.frames.map((frame) => ({ key: def.key, frame })),
      frameRate: a.fps,
      repeat: a.repeat,
    });
  }
}

export function registerAllSheets(scene: Phaser.Scene): void {
  for (const def of ALL_SHEETS) registerSheet(scene, def);
}
