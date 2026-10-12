import Phaser from 'phaser';
import { createActor } from '../art/actors';
import { Soundscape } from '../audio/Soundscape';
import { BIOMES } from '../content/biomes';
import { encounterFor, SPAWNS, type EnemyKind } from '../content/encounters';
import { blocked, moveAroundObstacle, normalizedMovement, OBSTACLES, type EscapeStep } from '../core/arena';
import { generateRun, parseRunSeed, type Direction, type Room } from '../core/run';
import { chestWeapon, createShots, ENERGY_DELAY, MAX_ENERGY, restoreEnergy, spendEnergy, WEAPONS, type WeaponId } from '../core/weapons';
import { closestTarget } from '../core/targeting';

type State = 'menu' | 'playing' | 'chest' | 'paused' | 'dead' | 'cleared';
type Enemy = { view: Phaser.GameObjects.Container; kind: EnemyKind; x: number; y: number; hp: number; maxHp: number; speed: number; cooldown: number; windup: number; escape?: EscapeStep };
type Bullet = { view: Phaser.GameObjects.Arc; vx: number; vy: number; life: number; damage: number };
type Coin = { view: Phaser.GameObjects.Arc; x: number; y: number };

const W = 960;
const H = 540;

export class ArenaScene extends Phaser.Scene {
  private state: State = 'menu';
  private hero!: Phaser.GameObjects.Container;
  private heroX = 480;
  private heroY = 385;
  private heroHp = 5;
  private hurtTimer = 0;
  private fireTimer = 0;
  private energy = MAX_ENERGY;
  private energyCooldown = 0;
  private dashTimer = 0;
  private dashCooldown = 0;
  private skillCooldown = 0;
  private lastMoveX = 0;
  private lastMoveY = -1;
  private enemies: Enemy[] = [];
  private rooms: Room[] = [];
  private currentRoom = 0;
  private cleared = new Set<number>();
  private visited = new Set<number>();
  private seed = 0;
  private roomArt: Phaser.GameObjects.GameObject[] = [];
  private mapGraphics!: Phaser.GameObjects.Graphics;
  private bullets: Bullet[] = [];
  private enemyBullets: Bullet[] = [];
  private groundCoins: Coin[] = [];
  private storedCoins = new Map<number, { x: number; y: number }[]>();
  private coins = 0;
  private weapon: WeaponId = 'bolt';
  private openedChests = new Set<number>();
  private damageTaken = 0;
  private bossWarning!: Phaser.GameObjects.Graphics;
  private bossBar!: Phaser.GameObjects.Graphics;
  private debugFps?: Phaser.GameObjects.Text;
  private fpsTimer = 0;
  private healButton!: Phaser.GameObjects.Rectangle;
  private healLabel!: Phaser.GameObjects.Text;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private heldCodes = new Set<string>();
  private pressedCodes = new Set<string>();
  private mouseDown = false;
  private movePointer: number | null = null;
  private firePointer: number | null = null;
  private joyX = 0;
  private joyY = 0;
  private touchMode = false;
  private hud!: Phaser.GameObjects.Text;
  private energyText!: Phaser.GameObjects.Text;
  private energyBar!: Phaser.GameObjects.Graphics;
  private hint!: Phaser.GameObjects.Text;
  private joyBase!: Phaser.GameObjects.Arc;
  private joyKnob!: Phaser.GameObjects.Arc;
  private fireBase!: Phaser.GameObjects.Arc;
  private fireLabel!: Phaser.GameObjects.Text;
  private dashButton!: Phaser.GameObjects.Arc;
  private dashLabel!: Phaser.GameObjects.Text;
  private skillButton!: Phaser.GameObjects.Arc;
  private skillLabel!: Phaser.GameObjects.Text;
  private overlay: Phaser.GameObjects.GameObject[] = [];
  private elapsed = 0;
  private soundscape = new Soundscape();
  private soundLabel!: Phaser.GameObjects.Text;

  constructor() { super('Arena'); }

  create(): void {
    this.touchMode = navigator.maxTouchPoints > 0 || matchMedia('(pointer: coarse)').matches;
    this.drawRoom();
    this.createHero();
    const panels = this.add.graphics().setDepth(19);
    panels.fillStyle(0x071520, 0.88); panels.fillRoundedRect(19, 10, 313, 57, 10);
    panels.fillRoundedRect(334, 10, 208, 57, 10);
    panels.fillRoundedRect(731, 9, 212, 75, 10);
    panels.lineStyle(2, 0x50777d, 0.8);
    panels.strokeRoundedRect(19, 10, 313, 57, 10);
    panels.strokeRoundedRect(334, 10, 208, 57, 10);
    panels.strokeRoundedRect(731, 9, 212, 75, 10);
    this.hud = this.add.text(35, 19, '', { fontFamily: 'Trebuchet MS, system-ui', fontSize: '18px', color: '#effaf4', fontStyle: 'bold' }).setDepth(20);
    this.energyText = this.add.text(345, 16, '', { fontFamily: 'system-ui', fontSize: '14px', color: '#acebff', fontStyle: 'bold' }).setDepth(20);
    this.energyBar = this.add.graphics().setDepth(20);
    if (new URLSearchParams(location.search).has('debug')) {
      this.debugFps = this.add.text(740, 77, '', { fontFamily: 'monospace', fontSize: '11px', color: '#93d8c7' }).setDepth(25);
    }
    this.mapGraphics = this.add.graphics().setDepth(20);
    this.bossWarning = this.add.graphics().setDepth(8);
    this.bossBar = this.add.graphics().setDepth(20);
    this.healButton = this.add.rectangle(647, 39, 105, 30, 0x367c80).setStrokeStyle(2, 0xa5e8cf).setDepth(20).setInteractive({ useHandCursor: true });
    this.healLabel = this.add.text(647, 39, 'CURA ◈3', { fontFamily: 'system-ui', fontSize: '14px', color: '#e4fff8', fontStyle: 'bold' }).setOrigin(0.5).setDepth(21);
    this.healButton.on('pointerdown', () => this.buyHeal());
    this.hint = this.add.text(480, 506, '', { fontFamily: 'system-ui', fontSize: '14px', color: '#91a5c8' }).setOrigin(0.5).setDepth(20);
    this.add.text(900, 27, 'Ⅱ', { fontFamily: 'system-ui', fontSize: '26px', color: '#dbeaff' }).setOrigin(0.5).setDepth(20);
    const soundButton = this.add.rectangle(895, 67, 82, 31, 0x1b4048).setStrokeStyle(1, 0x6aaea8)
      .setDepth(23).setInteractive({ useHandCursor: true });
    this.soundLabel = this.add.text(895, 67, 'SOM ●', { fontFamily: 'Trebuchet MS, system-ui', fontSize: '13px', color: '#9fe8d1', fontStyle: 'bold' })
      .setOrigin(0.5).setDepth(24);
    soundButton.on('pointerdown', () => this.toggleSound());

    this.joyBase = this.add.circle(153, 399, 61, 0x8cc5ff, 0.13).setStrokeStyle(2, 0xa5d4ff, 0.5).setDepth(20);
    this.joyKnob = this.add.circle(153, 399, 25, 0x9ad7ff, 0.47).setDepth(21);
    this.fireBase = this.add.circle(810, 399, 60, 0xff9f88, 0.28).setStrokeStyle(3, 0xffc0a4, 0.8).setDepth(20);
    this.fireLabel = this.add.text(810, 399, 'ATIRAR', { fontFamily: 'system-ui', fontSize: '15px', color: '#fff5ed', fontStyle: 'bold' }).setOrigin(0.5).setDepth(21);
    this.dashButton = this.add.circle(696, 437, 34, 0x8dc5f4, 0.25).setStrokeStyle(2, 0x9bd8ff, 0.8).setDepth(20);
    this.dashLabel = this.add.text(696, 437, 'DASH', { fontFamily: 'system-ui', fontSize: '12px', color: '#e9faff', fontStyle: 'bold' }).setOrigin(0.5).setDepth(21);
    this.skillButton = this.add.circle(870, 281, 35, 0xc991ef, 0.28).setStrokeStyle(2, 0xe3bbff, 0.8).setDepth(20);
    this.skillLabel = this.add.text(870, 281, 'PULSO', { fontFamily: 'system-ui', fontSize: '11px', color: '#fbeaff', fontStyle: 'bold' }).setOrigin(0.5).setDepth(21);
    this.setTouchVisibility();

    this.keys = this.input.keyboard!.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,ESC,SPACE,E,H') as Record<string, Phaser.Input.Keyboard.Key>;
    window.addEventListener('keydown', this.onNativeKeyDown, true);
    window.addEventListener('keyup', this.onNativeKeyUp, true);
    this.input.on('pointerdown', this.onDown, this);
    this.input.on('pointermove', this.onMove, this);
    this.input.on('pointerup', this.onUp, this);
    this.input.on('pointerupoutside', this.onUp, this);
    this.game.events.on(Phaser.Core.Events.BLUR, this.pauseOnBlur, this);
    this.scale.on(Phaser.Scale.Events.RESIZE, this.pauseOnPortrait, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.game.events.off(Phaser.Core.Events.BLUR, this.pauseOnBlur, this));
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.scale.off(Phaser.Scale.Events.RESIZE, this.pauseOnPortrait, this));
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      window.removeEventListener('keydown', this.onNativeKeyDown, true);
      window.removeEventListener('keyup', this.onNativeKeyUp, true);
    });
    this.showOverlay('JUNQ · RUN', 'Mira automática, energia limitada e armas em baús.\nElimine os guardiões e encontre a saída.', 'COMEÇAR', () => this.startRun());
    this.refreshHud();
  }

  private drawRoom(): void {
    this.roomArt.forEach(item => item.destroy());
    const room = this.rooms[this.currentRoom];
    const palette = BIOMES[room?.biome ?? 'atrium'];
    const g = this.add.graphics();
    g.fillGradientStyle(palette.backdrop, palette.backdrop, 0x080f1b, 0x080f1b); g.fillRect(0, 0, W, H);
    g.fillStyle(palette.rim); g.fillRoundedRect(37, 66, 886, 434, 18);
    g.fillStyle(0x0c1826); g.fillRoundedRect(47, 76, 866, 414, 13);
    g.fillStyle(palette.floor); g.fillRoundedRect(59, 86, 842, 394, 8);
    // Offset slabs and small etched glyphs make the room feel hand built without an external tileset.
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 20; col++) {
        const x = 64 + col * 42 + (row % 2) * 20, y = 90 + row * 39;
        if (x > 877) continue;
        g.fillStyle((row + col) % 4 === 0 ? palette.tileA : palette.tileB, 0.65);
        g.fillRoundedRect(x, y, 39, 36, 3);
        if ((row * 7 + col * 11) % 17 === 0) {
          g.lineStyle(1, palette.glyph, 0.5);
          if (room?.biome === 'forge') {
            g.lineBetween(x + 10, y + 7, x + 22, y + 19);
            g.lineBetween(x + 22, y + 19, x + 15, y + 30);
          } else {
            g.strokeCircle(x + 19, y + 18, 9);
            g.lineBetween(x + 19, y + 12, x + 19, y + 24);
          }
        }
      }
    }
    g.lineStyle(4, palette.pillarTop); g.strokeRoundedRect(54, 81, 852, 403, 12);
    g.lineStyle(2, palette.line, 0.6); g.strokeRoundedRect(62, 89, 836, 387, 8);
    for (const [x, y] of [[85, 111], [875, 111], [85, 454], [875, 454]]) {
      g.fillStyle(0x142a36); g.fillCircle(x, y, 15);
      g.lineStyle(2, palette.accent); g.strokeCircle(x, y, 11);
      g.fillStyle(0xd7b772); g.fillCircle(x, y, 4);
    }
    for (const o of room?.obstacles ?? OBSTACLES) {
      g.fillStyle(0x050d17, 0.65); g.fillRoundedRect(o.x + 7, o.y + 11, o.w, o.h, 7);
      g.fillStyle(palette.pillar); g.fillRoundedRect(o.x, o.y, o.w, o.h, 6);
      g.fillStyle(palette.pillarTop); g.fillRoundedRect(o.x + 5, o.y + 4, o.w - 10, o.h - 11, 4);
      g.lineStyle(3, palette.pillarEdge); g.strokeRoundedRect(o.x, o.y, o.w, o.h, 6);
      g.lineStyle(2, palette.line); g.lineBetween(o.x + 11, o.y + 12, o.x + o.w - 11, o.y + o.h - 15);
      g.fillStyle(0xd6b774); g.fillCircle(o.x + o.w / 2, o.y + o.h / 2, 4);
    }
    if (room) {
      const open = this.cleared.has(room.id);
      g.fillStyle(open ? 0x64d8b4 : 0xa25a68);
      for (const direction of Object.keys(room.neighbors) as Direction[]) {
        if (direction === 'north') { g.fillRect(436, 81, 88, 12); g.fillStyle(0xd9f0cf); g.fillTriangle(480, 87, 470, 97, 490, 97); }
        if (direction === 'south') { g.fillRect(436, 473, 88, 12); g.fillStyle(0xd9f0cf); g.fillTriangle(480, 480, 470, 467, 490, 467); }
        if (direction === 'west') { g.fillRect(52, 251, 13, 68); g.fillStyle(0xd9f0cf); g.fillTriangle(57, 285, 70, 274, 70, 296); }
        if (direction === 'east') { g.fillRect(895, 251, 13, 68); g.fillStyle(0xd9f0cf); g.fillTriangle(902, 285, 890, 274, 890, 296); }
        g.fillStyle(open ? 0x64d8b4 : 0xa25a68);
      }
    }
    const roomName = room?.kind === 'boss' ? 'GUARDIÃO FINAL' : room?.kind === 'reward' ? 'BAÚ APÓS COMBATE' : 'COMBATE';
    const title = this.add.text(480, 110, room ? `${palette.name} · SALA ${String(room.id + 1).padStart(2, '0')} · ${this.cleared.has(room.id) ? 'PORTAS ABERTAS' : roomName}` : 'ÁTRIO · SALA 01',
      { fontFamily: 'system-ui', fontSize: '13px', color: room?.biome === 'forge' ? '#ffd39b' : '#93bac1', letterSpacing: 2 }).setOrigin(0.5);
    this.roomArt = [g, title];
    if (room?.kind === 'reward' && this.cleared.has(room.id) && !this.openedChests.has(room.id)) {
      const chest = this.add.graphics().setDepth(6);
      chest.fillStyle(0x251b23); chest.fillRoundedRect(439, 247, 82, 55, 7);
      chest.fillStyle(0x925b3f); chest.fillRoundedRect(445, 242, 70, 49, 6);
      chest.lineStyle(3, 0xffd58b); chest.strokeRoundedRect(445, 242, 70, 49, 6);
      chest.fillStyle(0xe7b963); chest.fillRect(476, 243, 9, 47);
      chest.fillStyle(0x2b3e43); chest.fillCircle(480, 265, 7);
      chest.fillStyle(0xf7e6a4); chest.fillCircle(480, 265, 3);
      const prompt = this.add.text(480, 310, 'TOQUE NO BAÚ', { fontFamily: 'system-ui', fontSize: '14px', color: '#ffe2a0', fontStyle: 'bold' }).setOrigin(0.5).setDepth(6);
      this.roomArt.push(chest, prompt);
    }
  }

  private createHero(): void {
    this.hero = createActor(this, this.heroX, this.heroY, 'hero').setDepth(10);
  }

  private createEnemy(x: number, y: number, kind: EnemyKind): Enemy {
    const view = createActor(this, x, y, kind).setDepth(9);
    const hp = kind === 'boss' ? 32 : kind === 'brute' ? 6 : kind === 'sentry' ? 4 : 3;
    return { view, kind, x, y, hp, maxHp: hp,
      speed: kind === 'sentry' ? 0 : kind === 'boss' ? 55 : kind === 'brute' ? 48 : kind === 'shooter' ? 58 : 84,
      cooldown: kind === 'boss' ? 1.8 : kind === 'sentry' ? 1.4 : kind === 'shooter' ? 1 : 0, windup: 0 };
  }

  private requestMobileFullscreen(): void {
    if (!this.touchMode || !matchMedia('(orientation: landscape)').matches || document.fullscreenElement) return;
    void document.documentElement.requestFullscreen?.({ navigationUI: 'hide' }).then(() => {
      const orientation = screen.orientation as (ScreenOrientation & { lock?: (mode: string) => Promise<void> }) | undefined;
      void orientation?.lock?.('landscape')?.catch(() => undefined);
    }).catch(() => undefined);
  }

  private startRun(): void {
    this.requestMobileFullscreen();
    this.soundscape.unlock(); this.soundscape.play('start');
    this.pressedCodes.clear();
    this.clearOverlay();
    this.seed = parseRunSeed(new URLSearchParams(location.search).get('seed')) ?? Math.floor(Math.random() * 0x100000000);
    this.rooms = generateRun(this.seed);
    this.currentRoom = 0;
    this.cleared = new Set();
    this.visited = new Set([0]);
    this.storedCoins.clear(); this.coins = 0; this.weapon = 'bolt'; this.openedChests.clear(); this.damageTaken = 0;
    this.groundCoins.forEach(coin => coin.view.destroy()); this.groundCoins = [];
    this.heroHp = 5; this.hurtTimer = 0; this.fireTimer = 0; this.energy = MAX_ENERGY; this.energyCooldown = 0; this.elapsed = 0;
    this.dashTimer = 0; this.dashCooldown = 0; this.skillCooldown = 0;
    this.heroX = 480; this.heroY = 385; this.hero.setPosition(this.heroX, this.heroY);
    this.enterRoom(0);
    this.state = 'playing'; this.refreshHud();
  }

  private enterRoom(id: number, entry?: Direction): void {
    if (entry) this.soundscape.play('door');
    if (this.rooms.length) {
      this.storedCoins.set(this.currentRoom, this.groundCoins.map(coin => ({ x: coin.x, y: coin.y })));
    }
    this.groundCoins.forEach(coin => coin.view.destroy());
    this.groundCoins = [];
    this.bullets.forEach(b => b.view.destroy());
    this.enemyBullets.forEach(b => b.view.destroy());
    this.enemies.forEach(e => e.view.destroy());
    this.bullets = [];
    this.enemyBullets = [];
    this.enemies = [];
    this.bossWarning.clear(); this.bossBar.clear();
    this.currentRoom = id;
    this.visited.add(id);
    if (entry === 'east') { this.heroX = 89; this.heroY = 285; }
    if (entry === 'west') { this.heroX = 871; this.heroY = 285; }
    if (entry === 'south') { this.heroX = 480; this.heroY = 118; }
    if (entry === 'north') { this.heroX = 480; this.heroY = 447; }
    this.hero.setPosition(this.heroX, this.heroY);
    this.drawRoom();
    if (!this.cleared.has(id)) {
      this.enemies = encounterFor(this.rooms[id]).map(kind => this.createEnemy(SPAWNS[kind].x, SPAWNS[kind].y, kind));
    }
    for (const coin of this.storedCoins.get(id) ?? []) this.spawnCoin(coin.x, coin.y);
    this.mouseDown = false; this.movePointer = null; this.firePointer = null;
    this.joyX = 0; this.joyY = 0; this.joyKnob.setPosition(153, 399);
    this.refreshHud();
  }

  update(_time: number, delta: number): void {
    this.fpsTimer -= delta;
    if (this.debugFps && this.fpsTimer <= 0) {
      this.debugFps.setText(`FPS ${Math.round(this.game.loop.actualFps)}`);
      this.fpsTimer = 500;
    }
    const escape = this.consumeKey('Escape');
    if (Phaser.Input.Keyboard.JustDown(this.keys.ESC) || escape) this.togglePause();
    if (this.state !== 'playing') { this.pressedCodes.clear(); return; }
    const dt = Math.min(delta, 50) / 1000;
    this.elapsed += dt;
    this.hurtTimer = Math.max(0, this.hurtTimer - dt);
    this.fireTimer -= dt;
    this.energyCooldown = Math.max(0, this.energyCooldown - dt);
    this.energy = restoreEnergy(this.energy, dt, this.energyCooldown);
    this.drawEnergy();
    this.dashTimer = Math.max(0, this.dashTimer - dt);
    this.dashCooldown = Math.max(0, this.dashCooldown - dt);
    this.skillCooldown = Math.max(0, this.skillCooldown - dt);
    const space = this.consumeKey('Space'), pulseKey = this.consumeKey('KeyE'), healKey = this.consumeKey('KeyH');
    if (Phaser.Input.Keyboard.JustDown(this.keys.SPACE) || space) this.dash();
    if (Phaser.Input.Keyboard.JustDown(this.keys.E) || pulseKey) this.pulse();
    if (Phaser.Input.Keyboard.JustDown(this.keys.H) || healKey) this.buyHeal();
    if (this.state !== 'playing') return;
    this.hero.setAlpha(this.hurtTimer > 0 && Math.floor(this.hurtTimer * 12) % 2 === 0 ? 0.45 : 1);

    let mx = Number(this.keys.D.isDown || this.keys.RIGHT.isDown || this.heldCodes.has('KeyD') || this.heldCodes.has('ArrowRight'))
      - Number(this.keys.A.isDown || this.keys.LEFT.isDown || this.heldCodes.has('KeyA') || this.heldCodes.has('ArrowLeft')) + this.joyX;
    let my = Number(this.keys.S.isDown || this.keys.DOWN.isDown || this.heldCodes.has('KeyS') || this.heldCodes.has('ArrowDown'))
      - Number(this.keys.W.isDown || this.keys.UP.isDown || this.heldCodes.has('KeyW') || this.heldCodes.has('ArrowUp')) + this.joyY;
    ({ x: mx, y: my } = normalizedMovement(mx, my));
    if (Math.hypot(mx, my) > 0.15) { this.lastMoveX = mx; this.lastMoveY = my; }
    if (this.dashTimer > 0) { mx = this.lastMoveX; my = this.lastMoveY; }
    if (this.tryDoor(mx, my)) return;
    const speed = this.dashTimer > 0 ? 520 : 205;
    const nextX = this.heroX + mx * speed * dt;
    const nextY = this.heroY + my * speed * dt;
    const obstacles = this.rooms[this.currentRoom].obstacles;
    if (!blocked(nextX, this.heroY, 15, obstacles)) this.heroX = nextX;
    if (!blocked(this.heroX, nextY, 15, obstacles)) this.heroY = nextY;
    this.hero.setPosition(this.heroX, this.heroY);
    for (const coin of [...this.groundCoins]) {
      if (Math.hypot(this.heroX - coin.x, this.heroY - coin.y) >= 29) continue;
      coin.view.destroy(); this.groundCoins.splice(this.groundCoins.indexOf(coin), 1);
      this.coins++; this.soundscape.play('coin'); this.refreshHud();
    }

    if (this.firePointer !== null || this.mouseDown) this.fire();
    this.bossWarning.clear(); this.bossBar.clear();
    for (const enemy of this.enemies) {
      const dx = this.heroX - enemy.x, dy = this.heroY - enemy.y;
      const length = Math.max(1, Math.hypot(dx, dy));
      const preferred = enemy.kind === 'shooter' && length < 190 ? -0.65 : 1;
      const motion = enemy.kind === 'sentry' || (enemy.kind === 'boss' && enemy.windup > 0) ? 0
        : enemy.kind === 'shooter' && length < 260 && length >= 190 ? 0 : preferred;
      const radius = enemy.kind === 'boss' ? 30 : enemy.kind === 'brute' ? 20 : 15;
      const moved = moveAroundObstacle(enemy.x, enemy.y, dx / length * motion, dy / length * motion,
        enemy.speed * dt, radius, obstacles, enemy.escape);
      enemy.x = moved.x; enemy.y = moved.y; enemy.escape = moved.escape;
      enemy.view.setPosition(enemy.x, enemy.y);
      enemy.cooldown = Math.max(0, enemy.cooldown - dt);
      if (enemy.kind === 'boss') {
        this.bossBar.fillStyle(0x381e33); this.bossBar.fillRoundedRect(340, 67, 280, 12, 5);
        this.bossBar.fillStyle(0xff7f9b); this.bossBar.fillRoundedRect(342, 69, Math.max(0, 276 * enemy.hp / enemy.maxHp), 8, 4);
        if (enemy.windup > 0) {
          enemy.windup = Math.max(0, enemy.windup - dt);
          this.bossWarning.lineStyle(3, 0xff91a5, 0.75);
          this.bossWarning.strokeCircle(enemy.x, enemy.y, 78 + (1 - enemy.windup) * 26);
          this.bossWarning.lineBetween(enemy.x, enemy.y, this.heroX, this.heroY);
          if (enemy.windup === 0) this.bossAttack(enemy);
        } else if (enemy.cooldown === 0) { enemy.windup = 0.85; enemy.cooldown = 3.2; }
      }
      if (enemy.kind === 'shooter' && enemy.cooldown === 0 && length < 420) {
        enemy.cooldown = 1.65;
        this.spawnEnemyBullet(enemy.x, enemy.y, Math.atan2(dy, dx), 215);
      }
      if (enemy.kind === 'sentry' && length < 460) {
        if (enemy.windup > 0) {
          enemy.windup = Math.max(0, enemy.windup - dt);
          this.bossWarning.lineStyle(3, 0xffd28a, 0.85);
          this.bossWarning.strokeCircle(enemy.x, enemy.y, 25 + (0.7 - enemy.windup) * 17);
          this.bossWarning.lineBetween(enemy.x, enemy.y, this.heroX, this.heroY);
          if (enemy.windup === 0) {
            const aim = Math.atan2(this.heroY - enemy.y, this.heroX - enemy.x);
            for (const spread of [-0.24, 0, 0.24]) this.spawnEnemyBullet(enemy.x, enemy.y, aim + spread, 195, 0xffbc72);
          }
        } else if (enemy.cooldown === 0) { enemy.windup = 0.7; enemy.cooldown = 2.8; }
      }
      if (length < radius + 14) {
        this.damageHero();
        if (this.state !== 'playing') return;
      }
    }
    for (const bullet of [...this.bullets]) {
      bullet.view.x += bullet.vx * dt;
      bullet.view.y += bullet.vy * dt;
      bullet.life -= dt;
      if (bullet.life <= 0 || blocked(bullet.view.x, bullet.view.y, 5, obstacles)) { this.removeBullet(bullet); continue; }
      const target = this.enemies.find(e => Math.hypot(e.x - bullet.view.x, e.y - bullet.view.y) < (e.kind === 'boss' ? 37 : e.kind === 'brute' ? 26 : 21));
      if (!target) continue;
      this.removeBullet(bullet);
      this.damageEnemy(target, bullet.damage);
      if (this.state !== 'playing' || this.enemies.length === 0) return;
    }
    for (const bullet of [...this.enemyBullets]) {
      bullet.view.x += bullet.vx * dt; bullet.view.y += bullet.vy * dt; bullet.life -= dt;
      if (bullet.life <= 0 || blocked(bullet.view.x, bullet.view.y, 7, obstacles)) { this.removeEnemyBullet(bullet); continue; }
      if (Math.hypot(this.heroX - bullet.view.x, this.heroY - bullet.view.y) < 22) {
        this.removeEnemyBullet(bullet); this.damageHero();
        if (this.state !== 'playing') return;
      }
    }
    this.dashButton.setAlpha(this.dashCooldown > 0 ? 0.35 : 1);
    this.skillButton.setAlpha(this.skillCooldown > 0 ? 0.35 : 1);
  }

  private spawnEnemyBullet(x: number, y: number, angle: number, speed: number, color = 0xf8a5d9): void {
    if (this.enemyBullets.length >= 48) return;
    const view = this.add.circle(x, y, 7, color).setStrokeStyle(2, color === 0xffbc72 ? 0xffedba : 0xffe4fa).setDepth(8);
    this.enemyBullets.push({ view, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 2.4, damage: 1 });
  }

  private bossAttack(enemy: Enemy): void {
    for (let i = 0; i < 8; i++) this.spawnEnemyBullet(enemy.x, enemy.y, i * Math.PI / 4, 180);
    const aim = Math.atan2(this.heroY - enemy.y, this.heroX - enemy.x);
    for (const offset of [-0.2, 0, 0.2]) this.spawnEnemyBullet(enemy.x, enemy.y, aim + offset, 245);
  }

  private damageEnemy(enemy: Enemy, amount: number): void {
    enemy.hp -= amount; enemy.view.setAlpha(0.6);
    this.soundscape.play('hit');
    this.time.delayedCall(80, () => { if (enemy.view.active) enemy.view.setAlpha(1); });
    if (enemy.hp > 0) return;
    enemy.view.destroy(); this.enemies.splice(this.enemies.indexOf(enemy), 1);
    if (enemy.kind !== 'boss') this.spawnCoin(enemy.x, enemy.y);
    this.refreshHud();
    if (this.enemies.length === 0) this.finishRoom();
  }

  private spawnCoin(x: number, y: number): void {
    const view = this.add.circle(x, y, 9, 0xf3cc61).setStrokeStyle(2, 0xfff1ae).setDepth(7);
    this.groundCoins.push({ view, x, y });
  }

  private tryDoor(mx: number, my: number): boolean {
    if (!this.cleared.has(this.currentRoom)) return false;
    const room = this.rooms[this.currentRoom];
    let direction: Direction | undefined;
    if (mx > 0.1 && this.heroX >= 878 && Math.abs(this.heroY - 285) < 33) direction = 'east';
    else if (mx < -0.1 && this.heroX <= 82 && Math.abs(this.heroY - 285) < 33) direction = 'west';
    else if (my < -0.1 && this.heroY <= 111 && Math.abs(this.heroX - 480) < 45) direction = 'north';
    else if (my > 0.1 && this.heroY >= 455 && Math.abs(this.heroX - 480) < 45) direction = 'south';
    const next = direction && room.neighbors[direction];
    if (next === undefined) return false;
    this.enterRoom(next, direction);
    return true;
  }

  private finishRoom(): void {
    this.cleared.add(this.currentRoom);
    this.enemyBullets.forEach(bullet => bullet.view.destroy()); this.enemyBullets = [];
    this.bossWarning.clear();
    this.drawRoom();
    this.refreshHud();
    if (this.rooms[this.currentRoom].kind === 'boss') { this.finish(true); return; }
    // Salas de recompensa revelam o baú depois do combate. Ele permanece até ser aberto.
  }

  private fire(): void {
    if (this.fireTimer > 0 || this.bullets.length >= 32) return;
    const target = closestTarget({ x: this.heroX, y: this.heroY }, this.enemies, this.rooms[this.currentRoom].obstacles);
    if (!target) return;
    const remaining = spendEnergy(this.energy, this.weapon);
    if (remaining === null) { this.drawEnergy(); return; }
    const dx = target.x - this.heroX, dy = target.y - this.heroY;
    const shots = createShots(this.weapon, dx, dy);
    this.energy = remaining;
    this.energyCooldown = ENERGY_DELAY;
    this.fireTimer = WEAPONS[this.weapon].cadence;
    this.drawEnergy();
    this.soundscape.play('shot');
    if (Math.hypot(dx, dy) < 32) {
      const impact = this.add.circle(target.x, target.y, 20, shots[0].color, 0.65).setDepth(8);
      this.tweens.add({ targets: impact, alpha: 0, scale: 1.5, duration: 140, onComplete: () => impact.destroy() });
      this.damageEnemy(target, shots.reduce((damage, shot) => damage + shot.damage, 0));
      return;
    }
    for (const shot of shots) {
      if (this.bullets.length >= 32) break;
      const view = this.add.circle(this.heroX + shot.vx / Math.hypot(shot.vx, shot.vy) * 20,
        this.heroY + shot.vy / Math.hypot(shot.vx, shot.vy) * 20, shot.radius, shot.color)
        .setStrokeStyle(2, 0xf3ffff).setDepth(8);
      this.bullets.push({ view, ...shot });
    }
  }

  private removeBullet(b: Bullet): void {
    b.view.destroy();
    const index = this.bullets.indexOf(b);
    if (index >= 0) this.bullets.splice(index, 1);
  }

  private removeEnemyBullet(b: Bullet): void {
    b.view.destroy();
    const index = this.enemyBullets.indexOf(b);
    if (index >= 0) this.enemyBullets.splice(index, 1);
  }

  private damageHero(): void {
    if (this.hurtTimer > 0 || this.dashTimer > 0 || this.state !== 'playing') return;
    this.hurtTimer = 1; this.heroHp--; this.damageTaken++;
    this.soundscape.play('hurt');
    this.cameras.main.shake(90, 0.005); this.refreshHud();
    if (this.heroHp <= 0) this.finish(false);
  }

  private dash(): void {
    if (this.state !== 'playing' || this.dashCooldown > 0) return;
    this.dashTimer = 0.18; this.dashCooldown = 1.8;
    this.soundscape.play('dash');
    const trail = this.add.circle(this.heroX, this.heroY, 20, 0x63cfff, 0.35).setDepth(7);
    this.tweens.add({ targets: trail, alpha: 0, scale: 2.2, duration: 220, onComplete: () => trail.destroy() });
  }

  private pulse(): void {
    if (this.state !== 'playing' || this.skillCooldown > 0) return;
    this.skillCooldown = 6;
    this.soundscape.play('pulse');
    const wave = this.add.circle(this.heroX, this.heroY, 15, 0x7e97fa, 0.09).setStrokeStyle(4, 0x9dceff).setDepth(7);
    this.tweens.add({ targets: wave, radius: 135, alpha: 0, duration: 320, onComplete: () => wave.destroy() });
    for (const enemy of [...this.enemies]) {
      if (Math.hypot(enemy.x - this.heroX, enemy.y - this.heroY) > 135) continue;
      this.damageEnemy(enemy, 2);
    }
    this.refreshHud();
  }

  private buyHeal(): void {
    if (this.state !== 'playing' || !this.cleared.has(this.currentRoom) || this.heroHp >= 5 || this.coins < 3) return;
    this.coins -= 3; this.heroHp++; this.refreshHud();
  }

  private openChest(): void {
    if (this.state !== 'playing' || !this.cleared.has(this.currentRoom) || this.rooms[this.currentRoom].kind !== 'reward'
      || this.openedChests.has(this.currentRoom)) return;
    this.state = 'chest';
    this.soundscape.play('chest');
    this.clearOverlay();
    const shade = this.add.rectangle(480, 270, W, H, 0x06111c, 0.87).setDepth(40);
    const card = this.add.graphics().setDepth(41);
    card.fillStyle(0x122836, 0.98); card.fillRoundedRect(180, 112, 600, 330, 18);
    card.lineStyle(3, 0xd5b878); card.strokeRoundedRect(180, 112, 600, 330, 18);
    card.lineStyle(2, 0x7dc9bf); card.lineBetween(236, 156, 724, 156);
    card.lineBetween(236, 330, 724, 330);
    card.fillStyle(0xe8ca82); card.fillCircle(207, 138, 5); card.fillCircle(753, 138, 5);
    const rewardIds = this.rooms.filter(room => room.kind === 'reward').map(room => room.id);
    const found = chestWeapon(this.seed, this.currentRoom, rewardIds);
    const heading = this.add.text(480, 196, 'BAÚ ABERTO!', { fontFamily: 'Trebuchet MS, system-ui', fontSize: '32px', color: '#ffe1a0', fontStyle: 'bold' }).setOrigin(0.5).setDepth(42);
    const detail = this.add.text(480, 245, `${WEAPONS[found].name}\n${WEAPONS[found].description} · ${WEAPONS[found].energy} energia por tiro`,
      { fontFamily: 'Trebuchet MS, system-ui', fontSize: '19px', color: '#e4f3e8', align: 'center', lineSpacing: 10 }).setOrigin(0.5).setDepth(42);
    const equip = this.add.rectangle(365, 377, 205, 60, 0x58bfbd).setStrokeStyle(2, 0xb6f4e1).setInteractive({ useHandCursor: true }).setDepth(42);
    const equipLabel = this.add.text(365, 377, 'EQUIPAR', { fontFamily: 'Trebuchet MS, system-ui', fontSize: '18px', color: '#0b2632', fontStyle: 'bold' }).setOrigin(0.5).setDepth(43);
    const keep = this.add.rectangle(595, 377, 205, 60, 0x2b4650).setStrokeStyle(2, 0x8ebbb6).setInteractive({ useHandCursor: true }).setDepth(42);
    const keepLabel = this.add.text(595, 377, 'MANTER ATUAL', { fontFamily: 'Trebuchet MS, system-ui', fontSize: '16px', color: '#e3f1e9', fontStyle: 'bold' }).setOrigin(0.5).setDepth(43);
    equip.on('pointerdown', () => this.closeChest(found));
    keep.on('pointerdown', () => this.closeChest());
    this.overlay = [shade, card, heading, detail, equip, equipLabel, keep, keepLabel];
  }

  private closeChest(equip?: WeaponId): void {
    if (this.state !== 'chest') return;
    if (equip) this.weapon = equip;
    this.openedChests.add(this.currentRoom);
    this.clearOverlay(); this.state = 'playing'; this.drawRoom(); this.refreshHud();
  }

  private refreshHud(): void {
    this.hud.setX(this.touchMode ? 78 : 35);
    this.hud.setText(`❤ ${'♥'.repeat(this.heroHp)}${'♡'.repeat(5 - this.heroHp)}   Salas ${this.cleared.size}/6\n${WEAPONS[this.weapon].name}   ◈ ${this.coins} moedas`);
    this.healButton.setVisible(this.state === 'playing' && this.cleared.has(this.currentRoom));
    this.healLabel.setVisible(this.healButton.visible);
    this.healButton.setAlpha(this.coins >= 3 && this.heroHp < 5 ? 1 : 0.4);
    this.healLabel.setAlpha(this.healButton.alpha);
    this.hint.setText(this.touchMode ? 'Mover à esquerda · segurar ATIRAR mira sozinho · abra baús para novas armas' : 'WASD: mover · segure clique: tiro automático · ESPAÇO: dash · E: pulso · H: cura · ESC: pausa');
    this.drawEnergy();
    this.drawMap();
  }

  private drawEnergy(): void {
    const ready = this.energy >= WEAPONS[this.weapon].energy;
    this.energyText.setText(`ENERGIA ${Math.floor(this.energy)}/${MAX_ENERGY} · ${WEAPONS[this.weapon].energy}/tiro`);
    this.energyBar.clear();
    this.energyBar.fillStyle(0x213c54); this.energyBar.fillRoundedRect(345, 47, 185, 11, 4);
    this.energyBar.fillStyle(ready ? 0x61cde9 : 0xff8c91);
    this.energyBar.fillRoundedRect(347, 49, 181 * this.energy / MAX_ENERGY, 7, 3);
    this.fireBase.setAlpha(ready ? 1 : 0.4);
    this.fireLabel.setAlpha(ready ? 1 : 0.5);
  }

  private drawMap(): void {
    this.mapGraphics.clear();
    for (const room of this.rooms) {
      if (!this.visited.has(room.id)) continue;
      const x = 765 + room.x * 34, y = 19 + room.y * 24;
      this.mapGraphics.lineStyle(2, 0x9cc8df, 0.75);
      if (room.neighbors.east !== undefined && this.visited.has(room.neighbors.east)) this.mapGraphics.lineBetween(x + 8, y + 6, x + 34, y + 6);
      if (room.neighbors.south !== undefined && this.visited.has(room.neighbors.south)) this.mapGraphics.lineBetween(x + 8, y + 6, x + 8, y + 30);
      this.mapGraphics.fillStyle(room.id === this.currentRoom ? 0x65e5ff : room.kind === 'boss' ? 0xff7896
        : room.biome === 'forge' ? 0xf3ba78 : this.cleared.has(room.id) ? 0x79d9b4 : 0xa6c9cf);
      this.mapGraphics.fillRoundedRect(x, y, 16, 13, 3);
    }
  }

  private finish(won: boolean): void {
    this.state = won ? 'cleared' : 'dead';
    this.soundscape.play(won ? 'win' : 'lose');
    this.mouseDown = false; this.firePointer = null; this.movePointer = null;
    this.joyX = 0; this.joyY = 0; this.joyKnob.setPosition(153, 399);
    this.showOverlay(won ? 'GUARDIÃO DERROTADO!' : 'FIM DA TENTATIVA',
      `${won ? 'Você concluiu a run.' : 'Os guardiões venceram desta vez.'}\nSalas: ${this.cleared.size}/6 · Tempo: ${Math.floor(this.elapsed)}s · Dano: ${this.damageTaken}\nMoedas: ${this.coins} · Seed: ${this.seed}`,
      'JOGAR DE NOVO', () => this.startRun());
  }

  private togglePause(): void {
    if (this.state === 'playing') {
      this.heldCodes.clear(); this.pressedCodes.clear();
      this.state = 'paused'; this.mouseDown = false; this.firePointer = null;
      this.movePointer = null; this.joyX = 0; this.joyY = 0; this.joyKnob.setPosition(153, 399);
      this.showOverlay('PAUSA', 'Respira, MVP. A sala espera.', 'CONTINUAR', () => { this.clearOverlay(); this.state = 'playing'; });
    } else if (this.state === 'paused') { this.clearOverlay(); this.state = 'playing'; }
  }

  private pauseOnBlur(): void { if (this.state === 'playing') this.togglePause(); }

  private onNativeKeyDown = (event: KeyboardEvent): void => {
    if (!event.repeat) this.pressedCodes.add(event.code);
    this.heldCodes.add(event.code);
  };

  private onNativeKeyUp = (event: KeyboardEvent): void => { this.heldCodes.delete(event.code); };

  private consumeKey(code: string): boolean {
    const wasPressed = this.pressedCodes.has(code);
    this.pressedCodes.delete(code);
    return wasPressed;
  }

  private pauseOnPortrait(): void {
    if (this.touchMode && matchMedia('(orientation: portrait)').matches && this.state === 'playing') this.togglePause();
  }

  private showOverlay(title: string, subtitle: string, button: string, action: () => void): void {
    this.clearOverlay();
    const shade = this.add.rectangle(480, 270, W, H, 0x06111c, 0.82).setDepth(40);
    const card = this.add.graphics().setDepth(41);
    card.fillStyle(0x122836, 0.96); card.fillRoundedRect(191, 115, 578, 322, 18);
    card.lineStyle(3, 0x77c9c6); card.strokeRoundedRect(191, 115, 578, 322, 18);
    card.lineStyle(2, 0xc5ad75, 0.8); card.lineBetween(240, 156, 720, 156);
    card.lineBetween(240, 350, 720, 350);
    for (const x of [216, 744]) {
      card.fillStyle(0xdec58b); card.fillCircle(x, 140, 4); card.fillCircle(x, 412, 4);
    }
    const heading = this.add.text(480, 216, title, { fontFamily: 'Trebuchet MS, system-ui', fontSize: '42px', color: '#f2f3de', fontStyle: 'bold' }).setOrigin(0.5).setDepth(42);
    const detail = this.add.text(480, 284, subtitle, { fontFamily: 'Trebuchet MS, system-ui', fontSize: '18px', color: '#b7d8d5', align: 'center', lineSpacing: 10 }).setOrigin(0.5).setDepth(42);
    const plate = this.add.rectangle(480, 391, 272, 58, 0x58bfbd).setStrokeStyle(2, 0xb6f4e1).setInteractive({ useHandCursor: true }).setDepth(42);
    const label = this.add.text(480, 391, button, { fontFamily: 'Trebuchet MS, system-ui', fontSize: '19px', color: '#0b2632', fontStyle: 'bold' }).setOrigin(0.5).setDepth(43);
    plate.on('pointerdown', action);
    this.overlay = [shade, card, heading, detail, plate, label];
  }

  private clearOverlay(): void { this.overlay.forEach(item => item.destroy()); this.overlay = []; }

  private toggleSound(): void {
    this.soundscape.setMuted(!this.soundscape.muted);
    this.soundLabel.setText(this.soundscape.muted ? 'SOM ○' : 'SOM ●');
    this.soundLabel.setColor(this.soundscape.muted ? '#8b9cac' : '#9fe8d1');
    if (!this.soundscape.muted) this.soundscape.play('coin');
  }

  private setTouchVisibility(): void {
    for (const obj of [this.joyBase, this.joyKnob, this.fireBase, this.fireLabel, this.dashButton, this.dashLabel, this.skillButton, this.skillLabel]) obj.setVisible(this.touchMode);
  }

  private onDown(pointer: Phaser.Input.Pointer): void {
    if (this.state === 'playing' && pointer.x > 870 && pointer.y < 48) { this.togglePause(); return; }
    if (pointer.y < 90 && pointer.x > 850) return;
    if (pointer.y < 70) return;
    if (this.state !== 'playing') return;
    if (this.rooms[this.currentRoom].kind === 'reward' && this.cleared.has(this.currentRoom)
      && !this.openedChests.has(this.currentRoom) && Math.abs(pointer.x - 480) < 52 && Math.abs(pointer.y - 270) < 45) {
      this.openChest(); return;
    }
    const isTouch = pointer.wasTouch || (pointer.event as PointerEvent).pointerType === 'touch';
    if (isTouch) {
      this.touchMode = true; this.setTouchVisibility(); this.refreshHud();
      if (pointer.x < 355 && pointer.y > 265 && this.movePointer === null) { this.movePointer = pointer.id; this.updateJoystick(pointer); }
      else if (Math.hypot(pointer.x - 696, pointer.y - 437) < 40) this.dash();
      else if (Math.hypot(pointer.x - 870, pointer.y - 281) < 43) this.pulse();
      else if (pointer.x > 585 && pointer.y > 250 && this.firePointer === null) this.firePointer = pointer.id;
    } else this.mouseDown = true;
  }

  private onUp(pointer: Phaser.Input.Pointer): void {
    if (pointer.id === this.movePointer) { this.movePointer = null; this.joyX = 0; this.joyY = 0; this.joyKnob.setPosition(153, 399); }
    if (pointer.id === this.firePointer) this.firePointer = null;
    if (!pointer.wasTouch && (pointer.event as PointerEvent).pointerType !== 'touch') this.mouseDown = false;
  }

  private onMove(pointer: Phaser.Input.Pointer): void {
    if (pointer.id === this.movePointer) this.updateJoystick(pointer);
  }

  private updateJoystick(pointer: Phaser.Input.Pointer): void {
    const dx = pointer.x - 153, dy = pointer.y - 399;
    const magnitude = Math.max(1, Math.hypot(dx, dy));
    const reach = Math.min(magnitude, 48);
    this.joyX = dx / magnitude * reach / 48;
    this.joyY = dy / magnitude * reach / 48;
    this.joyKnob.setPosition(153 + this.joyX * 48, 399 + this.joyY * 48);
  }

}
