import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Synth } from '../../src/audio/Synth';

/** AudioContext that only starts running when resume() is called during a "gesture". */
class FakeCtx {
  static gesture = false;
  state: 'suspended' | 'running' = 'suspended';
  currentTime = 0;
  sampleRate = 100;
  destination = {};
  createGain() {
    return { connect() {}, gain: { value: 0 } };
  }
  createBuffer() {
    return { getChannelData: () => new Float32Array(10) };
  }
  resume() {
    if (FakeCtx.gesture) this.state = 'running';
    return Promise.resolve();
  }
}

type Listener = () => void;
const listeners: Record<string, Listener[]> = {};
const g = globalThis as unknown as Record<string, unknown>;

beforeEach(() => {
  FakeCtx.gesture = false;
  for (const k of Object.keys(listeners)) delete listeners[k];
  g.window = { AudioContext: FakeCtx };
  g.document = {
    addEventListener: (t: string, fn: Listener) => (listeners[t] ??= []).push(fn),
    removeEventListener: (t: string, fn: Listener) => (listeners[t] = (listeners[t] ?? []).filter((f) => f !== fn)),
  };
});

afterEach(() => {
  delete g.window;
  delete g.document;
});

describe('Synth.unlock', () => {
  it('não se dá por desbloqueado enquanto o contexto está suspenso (touchstart no telemóvel)', () => {
    const s = new Synth();
    s.unlock();
    expect(s.unlocked).toBe(false);
  });

  it('volta a tentar no próximo gesto válido (touchend) e fica a tocar', () => {
    const s = new Synth();
    s.unlock();
    FakeCtx.gesture = true;
    listeners.touchend?.forEach((fn) => fn());
    expect(s.unlocked).toBe(true);
  });
});
