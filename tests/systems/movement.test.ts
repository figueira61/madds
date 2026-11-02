import { describe, it, expect } from 'vitest';
import { createMoveState, stepMovement, MADDS_PARAMS, type MoveInput, type Contact, type MoveState } from '../../src/systems/movement';

const NONE: MoveInput = { left: false, right: false, jumpPressed: false, jumpHeld: false };
const FLOOR: Contact = { onFloor: true, wallLeft: false, wallRight: false };
const AIR: Contact = { onFloor: false, wallLeft: false, wallRight: false };
const P = MADDS_PARAMS;

function run(s: MoveState, input: MoveInput, c: Contact, totalMs: number, speedMul = 1): MoveState {
  for (let t = 0; t < totalMs; t += 10) s = stepMovement(s, input, c, 10, P, speedMul);
  return s;
}

describe('stepMovement', () => {
  it('acelera até ao máximo, e mais com speedMul', () => {
    const right = { ...NONE, right: true };
    expect(run(createMoveState(), right, FLOOR, 50).vx).toBeCloseTo(75);
    expect(run(createMoveState(), right, FLOOR, 200).vx).toBe(150);
    expect(run(createMoveState(), right, FLOOR, 200, 1.3).vx).toBeCloseTo(195);
  });

  it('trava até parar sem input', () => {
    const s = { ...createMoveState(), vx: 150 };
    expect(run(s, NONE, FLOOR, 100).vx).toBe(0);
  });

  it('salta do chão com 330 px/s', () => {
    const s = stepMovement(createMoveState(), { ...NONE, jumpPressed: true, jumpHeld: true }, FLOOR, 10, P);
    expect(s.vy).toBe(-330);
  });

  it('coyote time: salta até 100 ms depois de sair do chão', () => {
    const jump = { ...NONE, jumpPressed: true, jumpHeld: true };
    const onEdge = run(createMoveState(), NONE, FLOOR, 10);
    const ok = stepMovement(run(onEdge, NONE, AIR, 80), jump, AIR, 10, P);
    expect(ok.vy).toBe(-330);
    const late = stepMovement(run(onEdge, NONE, AIR, 110), jump, AIR, 10, P);
    expect(late.vy).toBeGreaterThan(-330);
  });

  it('jump buffer: salto pedido até 120 ms antes de aterrar conta', () => {
    const press = stepMovement(createMoveState(), { ...NONE, jumpPressed: true, jumpHeld: true }, AIR, 10, P);
    const held = { ...NONE, jumpHeld: true };
    const ok = stepMovement(run(press, held, AIR, 100), held, FLOOR, 10, P);
    expect(ok.vy).toBe(-330);
    const late = stepMovement(run(press, held, AIR, 130), held, FLOOR, 10, P);
    expect(late.vy).not.toBe(-330);
  });

  it('corta o salto ao largar o botão, só uma vez por salto', () => {
    const rising: MoveState = { ...createMoveState(), vy: -300, jumpCutDone: false, sinceFloorMs: 1000 };
    const cut = stepMovement(rising, NONE, AIR, 10, P);
    expect(cut.vy).toBeCloseTo(-150 + 9);
    const next = stepMovement(cut, NONE, AIR, 10, P);
    expect(next.vy).toBeCloseTo(-141 + 9);
  });

  it('desliza na parede a no máximo 60 px/s', () => {
    const falling: MoveState = { ...createMoveState(), vy: 200, sinceFloorMs: 1000 };
    const s = stepMovement(falling, { ...NONE, right: true }, { ...AIR, wallRight: true }, 10, P);
    expect(s.vy).toBe(60);
    expect(s.wallSliding).toBe(true);
  });

  it('wall jump afasta da parede e bloqueia o input horizontal 150 ms', () => {
    const onWall: MoveState = { ...createMoveState(), vy: 60, sinceFloorMs: 1000 };
    const s = stepMovement(onWall, { ...NONE, right: true, jumpPressed: true, jumpHeld: true }, { ...AIR, wallRight: true }, 10, P);
    expect(s.vx).toBe(-180);
    expect(s.vy).toBe(-300);
    expect(s.facing).toBe(-1);
    const locked = run(s, { ...NONE, right: true, jumpHeld: true }, AIR, 140);
    expect(locked.vx).toBe(-180);
  });

  it('sem canWallJump não há wall jump', () => {
    const onWall: MoveState = { ...createMoveState(), vy: 60, sinceFloorMs: 1000 };
    const s = stepMovement(onWall, { ...NONE, jumpPressed: true, jumpHeld: true }, { ...AIR, wallRight: true }, 10, { ...P, canWallJump: false });
    expect(s.vy).toBeGreaterThan(0);
  });

  it('limita dt a 50 ms', () => {
    const s = { ...createMoveState(), sinceFloorMs: 1000 };
    expect(stepMovement(s, NONE, AIR, 500, P).vy).toBe(stepMovement(s, NONE, AIR, 50, P).vy);
  });

  it('facing segue a última direção pressionada', () => {
    let s = stepMovement(createMoveState(), { ...NONE, left: true }, FLOOR, 10, P);
    expect(s.facing).toBe(-1);
    s = stepMovement(s, NONE, FLOOR, 10, P);
    expect(s.facing).toBe(-1);
    s = stepMovement(s, { ...NONE, right: true }, FLOOR, 10, P);
    expect(s.facing).toBe(1);
  });
});

describe('velocidade de queda', () => {
  it('nunca passa de maxFallSpeed (não atravessa o chão em quedas longas)', () => {
    const s = run({ ...createMoveState(), sinceFloorMs: 1000 }, NONE, AIR, 5000);
    expect(s.vy).toBe(P.maxFallSpeed);
    expect(P.maxFallSpeed).toBeLessThanOrEqual(600);
  });
});
