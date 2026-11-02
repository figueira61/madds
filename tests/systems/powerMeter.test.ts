import { describe, it, expect } from 'vitest';
import { PowerMeter, POWER } from '../../src/systems/powerMeter';

describe('PowerMeter', () => {
  it('inimigo dá +15 e cada inimigo extra da cadeia +5', () => {
    const p = new PowerMeter();
    p.enemyDefeated(0);
    p.enemyDefeated(1);
    p.enemyDefeated(2);
    expect(p.value).toBe(55);
  });

  it('animal +10, Bola Dourada +20, limite 100', () => {
    const p = new PowerMeter();
    p.animalFreed();
    p.goldenBall();
    expect(p.value).toBe(30);
    for (let i = 0; i < 7; i++) p.enemyDefeated(0);
    expect(p.value).toBe(100);
  });

  it('dano tira 30 e nunca fica abaixo de 0', () => {
    const p = new PowerMeter(40);
    p.damaged();
    expect(p.value).toBe(10);
    p.damaged();
    expect(p.value).toBe(0);
  });

  it('não desce com o tempo', () => {
    const p = new PowerMeter(50);
    p.update(60000);
    expect(p.value).toBe(50);
  });

  it('só ativa a 100', () => {
    expect(new PowerMeter(99).canActivate()).toBe(false);
    expect(new PowerMeter(99).activate()).toBe(false);
    expect(new PowerMeter(100).canActivate()).toBe(true);
  });

  it('durante o super: não reativa, ignora ganhos e dano, esvazia em 12 s', () => {
    const p = new PowerMeter(100);
    expect(p.activate()).toBe(true);
    expect(p.active).toBe(true);
    expect(p.activate()).toBe(false);
    expect(p.canActivate()).toBe(false);
    p.update(POWER.durationMs / 2);
    expect(p.value).toBe(50);
    p.enemyDefeated(0);
    p.damaged();
    expect(p.value).toBe(50);
    p.update(POWER.durationMs / 2);
    expect(p.active).toBe(false);
    expect(p.value).toBe(0);
  });

  it('morrer com super ativo termina-o e esvazia; sem super mantém a barra', () => {
    const a = new PowerMeter(100);
    a.activate();
    a.onDeath();
    expect(a.active).toBe(false);
    expect(a.value).toBe(0);
    const b = new PowerMeter(60);
    b.onDeath();
    expect(b.value).toBe(60);
  });
});
