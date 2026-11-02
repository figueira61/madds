import { describe, it, expect } from 'vitest';
import { SaveStore, defaultSave, SAVE_KEY, type KVStorage } from '../../src/systems/saveStore';

function memory(initial?: string): KVStorage & { data: Map<string, string> } {
  const data = new Map<string, string>();
  if (initial !== undefined) data.set(SAVE_KEY, initial);
  return { data, getItem: (k) => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v) };
}

describe('SaveStore', () => {
  it('sem dados devolve o save por omissão', () => {
    expect(new SaveStore(memory()).load()).toEqual(defaultSave());
  });

  it('guarda e carrega o mesmo progresso', () => {
    const store = new SaveStore(memory());
    const d = { ...defaultSave(), completed: ['1-1'], cromos: ['1-1'], bestTimesMs: { '1-1': 61000 }, falls: { '1-1': 3 }, power: 45 };
    store.save(d);
    expect(store.load()).toEqual(d);
  });

  it('JSON inválido ou outra versão → por omissão', () => {
    expect(new SaveStore(memory('{nope')).load()).toEqual(defaultSave());
    expect(new SaveStore(memory(JSON.stringify({ version: 2, completed: ['1-1'] }))).load()).toEqual(defaultSave());
  });

  it('objeto parcial é completado com os valores por omissão', () => {
    const d = new SaveStore(memory(JSON.stringify({ version: 1, completed: ['1-1'] }))).load();
    expect(d.completed).toEqual(['1-1']);
    expect(d.options).toEqual(defaultSave().options);
    expect(d.power).toBe(0);
  });

  it('campos com tipo errado são ignorados', () => {
    const d = new SaveStore(memory(JSON.stringify({ version: 1, completed: 'x', power: 'muito', options: { music: 0.2, sfx: 'alto' } }))).load();
    expect(d.completed).toEqual([]);
    expect(d.power).toBe(0);
    expect(d.options.music).toBe(0.2);
    expect(d.options.sfx).toBe(defaultSave().options.sfx);
  });

  it('sem armazenamento joga na mesma', () => {
    const store = new SaveStore(null);
    expect(store.available).toBe(false);
    expect(store.load()).toEqual(defaultSave());
    expect(() => store.save(defaultSave())).not.toThrow();
  });

  it('armazenamento que falha a gravar não lança erro', () => {
    const broken: KVStorage = { getItem: () => null, setItem: () => { throw new Error('QuotaExceeded'); } };
    expect(() => new SaveStore(broken).save(defaultSave())).not.toThrow();
  });
});
