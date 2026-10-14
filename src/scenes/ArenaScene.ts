import Phaser from 'phaser';
import { Soundscape } from '../audio/Soundscape';
import { BIOMES } from '../content/biomes';
import { encounterFor, SPAWNS, type EnemyKind } from '../content/encounters';
import { blocked, moveAroundObstacle, normalizedMovement, OBSTACLES, type EscapeStep } from '../core/arena';
import { ADMIN_FORMS, adminAffinitiesFor, adminSpawnPoint, type AdminForm } from '../core/admin';
import { FIRST_CHECKPOINT_WORLD, generateRun, parseRunSeed, STAGES_PER_WORLD, type Direction, type Room } from '../core/run';
import { createShots, ENERGY_DELAY, MAX_ENERGY, restoreEnergy, spendEnergy, WEAPONS, type WeaponId } from '../core/weapons';
import { closestTarget } from '../core/targeting';
import { activeSynergy, altarChoices, affinityDamageBonus, ELEMENT, ELEMENTS, emptyAffinities, gainAffinity, primaryElement, totalAffinity,
  type Affinities, type ElementId } from '../core/affinities';
import { distanceToSegment } from '../core/geometry';
import { jaoFormTextureSuffix, jaoMasteryFor } from '../content/jaoMasteries';
import { emptyEquipment, energyRegen, GEAR, gearChoices, GEAR_IDS, maxEnergy, maxHealth, maxShield, type Equipment, type GearId } from '../core/equipment';
import openingArt from '../assets/abertura.webp';
import selectionArt from '../assets/selecao.webp';
import roomArt from '../assets/sala-atrio.webp';
import forgeArt from '../assets/sala-forja.webp';
import cryptArt from '../assets/sala-cripta.webp';
import chaserArt from '../assets/enemy-chaser.png';
import shooterArt from '../assets/enemy-shooter.png';
import sentryArt from '../assets/enemy-sentry.png';
import bruteArt from '../assets/enemy-brute.png';
import bossArt from '../assets/enemy-boss.png';
import arrowArt from '../assets/projectile-arrow.png';
import cardOne from '../assets/projectile-card-1.png';
import cardTwo from '../assets/projectile-card-2.png';
import cardThree from '../assets/projectile-card-3.png';

type State = 'menu' | 'selecting' | 'playing' | 'altar' | 'chest' | 'interlude' | 'paused' | 'admin' | 'dead' | 'cleared';
type HeroId = 'jao' | 'alice' | 'gui';
const HEROES: { id: HeroId; name: string; description: string }[] = [
  { id: 'jao', name: 'JÃO', description: 'O explorador de jaqueta vinho' },
  { id: 'alice', name: 'ALICE', description: 'Coragem e olhar atento' },
  { id: 'gui', name: 'GUI', description: 'O guardião de cabelos longos' },
];
type Enemy = { view: Phaser.GameObjects.Container; kind: EnemyKind; x: number; y: number; hp: number; maxHp: number; speed: number; cooldown: number; windup: number; slowTimer: number; escape?: EscapeStep };
type Bullet = { view: Phaser.GameObjects.Arc | Phaser.GameObjects.Image; vx: number; vy: number; life: number; damage: number; synergy?: 'plasma' | 'mud' };
type Coin = { view: Phaser.GameObjects.Arc; x: number; y: number };

const W = 960;
const H = 540;

export class ArenaScene extends Phaser.Scene {
  private state: State = 'menu';
  private selectedHero: HeroId = 'jao';
  private adminMode = false;
  private adminForm: AdminForm = 'base';
  private adminSpawnSequence = 0;
  private adminMessage = '';
  private hero!: Phaser.GameObjects.Container;
  private heroSprite!: Phaser.GameObjects.Image;
  private attackPose = 0;
  private facing: 'north' | 'south' | 'east' | 'west' = 'south';
  private heroMoveX = 0;
  private heroMoveY = 0;
  private heroX = 480;
  private heroY = 385;
  private heroHp = 5;
  private heroShield = 0;
  private shieldRecharge = 0;
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
  private claimedChests = new Set<number>();
  private equipment: Equipment = emptyEquipment();
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
  private gearHud!: Phaser.GameObjects.Text;
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
  private adminOverlay: Phaser.GameObjects.GameObject[] = [];

  constructor() { super('Arena'); }

  preload(): void {
    this.load.image('opening', openingArt);
    this.load.image('selection', selectionArt);
    this.load.image('room-atrium', roomArt);
    this.load.image('room-forge', forgeArt);
    this.load.image('room-crypt', cryptArt);
    for (const [key, url] of Object.entries({
      'enemy-chaser': chaserArt, 'enemy-shooter': shooterArt, 'enemy-sentry': sentryArt,
      'enemy-brute': bruteArt, 'enemy-boss': bossArt,
      'projectile-arrow': arrowArt, 'projectile-card-1': cardOne,
      'projectile-card-2': cardTwo, 'projectile-card-3': cardThree,
    })) this.load.image(key, url);
    for (const [path, url] of Object.entries(import.meta.glob('../assets/vfx-jao-*.png',
      { eager: true, query: '?url', import: 'default' }))) {
      const key = path.split('/').pop()!.replace('.png', '');
      this.load.spritesheet(key, url as string, { frameWidth: 512, frameHeight: 512 });
    }
    for (const [path, url] of Object.entries(import.meta.glob('../assets/*-{armed,attack,select}*.png',
      { eager: true, query: '?url', import: 'default' }))) {
      this.load.image(path.split('/').pop()!.replace('.png', ''), url as string);
    }
  }

  create(): void {
    this.createMasteryAnimations();
    this.touchMode = navigator.maxTouchPoints > 0 || matchMedia('(pointer: coarse)').matches;
    this.adminMode = new URLSearchParams(location.search).get('admin') === '1';
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
    this.gearHud = this.add.text(351, 73, '', { fontFamily: 'Georgia, serif', fontSize: '13px', color: '#f6d5a3', backgroundColor: '#241813' }).setDepth(20);
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
    if (this.adminMode) {
      this.add.rectangle(895, 111, 82, 30, 0x5e3c26).setStrokeStyle(2, 0xe4b96f).setDepth(23);
      this.add.text(895, 111, 'ADM', { fontFamily: 'Georgia, serif', fontSize: '15px', color: '#ffe8af', fontStyle: 'bold' })
        .setOrigin(0.5).setDepth(24);
    }

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
    const roomTexture = room?.biome === 'forge' ? 'room-forge'
      : room?.biome === 'crypt' ? 'room-crypt' : 'room-atrium';
    const backdrop = this.add.image(480, 270, roomTexture)
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
    const roomName = room?.kind === 'boss' ? 'GUARDIÃO' : 'COMBATE';
    const title = this.add.text(480, 110, room ? `MUNDO ${room.world} · ${room.stage}/5 · ${palette.name} · ${this.cleared.has(room.id) ? 'PORTAS ABERTAS' : roomName}` : 'ÁTRIO · 1/5',
      { fontFamily: 'Georgia, serif', fontSize: '14px', color: '#ffe0a2', letterSpacing: 2, backgroundColor: '#281814' }).setOrigin(0.5).setDepth(3);
    this.roomArt = [backdrop, g, title];
    if (room?.reward === 'affinity' && this.cleared.has(room.id) && !this.claimedAltars.has(room.id)) {
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
    if (room?.reward === 'gear' && this.cleared.has(room.id) && !this.claimedChests.has(room.id)) {
      const chest = this.add.graphics().setDepth(6);
      chest.fillStyle(0x24150f); chest.fillRect(445, 264, 76, 44);
      chest.fillStyle(0x83502e); chest.fillRect(448, 247, 64, 47);
      chest.lineStyle(4, 0xe0b56e); chest.strokeRect(448, 247, 64, 47);
      chest.fillStyle(0xf2d27f); chest.fillRect(475, 251, 10, 38);
      chest.fillStyle(0xf8e0a5); chest.fillRect(478, 265, 4, 7);
      const prompt = this.add.text(480, 321, 'ABRIR BAÚ', { fontFamily: 'Georgia, serif', fontSize: '14px', color: '#ffe2a0', fontStyle: 'bold', backgroundColor: '#281814' }).setOrigin(0.5).setDepth(6);
      this.roomArt.push(chest, prompt);
    }
  }

  private createHero(): void {
    this.hero = this.add.container(this.heroX, this.heroY).setDepth(10);
    this.setHeroArt();
  }

  private setHeroArt(): void {
    this.hero.removeAll(true);
    const shadow = this.add.ellipse(0, 15, 40, 10, 0x100c0b, 0.7);
    this.heroSprite = this.add.image(0, -19, `${this.selectedHero}-armed`).setDisplaySize(109.2, 78).setOrigin(80 / 224, 0.5);
    this.facing = 'south';
    this.attackPose = 0;
    this.hero.add([shadow, this.heroSprite]);
    const mastery = this.selectedHero === 'jao' ? jaoMasteryFor(this.affinities) : null;
    this.skillLabel?.setText(mastery?.button ?? (this.selectedHero === 'jao' ? 'CORTE' : this.selectedHero === 'alice' ? 'FOCO' : 'IMPACTO'));
  }

  private animateHero(mx: number, my: number): void {
    const moving = Math.hypot(mx, my) > 0.15;
    if (moving) this.facing = Math.abs(mx) > Math.abs(my) ? mx > 0 ? 'east' : 'west' : my < 0 ? 'north' : 'south';
    const walkFrame = Math.floor(this.elapsed * 8) % 2 + 1;
    const baseKey = this.facing === 'south' ? this.selectedHero
      : this.facing === 'north' ? `${this.selectedHero}-back`
      : `${this.selectedHero}-walk${moving ? walkFrame : 1}`;
    const form = this.selectedHero === 'jao'
      ? jaoFormTextureSuffix(this.affinities) || (activeSynergy(this.affinities) === 'plasma' ? '-plasma' : '')
      : '';
    const earthDownWalk = moving && this.facing === 'south' && this.selectedHero === 'jao' && form === '-earth'
      ? `jao-walk-down${walkFrame}-earth-armed` : null;
    const key = this.attackPose > 0 && !moving && (this.facing === 'east' || this.facing === 'west')
      ? `${this.selectedHero}-attack${form}` : earthDownWalk ?? `${baseKey}${form}-armed`;
    if (this.heroSprite.texture.key !== key) {
      this.heroSprite.setTexture(key);
      const frame = this.textures.get(key).get();
      this.heroSprite.setDisplaySize(frame.width / frame.height * 78, 78);
    }
    this.heroSprite.setFlipX(this.facing === 'west');
    this.heroSprite.setOrigin(this.facing === 'west' ? 144 / 224 : 80 / 224, 0.5);
    const verticalStep = moving && (this.facing === 'north' || this.facing === 'south');
    this.heroSprite.y = -19 + (verticalStep ? Math.abs(Math.sin(this.elapsed * 12)) * 1.2 : Math.sin(this.elapsed * 2) * 0.35);
    this.heroSprite.angle = 0;
  }

  private createEnemy(x: number, y: number, kind: EnemyKind): Enemy {
    const height = kind === 'boss' ? 92 : kind === 'brute' ? 69 : kind === 'sentry' ? 60 : kind === 'shooter' ? 52 : 49;
    const shadow = this.add.ellipse(0, kind === 'boss' ? 32 : 18, kind === 'boss' ? 70 : 42, 10, 0x100b09, 0.65);
    const sprite = this.add.image(0, kind === 'boss' ? -18 : -9, `enemy-${kind}`);
    sprite.setDisplaySize(sprite.width / sprite.height * height, height);
    const view = this.add.container(x, y, [shadow, sprite]).setDepth(9);
    const world = this.rooms[this.currentRoom]?.world ?? 1;
    const hp = kind === 'boss' ? 26 + world * 6 : (kind === 'brute' ? 6 : kind === 'sentry' ? 4 : 3) + Math.min(3, world - 1);
    return { view, kind, x, y, hp, maxHp: hp,
      speed: kind === 'sentry' ? 0 : kind === 'boss' ? 55 : kind === 'brute' ? 48 : kind === 'shooter' ? 58 : 84,
      cooldown: kind === 'boss' ? 1.8 : kind === 'sentry' ? 1.4 : kind === 'shooter' ? 1 : 0, windup: 0, slowTimer: 0 };
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
    this.claimedChests.clear(); this.equipment = emptyEquipment(); this.heroShield = 0; this.shieldRecharge = 0;
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
    if (this.adminMode && this.consumeKey('F2') && (this.state === 'playing' || this.state === 'admin')) this.toggleAdminPanel();
    if (this.state === 'admin') { this.pressedCodes.clear(); return; }
    const escape = this.consumeKey('Escape');
    if (Phaser.Input.Keyboard.JustDown(this.keys.ESC) || escape) this.togglePause();
    if (this.state !== 'playing') { this.pressedCodes.clear(); return; }
    const dt = Math.min(delta, 50) / 1000;
    this.elapsed += dt;
    this.hurtTimer = Math.max(0, this.hurtTimer - dt);
    this.fireTimer -= dt;
    this.attackPose = Math.max(0, this.attackPose - dt);
    this.energyCooldown = Math.max(0, this.energyCooldown - dt);
    this.energy = restoreEnergy(this.energy, dt, this.energyCooldown, maxEnergy(this.equipment), energyRegen(this.equipment));
    this.drawEnergy();
    this.dashTimer = Math.max(0, this.dashTimer - dt);
    this.dashCooldown = Math.max(0, this.dashCooldown - dt);
    this.skillCooldown = Math.max(0, this.skillCooldown - dt);
    this.shieldRecharge = Math.max(0, this.shieldRecharge - dt);
    if (this.shieldRecharge === 0 && this.heroShield < maxShield(this.equipment)) {
      this.heroShield = maxShield(this.equipment); this.refreshHud();
    }
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
    this.heroMoveX = mx; this.heroMoveY = my;
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
      enemy.slowTimer = Math.max(0, enemy.slowTimer - dt);
      const moved = moveAroundObstacle(enemy.x, enemy.y, dx / length * motion, dy / length * motion,
        enemy.speed * (enemy.slowTimer > 0 ? 0.55 : 1) * dt, radius, obstacles, enemy.escape);
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
      if (bullet.synergy === 'mud') target.slowTimer = 2.2;
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
    if (this.rooms[this.currentRoom].kind === 'boss') { this.finishWorld(); return; }
  }

  private fire(): void {
    if (this.fireTimer > 0 || (this.weapon !== 'bolt' && this.bullets.length >= 32)) return;
    const target = closestTarget({ x: this.heroX, y: this.heroY }, this.enemies, this.rooms[this.currentRoom].obstacles);
    if (!target) return;
    if (this.weapon === 'bolt' && Math.hypot(target.x - this.heroX, target.y - this.heroY) > 120) return;
    const remaining = spendEnergy(this.energy, this.weapon);
    if (remaining === null) { this.drawEnergy(); return; }
    const dx = target.x - this.heroX, dy = target.y - this.heroY;
    const shots = createShots(this.weapon, dx, dy, affinityDamageBonus(this.affinities));
    const mastery = this.selectedHero === 'jao' ? jaoMasteryFor(this.affinities) : null;
    if (mastery && this.weapon === 'bolt') shots[0].color = mastery.color;
    const synergy = activeSynergy(this.affinities);
    if (synergy === 'plasma') for (const shot of shots) { shot.color = 0xffa3e5; shot.damage += 2; shot.vx *= 1.25; shot.vy *= 1.25; }
    if (synergy === 'mud') for (const shot of shots) { shot.color = 0x87aa63; shot.damage += 1; }
    const weave = ELEMENTS.flatMap(id => Array<ElementId>(this.affinities[id]).fill(id));
    const volley = this.attackCount++;
    const infused = weave.length ? weave[volley % weave.length] : null;
    if (infused && !synergy) for (const shot of shots) shot.color = ELEMENT[infused].color;
    this.energy = remaining;
    this.energyCooldown = ENERGY_DELAY;
    this.fireTimer = WEAPONS[this.weapon].cadence;
    this.drawEnergy();
    this.soundscape.play('shot');
    this.attackPose = 0.22;
    if (Math.hypot(this.heroMoveX, this.heroMoveY) <= 0.15) {
      this.facing = this.weapon === 'bolt' && Math.abs(dy) > Math.abs(dx) * 1.7
        ? dy < 0 ? 'north' : 'south' : dx < 0 ? 'west' : 'east';
    }
    this.animateHero(this.heroMoveX, this.heroMoveY);
    if (this.weapon === 'bolt') {
      const angle = Math.atan2(dy, dx);
      for (const enemy of [...this.enemies]) {
        const reach = Math.hypot(enemy.x - this.heroX, enemy.y - this.heroY);
        const deviation = Math.atan2(Math.sin(Math.atan2(enemy.y - this.heroY, enemy.x - this.heroX) - angle),
          Math.cos(Math.atan2(enemy.y - this.heroY, enemy.x - this.heroX) - angle));
        if (reach > 120 || Math.abs(deviation) > 0.78) continue;
        if (synergy === 'mud') enemy.slowTimer = 2.2;
        this.damageEnemy(enemy, shots[0].damage + 1);
      }
      return;
    }
    for (const shot of shots) {
      if (this.bullets.length >= 32) break;
      const angle = Math.atan2(shot.vy, shot.vx);
      const x = this.heroX + Math.cos(angle) * 24;
      const y = this.heroY + Math.sin(angle) * 24 - 10;
      const view = this.weapon === 'lance'
        ? this.add.image(x, y, `projectile-card-${volley % 3 + 1}`).setDisplaySize(17, 24).setAngle(angle * 180 / Math.PI + 90).setDepth(8)
        : this.add.image(x, y, 'projectile-arrow').setDisplaySize(42, 14).setAngle(angle * 180 / Math.PI).setDepth(8);
      if (infused || synergy) {
        const glint = this.add.circle(x, y, 11, shot.color, 0.5).setDepth(7);
        this.tweens.add({ targets: glint, alpha: 0, scale: 1.7, duration: 190, onComplete: () => glint.destroy() });
      }
      this.bullets.push({ view, ...shot, synergy: synergy ?? undefined });
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
    this.hurtTimer = 1;
    if (this.heroShield > 0) this.heroShield--;
    else this.heroHp--;
    this.shieldRecharge = 8;
    this.damageTaken++;
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

  private createMasteryAnimations(): void {
    for (const key of [
      'vfx-jao-fenda_basaltica', 'vfx-jao-mare_ascendente', 'vfx-jao-corte_da_brasa',
      'vfx-jao-passo_fulminante', 'vfx-jao-corte_da_aurora', 'vfx-jao-corte_do_veu',
    ]) {
      if (this.anims.exists(key)) continue;
      this.anims.create({
        key,
        frames: this.anims.generateFrameNumbers(key, { start: 0, end: 3 }),
        frameRate: 12,
        repeat: 0,
      });
    }
  }

  private playMasteryVfx(key: string, x: number, y: number, angle: number, width: number, height: number): void {
    const effect = this.add.sprite(x, y, key).setDisplaySize(width, height).setRotation(angle).setDepth(13);
    effect.play(key);
    effect.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => effect.destroy());
  }

  private showSwordArc(x: number, y: number, angle: number, color: number, radius = 48): void {
    const arc = this.add.graphics().setDepth(13);
    arc.lineStyle(13, 0x2a1915, 0.96);
    arc.beginPath(); arc.arc(x, y, radius, angle - 0.82, angle + 0.82); arc.strokePath();
    arc.lineStyle(8, color, 1);
    arc.beginPath(); arc.arc(x, y, radius, angle - 0.78, angle + 0.78); arc.strokePath();
    arc.lineStyle(2, 0xfff1cf, 0.95);
    arc.beginPath(); arc.arc(x, y, radius + 5, angle - 0.55, angle + 0.55); arc.strokePath();
    this.tweens.add({ targets: arc, alpha: 0, scale: 1.18, duration: 190, onComplete: () => arc.destroy() });
  }

  private showArcherVolley(x: number, y: number, radius: number, color: number): void {
    const charge = this.add.circle(x, y - 12, 10, color, 0.12).setStrokeStyle(3, 0xffedc3).setDepth(12);
    this.tweens.add({ targets: charge, radius: 32, alpha: 0, duration: 220, onComplete: () => charge.destroy() });
    for (let i = 0; i < 9; i++) {
      const angle = -Math.PI / 2 + i * Math.PI * 2 / 9, startX = x + Math.cos(angle) * 17, startY = y - 12 + Math.sin(angle) * 17;
      const arrow = this.add.image(startX, startY, 'projectile-arrow').setDisplaySize(31, 10).setAngle(angle * 180 / Math.PI).setDepth(13).setTint(color);
      this.tweens.add({ targets: arrow, x: x + Math.cos(angle) * radius, y: y + Math.sin(angle) * radius,
        alpha: 0, duration: 520, onComplete: () => arrow.destroy() });
    }
  }

  private showCardFan(x: number, y: number, radius: number): void {
    for (let i = 0; i < 11; i++) {
      const angle = -Math.PI / 2 + i * Math.PI * 2 / 11, startX = x + Math.cos(angle) * 15, startY = y - 8 + Math.sin(angle) * 15;
      const card = this.add.image(startX, startY, `projectile-card-${i % 3 + 1}`).setDisplaySize(16, 22)
        .setAngle(angle * 180 / Math.PI + 90).setDepth(13);
      this.tweens.add({ targets: card, x: x + Math.cos(angle) * radius, y: y + Math.sin(angle) * radius,
        alpha: 0, angle: card.angle + 190, duration: 560, onComplete: () => card.destroy() });
    }
  }

  private pulse(): void {
    if (this.state !== 'playing' || this.skillCooldown > 0) return;
    const bonus = affinityDamageBonus(this.affinities);
    const infusion = primaryElement(this.affinities);
    const synergy = activeSynergy(this.affinities);
    const effectColor = synergy === 'plasma' ? 0xffa3e5 : synergy === 'mud' ? 0x87aa63 : infusion ? ELEMENT[infusion].color : 0xffd4a0;
    if (this.selectedHero === 'jao') {
      const target = closestTarget({ x: this.heroX, y: this.heroY }, this.enemies, this.rooms[this.currentRoom].obstacles);
      if (!target) return;
      this.skillCooldown = 6; this.soundscape.play('pulse');
      const oldX = this.heroX, oldY = this.heroY;
      const dx = target.x - oldX, dy = target.y - oldY, length = Math.max(1, Math.hypot(dx, dy));
      const angle = Math.atan2(dy, dx);
      this.attackPose = 0.24;
      this.facing = Math.abs(dy) > Math.abs(dx) * 1.7 ? dy < 0 ? 'north' : 'south' : dx < 0 ? 'west' : 'east';
      this.animateHero(0, 0);
      const mastery = jaoMasteryFor(this.affinities);
      const color = mastery?.color ?? effectColor;
      const end = { x: target.x + dx / length * 42, y: target.y + dy / length * 42 };
      if (mastery?.effect === 'blink') {
        this.playMasteryVfx('vfx-jao-passo_fulminante', (oldX + target.x) / 2, (oldY + target.y) / 2 - 8,
          angle, Math.min(220, Math.max(135, length + 50)), 145);
        if (!blocked(end.x, end.y, 15, this.rooms[this.currentRoom].obstacles)) {
          this.heroX = end.x; this.heroY = end.y; this.hero.setPosition(end.x, end.y);
          this.dashTimer = 0.22;
        }
        this.damageEnemy(target, mastery.damage + bonus);
      } else if (mastery?.effect === 'burst') {
        this.playMasteryVfx('vfx-jao-corte_da_brasa', target.x, target.y - 10, angle, 160, 150);
        for (const nearby of [...this.enemies]) {
          if (Math.hypot(nearby.x - target.x, nearby.y - target.y) > 74) continue;
          this.damageEnemy(nearby, nearby === target ? mastery.damage + bonus : 2 + bonus);
        }
      } else if (mastery?.effect === 'fissure') {
        this.playMasteryVfx('vfx-jao-fenda_basaltica', (oldX + target.x) / 2, (oldY + target.y) / 2 + 9,
          angle, Math.min(300, Math.max(150, length + 65)), 142);
        for (const nearby of [...this.enemies]) {
          if (distanceToSegment(nearby.x, nearby.y, oldX, oldY, target.x, target.y) > 34) continue;
          nearby.slowTimer = mastery.slow;
          this.damageEnemy(nearby, mastery.damage + bonus);
        }
      } else if (mastery?.effect === 'wave') {
        this.playMasteryVfx('vfx-jao-mare_ascendente', (oldX + target.x) / 2, (oldY + target.y) / 2 - 8,
          angle + Math.PI / 2, 150, 180);
        for (const nearby of [...this.enemies]) {
          if (distanceToSegment(nearby.x, nearby.y, oldX, oldY, target.x, target.y) > 58) continue;
          nearby.slowTimer = mastery.slow;
          this.damageEnemy(nearby, mastery.damage + bonus);
        }
      } else if (mastery?.effect === 'ray') {
        const rayEnd = { x: target.x + dx / length * 180, y: target.y + dy / length * 180 };
        const rayLength = Math.hypot(rayEnd.x - oldX, rayEnd.y - oldY);
        this.playMasteryVfx('vfx-jao-corte_da_aurora', (oldX + rayEnd.x) / 2, (oldY + rayEnd.y) / 2 - 8,
          angle, Math.min(340, Math.max(180, rayLength)), 132);
        for (const nearby of [...this.enemies]) {
          if (distanceToSegment(nearby.x, nearby.y, oldX, oldY, rayEnd.x, rayEnd.y) > 25) continue;
          this.damageEnemy(nearby, mastery.damage + bonus);
        }
      } else if (mastery?.effect === 'echo') {
        const flank = { x: target.x - dx / length * 43, y: target.y - dy / length * 43 };
        this.playMasteryVfx('vfx-jao-corte_do_veu', target.x, target.y - 8, angle, 160, 160);
        if (!blocked(flank.x, flank.y, 15, this.rooms[this.currentRoom].obstacles)) {
          this.heroX = flank.x; this.heroY = flank.y; this.hero.setPosition(flank.x, flank.y);
          this.dashTimer = 0.16;
        }
        const afterimage = this.add.image(oldX, oldY - 19, 'jao-shadow-armed')
          .setDisplaySize(55, 78).setOrigin(80 / 224, 0.5).setTint(color).setAlpha(0.65).setDepth(9);
        this.tweens.add({ targets: afterimage, alpha: 0, duration: 300, onComplete: () => afterimage.destroy() });
        this.damageEnemy(target, mastery.damage + bonus);
        this.time.delayedCall(260, () => {
          if (this.state !== 'playing' || !this.enemies.includes(target)) return;
          this.playMasteryVfx('vfx-jao-corte_do_veu', target.x, target.y - 8, angle, 132, 132);
          this.damageEnemy(target, 2 + bonus);
        });
      } else {
        this.showSwordArc(oldX, oldY - 8, angle, color, 43);
        if (synergy === 'mud') target.slowTimer = 3;
        this.damageEnemy(target, (synergy === 'plasma' ? 5 : 2) + bonus);
      }
      this.refreshHud();
      return;
    }
    this.skillCooldown = 6;
    this.soundscape.play('pulse');
    const color = infusion || synergy ? effectColor : this.selectedHero === 'alice' ? 0xd9c191 : 0xc5a17b;
    const radius = this.selectedHero === 'alice' ? 170 : 135;
    if (this.selectedHero === 'alice') this.showArcherVolley(this.heroX, this.heroY, radius, color);
    else this.showCardFan(this.heroX, this.heroY, radius);
    const wave = this.add.circle(this.heroX, this.heroY, 18, color, 0.08).setStrokeStyle(3, color).setDepth(7);
    this.tweens.add({ targets: wave, radius, alpha: 0, duration: 430, onComplete: () => wave.destroy() });
    for (const enemy of [...this.enemies]) {
      if (Math.hypot(enemy.x - this.heroX, enemy.y - this.heroY) > radius) continue;
      if (synergy === 'mud') enemy.slowTimer = 3;
      this.damageEnemy(enemy, (this.selectedHero === 'alice' ? 1 : 2) + bonus + (synergy === 'plasma' ? 2 : 0));
    }
    this.refreshHud();
  }

  private buyHeal(): void {
    if (this.state !== 'playing' || !this.cleared.has(this.currentRoom) || this.heroHp >= maxHealth(this.equipment) || this.coins < 3) return;
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
    const detail = this.add.text(480, 184, `Escolha um elemento · ${totalAffinity(this.affinities)} fragmentos nesta run`,
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
    const hint = this.add.text(480, 428, 'Domínio puro: 5 iguais · Plasma ou Lodo: 3 + 3.',
      { fontFamily: 'Georgia, serif', fontSize: '15px', color: '#ddc396' }).setOrigin(0.5).setDepth(43);
    this.overlay.push(hint);
  }

  private chooseAffinity(element: ElementId): void {
    if (this.state !== 'altar') return;
    this.affinities = gainAffinity(this.affinities, element);
    this.claimedAltars.add(this.currentRoom);
    this.clearOverlay(); this.state = 'playing'; this.drawRoom(); this.animateHero(0, 0); this.refreshHud();
  }

  private openChest(): void {
    if (this.state !== 'playing' || !this.cleared.has(this.currentRoom) || this.rooms[this.currentRoom].reward !== 'gear'
      || this.claimedChests.has(this.currentRoom)) return;
    const choices = gearChoices(this.seed, this.currentRoom, this.equipment);
    if (!choices.length) { this.claimedChests.add(this.currentRoom); this.drawRoom(); return; }
    this.state = 'chest'; this.soundscape.play('chest'); this.clearOverlay();
    const shade = this.add.rectangle(480, 270, W, H, 0x1a110d, 0.9).setDepth(40);
    const card = this.add.graphics().setDepth(41);
    card.fillStyle(0x342119, 0.98); card.fillRect(143, 81, 674, 385);
    card.lineStyle(5, 0xd5a35d); card.strokeRect(143, 81, 674, 385);
    card.lineStyle(2, 0xc49b64); card.lineBetween(200, 147, 760, 147);
    const heading = this.add.text(480, 119, 'BAÚ DE RELÍQUIAS', { fontFamily: 'Georgia, serif', fontSize: '30px', color: '#ffe1a0', fontStyle: 'bold' }).setOrigin(0.5).setDepth(42);
    const detail = this.add.text(480, 184, 'Escolha um equipamento para levar entre as masmorras',
      { fontFamily: 'Georgia, serif', fontSize: '17px', color: '#f4ddb7' }).setOrigin(0.5).setDepth(42);
    this.overlay = [shade, card, heading, detail];
    for (const [index, id] of choices.entries()) {
      const x = 279 + index * 201;
      const plate = this.add.rectangle(x, 304, 177, 187, 0x4b3125).setStrokeStyle(3, 0xe2b674)
        .setDepth(42).setInteractive({ useHandCursor: true });
      const glyph = this.add.text(x, 257, GEAR[id].glyph, { fontFamily: 'Georgia, serif', fontSize: '48px', color: '#f7d591' }).setOrigin(0.5).setDepth(43);
      const name = this.add.text(x, 309, GEAR[id].name, { fontFamily: 'Georgia, serif', fontSize: '16px', color: '#fff0c9', fontStyle: 'bold' }).setOrigin(0.5).setDepth(43);
      const description = this.add.text(x, 355, `${GEAR[id].description}\nNível ${this.equipment[id]} → ${this.equipment[id] + 1}`,
        { fontFamily: 'Georgia, serif', fontSize: '12px', color: '#f1cfa2', align: 'center', wordWrap: { width: 159 } }).setOrigin(0.5).setDepth(43);
      plate.on('pointerdown', () => this.chooseGear(id));
      this.overlay.push(plate, glyph, name, description);
    }
    const hint = this.add.text(480, 429, 'Relíquias duram até o fim desta run; armas continuam próprias de cada herói.',
      { fontFamily: 'Georgia, serif', fontSize: '14px', color: '#ddc396' }).setOrigin(0.5).setDepth(43);
    this.overlay.push(hint);
  }

  private chooseGear(id: GearId): void {
    if (this.state !== 'chest') return;
    this.equipment = { ...this.equipment, [id]: this.equipment[id] + 1 };
    if (id === 'ring') this.heroHp++;
    if (id === 'armor') this.heroShield++;
    if (id === 'pendant') this.energy += 20;
    this.claimedChests.add(this.currentRoom);
    this.clearOverlay(); this.state = 'playing'; this.drawRoom(); this.refreshHud();
  }

  private refreshHud(): void {
    this.hud.setX(this.touchMode ? 78 : 35);
    const room = this.rooms[this.currentRoom];
    this.hud.setText(`${this.selectedHero.toUpperCase()}  ${'♥'.repeat(this.heroHp)}${'♡'.repeat(maxHealth(this.equipment) - this.heroHp)} ${'⬡'.repeat(this.heroShield)}  ${room?.world ?? 1}-${room?.stage ?? 1}/5\n${WEAPONS[this.weapon].name}   ◈ ${this.coins} moedas`);
    for (const [index, id] of ELEMENTS.entries()) {
      this.affinityHud[index].setText(`${ELEMENT[id].glyph}${this.affinities[id]}`);
      this.affinityHud[index].setColor(this.affinities[id] ? ELEMENT[id].css : '#8a7764');
    }
    const synergy = activeSynergy(this.affinities);
    const mastery = this.selectedHero === 'jao' ? jaoMasteryFor(this.affinities) : null;
    this.skillLabel.setText(mastery?.button ?? (synergy === 'plasma' ? 'PLASMA' : synergy === 'mud' ? 'LODO' : this.selectedHero === 'jao' ? 'CORTE' : this.selectedHero === 'alice' ? 'FOCO' : 'CARTAS'));
    this.gearHud.setText(GEAR_IDS.map(id => `${GEAR[id].glyph}${this.equipment[id]}`).join('  ') + (synergy ? ` · ${synergy === 'plasma' ? 'PLASMA' : 'LODO'}`
      : mastery ? ` · ${ELEMENT[mastery.element].name} 5` : ''));
    this.healButton.setVisible(this.state === 'playing' && this.cleared.has(this.currentRoom));
    this.healLabel.setVisible(this.healButton.visible);
    this.healButton.setAlpha(this.coins >= 3 && this.heroHp < maxHealth(this.equipment) ? 1 : 0.4);
    this.healLabel.setAlpha(this.healButton.alpha);
    this.hint.setText(this.touchMode ? 'Mover à esquerda · ATIRAR mira sozinho · toque na recompensa após a luta' : 'WASD: mover · segure clique: tiro automático · ESPAÇO: dash · E: habilidade · H: cura · ESC: pausa');
    this.drawEnergy();
    this.drawMap();
  }

  private drawEnergy(): void {
    const ready = this.energy >= WEAPONS[this.weapon].energy;
    this.energyText.setText(`ENERGIA ${Math.floor(this.energy)}/${maxEnergy(this.equipment)} · ${WEAPONS[this.weapon].energy}/tiro`);
    this.energyBar.clear();
    this.energyBar.fillStyle(0x160f0d); this.energyBar.fillRect(351, 44, 188, 15);
    this.energyBar.fillStyle(ready ? 0x77b6d0 : 0xb15b49);
    this.energyBar.fillRect(354, 47, 182 * this.energy / maxEnergy(this.equipment), 9);
    this.fireBase.setAlpha(ready ? 1 : 0.4);
    this.fireLabel.setAlpha(ready ? 1 : 0.5);
  }

  private drawMap(): void {
    this.mapGraphics.clear();
    const world = this.rooms[this.currentRoom]?.world;
    for (const room of this.rooms) {
      if (room.world !== world) continue;
      const x = 765 + room.x * 34, y = 19;
      this.mapGraphics.lineStyle(2, 0xc49a5d, 0.75);
      if (room.neighbors.east !== undefined) this.mapGraphics.lineBetween(x + 8, y + 6, x + 34, y + 6);
      this.mapGraphics.fillStyle(room.id === this.currentRoom ? 0xf0c76f : room.kind === 'boss' ? 0xb94b42
        : this.cleared.has(room.id) ? 0x9caa70 : 0x81705c);
      this.mapGraphics.fillRect(x, y, 16, 13);
    }
  }

  private finishWorld(): void {
    const world = this.rooms[this.currentRoom].world;
    this.state = 'interlude'; this.mouseDown = false; this.firePointer = null;
    this.soundscape.play('win');
    if (world < FIRST_CHECKPOINT_WORLD) {
      this.showOverlay(`MUNDO ${world} CONCLUÍDO`, `O guardião caiu. Seus equipamentos e afinidades seguem com você.\nPróxima masmorra: mundo ${world + 1}, fase 1/5.`,
        'PRÓXIMO MUNDO', () => this.advanceWorld(world + 1));
      return;
    }
    this.showWorldChoice(world);
  }

  private showWorldChoice(world: number): void {
    this.showOverlay(`MUNDO ${world} CONCLUÍDO`, `Você chegou ao marco da expedição.\nFragmentos: ${totalAffinity(this.affinities)} · Seed: ${this.seed}\nPode encerrar com vitória ou seguir para o mundo ${world + 1}.`,
      'VOLTAR AO LOBBY', () => this.finish(true));
    this.overlay.push(...this.addWoodButton(480, 444, 272, 'CONTINUAR', () => this.advanceWorld(world + 1)));
  }

  private advanceWorld(world: number): void {
    this.clearOverlay();
    if (world > this.rooms.length / STAGES_PER_WORLD) this.rooms = generateRun(this.seed, world);
    this.state = 'playing';
    this.enterRoom((world - 1) * STAGES_PER_WORLD);
    this.cameras.main.flash(350, 49, 26, 51);
  }

  private finish(won: boolean): void {
    this.state = won ? 'cleared' : 'dead';
    this.soundscape.play(won ? 'win' : 'lose');
    this.mouseDown = false; this.firePointer = null; this.movePointer = null;
    this.joyX = 0; this.joyY = 0; this.joyKnob.setPosition(153, 399);
    this.showOverlay(won ? 'GUARDIÃO DERROTADO!' : 'FIM DA TENTATIVA',
      `${won ? 'Você encerrou a expedição.' : 'Os guardiões venceram desta vez.'}\nFases: ${this.cleared.size} · Tempo: ${Math.floor(this.elapsed)}s · Dano: ${this.damageTaken}\nMoedas: ${this.coins} · Seed: ${this.seed}`,
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

  private toggleAdminPanel(): void {
    if (!this.adminMode) return;
    if (this.state === 'admin') {
      this.clearAdminPanel();
      this.state = 'playing';
      this.refreshHud();
      return;
    }
    if (this.state !== 'playing') return;
    this.heldCodes.clear(); this.pressedCodes.clear();
    this.mouseDown = false; this.firePointer = null; this.movePointer = null;
    this.joyX = 0; this.joyY = 0; this.joyKnob.setPosition(153, 399);
    this.state = 'admin';
    this.showAdminPanel();
  }

  private showAdminPanel(): void {
    this.clearAdminPanel();
    const shade = this.add.rectangle(480, 270, W, H, 0x160e0b, 0.8).setDepth(60);
    const card = this.add.graphics().setDepth(61);
    card.fillStyle(0x332119, 0.98); card.fillRect(130, 52, 700, 436);
    card.lineStyle(5, 0xc29455); card.strokeRect(130, 52, 700, 436);
    card.lineStyle(2, 0xc5ad75, 0.8); card.lineBetween(174, 112, 786, 112);
    const title = this.add.text(480, 82, 'PAINEL DE ADM', { fontFamily: 'Georgia, serif', fontSize: '31px', color: '#ffe4aa', fontStyle: 'bold' })
      .setOrigin(0.5).setDepth(62);
    const mastery = jaoMasteryFor(this.affinities);
    const status = this.add.text(480, 137,
      `${mastery?.form ?? 'JÃO BASE'} · ${totalAffinity(this.affinities)} fragmentos · ${this.enemies.length} inimigos · HP ${this.heroHp}/${maxHealth(this.equipment)} · ◈ ${Math.floor(this.energy)}`,
      { fontFamily: 'Georgia, serif', fontSize: '14px', color: '#f0d7b0', align: 'center' }).setOrigin(0.5).setDepth(62);
    const formHeading = this.add.text(480, 164, 'ESCOLHER FORMA', { fontFamily: 'Georgia, serif', fontSize: '16px', color: '#e9bf79', fontStyle: 'bold' })
      .setOrigin(0.5).setDepth(62);
    this.adminOverlay.push(shade, card, title, status, formHeading);
    for (const [index, form] of ADMIN_FORMS.entries()) {
      const x = 190 + index * 96;
      this.adminOverlay.push(...this.addAdminButton(x, 198, 88, form.label, () => this.applyAdminForm(form.id), this.adminForm === form.id));
    }
    const enemyHeading = this.add.text(480, 245, 'INVOCAR INIMIGO', { fontFamily: 'Georgia, serif', fontSize: '16px', color: '#e9bf79', fontStyle: 'bold' })
      .setOrigin(0.5).setDepth(62);
    this.adminOverlay.push(enemyHeading);
    const enemies: { kind: EnemyKind; label: string }[] = [
      { kind: 'chaser', label: 'DIABRETE' }, { kind: 'shooter', label: 'ATIRADOR' },
      { kind: 'sentry', label: 'SENTINELA' }, { kind: 'brute', label: 'BRUTO' }, { kind: 'boss', label: 'CHEFE' },
    ];
    for (const [index, enemy] of enemies.entries()) {
      const x = 204 + index * 138;
      this.adminOverlay.push(...this.addAdminButton(x, 280, 126, enemy.label, () => this.spawnAdminEnemy(enemy.kind)));
    }
    const utilities = this.addAdminButton(365, 350, 210, 'RESTAURAR HP + ENERGIA', () => this.restoreAdminVitals());
    this.adminOverlay.push(...utilities);
    const close = this.addAdminButton(480, 435, 220, 'VOLTAR À RUN · F2', () => this.toggleAdminPanel());
    this.adminOverlay.push(...close);
    if (this.adminMessage) {
      const message = this.add.text(480, 396, this.adminMessage, { fontFamily: 'Georgia, serif', fontSize: '14px', color: '#ffe3aa' })
        .setOrigin(0.5).setDepth(63);
      this.adminOverlay.push(message);
    }
  }

  private addAdminButton(x: number, y: number, width: number, label: string, action: () => void, selected = false): Phaser.GameObjects.GameObject[] {
    const plate = this.add.rectangle(x, y, width, 42, selected ? 0x80542f : 0x573721)
      .setStrokeStyle(selected ? 3 : 2, selected ? 0xffd47d : 0xc29455).setDepth(62).setInteractive({ useHandCursor: true });
    const text = this.add.text(x, y, label, { fontFamily: 'Georgia, serif', fontSize: width < 100 ? '13px' : '14px',
      color: '#fff0c2', fontStyle: 'bold', align: 'center', wordWrap: { width: width - 8 } }).setOrigin(0.5).setDepth(63);
    plate.on('pointerdown', action);
    return [plate, text];
  }

  private applyAdminForm(form: AdminForm): void {
    this.adminForm = form;
    this.selectedHero = 'jao';
    this.weapon = 'bolt';
    this.affinities = adminAffinitiesFor(form);
    this.skillCooldown = 0;
    this.setHeroArt();
    this.animateHero(0, 0);
    this.adminMessage = form === 'base' ? 'Jão voltou à forma base.' : `${jaoMasteryFor(this.affinities)?.form} pronto para testar.`;
    this.refreshHud();
    this.showAdminPanel();
  }

  private spawnAdminEnemy(kind: EnemyKind): void {
    if (this.enemies.length >= 30) {
      this.adminMessage = 'Limite de 30 inimigos atingido. Derrote alguns antes de invocar mais.';
      this.showAdminPanel();
      return;
    }
    const point = adminSpawnPoint(
      { x: this.heroX, y: this.heroY }, kind, this.rooms[this.currentRoom].obstacles,
      this.enemies.map(enemy => ({ x: enemy.x, y: enemy.y, kind: enemy.kind })), this.adminSpawnSequence,
    );
    if (!point) {
      this.adminMessage = 'Sem espaço livre. Afaste-se e tente novamente.';
      this.showAdminPanel();
      return;
    }
    this.adminSpawnSequence++;
    this.enemies.push(this.createEnemy(point.x, point.y, kind));
    this.adminMessage = `${kind === 'boss' ? 'Chefe' : kind} invocado. ${this.enemies.length}/30 inimigos.`;
    this.refreshHud();
    this.showAdminPanel();
  }

  private restoreAdminVitals(): void {
    this.heroHp = maxHealth(this.equipment);
    this.heroShield = maxShield(this.equipment);
    this.energy = maxEnergy(this.equipment);
    this.hurtTimer = 0; this.shieldRecharge = 0; this.skillCooldown = 0;
    this.adminMessage = 'Vida, escudo, energia e habilidade restaurados.';
    this.refreshHud();
    this.showAdminPanel();
  }

  private clearAdminPanel(): void { this.adminOverlay.forEach(item => item.destroy()); this.adminOverlay = []; }

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
      const sprite = this.add.image(x, 271, `${hero.id}-select`).setDisplaySize(214, 214).setDepth(43);
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
    if (this.adminMode && this.state === 'playing' && pointer.x > 845 && pointer.y >= 90 && pointer.y < 133) {
      this.toggleAdminPanel(); return;
    }
    if (this.state === 'playing' && pointer.x > 870 && pointer.y < 48) { this.togglePause(); return; }
    if (pointer.y < 90 && pointer.x > 850) return;
    if (pointer.y < 70) return;
    if (this.state !== 'playing') return;
    if (this.cleared.has(this.currentRoom) && Math.abs(pointer.x - 480) < 52 && Math.abs(pointer.y - 270) < 53) {
      if (this.rooms[this.currentRoom].reward === 'affinity' && !this.claimedAltars.has(this.currentRoom)) { this.openAltar(); return; }
      if (this.rooms[this.currentRoom].reward === 'gear' && !this.claimedChests.has(this.currentRoom)) { this.openChest(); return; }
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
