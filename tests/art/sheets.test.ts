import { describe, it, expect } from 'vitest';
import { ALL_SHEETS } from '../../src/art/sheets';
import { checkSheet } from '../../src/art/pixels';
import { PALETTE } from '../../src/art/palette';

describe('ALL_SHEETS', () => {
  it('tem sheets registadas com chaves únicas', () => {
    expect(ALL_SHEETS.length).toBeGreaterThan(0);
    expect(new Set(ALL_SHEETS.map((s) => s.key)).size).toBe(ALL_SHEETS.length);
  });

  for (const def of ALL_SHEETS) {
    it(`a sheet '${def.key}' é válida`, () => {
      expect(checkSheet(def, PALETTE)).toEqual([]);
    });
  }
});
