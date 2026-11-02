export interface Options {
  music: number;
  sfx: number;
  touchScale: number;
  touchOffsetX: number;
}

export interface SaveData {
  version: 1;
  completed: string[];
  cromos: string[];
  bestTimesMs: Record<string, number>;
  falls: Record<string, number>;
  power: number;
  options: Options;
}

export interface KVStorage {
  getItem(k: string): string | null;
  setItem(k: string, v: string): void;
}

export const SAVE_KEY = 'madds-save-v1';

export function defaultSave(): SaveData {
  return {
    version: 1,
    completed: [],
    cromos: [],
    bestTimesMs: {},
    falls: {},
    power: 0,
    options: { music: 0.7, sfx: 0.8, touchScale: 1, touchOffsetX: 0 },
  };
}

export function browserStorage(): KVStorage | null {
  try {
    const s = globalThis.localStorage;
    const probe = '__madds_probe__';
    s.setItem(probe, '1');
    s.removeItem(probe);
    return s;
  } catch {
    return null;
  }
}

export class SaveStore {
  constructor(private readonly storage: KVStorage | null) {}

  get available(): boolean {
    return this.storage !== null;
  }

  load(): SaveData {
    try {
      const raw = this.storage?.getItem(SAVE_KEY);
      if (!raw) return defaultSave();
      return merge(JSON.parse(raw));
    } catch {
      return defaultSave();
    }
  }

  save(d: SaveData): void {
    try {
      this.storage?.setItem(SAVE_KEY, JSON.stringify(d));
    } catch {
      // Storage full or blocked (e.g. private browsing): keep playing without saving.
    }
  }
}

type Raw = Record<string, unknown>;

function isObject(v: unknown): v is Raw {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function strings(v: unknown, fallback: string[]): string[] {
  return Array.isArray(v) && v.every((x) => typeof x === 'string') ? [...v] : fallback;
}

function numberMap(v: unknown): Record<string, number> {
  if (!isObject(v)) return {};
  const out: Record<string, number> = {};
  for (const [k, x] of Object.entries(v)) if (typeof x === 'number' && Number.isFinite(x)) out[k] = x;
  return out;
}

function num(v: unknown, fallback: number): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : fallback;
}

function merge(raw: unknown): SaveData {
  const d = defaultSave();
  if (!isObject(raw) || raw.version !== 1) return d;
  const o = isObject(raw.options) ? raw.options : {};
  return {
    version: 1,
    completed: strings(raw.completed, d.completed),
    cromos: strings(raw.cromos, d.cromos),
    bestTimesMs: numberMap(raw.bestTimesMs),
    falls: numberMap(raw.falls),
    power: num(raw.power, d.power),
    options: {
      music: num(o.music, d.options.music),
      sfx: num(o.sfx, d.options.sfx),
      touchScale: num(o.touchScale, d.options.touchScale),
      touchOffsetX: num(o.touchOffsetX, d.options.touchOffsetX),
    },
  };
}
