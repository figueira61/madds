import { describe, it, expect } from 'vitest';
import { rowsToRGBA, checkSheet } from '../../src/art/pixels';

describe('rowsToRGBA', () => {
  it('converte caracteres em RGBA, com "." transparente', () => {
    expect([...rowsToRGBA(['.a'], { a: '#ff0000' })]).toEqual([0, 0, 0, 0, 255, 0, 0, 255]);
  });
});

describe('checkSheet', () => {
  it('aponta linhas curtas, alturas erradas e caracteres fora da paleta', () => {
    const errors = checkSheet({ key: 'x', frameW: 2, frameH: 2, frames: [['a.', 'a'], ['ab', 'aa'], ['aa']] }, { a: '#000000' });
    expect(errors.join(' ')).toContain('largura');
    expect(errors.join(' ')).toContain("'b'");
    expect(errors.join(' ')).toContain('altura');
  });

  it('aponta animações com frames inexistentes', () => {
    const errors = checkSheet({ key: 'x', frameW: 1, frameH: 1, frames: [['a']], anims: { run: { frames: [0, 3], fps: 8, repeat: -1 } } }, { a: '#000000' });
    expect(errors.join(' ')).toContain('run');
  });
});
