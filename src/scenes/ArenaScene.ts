import Phaser from 'phaser';
import { blocked, normalizedMovement, OBSTACLES } from '../core/arena';

type State = 'menu' | 'playing' | 'paused' | 'dead' | 'cleared';
type Enemy = { view: Phaser.GameObjects.Container; x: number; y: number; hp: number; speed: number; cooldown: number };
type Bullet = { view: Phaser.GameObjects.Arc; vx: number; vy: number; life: number };

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
  private enemies: Enemy[] = [];
  private bullets: Bullet[] = [];
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private mouseDown = false;
  private movePointer: number | null = null;
  private firePointer: number | null = null;
  private joyX = 0;
  private joyY = 0;
  private aimX = 1;
  private aimY = 0;
  private touchMode = false;
  private hud!: Phaser.GameObjects.Text;
  private hint!: Phaser.GameObjects.Text;
  private joyBase!: Phaser.GameObjects.Arc;
  private joyKnob!: Phaser.GameObjects.Arc;
  private fireBase!: Phaser.GameObjects.Arc;
  private fireLabel!: Phaser.GameObjects.Text;
  private overlay: Phaser.GameObjects.GameObject[] = [];
  private elapsed = 0;

  constructor() { super('Arena'); }

  create(): void {
    this.touchMode = navigator.maxTouchPoints > 0 || matchMedia('(pointer: coarse)').matches;
    this.drawRoom();
    this.createHero();
    this.hud = this.add.text(35, 19, '', { fontFamily: 'system-ui', fontSize: '18px', color: '#eef4ff', fontStyle: 'bold' }).setDepth(20);
    this.hint = this.add.text(480, 506, '', { fontFamily: 'system-ui', fontSize: '14px', color: '#91a5c8' }).setOrigin(0.5).setDepth(20);
    this.add.text(920, 27, 'Ⅱ', { fontFamily: 'system-ui', fontSize: '26px', color: '#dbeaff' }).setOrigin(0.5).setDepth(20);

    this.joyBase = this.add.circle(153, 399, 61, 0x8cc5ff, 0.13).setStrokeStyle(2, 0xa5d4ff, 0.5).setDepth(20);
    this.joyKnob = this.add.circle(153, 399, 25, 0x9ad7ff, 0.47).setDepth(21);
    this.fireBase = this.add.circle(810, 399, 60, 0xff9f88, 0.28).setStrokeStyle(3, 0xffc0a4, 0.8).setDepth(20);
    this.fireLabel = this.add.text(810, 399, 'ATIRAR', { fontFamily: 'system-ui', fontSize: '15px', color: '#fff5ed', fontStyle: 'bold' }).setOrigin(0.5).setDepth(21);
    this.setTouchVisibility();

    this.keys = this.input.keyboard!.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,ESC,R') as Record<string, Phaser.Input.Keyboard.Key>;
    this.input.on('pointerdown', this.onDown, this);
    this.input.on('pointermove', this.onMove, this);
    this.input.on('pointerup', this.onUp, this);
    this.input.on('pointerupoutside', this.onUp, this);
    this.game.events.on(Phaser.Core.Events.BLUR, this.pauseOnBlur, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.game.events.off(Phaser.Core.Events.BLUR, this.pauseOnBlur, this));
    this.showOverlay('JUNQ · PROTÓTIPO', 'Primeira sala jogável\nElimine os guardiões e sobreviva.', 'COMEÇAR', () => this.startRun());
    this.refreshHud();
  }

  private drawRoom(): void {
    const g = this.add.graphics();
    g.fillStyle(0x0b1324); g.fillRect(0, 0, W, H);
    g.fillStyle(0x1c2940); g.fillRoundedRect(39, 68, 882, 430, 22);
    g.fillStyle(0x17233a); g.fillRoundedRect(54, 82, 852, 402, 13);
    g.lineStyle(1, 0x263a59, 0.55);
    for (let x = 75; x < 900; x += 42) g.lineBetween(x, 90, x, 476);
    for (let y = 95; y < 475; y += 42) g.lineBetween(58, y, 902, y);
    g.lineStyle(4, 0x476b88, 0.9); g.strokeRoundedRect(54, 82, 852, 402, 13);
    g.fillStyle(0x203a54, 0.7); g.fillRect(436, 83, 88, 9); g.fillRect(436, 475, 88, 8);
    for (const o of OBSTACLES) {
      g.fillStyle(0x090d19, 0.45); g.fillRoundedRect(o.x + 7, o.y + 9, o.w, o.h, 8);
      g.fillStyle(0x354b64); g.fillRoundedRect(o.x, o.y, o.w, o.h, 7);
      g.lineStyle(3, 0x7894a7); g.strokeRoundedRect(o.x, o.y, o.w, o.h, 7);
      g.lineStyle(2, 0x526e85); g.lineBetween(o.x + 10, o.y + 12, o.x + o.w - 10, o.y + o.h - 12);
    }
    this.add.text(480, 110, 'SALA 01 · CÂMARA DE TESTE', { fontFamily: 'system-ui', fontSize: '13px', color: '#7398bd', letterSpacing: 3 }).setOrigin(0.5);
  }

  private createHero(): void {
    const shadow = this.add.ellipse(2, 17, 33, 13, 0x050814, 0.55);
    const cloak = this.add.triangle(0, 10, -13, 2, 13, 2, 0, 27, 0x256d9b);
    const body = this.add.circle(0, 0, 15, 0x3bc5ec).setStrokeStyle(3, 0xdafaff);
    const core = this.add.circle(0, -2, 5, 0xf5ffff);
    this.hero = this.add.container(this.heroX, this.heroY, [shadow, cloak, body, core]).setDepth(10);
  }

  private createEnemy(x: number, y: number, speed: number): Enemy {
    const shadow = this.add.ellipse(2, 14, 36, 11, 0x04060d, 0.5);
    const body = this.add.circle(0, 0, 15, 0xbc526b).setStrokeStyle(3, 0xff9eaa);
    const eye1 = this.add.circle(-5, -3, 2, 0xffe6c9);
    const eye2 = this.add.circle(5, -3, 2, 0xffe6c9);
    const view = this.add.container(x, y, [shadow, body, eye1, eye2]).setDepth(9);
    return { view, x, y, hp: 3, speed, cooldown: 0 };
  }

  private startRun(): void {
    this.clearOverlay();
    this.bullets.forEach(b => b.view.destroy());
    this.enemies.forEach(e => e.view.destroy());
    this.bullets = [];
    this.enemies = [
      this.createEnemy(175, 155, 70), this.createEnemy(780, 158, 84),
      this.createEnemy(168, 350, 74), this.createEnemy(762, 323, 92),
    ];
    this.heroX = 480; this.heroY = 385; this.hero.setPosition(this.heroX, this.heroY);
    this.heroHp = 5; this.hurtTimer = 0; this.fireTimer = 0; this.elapsed = 0;
    this.mouseDown = false; this.movePointer = null; this.firePointer = null;
    this.joyX = 0; this.joyY = 0; this.joyKnob.setPosition(153, 399);
    this.state = 'playing'; this.refreshHud();
  }

  update(_time: number, delta: number): void {
    if (Phaser.Input.Keyboard.JustDown(this.keys.ESC)) this.togglePause();
    if (this.state !== 'playing') return;
    const dt = Math.min(delta, 50) / 1000;
    this.elapsed += dt;
    this.hurtTimer = Math.max(0, this.hurtTimer - dt);
    this.fireTimer -= dt;
    this.hero.setAlpha(this.hurtTimer > 0 && Math.floor(this.hurtTimer * 12) % 2 === 0 ? 0.45 : 1);

    let mx = Number(this.keys.D.isDown || this.keys.RIGHT.isDown) - Number(this.keys.A.isDown || this.keys.LEFT.isDown) + this.joyX;
    let my = Number(this.keys.S.isDown || this.keys.DOWN.isDown) - Number(this.keys.W.isDown || this.keys.UP.isDown) + this.joyY;
    ({ x: mx, y: my } = normalizedMovement(mx, my));
    const nextX = this.heroX + mx * 205 * dt;
    const nextY = this.heroY + my * 205 * dt;
    if (!blocked(nextX, this.heroY, 15)) this.heroX = nextX;
    if (!blocked(this.heroX, nextY, 15)) this.heroY = nextY;
    this.hero.setPosition(this.heroX, this.heroY);

    if (this.firePointer !== null || this.mouseDown) this.fire();
    for (const enemy of this.enemies) {
      const dx = this.heroX - enemy.x, dy = this.heroY - enemy.y;
      const length = Math.max(1, Math.hypot(dx, dy));
      const ex = enemy.x + dx / length * enemy.speed * dt;
      const ey = enemy.y + dy / length * enemy.speed * dt;
      if (!blocked(ex, enemy.y, 15)) enemy.x = ex;
      if (!blocked(enemy.x, ey, 15)) enemy.y = ey;
      enemy.view.setPosition(enemy.x, enemy.y);
      enemy.cooldown = Math.max(0, enemy.cooldown - dt);
      if (length < 29 && enemy.cooldown === 0 && this.hurtTimer === 0) {
        enemy.cooldown = 0.6; this.hurtTimer = 1; this.heroHp--;
        this.cameras.main.shake(90, 0.005); this.refreshHud();
        if (this.heroHp <= 0) { this.finish(false); return; }
      }
    }
    for (const bullet of [...this.bullets]) {
      bullet.view.x += bullet.vx * dt;
      bullet.view.y += bullet.vy * dt;
      bullet.life -= dt;
      if (bullet.life <= 0 || blocked(bullet.view.x, bullet.view.y, 5)) { this.removeBullet(bullet); continue; }
      const target = this.enemies.find(e => Math.hypot(e.x - bullet.view.x, e.y - bullet.view.y) < 20);
      if (!target) continue;
      target.hp--; target.view.setAlpha(0.6);
      this.time.delayedCall(80, () => { if (target.view.active) target.view.setAlpha(1); });
      this.removeBullet(bullet);
      if (target.hp <= 0) {
        target.view.destroy(); this.enemies.splice(this.enemies.indexOf(target), 1); this.refreshHud();
        if (this.enemies.length === 0) { this.finish(true); return; }
      }
    }
  }

  private fire(): void {
    if (this.fireTimer > 0 || this.bullets.length >= 32) return;
    let dx = this.aimX, dy = this.aimY;
    if (this.firePointer !== null && Math.hypot(dx, dy) < 0.1) {
      const closest = [...this.enemies].sort((a, b) =>
        Math.hypot(a.x - this.heroX, a.y - this.heroY) - Math.hypot(b.x - this.heroX, b.y - this.heroY))[0];
      if (closest) { dx = closest.x - this.heroX; dy = closest.y - this.heroY; }
    }
    const length = Math.max(0.001, Math.hypot(dx, dy)); dx /= length; dy /= length;
    const view = this.add.circle(this.heroX + dx * 20, this.heroY + dy * 20, 6, 0x7beaff).setStrokeStyle(2, 0xf3ffff).setDepth(8);
    this.bullets.push({ view, vx: dx * 520, vy: dy * 520, life: 1.5 });
    this.fireTimer = 0.19;
  }

  private removeBullet(b: Bullet): void {
    b.view.destroy();
    const index = this.bullets.indexOf(b);
    if (index >= 0) this.bullets.splice(index, 1);
  }

  private refreshHud(): void {
    this.hud.setText(`❤ ${'♥'.repeat(this.heroHp)}${'♡'.repeat(5 - this.heroHp)}     ◈ ${4 - this.enemies.length}/4`);
    this.hint.setText(this.touchMode ? 'Arraste à esquerda para mover · segure ATIRAR para disparar' : 'WASD para mover · mouse para mirar e atirar · ESC para pausar');
  }

  private finish(won: boolean): void {
    this.state = won ? 'cleared' : 'dead';
    this.mouseDown = false; this.firePointer = null; this.movePointer = null;
    this.joyX = 0; this.joyY = 0; this.joyKnob.setPosition(153, 399);
    this.showOverlay(won ? 'SALA LIMPA!' : 'FIM DA TENTATIVA',
      `${won ? 'Você derrotou os guardiões.' : 'Os guardiões venceram desta vez.'}\nTempo: ${Math.floor(this.elapsed)}s  ·  Eliminados: ${4 - this.enemies.length}/4`,
      'JOGAR DE NOVO', () => this.startRun());
  }

  private togglePause(): void {
    if (this.state === 'playing') {
      this.state = 'paused'; this.mouseDown = false; this.firePointer = null;
      this.movePointer = null; this.joyX = 0; this.joyY = 0; this.joyKnob.setPosition(153, 399);
      this.showOverlay('PAUSA', 'Respira, MVP. A sala espera.', 'CONTINUAR', () => { this.clearOverlay(); this.state = 'playing'; });
    } else if (this.state === 'paused') { this.clearOverlay(); this.state = 'playing'; }
  }

  private pauseOnBlur(): void { if (this.state === 'playing') this.togglePause(); }

  private showOverlay(title: string, subtitle: string, button: string, action: () => void): void {
    this.clearOverlay();
    const shade = this.add.rectangle(480, 270, W, H, 0x080d18, 0.82).setDepth(40);
    const accent = this.add.rectangle(480, 186, 460, 4, 0x67d8f1).setDepth(41);
    const heading = this.add.text(480, 224, title, { fontFamily: 'system-ui', fontSize: '42px', color: '#e8faff', fontStyle: 'bold' }).setOrigin(0.5).setDepth(41);
    const detail = this.add.text(480, 293, subtitle, { fontFamily: 'system-ui', fontSize: '18px', color: '#adc4d9', align: 'center', lineSpacing: 10 }).setOrigin(0.5).setDepth(41);
    const plate = this.add.rectangle(480, 391, 272, 58, 0x3eacc6).setStrokeStyle(2, 0x9ff4ff).setInteractive({ useHandCursor: true }).setDepth(41);
    const label = this.add.text(480, 391, button, { fontFamily: 'system-ui', fontSize: '19px', color: '#091521', fontStyle: 'bold' }).setOrigin(0.5).setDepth(42);
    plate.on('pointerdown', action);
    this.overlay = [shade, accent, heading, detail, plate, label];
  }

  private clearOverlay(): void { this.overlay.forEach(item => item.destroy()); this.overlay = []; }

  private setTouchVisibility(): void {
    for (const obj of [this.joyBase, this.joyKnob, this.fireBase, this.fireLabel]) obj.setVisible(this.touchMode);
  }

  private onDown(pointer: Phaser.Input.Pointer): void {
    if (this.state === 'playing' && pointer.x > 876 && pointer.y < 70) { this.togglePause(); return; }
    if (this.state !== 'playing') return;
    const isTouch = pointer.wasTouch || (pointer.event as PointerEvent).pointerType === 'touch';
    if (isTouch) {
      this.touchMode = true; this.setTouchVisibility(); this.refreshHud();
      if (pointer.x < 355 && pointer.y > 265 && this.movePointer === null) { this.movePointer = pointer.id; this.updateJoystick(pointer); }
      else if (pointer.x > 585 && pointer.y > 250 && this.firePointer === null) { this.firePointer = pointer.id; this.updateAim(pointer); }
    } else { this.mouseDown = true; this.updateAim(pointer); }
  }

  private onMove(pointer: Phaser.Input.Pointer): void {
    if (pointer.id === this.movePointer) this.updateJoystick(pointer);
    if (pointer.id === this.firePointer || (this.mouseDown && pointer.isDown)) this.updateAim(pointer);
  }

  private onUp(pointer: Phaser.Input.Pointer): void {
    if (pointer.id === this.movePointer) { this.movePointer = null; this.joyX = 0; this.joyY = 0; this.joyKnob.setPosition(153, 399); }
    if (pointer.id === this.firePointer) this.firePointer = null;
    if (!pointer.wasTouch && (pointer.event as PointerEvent).pointerType !== 'touch') this.mouseDown = false;
  }

  private updateJoystick(pointer: Phaser.Input.Pointer): void {
    const dx = pointer.x - 153, dy = pointer.y - 399;
    const magnitude = Math.max(1, Math.hypot(dx, dy));
    const reach = Math.min(magnitude, 48);
    this.joyX = dx / magnitude * reach / 48;
    this.joyY = dy / magnitude * reach / 48;
    this.joyKnob.setPosition(153 + this.joyX * 48, 399 + this.joyY * 48);
  }

  private updateAim(pointer: Phaser.Input.Pointer): void {
    if (pointer.id === this.firePointer) {
      const dx = pointer.x - 810, dy = pointer.y - 399;
      if (Math.hypot(dx, dy) < 25) { this.aimX = 0; this.aimY = 0; }
      else { this.aimX = dx; this.aimY = dy; }
    } else { this.aimX = pointer.x - this.heroX; this.aimY = pointer.y - this.heroY; }
  }
}
