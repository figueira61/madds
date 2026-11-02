import { describe, it, expect } from 'vitest';
import { IdleTimer } from '../../src/systems/idle';

describe('IdleTimer', () => {
  it('pausa longa a partir de 5 s sem input, e reinicia com input', () => {
    const t = new IdleTimer();
    t.update(4999, false);
    expect(t.isLongIdle).toBe(false);
    t.update(1, false);
    expect(t.isLongIdle).toBe(true);
    t.update(16, true);
    expect(t.idleMs).toBe(0);
    expect(t.isLongIdle).toBe(false);
  });
});
