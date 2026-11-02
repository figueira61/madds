import { describe, it, expect } from 'vitest';
import { Grid } from '../../src/art/raster';

describe('Grid', () => {
  it('começa transparente com as dimensões pedidas', () => {
    expect(new Grid(3, 2).rows()).toEqual(['...', '...']);
  });

  it('rect e set ignoram pixels fora da grelha', () => {
    const g = new Grid(3, 3).rect(1, 1, 5, 5, 'a').set(-1, 0, 'b');
    expect(g.rows()).toEqual(['...', '.aa', '.aa']);
  });

  it('ellipse preenche um círculo simétrico', () => {
    expect(new Grid(5, 5).ellipse(2, 2, 2, 2, 'a').rows()).toEqual(['..a..', '.aaa.', 'aaaaa', '.aaa.', '..a..']);
  });

  it('paste copia outra grelha sem os transparentes', () => {
    const g = new Grid(3, 1).rect(0, 0, 3, 1, 'a').paste(['.b'], 1, 0);
    expect(g.rows()).toEqual(['aab']);
  });
});
