import Phaser from 'phaser';

export type ActorKind = 'hero' | 'chaser' | 'shooter' | 'brute' | 'boss';

/** Original vector silhouettes. No external sprite or font is loaded. */
export function createActor(scene: Phaser.Scene, x: number, y: number, kind: ActorKind): Phaser.GameObjects.Container {
  const g = scene.add.graphics();
  const shadow = scene.add.ellipse(2, kind === 'boss' ? 26 : 17, kind === 'boss' ? 68 : 37, 12, 0x050b14, 0.64);

  if (kind === 'hero') {
    g.fillStyle(0x071c2d); g.fillTriangle(-13, 6, 13, 6, 0, 28);
    g.fillStyle(0x17627e); g.fillTriangle(-9, 7, 9, 7, -5, 25);
    g.lineStyle(2, 0x4dd7e6); g.lineBetween(-8, 14, -5, 23);
    g.fillStyle(0x143951); g.fillRoundedRect(-15, -9, 30, 27, 9);
    g.lineStyle(3, 0x87eaf1); g.strokeRoundedRect(-15, -9, 30, 27, 9);
    g.fillStyle(0x092234); g.fillRoundedRect(-12, -18, 24, 20, 6);
    g.lineStyle(2, 0x6bcddd); g.strokeRoundedRect(-12, -18, 24, 20, 6);
    g.fillStyle(0xb8f9ec); g.fillRoundedRect(-8, -10, 16, 4, 2);
    g.fillStyle(0xf1d79b); g.fillCircle(16, 8, 4);
    g.lineStyle(2, 0x75e9ec); g.strokeCircle(16, 8, 7);
  } else if (kind === 'chaser') {
    g.fillStyle(0x4a1c35); g.fillTriangle(-18, -5, -24, -24, -5, -15);
    g.fillTriangle(18, -5, 24, -24, 5, -15);
    g.fillStyle(0x782b48); g.fillRoundedRect(-17, -16, 34, 34, 11);
    g.lineStyle(3, 0xe78984); g.strokeRoundedRect(-17, -16, 34, 34, 11);
    g.fillStyle(0xffd69c); g.fillTriangle(-10, -3, -2, 0, -9, 3);
    g.fillTriangle(10, -3, 2, 0, 9, 3);
    g.lineStyle(2, 0xf2aa88); g.lineBetween(-7, 12, 7, 12);
  } else if (kind === 'shooter') {
    g.fillStyle(0x341f55); g.fillTriangle(0, -27, 22, 8, 0, 25);
    g.fillTriangle(0, -27, -22, 8, 0, 25);
    g.lineStyle(3, 0xc7a9f6); g.strokeTriangle(0, -27, 22, 8, 0, 25);
    g.strokeTriangle(0, -27, -22, 8, 0, 25);
    g.fillStyle(0x7d63a6); g.fillCircle(0, -1, 10);
    g.fillStyle(0xf5d6ff); g.fillCircle(0, -1, 4);
  } else if (kind === 'brute') {
    g.fillStyle(0x513944); g.fillRoundedRect(-24, -19, 48, 41, 9);
    g.fillStyle(0x977052); g.fillRoundedRect(-19, -15, 38, 33, 6);
    g.lineStyle(3, 0xffd393); g.strokeRoundedRect(-19, -15, 38, 33, 6);
    g.fillStyle(0x3c2938); g.fillRoundedRect(-14, -10, 28, 11, 3);
    g.fillStyle(0xffe3ae); g.fillRect(-8, -7, 5, 3); g.fillRect(3, -7, 5, 3);
    g.lineStyle(3, 0xd8a36e); g.lineBetween(-15, 11, 15, 11);
    g.fillStyle(0xc99b72); g.fillRect(-27, 0, 7, 14); g.fillRect(20, 0, 7, 14);
  } else {
    g.fillStyle(0x3b1b3d); g.fillTriangle(-30, -12, -32, -38, -8, -24);
    g.fillTriangle(30, -12, 32, -38, 8, -24);
    g.fillStyle(0x692c4f); g.fillRoundedRect(-32, -22, 64, 52, 12);
    g.lineStyle(4, 0xf29ba0); g.strokeRoundedRect(-32, -22, 64, 52, 12);
    g.fillStyle(0x32172f); g.fillRoundedRect(-23, -13, 46, 21, 5);
    g.fillStyle(0xffd3a3); g.fillTriangle(-16, -5, -3, -2, -15, 2);
    g.fillTriangle(16, -5, 3, -2, 15, 2);
    g.lineStyle(3, 0xf7b18b); g.lineBetween(-15, 18, 15, 18);
    g.fillStyle(0xe9a17a); g.fillTriangle(-25, -27, -15, -40, -3, -25);
    g.fillTriangle(25, -27, 15, -40, 3, -25);
  }
  return scene.add.container(x, y, [shadow, g]);
}
