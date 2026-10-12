import Phaser from 'phaser';
import { blocked, normalizedMovement, OBSTACLES } from '../core/arena';

type State = 'menu' | 'playing' | 'paused' | 'dead' | 'cleared';
type EnemyKind = 'chaser' | 'shooter' | 'brute';
type Enemy = { view: Phaser.GameObjects.Container; kind: EnemyKind; x: number; y: number; hp: number; speed: number; cooldown: number };
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
  private dashTimer = 0;
  private dashCooldown = 0;
  private skillCooldown = 0;
  private lastMoveX = 0;
  private lastMoveY = -1;
  private enemies: Enemy[] = [];
  private bullets: Bullet[] = [];
  private enemyBullets: Bullet[] = [];
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
  private dashButton!: Phaser.GameObjects.Arc;
  private dashLabel!: Phaser.GameObjects.Text;
  private skillButton!: Phaser.GameObjects.Arc;
  private skillLabel!: Phaser.GameObjects.Text;
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
    this.dashButton = this.add.circle(696, 437, 34, 0x8dc5f4, 0.25).setStrokeStyle(2, 0x9bd8ff, 0.8).setDepth(20);
    this.dashLabel = this.add.text(696, 437, 'DASH', { fontFamily: 'system-ui', fontSize: '12px', color: '#e9faff', fontStyle: 'bold' }).setOrigin(0.5).setDepth(21);
    this.skillButton = this.add.circle(870, 281, 35, 0xc991ef, 0.28).setStrokeStyle(2, 0xe3bbff, 0.8).setDepth(20);
    this.skillLabel = this.add.text(870, 281, 'PULSO', { fontFamily: 'system-ui', fontSize: '11px', color: '#fbeaff', fontStyle: 'bold' }).setOrigin(0.5).setDepth(21);
    this.setTouchVisibility();

    this.keys = this.input.keyboard!.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,ESC,SPACE,E') as Record<string, Phaser.Input.Keyboard.Key>;
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

  private createEnemy(x: number, y: number, kind: EnemyKind): Enemy {
    const color = kind === 'brute' ? 0xb57b51 : kind === 'shooter' ? 0x9267bf : 0xbc526b;
    const edge = kind === 'brute' ? 0xffc286 : kind === 'shooter' ? 0xdcb1ff : 0xff9eaa;
    const radius = kind === 'brute' ? 20 : 15;
    const shadow = this.add.ellipse(2, 14, 36, 11, 0x04060d, 0.5);
    const body = this.add.circle(0, 0, radius, color).setStrokeStyle(3, edge);
    const eye1 = this.add.circle(-5, -3, 2, 0xffe6c9);
    const eye2 = this.add.circle(5, -3, 2, 0xffe6c9);
    const view = this.add.container(x, y, [shadow, body, eye1, eye2]).setDepth(9);
    return { view, kind, x, y, hp: kind === 'brute' ? 7 : kind === 'shooter' ? 3 : 3,
      speed: kind === 'brute' ? 48 : kind === 'shooter' ? 58 : 84, cooldown: kind === 'shooter' ? 1 : 0 };
  }

  private startRun(): void {
    this.clearOverlay();
    this.bullets.forEach(b => b.view.destroy());
    this.enemyBullets.forEach(b => b.view.destroy());
    this.enemies.forEach(e => e.view.destroy());
    this.bullets = [];
    this.enemyBullets = [];
    this.enemies = [
      this.createEnemy(175, 155, 'chaser'), this.createEnemy(780, 158, 'shooter'),
      this.createEnemy(168, 350, 'chaser'), this.createEnemy(762, 323, 'brute'),
    ];
    this.heroX = 480; this.heroY = 385; this.hero.setPosition(this.heroX, this.heroY);
    this.heroHp = 5; this.hurtTimer = 0; this.fireTimer = 0; this.elapsed = 0;
    this.dashTimer = 0; this.dashCooldown = 0; this.skillCooldown = 0;
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
    this.dashTimer = Math.max(0, this.dashTimer - dt);
    this.dashCooldown = Math.max(0, this.dashCooldown - dt);
    this.skillCooldown = Math.max(0, this.skillCooldown - dt);
    if (Phaser.Input.Keyboard.JustDown(this.keys.SPACE)) this.dash();
    if (Phaser.Input.Keyboard.JustDown(this.keys.E)) this.pulse();
    if (this.state !== 'playing') return;
    this.hero.setAlpha(this.hurtTimer > 0 && Math.floor(this.hurtTimer * 12) % 2 === 0 ? 0.45 : 1);

    let mx = Number(this.keys.D.isDown || this.keys.RIGHT.isDown) - Number(this.keys.A.isDown || this.keys.LEFT.isDown) + this.joyX;
    let my = Number(this.keys.S.isDown || this.keys.DOWN.isDown) - Number(this.keys.W.isDown || this.keys.UP.isDown) + this.joyY;
    ({ x: mx, y: my } = normalizedMovement(mx, my));
    if (Math.hypot(mx, my) > 0.15) { this.lastMoveX = mx; this.lastMoveY = my; }
    if (this.dashTimer > 0) { mx = this.lastMoveX; my = this.lastMoveY; }
    const speed = this.dashTimer > 0 ? 520 : 205;
    const nextX = this.heroX + mx * speed * dt;
    const nextY = this.heroY + my * speed * dt;
    if (!blocked(nextX, this.heroY, 15)) this.heroX = nextX;
    if (!blocked(this.heroX, nextY, 15)) this.heroY = nextY;
    this.hero.setPosition(this.heroX, this.heroY);

    if (this.firePointer !== null || this.mouseDown) this.fire();
    for (const enemy of this.enemies) {
      const dx = this.heroX - enemy.x, dy = this.heroY - enemy.y;
      const length = Math.max(1, Math.hypot(dx, dy));
      const preferred = enemy.kind === 'shooter' && length < 190 ? -0.65 : 1;
      const motion = enemy.kind === 'shooter' && length < 260 && length >= 190 ? 0 : preferred;
      const ex = enemy.x + dx / length * enemy.speed * dt * motion;
      const ey = enemy.y + dy / length * enemy.speed * dt * motion;
      const radius = enemy.kind === 'brute' ? 20 : 15;
      if (!blocked(ex, enemy.y, radius)) enemy.x = ex;
      if (!blocked(enemy.x, ey, radius)) enemy.y = ey;
      enemy.view.setPosition(enemy.x, enemy.y);
      enemy.cooldown = Math.max(0, enemy.cooldown - dt);
      if (enemy.kind === 'shooter' && enemy.cooldown === 0 && length < 420) {
        enemy.cooldown = 1.65;
        const shot = this.add.circle(enemy.x, enemy.y, 7, 0xf8a5d9).setStrokeStyle(2, 0xffe4fa).setDepth(8);
        this.enemyBullets.push({ view: shot, vx: dx / length * 215, vy: dy / length * 215, life: 2.4 });
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
      if (bullet.life <= 0 || blocked(bullet.view.x, bullet.view.y, 5)) { this.removeBullet(bullet); continue; }
      const target = this.enemies.find(e => Math.hypot(e.x - bullet.view.x, e.y - bullet.view.y) < (e.kind === 'brute' ? 26 : 21));
      if (!target) continue;
      target.hp--; target.view.setAlpha(0.6);
      this.time.delayedCall(80, () => { if (target.view.active) target.view.setAlpha(1); });
      this.removeBullet(bullet);
      if (target.hp <= 0) {
        target.view.destroy(); this.enemies.splice(this.enemies.indexOf(target), 1); this.refreshHud();
        if (this.enemies.length === 0) { this.finish(true); return; }
      }
    }
    for (const bullet of [...this.enemyBullets]) {
      bullet.view.x += bullet.vx * dt; bullet.view.y += bullet.vy * dt; bullet.life -= dt;
      if (bullet.life <= 0 || blocked(bullet.view.x, bullet.view.y, 7)) { this.removeEnemyBullet(bullet); continue; }
      if (Math.hypot(this.heroX - bullet.view.x, this.heroY - bullet.view.y) < 22) {
        this.removeEnemyBullet(bullet); this.damageHero();
        if (this.state !== 'playing') return;
      }
    }
    this.dashButton.setAlpha(this.dashCooldown > 0 ? 0.35 : 1);
    this.skillButton.setAlpha(this.skillCooldown > 0 ? 0.35 : 1);
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

  private removeEnemyBullet(b: Bullet): void {
    b.view.destroy();
    const index = this.enemyBullets.indexOf(b);
    if (index >= 0) this.enemyBullets.splice(index, 1);
  }

  private damageHero(): void {
    if (this.hurtTimer > 0 || this.dashTimer > 0 || this.state !== 'playing') return;
    this.hurtTimer = 1; this.heroHp--;
    this.cameras.main.shake(90, 0.005); this.refreshHud();
    if (this.heroHp <= 0) this.finish(false);
  }

  private dash(): void {
    if (this.state !== 'playing' || this.dashCooldown > 0) return;
    this.dashTimer = 0.18; this.dashCooldown = 1.8;
    const trail = this.add.circle(this.heroX, this.heroY, 20, 0x63cfff, 0.35).setDepth(7);
    this.tweens.add({ targets: trail, alpha: 0, scale: 2.2, duration: 220, onComplete: () => trail.destroy() });
  }

  private pulse(): void {
    if (this.state !== 'playing' || this.skillCooldown > 0) return;
    this.skillCooldown = 6;
    const wave = this.add.circle(this.heroX, this.heroY, 15, 0x7e97fa, 0.09).setStrokeStyle(4, 0x9dceff).setDepth(7);
    this.tweens.add({ targets: wave, radius: 135, alpha: 0, duration: 320, onComplete: () => wave.destroy() });
    for (const enemy of [...this.enemies]) {
      if (Math.hypot(enemy.x - this.heroX, enemy.y - this.heroY) > 135) continue;
      enemy.hp -= 2;
      if (enemy.hp <= 0) {
        enemy.view.destroy(); this.enemies.splice(this.enemies.indexOf(enemy), 1);
      }
    }
    this.refreshHud();
    if (this.enemies.length === 0) this.finish(true);
  }

  private refreshHud(): void {
    this.hud.setText(`❤ ${'♥'.repeat(this.heroHp)}${'♡'.repeat(5 - this.heroHp)}     ◈ ${4 - this.enemies.length}/4`);
    this.hint.setText(this.touchMode ? 'Esquerda: mover · Direita: atirar, dash e pulso' : 'WASD: mover · clique: atirar · ESPAÇO: dash · E: pulso · ESC: pausa');
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
    for (const obj of [this.joyBase, this.joyKnob, this.fireBase, this.fireLabel, this.dashButton, this.dashLabel, this.skillButton, this.skillLabel]) obj.setVisible(this.touchMode);
  }

  private onDown(pointer: Phaser.Input.Pointer): void {
    if (this.state === 'playing' && pointer.x > 876 && pointer.y < 70) { this.togglePause(); return; }
    if (this.state !== 'playing') return;
    const isTouch = pointer.wasTouch || (pointer.event as PointerEvent).pointerType === 'touch';
    if (isTouch) {
      this.touchMode = true; this.setTouchVisibility(); this.refreshHud();
      if (pointer.x < 355 && pointer.y > 265 && this.movePointer === null) { this.movePointer = pointer.id; this.updateJoystick(pointer); }
      else if (Math.hypot(pointer.x - 696, pointer.y - 437) < 40) this.dash();
      else if (Math.hypot(pointer.x - 870, pointer.y - 281) < 43) this.pulse();
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
