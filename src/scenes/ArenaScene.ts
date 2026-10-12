import Phaser from 'phaser';
import { Soundscape } from '../audio/Soundscape';
import { BIOMES } from '../content/biomes';
import { encounterFor, SPAWNS, type EnemyKind } from '../content/encounters';
import { blocked, moveAroundObstacle, normalizedMovement, OBSTACLES, type EscapeStep } from '../core/arena';
import { generateRun, parseRunSeed, type Direction, type Room } from '../core/run';
import { createShots, ENERGY_DELAY, MAX_ENERGY, restoreEnergy, spendEnergy, WEAPONS, type WeaponId } from '../core/weapons';
import { closestTarget } from '../core/targeting';
import { altarChoices, affinityDamageBonus, ELEMENT, ELEMENTS, emptyAffinities, gainAffinity, hasPureMastery, primaryElement, totalAffinity,
  type Affinities, type ElementId } from '../core/affinities';
import openingArt from '../assets/abertura.webp';
import selectionArt from '../assets/selecao.webp';
import roomArt from '../assets/sala-atrio.webp';
import forgeArt from '../assets/sala-forja.webp';
import jaoArt from '../assets/jao.png';
import aliceArt from '../assets/alice.png';
import guiArt from '../assets/gui.png';
import jaoBack from '../assets/jao-back.png';
import aliceBack from '../assets/alice-back.png';
import guiBack from '../assets/gui-back.png';
import jaoWalk1 from '../assets/jao-walk1.png';
import aliceWalk1 from '../assets/alice-walk1.png';
import guiWalk1 from '../assets/gui-walk1.png';
import jaoWalk2 from '../assets/jao-walk2.png';
import aliceWalk2 from '../assets/alice-walk2.png';
import guiWalk2 from '../assets/gui-walk2.png';
import chaserArt from '../assets/enemy-chaser.png';
import shooterArt from '../assets/enemy-shooter.png';
import sentryArt from '../assets/enemy-sentry.png';
import bruteArt from '../assets/enemy-brute.png';
import bossArt from '../assets/enemy-boss.png';

type State = 'menu' | 'selecting' | 'playing' | 'altar' | 'paused' | 'dead' | 'cleared';
type HeroId = 'jao' | 'alice' | 'gui';
const HEROES: { id: HeroId; name: string; description: string }[] = [
  { id: 'jao', name: 'JÃO', description: 'O explorador de jaqueta vinho' },
  { id: 'alice', name: 'ALICE', description: 'Coragem e olhar atento' },
  { id: 'gui', name: 'GUI', description: 'O guardião de cabelos longos' },
];
type Enemy = { view: Phaser.GameObjects.Container; kind: EnemyKind; x: number; y: number; hp: number; maxHp: number; speed: number; cooldown: number; windup: number; escape?: EscapeStep };
type Bullet = { view: Phaser.GameObjects.Arc; vx: number; vy: number; life: number; damage: number };
type Coin = { view: Phaser.GameObjects.Arc; x: number; y: number };

const W = 960;
const H = 540;

export class ArenaScene extends Phaser.Scene {
  private state: State = 'menu';
  private selectedHero: HeroId = 'jao';
  private hero!: Phaser.GameObjects.Container;
  private heroSprite!: Phaser.GameObjects.Image;
  private facing: 'north' | 'south' | 'east' | 'west' = 'south';
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
  private claimedAltars = new Set<number>();
  private affinities: Affinities = emptyAffinities();
  private attackCount = 0;
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
  private affinityHud: Phaser.GameObjects.Text[] = [];
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

  preload(): void {
    this.load.image('opening', openingArt);
    this.load.image('selection', selectionArt);
    this.load.image('room-atrium', roomArt);
    this.load.image('room-forge', forgeArt);
    this.load.image('jao', jaoArt);
    this.load.image('alice', aliceArt);
    this.load.image('gui', guiArt);
    for (const [key, url] of Object.entries({
      'jao-back': jaoBack, 'alice-back': aliceBack, 'gui-back': guiBack,
      'jao-walk1': jaoWalk1, 'alice-walk1': aliceWalk1, 'gui-walk1': guiWalk1,
      'jao-walk2': jaoWalk2, 'alice-walk2': aliceWalk2, 'gui-walk2': guiWalk2,
      'enemy-chaser': chaserArt, 'enemy-shooter': shooterArt, 'enemy-sentry': sentryArt,
      'enemy-brute': bruteArt, 'enemy-boss': bossArt,
    })) this.load.image(key, url);
  }

  create(): void {
    this.touchMode = navigator.maxTouchPoints > 0 || matchMedia('(pointer: coarse)').matches;
    this.drawRoom();
    this.createHero();
    const panels = this.add.graphics().setDepth(19);
    panels.fillStyle(0x241813, 0.93); panels.fillRect(16, 8, 322, 89);
    panels.fillRect(342, 8, 209, 60);
    panels.fillRect(731, 8, 217, 82);
    panels.lineStyle(3, 0xa47642, 1);
    panels.strokeRect(16, 8, 322, 89);
    panels.strokeRect(342, 8, 209, 60);
    panels.strokeRect(731, 8, 217, 82);
    this.hud = this.add.text(35, 19, '', { fontFamily: 'Georgia, serif', fontSize: '17px', color: '#ffe5ae', fontStyle: 'bold' }).setDepth(20);
    this.affinityHud = ELEMENTS.map((id, index) => this.add.text(27 + index * 44, 72, `${ELEMENT[id].glyph}0`,
      { fontFamily: 'Georgia, serif', fontSize: '17px', color: '#80715f', fontStyle: 'bold' }).setDepth(20));
    this.energyText = this.add.text(352, 16, '', { fontFamily: 'Georgia, serif', fontSize: '14px', color: '#cddded', fontStyle: 'bold' }).setDepth(20);
    this.energyBar = this.add.graphics().setDepth(20);
    if (new URLSearchParams(location.search).has('debug')) {
      this.debugFps = this.add.text(740, 77, '', { fontFamily: 'monospace', fontSize: '11px', color: '#93d8c7' }).setDepth(25);
    }
    this.mapGraphics = this.add.graphics().setDepth(20);
    this.bossWarning = this.add.graphics().setDepth(8);
    this.bossBar = this.add.graphics().setDepth(20);
    this.healButton = this.add.rectangle(647, 39, 105, 30, 0x6b4a30).setStrokeStyle(2, 0xc69b5c).setDepth(20).setInteractive({ useHandCursor: true });
    this.healLabel = this.add.text(647, 39, 'CURA ◈3', { fontFamily: 'Georgia, serif', fontSize: '14px', color: '#ffe0aa', fontStyle: 'bold' }).setOrigin(0.5).setDepth(21);
    this.healButton.on('pointerdown', () => this.buyHeal());
    this.hint = this.add.text(480, 516, '', { fontFamily: 'Georgia, serif', fontSize: '12px', color: '#ffe3aa', backgroundColor: '#241813' }).setOrigin(0.5).setDepth(20);
    this.add.text(900, 27, 'Ⅱ', { fontFamily: 'system-ui', fontSize: '26px', color: '#dbeaff' }).setOrigin(0.5).setDepth(20);
    const soundButton = this.add.rectangle(895, 67, 82, 31, 0x50341f).setStrokeStyle(1, 0xb5854e)
      .setDepth(23).setInteractive({ useHandCursor: true });
    this.soundLabel = this.add.text(895, 67, 'SOM ●', { fontFamily: 'Georgia, serif', fontSize: '13px', color: '#ffe0a0', fontStyle: 'bold' })
      .setOrigin(0.5).setDepth(24);
    soundButton.on('pointerdown', () => this.toggleSound());

    this.joyBase = this.add.circle(153, 399, 61, 0x503b29, 0.45).setStrokeStyle(3, 0xd3aa67, 0.75).setDepth(20);
    this.joyKnob = this.add.circle(153, 399, 25, 0xc69454, 0.7).setDepth(21);
    this.fireBase = this.add.circle(810, 399, 60, 0x8a3d29, 0.7).setStrokeStyle(3, 0xe8b267, 0.95).setDepth(20);
    this.fireLabel = this.add.text(810, 399, 'ATIRAR', { fontFamily: 'system-ui', fontSize: '15px', color: '#fff5ed', fontStyle: 'bold' }).setOrigin(0.5).setDepth(21);
    this.dashButton = this.add.circle(696, 437, 34, 0x4e5c64, 0.7).setStrokeStyle(2, 0xb6c7c6, 0.8).setDepth(20);
    this.dashLabel = this.add.text(696, 437, 'DASH', { fontFamily: 'system-ui', fontSize: '12px', color: '#e9faff', fontStyle: 'bold' }).setOrigin(0.5).setDepth(21);
    this.skillButton = this.add.circle(870, 281, 35, 0x75533f, 0.75).setStrokeStyle(2, 0xf6ca8c, 0.8).setDepth(20);
    this.skillLabel = this.add.text(870, 281, 'CORTE', { fontFamily: 'system-ui', fontSize: '11px', color: '#fbeaff', fontStyle: 'bold' }).setOrigin(0.5).setDepth(21);
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
    this.showMainMenu();
    this.refreshHud();
  }

  private drawRoom(): void {
    this.roomArt.forEach(item => item.destroy());
    const room = this.rooms[this.currentRoom];
    const palette = BIOMES[room?.biome ?? 'atrium'];
    const backdrop = this.add.image(480, 270, room?.biome === 'forge' ? 'room-forge' : 'room-atrium')
      .setDisplaySize(W, H).setDepth(-2);
    const g = this.add.graphics();
    for (const o of room?.obstacles ?? OBSTACLES) {
      g.fillStyle(0x130b0b, 0.7); g.fillRect(o.x + 6, o.y + 9, o.w, o.h);
      g.fillStyle(palette.pillarEdge); g.fillRect(o.x, o.y, o.w, o.h);
      g.fillStyle(palette.pillar); g.fillRect(o.x + 4, o.y + 4, o.w - 8, o.h - 8);
      g.fillStyle(palette.pillarTop); g.fillRect(o.x + 7, o.y + 6, o.w - 14, o.h - 15);
      g.lineStyle(2, 0x241816); g.strokeRect(o.x + 7, o.y + 6, o.w - 14, o.h - 15);
      g.fillStyle(0xc58d48); g.fillRect(o.x + o.w / 2 - 3, o.y + o.h / 2 - 3, 6, 6);
    }
    if (room) {
      const open = this.cleared.has(room.id);
      g.fillStyle(open ? 0xe3ad5a : 0x743e34);
      for (const direction of Object.keys(room.neighbors) as Direction[]) {
        if (direction === 'north') { g.fillRect(436, 81, 88, 12); g.fillStyle(0xd9f0cf); g.fillTriangle(480, 87, 470, 97, 490, 97); }
        if (direction === 'south') { g.fillRect(436, 473, 88, 12); g.fillStyle(0xd9f0cf); g.fillTriangle(480, 480, 470, 467, 490, 467); }
        if (direction === 'west') { g.fillRect(52, 251, 13, 68); g.fillStyle(0xd9f0cf); g.fillTriangle(57, 285, 70, 274, 70, 296); }
        if (direction === 'east') { g.fillRect(895, 251, 13, 68); g.fillStyle(0xd9f0cf); g.fillTriangle(902, 285, 890, 274, 890, 296); }
        g.fillStyle(open ? 0xe3ad5a : 0x743e34);
      }
    }
    const roomName = room?.kind === 'boss' ? 'GUARDIÃO FINAL' : 'COMBATE';
    const title = this.add.text(480, 110, room ? `${palette.name} · SALA ${String(room.id + 1).padStart(2, '0')} · ${this.cleared.has(room.id) ? 'PORTAS ABERTAS' : roomName}` : 'ÁTRIO · SALA 01',
      { fontFamily: 'Georgia, serif', fontSize: '14px', color: '#ffe0a2', letterSpacing: 2, backgroundColor: '#281814' }).setOrigin(0.5).setDepth(3);
    this.roomArt = [backdrop, g, title];
    if (room && room.kind !== 'boss' && this.cleared.has(room.id) && !this.claimedAltars.has(room.id)) {
      const altar = this.add.graphics().setDepth(6);
      altar.fillStyle(0x201713); altar.fillRect(439, 261, 82, 37);
      altar.fillStyle(0x725339); altar.fillRect(445, 254, 70, 37);
      altar.lineStyle(3, 0xe0ad69); altar.strokeRect(445, 254, 70, 37);
      altar.fillStyle(0xf7d188); altar.fillCircle(480, 269, 17);
      altar.fillStyle(0x452c30); altar.fillCircle(480, 269, 11);
      altar.fillStyle(0xf7d188); altar.fillTriangle(480, 259, 472, 275, 488, 275);
      const prompt = this.add.text(480, 314, 'TOQUE NO ALTAR', { fontFamily: 'Georgia, serif', fontSize: '14px', color: '#ffe2a0', fontStyle: 'bold', backgroundColor: '#281814' }).setOrigin(0.5).setDepth(6);
      this.roomArt.push(altar, prompt);
    }
  }

  private createHero(): void {
    this.hero = this.add.container(this.heroX, this.heroY).setDepth(10);
    this.setHeroArt();
  }

  private setHeroArt(): void {
    this.hero.removeAll(true);
    const shadow = this.add.ellipse(0, 15, 40, 10, 0x100c0b, 0.7);
    this.heroSprite = this.add.image(0, -19, this.selectedHero).setDisplaySize(this.selectedHero === 'gui' ? 43 : 39, 67);
    this.facing = 'south';
    this.hero.add([shadow, this.heroSprite]);
    this.skillLabel?.setText(this.selectedHero === 'jao' ? 'CORTE' : this.selectedHero === 'alice' ? 'FOCO' : 'IMPACTO');
  }

  private animateHero(mx: number, my: number): void {
    const moving = Math.hypot(mx, my) > 0.15;
    if (moving) this.facing = Math.abs(mx) > Math.abs(my) ? mx > 0 ? 'east' : 'west' : my < 0 ? 'north' : 'south';
    const key = !moving || this.facing === 'south' ? this.selectedHero
      : this.facing === 'north' ? `${this.selectedHero}-back`
      : `${this.selectedHero}-walk${Math.floor(this.elapsed * 8) % 2 + 1}`;
    if (this.heroSprite.texture.key !== key) {
      this.heroSprite.setTexture(key);
      const frame = this.textures.get(key).get();
      this.heroSprite.setDisplaySize(frame.width / frame.height * 67, 67);
    }
    this.heroSprite.setFlipX(this.facing === 'west');
    this.heroSprite.y = -19 + (moving ? Math.sin(this.elapsed * 16) * 2 : 0);
    this.heroSprite.angle = moving ? Math.sin(this.elapsed * 8) * 1.5 : 0;
  }

  private createEnemy(x: number, y: number, kind: EnemyKind): Enemy {
    const height = kind === 'boss' ? 92 : kind === 'brute' ? 69 : kind === 'sentry' ? 60 : kind === 'shooter' ? 52 : 49;
    const shadow = this.add.ellipse(0, kind === 'boss' ? 32 : 18, kind === 'boss' ? 70 : 42, 10, 0x100b09, 0.65);
    const sprite = this.add.image(0, kind === 'boss' ? -18 : -9, `enemy-${kind}`);
    sprite.setDisplaySize(sprite.width / sprite.height * height, height);
    const view = this.add.container(x, y, [shadow, sprite]).setDepth(9);
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
    this.setHeroArt();
    this.seed = parseRunSeed(new URLSearchParams(location.search).get('seed')) ?? Math.floor(Math.random() * 0x100000000);
    this.rooms = generateRun(this.seed);
    this.currentRoom = 0;
    this.cleared = new Set();
    this.visited = new Set([0]);
    this.storedCoins.clear(); this.coins = 0;
    this.weapon = this.selectedHero === 'jao' ? 'bolt' : this.selectedHero === 'alice' ? 'fan' : 'lance';
    this.affinities = emptyAffinities(); this.attackCount = 0; this.claimedAltars.clear(); this.damageTaken = 0;
    this.groundCoins.forEach(coin => coin.view.destroy()); this.groundCoins = [];
    this.heroHp = 5; this.hurtTimer = 0; this.fireTimer = 0; this.energy = MAX_ENERGY; this.energyCooldown = 0; this.elapsed = 0;
    this.dashTimer = 0; this.dashCooldown = 0; this.skillCooldown = 0;
    this.heroX = 480; this.heroY = 385; this.hero.setPosition(this.heroX, this.heroY);
    this.enterRoom(0);
    this.cameras.main.flash(300, 30, 15, 6);
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
    if (entry) this.cameras.main.flash(180, 35, 21, 9);
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
    this.animateHero(mx, my);
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
      const sprite = enemy.view.list[1] as Phaser.GameObjects.Image;
      if (enemy.speed > 0) sprite.setFlipX(dx < 0);
      sprite.y = (enemy.kind === 'boss' ? -18 : -9) + (enemy.speed > 0 ? Math.sin(this.elapsed * 7 + enemy.x) * 1.5 : 0);
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
    // Toda sala não chefe revela um altar após o combate. Ele permanece até a escolha.
  }

  private fire(): void {
    if (this.fireTimer > 0 || this.bullets.length >= 32) return;
    const target = closestTarget({ x: this.heroX, y: this.heroY }, this.enemies, this.rooms[this.currentRoom].obstacles);
    if (!target) return;
    const remaining = spendEnergy(this.energy, this.weapon);
    if (remaining === null) { this.drawEnergy(); return; }
    const dx = target.x - this.heroX, dy = target.y - this.heroY;
    const shots = createShots(this.weapon, dx, dy, affinityDamageBonus(this.affinities));
    const weave = ELEMENTS.flatMap(id => Array<ElementId>(this.affinities[id]).fill(id));
    const infused = weave.length ? weave[this.attackCount++ % weave.length] : null;
    if (infused) for (const shot of shots) shot.color = ELEMENT[infused].color;
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
    const bonus = affinityDamageBonus(this.affinities);
    const infusion = primaryElement(this.affinities);
    if (this.selectedHero === 'jao') {
      const target = closestTarget({ x: this.heroX, y: this.heroY }, this.enemies, this.rooms[this.currentRoom].obstacles);
      if (!target) return;
      this.skillCooldown = 6; this.soundscape.play('pulse');
      const oldX = this.heroX, oldY = this.heroY;
      const dx = target.x - oldX, dy = target.y - oldY, length = Math.max(1, Math.hypot(dx, dy));
      const mastered = hasPureMastery(this.affinities, 'lightning');
      const slash = this.add.graphics().setDepth(12);
      slash.lineStyle(mastered ? 8 : 5, mastered ? ELEMENT.lightning.color : infusion ? ELEMENT[infusion].color : 0xffd4a0, 0.9);
      slash.lineBetween(oldX, oldY, mastered ? target.x + dx / length * 43 : target.x, mastered ? target.y + dy / length * 43 : target.y);
      this.tweens.add({ targets: slash, alpha: 0, duration: 260, onComplete: () => slash.destroy() });
      if (mastered) {
        const behindX = target.x + dx / length * 43, behindY = target.y + dy / length * 43;
        if (!blocked(behindX, behindY, 15, this.rooms[this.currentRoom].obstacles)) {
          this.heroX = behindX; this.heroY = behindY; this.hero.setPosition(behindX, behindY);
          this.dashTimer = 0.22;
        }
      }
      this.damageEnemy(target, (mastered ? 5 : 2) + bonus);
      this.refreshHud();
      return;
    }
    this.skillCooldown = 6;
    this.soundscape.play('pulse');
    const color = infusion ? ELEMENT[infusion].color : this.selectedHero === 'alice' ? 0xd9c191 : 0xc5a17b;
    const radius = this.selectedHero === 'alice' ? 170 : 135;
    const wave = this.add.circle(this.heroX, this.heroY, 15, color, 0.09).setStrokeStyle(4, color).setDepth(7);
    this.tweens.add({ targets: wave, radius, alpha: 0, duration: 320, onComplete: () => wave.destroy() });
    for (const enemy of [...this.enemies]) {
      if (Math.hypot(enemy.x - this.heroX, enemy.y - this.heroY) > radius) continue;
      this.damageEnemy(enemy, (this.selectedHero === 'alice' ? 1 : 2) + bonus);
    }
    this.refreshHud();
  }

  private buyHeal(): void {
    if (this.state !== 'playing' || !this.cleared.has(this.currentRoom) || this.heroHp >= 5 || this.coins < 3) return;
    this.coins -= 3; this.heroHp++; this.refreshHud();
  }

  private openAltar(): void {
    if (this.state !== 'playing' || !this.cleared.has(this.currentRoom) || this.rooms[this.currentRoom].kind === 'boss'
      || this.claimedAltars.has(this.currentRoom)) return;
    this.state = 'altar';
    this.soundscape.play('chest');
    this.clearOverlay();
    const shade = this.add.rectangle(480, 270, W, H, 0x1a110d, 0.9).setDepth(40);
    const card = this.add.graphics().setDepth(41);
    card.fillStyle(0x342119, 0.98); card.fillRect(143, 81, 674, 385);
    card.lineStyle(5, 0xd5a35d); card.strokeRect(143, 81, 674, 385);
    card.lineStyle(2, 0xc49b64); card.lineBetween(200, 147, 760, 147);
    const heading = this.add.text(480, 119, 'ALTAR DAS AFINIDADES', { fontFamily: 'Georgia, serif', fontSize: '30px', color: '#ffe1a0', fontStyle: 'bold' }).setOrigin(0.5).setDepth(42);
    const detail = this.add.text(480, 184, `Escolha um elemento · ${totalAffinity(this.affinities)}/5 fragmentos nesta run`,
      { fontFamily: 'Georgia, serif', fontSize: '17px', color: '#f4ddb7' }).setOrigin(0.5).setDepth(42);
    this.overlay = [shade, card, heading, detail];
    for (const [index, element] of altarChoices(this.seed, this.currentRoom, this.affinities).entries()) {
      const x = 279 + index * 201;
      const plate = this.add.rectangle(x, 304, 177, 187, 0x4b3125).setStrokeStyle(3, ELEMENT[element].color)
        .setDepth(42).setInteractive({ useHandCursor: true });
      const glyph = this.add.text(x, 259, ELEMENT[element].glyph, { fontFamily: 'Georgia, serif', fontSize: '50px', color: ELEMENT[element].css }).setOrigin(0.5).setDepth(43);
      const name = this.add.text(x, 312, ELEMENT[element].name, { fontFamily: 'Georgia, serif', fontSize: '18px', color: '#fff0c9', fontStyle: 'bold' }).setOrigin(0.5).setDepth(43);
      const level = this.add.text(x, 351, `${this.affinities[element]} → ${this.affinities[element] + 1}`, { fontFamily: 'Georgia, serif', fontSize: '19px', color: ELEMENT[element].css }).setOrigin(0.5).setDepth(43);
      plate.on('pointerdown', () => this.chooseAffinity(element));
      this.overlay.push(plate, glyph, name, level);
    }
    const hint = this.add.text(480, 428, 'Cada escolha fortalece o ataque. Domínio puro exige 5 no mesmo elemento.',
      { fontFamily: 'Georgia, serif', fontSize: '15px', color: '#ddc396' }).setOrigin(0.5).setDepth(43);
    this.overlay.push(hint);
  }

  private chooseAffinity(element: ElementId): void {
    if (this.state !== 'altar') return;
    this.affinities = gainAffinity(this.affinities, element);
    this.claimedAltars.add(this.currentRoom);
    this.clearOverlay(); this.state = 'playing'; this.drawRoom(); this.refreshHud();
  }

  private refreshHud(): void {
    this.hud.setX(this.touchMode ? 78 : 35);
    this.hud.setText(`${this.selectedHero.toUpperCase()}  ${'♥'.repeat(this.heroHp)}${'♡'.repeat(5 - this.heroHp)}  ${this.cleared.size}/6\n${WEAPONS[this.weapon].name}   ◈ ${this.coins} moedas`);
    for (const [index, id] of ELEMENTS.entries()) {
      this.affinityHud[index].setText(`${ELEMENT[id].glyph}${this.affinities[id]}`);
      this.affinityHud[index].setColor(this.affinities[id] ? ELEMENT[id].css : '#8a7764');
    }
    this.skillLabel.setText(this.selectedHero === 'jao' ? 'CORTE' : this.selectedHero === 'alice' ? 'FOCO' : 'IMPACTO');
    this.healButton.setVisible(this.state === 'playing' && this.cleared.has(this.currentRoom));
    this.healLabel.setVisible(this.healButton.visible);
    this.healButton.setAlpha(this.coins >= 3 && this.heroHp < 5 ? 1 : 0.4);
    this.healLabel.setAlpha(this.healButton.alpha);
    this.hint.setText(this.touchMode ? 'Mover à esquerda · segurar ATIRAR mira sozinho · toque no altar após a luta' : 'WASD: mover · segure clique: tiro automático · ESPAÇO: dash · E: habilidade · H: cura · ESC: pausa');
    this.drawEnergy();
    this.drawMap();
  }

  private drawEnergy(): void {
    const ready = this.energy >= WEAPONS[this.weapon].energy;
    this.energyText.setText(`ENERGIA ${Math.floor(this.energy)}/${MAX_ENERGY} · ${WEAPONS[this.weapon].energy}/tiro`);
    this.energyBar.clear();
    this.energyBar.fillStyle(0x160f0d); this.energyBar.fillRect(351, 44, 188, 15);
    this.energyBar.fillStyle(ready ? 0x77b6d0 : 0xb15b49);
    this.energyBar.fillRect(354, 47, 182 * this.energy / MAX_ENERGY, 9);
    this.fireBase.setAlpha(ready ? 1 : 0.4);
    this.fireLabel.setAlpha(ready ? 1 : 0.5);
  }

  private drawMap(): void {
    this.mapGraphics.clear();
    for (const room of this.rooms) {
      if (!this.visited.has(room.id)) continue;
      const x = 765 + room.x * 34, y = 19 + room.y * 24;
      this.mapGraphics.lineStyle(2, 0xc49a5d, 0.75);
      if (room.neighbors.east !== undefined && this.visited.has(room.neighbors.east)) this.mapGraphics.lineBetween(x + 8, y + 6, x + 34, y + 6);
      if (room.neighbors.south !== undefined && this.visited.has(room.neighbors.south)) this.mapGraphics.lineBetween(x + 8, y + 6, x + 8, y + 30);
      this.mapGraphics.fillStyle(room.id === this.currentRoom ? 0xf0c76f : room.kind === 'boss' ? 0xb94b42
        : room.biome === 'forge' ? 0xd99a50 : this.cleared.has(room.id) ? 0x9caa70 : 0x81705c);
      this.mapGraphics.fillRect(x, y, 16, 13);
    }
  }

  private finish(won: boolean): void {
    this.state = won ? 'cleared' : 'dead';
    this.soundscape.play(won ? 'win' : 'lose');
    this.mouseDown = false; this.firePointer = null; this.movePointer = null;
    this.joyX = 0; this.joyY = 0; this.joyKnob.setPosition(153, 399);
    this.showOverlay(won ? 'GUARDIÃO DERROTADO!' : 'FIM DA TENTATIVA',
      `${won ? 'Você concluiu a run.' : 'Os guardiões venceram desta vez.'}\nSalas: ${this.cleared.size}/6 · Tempo: ${Math.floor(this.elapsed)}s · Dano: ${this.damageTaken}\nMoedas: ${this.coins} · Seed: ${this.seed}`,
      'ESCOLHER HERÓI', () => this.showSelection());
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

  private addWoodButton(x: number, y: number, width: number, label: string, action: () => void, depth = 44): Phaser.GameObjects.GameObject[] {
    const plate = this.add.rectangle(x, y, width, 49, 0x714321).setStrokeStyle(4, 0xe5b76a)
      .setDepth(depth).setInteractive({ useHandCursor: true });
    const text = this.add.text(x, y, label, { fontFamily: 'Georgia, serif', fontSize: '23px', color: '#fff0c2', fontStyle: 'bold' })
      .setOrigin(0.5).setDepth(depth + 1);
    plate.on('pointerdown', action);
    return [plate, text];
  }

  private showMainMenu(): void {
    this.state = 'menu'; this.clearOverlay();
    const background = this.add.image(480, 270, 'opening').setDisplaySize(W, H).setDepth(40);
    const dark = this.add.rectangle(480, 84, 440, 140, 0x160f13, 0.42).setDepth(41);
    const title = this.add.text(480, 72, 'JUNQ', { fontFamily: 'Georgia, serif', fontSize: '81px', color: '#f5d28c', fontStyle: 'bold', stroke: '#412415', strokeThickness: 11 })
      .setOrigin(0.5).setDepth(42);
    const subtitle = this.add.text(480, 127, 'A AVENTURA COMEÇA AQUI', { fontFamily: 'Georgia, serif', fontSize: '16px', color: '#ffe9bd', letterSpacing: 3 })
      .setOrigin(0.5).setDepth(42);
    this.overlay = [background, dark, title, subtitle, ...this.addWoodButton(480, 467, 236, 'JOGAR', () => this.showSelection())];
  }

  private showSelection(): void {
    this.state = 'selecting'; this.clearOverlay();
    const background = this.add.image(480, 270, 'selection').setDisplaySize(W, H).setDepth(40);
    const panel = this.add.graphics().setDepth(41);
    panel.fillStyle(0x241711, 0.91); panel.fillRect(18, 13, 924, 71);
    panel.lineStyle(3, 0xb4894b); panel.strokeRect(18, 13, 924, 71);
    const title = this.add.text(480, 47, 'ESCOLHA SEU HERÓI', { fontFamily: 'Georgia, serif', fontSize: '33px', color: '#ffe1a0', fontStyle: 'bold' }).setOrigin(0.5).setDepth(42);
    this.overlay = [background, panel, title];
    for (const [index, hero] of HEROES.entries()) {
      const x = 208 + index * 272;
      const chosen = this.selectedHero === hero.id;
      const frame = this.add.rectangle(x, 292, 227, 299, chosen ? 0x583620 : 0x281c17, 0.92)
        .setStrokeStyle(chosen ? 5 : 3, chosen ? 0xffd47d : 0x8f6946).setDepth(42).setInteractive({ useHandCursor: true });
      const sprite = this.add.image(x, 271, hero.id).setDisplaySize(hero.id === 'gui' ? 125 : 112, 189).setDepth(43);
      const name = this.add.text(x, 397, hero.name, { fontFamily: 'Georgia, serif', fontSize: '23px', color: '#ffdf9a', fontStyle: 'bold' }).setOrigin(0.5).setDepth(43);
      const description = this.add.text(x, 427, hero.description, { fontFamily: 'Georgia, serif', fontSize: '12px', color: '#f1d2a1' }).setOrigin(0.5).setDepth(43);
      frame.on('pointerdown', () => { this.selectedHero = hero.id; this.showSelection(); });
      sprite.setInteractive({ useHandCursor: true }).on('pointerdown', () => { this.selectedHero = hero.id; this.showSelection(); });
      this.overlay.push(frame, sprite, name, description);
    }
    this.overlay.push(...this.addWoodButton(355, 492, 213, 'VOLTAR', () => this.showMainMenu()));
    this.overlay.push(...this.addWoodButton(605, 492, 213, 'ENTRAR', () => this.startRun()));
  }

  private showOverlay(title: string, subtitle: string, button: string, action: () => void): void {
    this.clearOverlay();
    const shade = this.add.rectangle(480, 270, W, H, 0x160e0b, 0.77).setDepth(40);
    const card = this.add.graphics().setDepth(41);
    card.fillStyle(0x332119, 0.97); card.fillRect(191, 115, 578, 322);
    card.lineStyle(5, 0xc29455); card.strokeRect(191, 115, 578, 322);
    card.lineStyle(2, 0xc5ad75, 0.8); card.lineBetween(240, 156, 720, 156);
    card.lineBetween(240, 350, 720, 350);
    for (const x of [216, 744]) {
      card.fillStyle(0xdec58b); card.fillCircle(x, 140, 4); card.fillCircle(x, 412, 4);
    }
    const heading = this.add.text(480, 216, title, { fontFamily: 'Georgia, serif', fontSize: '38px', color: '#ffe4aa', fontStyle: 'bold' }).setOrigin(0.5).setDepth(42);
    const detail = this.add.text(480, 284, subtitle, { fontFamily: 'Georgia, serif', fontSize: '17px', color: '#f0d7b0', align: 'center', lineSpacing: 10 }).setOrigin(0.5).setDepth(42);
    this.overlay = [shade, card, heading, detail, ...this.addWoodButton(480, 391, 272, button, action)];
  }

  private clearOverlay(): void { this.overlay.forEach(item => item.destroy()); this.overlay = []; }

  private toggleSound(): void {
    this.soundscape.setMuted(!this.soundscape.muted);
    this.soundLabel.setText(this.soundscape.muted ? 'SOM ○' : 'SOM ●');
    this.soundLabel.setColor(this.soundscape.muted ? '#9a8670' : '#ffe0a0');
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
    if (this.rooms[this.currentRoom].kind !== 'boss' && this.cleared.has(this.currentRoom)
      && !this.claimedAltars.has(this.currentRoom) && Math.abs(pointer.x - 480) < 52 && Math.abs(pointer.y - 270) < 45) {
      this.openAltar(); return;
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
