import Phaser from 'phaser';
import { TILE } from '../config';
import { LEVELS } from '../levels/registry';
import type { LevelData, LevelObject } from '../levels/format';
import { buildTilemap, animateWater, type BuiltMap } from '../levels/tilemap';
import { TILE_FRAME } from '../art/sprites/tiles';
import { drawForestBackground } from '../art/background';
import { Madds } from '../entities/Madds';
import { InputManager } from '../input/InputManager';
import { Health } from '../systems/health';
import { Checkpoints } from '../systems/checkpoints';
import { PowerMeter, POWER } from '../systems/powerMeter';
import { IdleTimer } from '../systems/idle';
import { synth } from '../audio/Synth';
import { gameState } from '../gameState';

export interface LevelSceneData {
  levelId: string;
  bekasJoined?: boolean;
}

export interface LevelResult {
  levelId: string;
  timeMs: number;
  falls: number;
  cromo: boolean;
  animalsFreed: number;
  animalsTotal: number;
}

/** Converts tile coordinates of an object to the world point at the bottom-centre of that tile. */
export function tileFoot(o: { x: number; y: number }): { x: number; y: number } {
  return { x: o.x * TILE + TILE / 2, y: (o.y + 1) * TILE };
}

export class LevelScene extends Phaser.Scene {
  level!: LevelData;
  built!: BuiltMap;
  madds!: Madds;
  controls!: InputManager;
  health!: Health;
  checkpoints!: Checkpoints;
  power!: PowerMeter;
  idle!: IdleTimer;
  bekasJoined = false;
  elapsedMs = 0;
  gotCromo = false;
  animalsFreed = 0;
  animalsTotal = 0;
  /** True while gameplay is frozen (transformation, cutscene-like moments). */
  frozen = false;
  private finished = false;
  private respawning = false;
  private lookAhead = 0;
  private waterPhase: 0 | 1 = 0;

  constructor() {
    super('Level');
  }

  init(data: LevelSceneData): void {
    this.level = LEVELS[data.levelId] ?? LEVELS['test-room'];
    this.bekasJoined = data.bekasJoined ?? false;
    this.elapsedMs = 0;
    this.gotCromo = false;
    this.animalsFreed = 0;
    this.finished = false;
    this.respawning = false;
    this.frozen = false;
  }

  create(): void {
    const opts = gameState.save.options;
    this.built = buildTilemap(this, this.level);
    drawForestBackground(this, this.built.widthPx, this.built.heightPx);
    this.physics.world.setBounds(0, 0, this.built.widthPx, this.built.heightPx + 200);

    const start = this.level.objects.find((o) => o.type === 'start')!;
    const foot = tileFoot(start);
    this.madds = new Madds(this, foot.x, foot.y, (side) => this.wallAt(side));
    this.physics.add.collider(this.madds, this.built.layer);

    this.controls = new InputManager(this, opts);
    this.health = new Health();
    this.checkpoints = new Checkpoints(foot);
    this.power = new PowerMeter(gameState.save.power);
    this.idle = new IdleTimer();

    for (const o of this.level.objects) this.spawnObject(o);
    this.animalsTotal = this.level.objects.filter((o) => o.type === 'cage').length;

    const cam = this.cameras.main;
    cam.setBounds(0, 0, this.built.widthPx, this.built.heightPx);
    cam.startFollow(this.madds, true, 0.15, 0.15);
    cam.setDeadzone(48, 32);
    cam.setRoundPixels(true);

    if (new URLSearchParams(location.search).get('debug') === '1') {
      this.physics.world.drawDebug = true;
      this.physics.world.createDebugGraphic();
    }

    this.time.addEvent({ delay: 400, loop: true, callback: () => animateWater(this.built.layer, (this.waterPhase = this.waterPhase === 0 ? 1 : 0)) });
    synth.playMusic(this.level.music);
    this.events.emit('level-ready');
  }

  /** Hook for object types; later tasks add more cases. */
  spawnObject(o: LevelObject): void {
    const p = tileFoot(o);
    switch (o.type) {
      case 'checkpoint': {
        const flag = this.physics.add.staticSprite(p.x, p.y - 12, 'checkpoint', 0);
        this.physics.add.overlap(this.madds, flag, () => {
          if (this.checkpoints.reach(o.id ?? `${o.x},${o.y}`, p)) {
            flag.setFrame(1);
            this.health.refill();
            this.events.emit('hud-hearts', this.health.hearts);
            synth.playSfx('checkpoint');
          }
        });
        break;
      }
      case 'exit': {
        const sign = this.physics.add.staticSprite(p.x, p.y - 12, 'exit', 0);
        this.physics.add.overlap(this.madds, sign, () => this.complete());
        break;
      }
      default:
        break;
    }
  }

  update(_time: number, delta: number): void {
    this.controls.update();
    if (this.finished) return;
    if (this.controls.state.justPressed('pause')) {
      this.events.emit('request-pause');
      return;
    }
    if (this.frozen) return;

    this.elapsedMs += delta;
    this.health.update(delta);
    this.power.update(delta);
    this.idle.update(delta, this.controls.state.anyDown() || !this.madds.onFloor || Math.abs(this.madds.move.vx) > 1);

    const speedMul = this.power.active ? POWER.speedMul : 1;
    this.madds.update(delta, this.controls.state, speedMul);
    this.updateCamera(delta);
    this.events.emit('level-update', delta);

    if (!this.respawning && this.touchingHazard()) this.die();
  }

  /** Damages Madds (enemy, projectile). Returns false if she was immune. */
  hurtMadds(fromX: number): boolean {
    if (this.power.active || this.respawning) return false;
    const r = this.health.hit();
    if (r === 'ignored') return false;
    this.power.damaged();
    this.events.emit('hud-hearts', this.health.hearts);
    this.events.emit('madds-hurt');
    synth.playSfx('hurt');
    this.madds.playHurt();
    const away = this.madds.x < fromX ? -1 : 1;
    this.madds.move = { ...this.madds.move, vx: away * 160, vy: -200, jumpCutDone: true };
    this.cameras.main.shake(120, 0.006);
    if (r === 'dead') this.die();
    return true;
  }

  die(): void {
    if (this.respawning) return;
    this.respawning = true;
    synth.playSfx('fall');
    this.checkpoints.recordFall();
    this.power.onDeath();
    this.events.emit('madds-died');
    this.cameras.main.flash(250, 255, 255, 255);
    this.madds.setVisible(false);
    this.madds.arcadeBody.setEnable(false);
    this.time.delayedCall(450, () => {
      const p = this.checkpoints.respawn;
      this.madds.setPosition(p.x, p.y);
      this.madds.resetMotion();
      this.madds.arcadeBody.setEnable(true);
      this.madds.setVisible(true);
      this.health.refill();
      this.events.emit('hud-hearts', this.health.hearts);
      this.events.emit('madds-respawned');
      this.respawning = false;
    });
  }

  complete(): void {
    if (this.finished) return;
    this.finished = true;
    const result: LevelResult = {
      levelId: this.level.id,
      timeMs: Math.round(this.elapsedMs),
      falls: this.checkpoints.falls,
      cromo: this.gotCromo,
      animalsFreed: this.animalsFreed,
      animalsTotal: this.animalsTotal,
    };
    this.madds.arcadeBody.setVelocity(0, 0);
    this.events.emit('level-complete', result);
    gameState.onLevelComplete(this, result, this.power.active ? 0 : this.power.value);
  }

  isSolidAt(worldX: number, worldY: number): boolean {
    const t = this.built.layer.getTileAtWorldXY(worldX, worldY);
    return !!t && t.collides && t.index !== TILE_FRAME.platform;
  }

  private wallAt(side: -1 | 1): boolean {
    const b = this.madds.arcadeBody;
    const x = side < 0 ? b.left - 2 : b.right + 1;
    return this.isSolidAt(x, b.top + 4) || this.isSolidAt(x, b.bottom - 4);
  }

  private touchingHazard(): boolean {
    const b = this.madds.arcadeBody;
    if (b.top > this.built.heightPx) return true;
    const tiles = this.built.layer.getTilesWithinWorldXY(b.left + 2, b.top + 6, b.width - 4, b.height - 6);
    return tiles.some((t) => t.index === TILE_FRAME.spikes || t.index === TILE_FRAME.waterA || t.index === TILE_FRAME.waterB || t.index === TILE_FRAME.waterDeep);
  }

  private updateCamera(delta: number): void {
    const target = this.madds.facing * 24;
    this.lookAhead += (target - this.lookAhead) * Math.min(1, delta / 250);
    this.cameras.main.setFollowOffset(-this.lookAhead, 0);
  }
}
