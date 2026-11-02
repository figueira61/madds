import Phaser from 'phaser';
import { TILE } from '../config';
import { LEVELS } from '../levels/registry';
import type { LevelData, LevelObject } from '../levels/format';
import { buildTilemap, animateWater, animateConveyors, buildBricks, conveyorDir, revealHidden, type BuiltMap } from '../levels/tilemap';
import { BrickBox, Door, Plate, Press, Scent, Switch } from '../entities/puzzle';
import { LinkBoard, doorCanClose, type Box } from '../systems/links';
import { TILE_FRAME } from '../art/sprites/tiles';
import { drawBackground } from '../art/background';
import { Madds } from '../entities/Madds';
import { Ball } from '../entities/Ball';
import { Bekas } from '../entities/Bekas';
import { Hunter, type Net } from '../entities/Hunter';
import { Robot, type Shockwave } from '../entities/Robot';
import type { Boss } from '../entities/Boss';
import { Beetle, Bird, type Enemy } from '../entities/enemies';
import { Cage, LogPlatform, Pickup } from '../entities/props';
import { InputManager } from '../input/InputManager';
import { Health } from '../systems/health';
import { Checkpoints } from '../systems/checkpoints';
import { PowerMeter, POWER } from '../systems/powerMeter';
import { IdleTimer } from '../systems/idle';
import { ControlSwitch } from '../systems/control';
import { ActionState } from '../input/actions';
import { synth } from '../audio/Synth';
import { gameState } from '../gameState';
import type { PauseChoice } from './PauseScene';

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

/** Input for the character the player is not driving. */
const NO_INPUT = new ActionState();

const NO_GROUP_DEFAULTS = {} as Phaser.Types.Physics.Arcade.PhysicsGroupDefaults;

/** Converts tile coordinates of an object to the world point at the bottom-centre of that tile. */
export function tileFoot(o: { x: number; y: number }): { x: number; y: number } {
  return { x: o.x * TILE + TILE / 2, y: (o.y + 1) * TILE };
}

/** Extra earth shown under the level on touch devices, where the buttons cover the bottom of the screen. */
const TOUCH_FLOOR_PX = 52;
/** Conveyor belts push whoever stands on them at this speed (px/s). */
const CONVEYOR_SPEED = 60;

export class LevelScene extends Phaser.Scene {
  level!: LevelData;
  built!: BuiltMap;
  madds!: Madds;
  controls!: InputManager;
  health!: Health;
  checkpoints!: Checkpoints;
  power!: PowerMeter;
  idle!: IdleTimer;
  ball!: Ball;
  enemies!: Phaser.Physics.Arcade.Group;
  logs: LogPlatform[] = [];
  bekas: Bekas | null = null;
  bekasJoined = false;
  private photoIdle = false;
  boss: Boss | null = null;
  private nets!: Phaser.Physics.Arcade.Group;
  private waves!: Phaser.Physics.Arcade.Group;
  private minionSpawns: { x: number; y: number }[] = [];
  private minions: Beetle[] = [];
  private tookDamage = false;
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
  private beltPhase: 0 | 1 = 0;
  control = new ControlSwitch();
  bekasZones: Phaser.Geom.Rectangle[] = [];
  private zoneHintShown = false;
  links = new LinkBoard();
  private plates: Plate[] = [];
  private doors: Door[] = [];
  private presses: Press[] = [];
  private scents: Scent[] = [];

  constructor() {
    super('Level');
  }

  init(data: LevelSceneData): void {
    this.level = LEVELS[data.levelId] ?? LEVELS['test-room'];
    // From World 2 on Bekas is always there, whatever path started the level.
    this.bekasJoined = (data.bekasJoined ?? false) || this.level.world >= 2;
    this.elapsedMs = 0;
    this.gotCromo = false;
    this.animalsFreed = 0;
    this.finished = false;
    this.respawning = false;
    this.frozen = false;
    this.logs = [];
    this.bekas = null;
    this.photoIdle = false;
    this.boss = null;
    this.minionSpawns = [];
    this.minions = [];
    this.tookDamage = false;
    this.control = new ControlSwitch();
    this.bekasZones = [];
    this.zoneHintShown = false;
    this.links = new LinkBoard();
    this.plates = [];
    this.doors = [];
    this.presses = [];
    this.scents = [];
  }

  create(): void {
    const opts = gameState.save.options;
    this.built = buildTilemap(this, this.level);
    drawBackground(this, this.level.world, this.built.widthPx, this.built.heightPx);
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

    if (this.bekasJoined) {
      this.bekas = new Bekas(this, foot.x - 24, foot.y, this.madds, this.built.heightPx);
      this.physics.add.collider(this.bekas, this.built.layer);
    }

    this.ball = new Ball(this, this.madds);
    this.physics.add.collider(this.ball, this.built.layer, (_b, tile) => this.onBallHitTile(tile as Phaser.Tilemaps.Tile), () => this.ball.collidesWithWorld);
    // Groups must not overwrite each body's own setup (velocity, gravity) when members are added.
    this.enemies = this.physics.add.group();
    this.enemies.defaults = NO_GROUP_DEFAULTS;
    this.physics.add.collider(this.enemies, this.built.layer);
    this.physics.add.overlap(this.ball, this.enemies, (_b, e) => this.onBallHitEnemy(e as Enemy), () => this.ball.inFlight);
    this.physics.add.overlap(this.madds, this.enemies, (_m, e) => this.onTouchEnemy(e as Enemy));
    this.nets = this.physics.add.group();
    this.nets.defaults = NO_GROUP_DEFAULTS;
    this.physics.add.collider(this.nets, this.built.layer, (n) => (n as Net).destroy());
    this.physics.add.overlap(this.madds, this.nets, (_m, n) => {
      (n as Net).destroy();
      this.hurtMadds((n as Net).x);
    });
    this.waves = this.physics.add.group();
    this.waves.defaults = NO_GROUP_DEFAULTS;
    this.physics.add.overlap(this.madds, this.waves, (_m, w) => this.hurtMadds((w as Shockwave).x));
    this.events.on('madds-hurt', () => (this.tookDamage = true));
    this.events.on('madds-died', () => (this.tookDamage = true));

    this.level.objects.forEach((o, i) => this.spawnObject(o, i));
    this.animalsTotal = this.level.objects.filter((o) => o.type === 'cage').length;

    // Touch: let the camera go below the level so the ground sits above the on-screen buttons.
    const floor = this.controls.hasTouch ? TOUCH_FLOOR_PX : 0;
    if (floor) this.add.rectangle(0, this.built.heightPx, this.built.widthPx, floor, 0x3b2616).setOrigin(0).setDepth(-1);
    const cam = this.cameras.main;
    cam.setBounds(0, 0, this.built.widthPx, this.built.heightPx + floor);
    cam.startFollow(this.madds, true, 0.15, 0.15);
    cam.setDeadzone(48, 32);
    cam.setRoundPixels(true);

    if (new URLSearchParams(location.search).get('debug') === '1') {
      this.physics.world.drawDebug = true;
      this.physics.world.createDebugGraphic();
    }

    this.time.addEvent({ delay: 400, loop: true, callback: () => animateWater(this.built.layer, (this.waterPhase = this.waterPhase === 0 ? 1 : 0)) });
    this.time.addEvent({ delay: 150, loop: true, callback: () => animateConveyors(this.built.layer, (this.beltPhase = this.beltPhase === 0 ? 1 : 0)) });
    synth.playMusic(this.level.music);
    this.scene.launch('Hud', { level: this });
    this.events.once('shutdown', () => {
      for (const ev of ['request-pause', 'madds-hurt', 'madds-died']) this.events.off(ev);
      this.scene.stop('Hud');
      this.controls.destroy();
    });
    this.events.on('request-pause', () => this.openPause());
    this.events.emit('level-ready');
  }

  /** Hook for object types; later tasks add more cases. */
  spawnObject(o: LevelObject, index = 0): void {
    const p = tileFoot(o);
    switch (o.type) {
      case 'beetle':
        this.addEnemy(new Beetle(this, p.x, p.y, (x, y) => this.isGroundAt(x, y), Number(o.props?.speed ?? 40)));
        break;
      case 'bird':
        this.addEnemy(new Bird(this, p.x, p.y - 8, Number(o.props?.range ?? 4) * TILE));
        break;
      case 'minifig':
        this.addEnemy(new Beetle(this, p.x, p.y, (x, y) => this.isGroundAt(x, y), Number(o.props?.speed ?? 45), 'minifig'));
        break;
      case 'heli':
        this.addEnemy(new Bird(this, p.x, p.y - 8, Number(o.props?.range ?? 4) * TILE, 'heli'));
        break;
      case 'cage': {
        const cage = new Cage(this, p.x, p.y, o.id ?? `cage-${index}`, Cage.speciesFor(index, o.props?.species));
        this.physics.add.overlap(this.ball, cage, () => {
          if (cage.opened) return;
          cage.open();
          this.animalsFreed += 1;
          this.power.animalFreed();
          this.emitPower();
          this.ball.recall();
        }, () => this.ball.inFlight);
        break;
      }
      case 'golden-ball':
      case 'cromo': {
        const item = new Pickup(this, p.x, p.y - 8, o.type);
        this.physics.add.overlap(this.madds, item, () => {
          if (item.taken) return;
          item.collect();
          if (o.type === 'cromo') {
            this.gotCromo = true;
            this.events.emit('hud-cromo', true);
            synth.playSfx('cromo');
          } else {
            this.power.goldenBall();
            this.emitPower();
            synth.playSfx('golden');
          }
        });
        break;
      }
      case 'boss-hunter':
        this.spawnHunter(p.x, p.y);
        break;
      case 'boss-robot':
        this.spawnRobot(p.x, p.y);
        break;
      case 'minion-spawn':
        this.minionSpawns.push(p);
        break;
      case 'log': {
        const log = new LogPlatform(this, p.x, p.y - 5, Number(o.props?.dx ?? 0) * TILE, Number(o.props?.dy ?? 0) * TILE, Number(o.props?.speed ?? 40));
        this.physics.add.collider(this.madds, log);
        if (this.bekas) this.physics.add.collider(this.bekas, log);
        this.logs.push(log);
        break;
      }
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
      case 'bekas-zone':
        this.bekasZones.push(new Phaser.Geom.Rectangle(o.x * TILE, o.y * TILE, Number(o.props?.w ?? 1) * TILE, Number(o.props?.h ?? 1) * TILE));
        break;
      case 'paw-sign':
        this.add.image(p.x, p.y, 'bekas-sign').setOrigin(0.5, 1).setDepth(2);
        break;
      case 'brick-box': {
        const box = new BrickBox(this, p.x, p.y);
        const rect = { x: Number(o.props?.bx), y: Number(o.props?.by), w: Number(o.props?.bw), h: Number(o.props?.bh) };
        this.physics.add.overlap(this.ball, box, () => {
          if (box.open()) buildBricks(this, this.built.layer, rect, (tx, ty) => this.burst(tx * TILE + 8, ty * TILE + 8, 1, 3));
          this.ball.recall();
        }, () => this.ball.inFlight);
        break;
      }
      case 'plate':
        this.plates.push(new Plate(this, p.x, p.y, o.id ?? ''));
        break;
      case 'switch': {
        const sw = new Switch(this, p.x, p.y, o.id ?? '');
        this.physics.add.overlap(this.ball, sw, () => {
          if (sw.flip()) this.links.toggleSwitch(sw.linkId);
          this.ball.recall();
        }, () => this.ball.inFlight);
        break;
      }
      case 'door': {
        const door = new Door(this, p.x, p.y, String(o.props?.link ?? ''), Number(o.props?.h ?? 2));
        this.doors.push(door);
        this.physics.add.collider(this.madds, door);
        if (this.bekas) this.physics.add.collider(this.bekas, door);
        this.physics.add.collider(this.enemies, door);
        this.physics.add.collider(this.ball, door, () => this.ball.onBounce(), () => this.ball.collidesWithWorld);
        break;
      }
      case 'press':
        this.presses.push(new Press(this, p.x + TILE / 2, o.y * TILE, Number(o.props?.period ?? 2400), Number(o.props?.offset ?? 0)));
        break;
      case 'scent':
        this.scents.push(new Scent(this, p.x, p.y, o.x, o.y));
        break;
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

    const bekasActive = this.bekasActive;
    if (!bekasActive && this.controls.state.justPressed('super') && !this.madds.busy && this.power.activate()) {
      this.transform();
      return;
    }
    this.updateSuper();

    const speedMul = this.power.active ? POWER.speedMul : 1;
    for (const log of this.logs) log.step(delta);
    this.updateControlSwitch();
    if (this.bekasActive) {
      const bekas = this.bekas!;
      this.madds.update(delta, NO_INPUT, speedMul);
      bekas.drive(delta, this.controls.state);
      if (this.controls.state.justPressed('kick')) this.bekasDig();
    } else {
      this.madds.update(delta, this.controls.state, speedMul);
      this.bekas?.follow();
      this.updateIdleAnimations();
      if (this.controls.state.justPressed('kick') && !this.madds.busy && this.ball.kick(this.madds, this.power.active)) this.madds.playKick();
    }
    this.rideLogs();
    this.updatePuzzles(delta);
    this.ball.update(delta);
    this.updateCamera(delta);
    this.events.emit('level-update', delta);

    if (!this.respawning && this.touchingHazard()) this.die();
    if (this.bekas && this.bekasActive && this.hazardUnder(this.bekas.arcadeBody)) this.bekas.poof();
  }

  /** Plates, doors, presses, scents and conveyor belts. */
  private updatePuzzles(delta: number): void {
    const box = (b: Phaser.Physics.Arcade.Body): Box => ({ x: b.left, y: b.top, w: b.width, h: b.height });
    const bodies: Box[] = [box(this.madds.arcadeBody)];
    if (this.bekas) bodies.push(box(this.bekas.arcadeBody));
    for (const e of this.enemies.getChildren() as Enemy[]) if (e.alive && e.body) bodies.push(box(e.body as Phaser.Physics.Arcade.Body));

    for (const plate of this.plates) {
      const z = plate.zone;
      const pressed = bodies.some((b) => b.x < z.right && b.x + b.w > z.left && b.y < z.bottom && b.y + b.h > z.top);
      plate.setPressed(pressed);
      this.links.setPlate(plate.linkId, pressed);
    }
    for (const door of this.doors) {
      const open = this.links.isOn(door.linkId);
      if (!open && door.isOpen && !doorCanClose(door.box, bodies)) continue;
      door.setOpen(open);
    }

    const maddsRect = this.madds.getBounds();
    for (const press of this.presses) {
      press.step(this.elapsedMs);
      if (press.phase !== 'down') continue;
      const hit = press.hitBox;
      if (!this.respawning && Phaser.Geom.Intersects.RectangleToRectangle(hit, maddsRect)) this.die();
      if (this.bekas && Phaser.Geom.Intersects.RectangleToRectangle(hit, this.bekas.getBounds())) this.bekas.poof();
    }

    if (this.bekasActive) {
      const b = this.bekas!;
      for (const sc of this.scents) {
        if (sc.sniffed || Phaser.Math.Distance.Between(b.x, b.y, sc.x, sc.y) > 2 * TILE || !b.onFloor) continue;
        sc.consume();
        b.sniff();
        revealHidden(this.built.layer, this.level.tiles, sc.tileX, sc.tileY);
        this.burst(sc.x, sc.y - 10, 2, 10);
      }
    }

    const dt = delta / 1000;
    for (const who of [this.madds, this.bekas]) {
      if (!who) continue;
      const b = who.body as Phaser.Physics.Arcade.Body;
      if (!(b.blocked.down || b.touching.down)) continue;
      const dir = conveyorDir(this.built.layer.getTileAtWorldXY(who.x, b.bottom + 2));
      if (dir) who.x += dir * CONVEYOR_SPEED * Math.min(dt, 0.05);
    }
  }

  get bekasActive(): boolean {
    return this.control.active === 'bekas' && !!this.bekas;
  }

  /** The character the player is driving. */
  activeBody(): Madds | Bekas {
    return this.bekasActive ? this.bekas! : this.madds;
  }

  private updateControlSwitch(): void {
    if (!this.bekas) return;
    const active = this.activeBody();
    const zoneOf = (x: number, y: number) => this.bekasZones.find((z) => z.contains(x, y - 4));
    const inZone = !!zoneOf(active.x, active.y);
    this.control.setInZone(inZone);
    this.controls.setVisible('bekas', this.control.buttonVisible);
    if (inZone && !this.zoneHintShown && !this.bekasActive) {
      this.zoneHintShown = true;
      this.events.emit('hud-hint', 'Carrega em C (ou no botão da pata) para controlares a Bekas');
    }
    // A parked Bekas rejoins Madds once Madds leaves the zone she was left in.
    if (this.bekas.parked && !this.bekasActive) {
      const z = zoneOf(this.bekas.x, this.bekas.y);
      if (!z || !z.contains(this.madds.x, this.madds.y - 4)) this.bekas.parked = false;
    }
    if (!this.controls.state.justPressed('bekas')) return;
    const canSwitch = active.onFloor && !this.madds.busy && !this.respawning && !this.frozen;
    if (!this.control.toggle(canSwitch)) return;
    const nowBekas = this.control.active === 'bekas';
    this.bekas.stopAffection();
    this.bekas.setControlled(nowBekas);
    if (nowBekas) this.madds.resetMotion();
    this.cameras.main.startFollow(nowBekas ? this.bekas : this.madds, true, 0.15, 0.15);
    synth.playSfx('bark');
  }

  /** Hands control back to Madds (death, level end). */
  private resetControl(): void {
    if (!this.bekasActive) return;
    this.control.reset();
    this.bekas!.setControlled(false);
    this.bekas!.parked = false;
    this.cameras.main.startFollow(this.madds, true, 0.15, 0.15);
  }

  private bekasDig(): void {
    const layer = this.built.layer;
    this.bekas!.dig(
      (tx, ty) => layer.getTileAt(tx, ty)?.index === TILE_FRAME.softDirt,
      (tx, ty) => {
        layer.removeTileAt(tx, ty);
        this.burst(tx * TILE + TILE / 2, ty * TILE + TILE / 2, 4, 6);
      },
    );
  }

  /** Damages Madds (enemy, projectile). Returns false if she was immune. */
  hurtMadds(fromX: number): boolean {
    if (this.power.active || this.respawning) return false;
    const r = this.health.hit();
    if (r === 'ignored') return false;
    this.power.damaged();
    this.emitPower();
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
    this.resetControl();
    this.photoIdle = false;
    this.bekas?.stopAffection();
    this.madds.busy = false;
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
    this.resetControl();
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

  openPause(): void {
    this.scene.pause();
    synth.suspend();
    this.scene.launch('Pause', { onChoice: (c: PauseChoice) => this.onPauseChoice(c) });
  }

  private onPauseChoice(c: PauseChoice): void {
    synth.resume();
    this.scene.stop('Pause');
    if (c === 'resume') this.scene.resume();
    else if (c === 'restart') this.scene.restart();
    else if (c === 'map') this.scene.start('WorldMap');
    else if (c === 'options') this.scene.launch('Options', { returnTo: 'Pause', onClose: () => this.openPause() });
  }

  /** Freezes gameplay for the A.D.Q.C. transformation, then resumes with the kit on. */
  private transform(): void {
    this.frozen = true;
    this.physics.pause();
    this.madds.busy = true;
    this.madds.setFlipX(false);
    this.madds.anims.stop();
    this.madds.play('transform-play');
    synth.playSfx('adqc');
    synth.playMusic('transform');
    this.cameras.main.flash(300, 90, 140, 240);
    this.events.emit('hud-adqc');
    this.emitPower();
    this.madds.once('animationcomplete-transform-play', () => {
      this.madds.setAdqc(true);
      this.madds.busy = false;
      this.frozen = false;
      this.physics.resume();
      this.cameras.main.flash(200, 255, 255, 255);
      this.burst(this.madds.x, this.madds.y - 12, 2, 10);
      synth.playMusic(this.level.music);
    });
  }

  private updateSuper(): void {
    this.controls.setVisible('super', this.power.canActivate());
    if (this.power.active) {
      this.emitPower();
      this.madds.setTint(Math.floor(this.time.now / 100) % 2 === 0 ? 0xffffff : 0xbfd8ff);
    } else if (this.madds.adqc) {
      this.madds.setAdqc(false);
      this.madds.clearTint();
      this.burst(this.madds.x, this.madds.y - 12, 0, 10);
      this.emitPower();
    }
  }

  private spawnHunter(x: number, y: number): void {
    this.spawnBoss(new Hunter(this, x, y, this.madds, 3 * TILE, this.built.widthPx - 3 * TILE, (net) => this.nets.add(net)));
  }

  private spawnRobot(x: number, y: number): void {
    this.spawnBoss(new Robot(this, x, y, this.madds, 3 * TILE, this.built.widthPx - 3 * TILE, (shot) => this.nets.add(shot), (wave) => this.waves.add(wave)));
  }

  /** Wires any boss: ball hits, contact damage, HUD bar, minions, and the no-damage cromo. */
  private spawnBoss(boss: Boss): void {
    this.boss = boss;
    this.physics.add.collider(boss, this.built.layer);
    this.physics.add.overlap(this.ball, boss, () => {
      if (!boss.vulnerable) return;
      boss.hit(this.ball.powered ? POWER.bossDamageMul : 1);
      this.ball.recall();
    }, () => this.ball.inFlight);
    this.physics.add.overlap(this.madds, boss, () => {
      if (!boss.defeated) this.hurtMadds(boss.x);
    });
    boss.on('boss-hit', (hp: number) => this.events.emit('hud-boss', hp, boss.maxHp, boss.displayName));
    boss.once('boss-defeated', () => this.onBossDefeated());
    this.time.addEvent({ delay: 8000, loop: true, callback: () => this.spawnMinion() });
    this.time.delayedCall(50, () => this.events.emit('hud-boss', boss.hp, boss.maxHp, boss.displayName));
  }

  private spawnMinion(): void {
    if (!this.boss || this.boss.defeated || this.minionSpawns.length === 0) return;
    this.minions = this.minions.filter((m) => m.alive);
    if (this.minions.length >= 2) return;
    const p = Phaser.Utils.Array.GetRandom(this.minionSpawns);
    this.burst(p.x, p.y - 8, 4, 8);
    const minion = new Beetle(this, p.x, p.y, (x, y) => this.isGroundAt(x, y), 40, this.level.world === 2 ? 'minifig' : 'beetle');
    this.addEnemy(minion);
    this.minions.push(minion);
  }

  private onBossDefeated(): void {
    const boss = this.boss!;
    this.events.emit('hud-boss', 0, boss.maxHp, '');
    this.minions.forEach((m) => m.alive && m.defeat());
    this.nets.clear(true, true);
    this.waves.clear(true, true);
    if (!this.tookDamage) {
      this.gotCromo = true;
      this.events.emit('hud-cromo', true);
      synth.playSfx('cromo');
    }
    synth.stopMusic();
    synth.playSfx('goal');
    this.time.delayedCall(1200, () => boss.leave(this.built.widthPx, () => this.complete()));
  }

  /** Long rest: photo of Bekas before the rescue, the affection routine after. Any input interrupts. */
  private updateIdleAnimations(): void {
    const playing = this.photoIdle || !!this.bekas?.inAffection;
    if (playing && this.controls.state.anyDown()) {
      this.photoIdle = false;
      this.bekas?.stopAffection();
      this.madds.busy = false;
      return;
    }
    if (playing || !this.idle.isLongIdle || !this.madds.onFloor || this.power.active) return;
    if (this.bekas) {
      this.bekas.startAffection();
    } else {
      this.photoIdle = true;
      this.madds.busy = true;
      this.madds.play('madds-photo', true);
    }
  }

  addEnemy(e: Enemy): void {
    this.enemies.add(e);
  }

  emitPower(): void {
    this.events.emit('hud-power', this.power.value, this.power.active);
  }

  /** Records a defeated enemy for the power bar. */
  enemyDefeated(e: Enemy, chainIndex: number): void {
    if (!e.alive) return;
    e.defeat();
    this.power.enemyDefeated(chainIndex);
    this.emitPower();
    synth.playSfx('enemy');
    this.burst(e.x, e.y - 6, 1);
  }

  burst(x: number, y: number, frame: number, count = 6): void {
    for (let i = 0; i < count; i++) {
      const a = (Math.PI * 2 * i) / count;
      const p = this.add.image(x, y, 'particle', frame).setDepth(12);
      this.tweens.add({ targets: p, x: x + Math.cos(a) * 14, y: y + Math.sin(a) * 14, alpha: 0, duration: 350, onComplete: () => p.destroy() });
    }
  }

  private onBallHitEnemy(e: Enemy): void {
    if (!e.alive) return;
    this.enemyDefeated(e, this.ball.chainIndex);
    this.ball.chainIndex += 1;
    if (!this.ball.powered) this.ball.ricochet();
  }

  private onTouchEnemy(e: Enemy): void {
    if (!e.alive) return;
    if (this.power.active) this.enemyDefeated(e, 0);
    else this.hurtMadds(e.x);
  }

  private onBallHitTile(tile: Phaser.Tilemaps.Tile): void {
    if (this.ball.powered && tile.index === TILE_FRAME.reinforced) {
      // The whole wall comes down at once, so one powered kick always opens a walkable gap.
      const layer = this.built.layer;
      const queue = [tile];
      while (queue.length) {
        const t = queue.pop()!;
        if (t.index !== TILE_FRAME.reinforced) continue;
        this.burst(t.getCenterX(), t.getCenterY(), 4, 8);
        layer.removeTileAt(t.x, t.y);
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const n = layer.getTileAt(t.x + dx, t.y + dy);
          if (n) queue.push(n);
        }
      }
      synth.playSfx('break');
      this.cameras.main.shake(80, 0.004);
      return;
    }
    if (tile.index === TILE_FRAME.reinforced) {
      // Hint: a normal kick only chips it; the blue flash points to the A.D.Q.C. kick.
      synth.playSfx('clink');
      this.burst(tile.getCenterX(), tile.getCenterY(), 4, 3);
      tile.tint = 0x9fc4ff;
      this.time.delayedCall(250, () => (tile.tint = 0xffffff));
    }
    this.ball.onBounce();
  }

  private rideLogs(): void {
    const b = this.madds.arcadeBody;
    for (const log of this.logs) {
      const lb = log.body as Phaser.Physics.Arcade.Body;
      const standing = Math.abs(b.bottom - lb.top) < 3 && b.right > lb.left && b.left < lb.right && this.madds.move.vy >= 0;
      if (standing) this.madds.x += log.x - log.prevX;
    }
  }

  private isGroundAt(worldX: number, worldY: number): boolean {
    const t = this.built.layer.getTileAtWorldXY(worldX, worldY);
    return !!t && t.collides;
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
    return this.hazardUnder(this.madds.arcadeBody);
  }

  /** Pits, spikes and water under a body. */
  private hazardUnder(b: Phaser.Physics.Arcade.Body): boolean {
    if (b.top > this.built.heightPx) return true;
    const tiles = this.built.layer.getTilesWithinWorldXY(b.left + 2, b.top + 6, b.width - 4, b.height - 6);
    return tiles.some((t) => t.index === TILE_FRAME.spikes || t.index === TILE_FRAME.waterA || t.index === TILE_FRAME.waterB || t.index === TILE_FRAME.waterDeep);
  }

  private updateCamera(delta: number): void {
    const target = this.activeBody().facing * 24;
    this.lookAhead += (target - this.lookAhead) * Math.min(1, delta / 250);
    this.cameras.main.setFollowOffset(-this.lookAhead, 0);
  }
}
