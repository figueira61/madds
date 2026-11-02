import { describe, it, expect } from 'vitest';
import { ControlSwitch } from '../../src/systems/control';

describe('ControlSwitch', () => {
  it('começa na Madds e só troca dentro de uma zona', () => {
    const c = new ControlSwitch();
    expect(c.active).toBe('madds');
    expect(c.buttonVisible).toBe(false);
    expect(c.toggle(true)).toBe(false);
    c.setInZone(true);
    expect(c.buttonVisible).toBe(true);
    expect(c.toggle(false)).toBe(false);
    expect(c.active).toBe('madds');
    expect(c.toggle(true)).toBe(true);
    expect(c.active).toBe('bekas');
  });

  it('com a Bekas ativa fora da zona, o botão continua e permite voltar', () => {
    const c = new ControlSwitch();
    c.setInZone(true);
    c.toggle(true);
    c.setInZone(false);
    expect(c.buttonVisible).toBe(true);
    expect(c.toggle(true)).toBe(true);
    expect(c.active).toBe('madds');
    expect(c.buttonVisible).toBe(false);
  });

  it('reset volta à Madds', () => {
    const c = new ControlSwitch();
    c.setInZone(true);
    c.toggle(true);
    c.reset();
    expect(c.active).toBe('madds');
  });
});
