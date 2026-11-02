import { describe, it, expect } from 'vitest';
import { powerPotential, type LevelData, type LevelObject } from '../../src/levels/format';
import { validateLevel } from '../../src/levels/validate';

function valid(): LevelData {
  const beetles: LevelObject[] = Array.from({ length: 10 }, (_, i) => ({ type: 'beetle', x: i, y: 1 }));
  return {
    id: 't', name: 'Teste', world: 1, kind: 'normal', music: 'world1',
    tiles: ['..........', '..........', '..........', '##########'],
    objects: [
      { type: 'start', x: 1, y: 2 },
      { type: 'exit', x: 8, y: 2 },
      { type: 'checkpoint', x: 4, y: 2, id: 'c1' },
      { type: 'cromo', x: 5, y: 0 },
      ...beetles,
    ],
  };
}

function boss(): LevelData {
  return {
    id: 'b', name: 'Arena', world: 1, kind: 'boss', music: 'boss',
    tiles: ['......', '......', '######'],
    objects: [
      { type: 'start', x: 1, y: 1 },
      { type: 'boss-hunter', x: 4, y: 1 },
      { type: 'minion-spawn', x: 5, y: 0 },
    ],
  };
}

function errorsOf(l: LevelData): string {
  return validateLevel(l).join(' | ');
}

describe('validateLevel', () => {
  it('nível válido não tem erros', () => {
    expect(validateLevel(valid())).toEqual([]);
    expect(validateLevel(boss())).toEqual([]);
  });

  it('linhas com comprimentos diferentes', () => {
    const l = valid();
    l.tiles[1] = '.........';
    expect(errorsOf(l)).toContain('comprimento');
  });

  it('caractere desconhecido', () => {
    const l = valid();
    l.tiles[0] = '.....X....';
    expect(errorsOf(l)).toContain('caractere');
  });

  it('exatamente um start', () => {
    const l = valid();
    l.objects = l.objects.filter((o) => o.type !== 'start');
    expect(errorsOf(l)).toContain('start');
    const two = valid();
    two.objects.push({ type: 'start', x: 2, y: 2 });
    expect(errorsOf(two)).toContain('start');
  });

  it('nível normal precisa de exit, checkpoint e um cromo', () => {
    const noExit = valid();
    noExit.objects = noExit.objects.filter((o) => o.type !== 'exit');
    expect(errorsOf(noExit)).toContain('exit');
    const noCp = valid();
    noCp.objects = noCp.objects.filter((o) => o.type !== 'checkpoint');
    expect(errorsOf(noCp)).toContain('checkpoint');
    const twoCromos = valid();
    twoCromos.objects.push({ type: 'cromo', x: 6, y: 0 });
    expect(errorsOf(twoCromos)).toContain('cromo');
  });

  it('potencial de poder abaixo de 150', () => {
    const l = valid();
    l.objects.splice(l.objects.findIndex((o) => o.type === 'beetle'), 1);
    expect(errorsOf(l)).toContain('poder');
  });

  it('arena de boss: sem cromo, com boss e lacaios', () => {
    const withCromo = boss();
    withCromo.objects.push({ type: 'cromo', x: 2, y: 0 });
    expect(errorsOf(withCromo)).toContain('cromo');
    const noBoss = boss();
    noBoss.objects = noBoss.objects.filter((o) => o.type !== 'boss-hunter');
    expect(errorsOf(noBoss)).toContain('boss');
    const noMinion = boss();
    noMinion.objects = noMinion.objects.filter((o) => o.type !== 'minion-spawn');
    expect(errorsOf(noMinion)).toContain('minion');
  });

  it('checkpoints e jaulas precisam de id único', () => {
    const l = valid();
    l.objects.push({ type: 'checkpoint', x: 6, y: 2, id: 'c1' });
    expect(errorsOf(l)).toContain('id');
    const cage = valid();
    cage.objects.push({ type: 'cage', x: 6, y: 2 });
    expect(errorsOf(cage)).toContain('id');
  });

  it('objetos fora do mapa ou dentro de tiles sólidos', () => {
    const out = valid();
    out.objects.push({ type: 'golden-ball', x: 20, y: 1 });
    expect(errorsOf(out)).toContain('fora');
    const solid = valid();
    solid.objects.push({ type: 'golden-ball', x: 3, y: 3 });
    expect(errorsOf(solid)).toContain('sólido');
    const log = valid();
    log.objects.push({ type: 'log', x: 3, y: 3 });
    expect(validateLevel(log)).toEqual([]);
  });
});

describe('powerPotential', () => {
  it('soma inimigos ×15, jaulas ×10 e Bolas Douradas ×20', () => {
    const l = valid();
    l.objects = [
      ...Array.from({ length: 4 }, (_, i): LevelObject => ({ type: 'beetle', x: i, y: 0 })),
      ...Array.from({ length: 2 }, (_, i): LevelObject => ({ type: 'bird', x: i, y: 1 })),
      { type: 'cage', x: 5, y: 1, id: 'a' },
      { type: 'golden-ball', x: 6, y: 1 },
    ];
    expect(powerPotential(l)).toBe(120);
  });
});
