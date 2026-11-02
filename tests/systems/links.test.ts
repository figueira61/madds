import { describe, it, expect } from 'vitest';
import { LinkBoard, doorCanClose } from '../../src/systems/links';

describe('LinkBoard', () => {
  it('placa é momentânea', () => {
    const b = new LinkBoard();
    b.setPlate('p', true);
    expect(b.isOn('p')).toBe(true);
    b.setPlate('p', false);
    expect(b.isOn('p')).toBe(false);
  });

  it('interruptor alterna', () => {
    const b = new LinkBoard();
    b.toggleSwitch('s');
    expect(b.isOn('s')).toBe(true);
    b.toggleSwitch('s');
    expect(b.isOn('s')).toBe(false);
  });

  it('id desconhecido está desligado', () => {
    expect(new LinkBoard().isOn('nada')).toBe(false);
  });
});

describe('doorCanClose', () => {
  const door = { x: 100, y: 0, w: 16, h: 32 };
  it('não fecha com alguém lá dentro', () => {
    expect(doorCanClose(door, [{ x: 110, y: 10, w: 10, h: 20 }])).toBe(false);
  });
  it('fecha com os corpos ao lado (tocar na aresta não conta)', () => {
    expect(doorCanClose(door, [{ x: 116, y: 10, w: 10, h: 20 }, { x: 80, y: 0, w: 20, h: 20 }])).toBe(true);
  });
});
