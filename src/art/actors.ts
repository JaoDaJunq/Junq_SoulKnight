import Phaser from 'phaser';

export type ActorKind = 'hero' | 'chaser' | 'shooter' | 'sentry' | 'brute' | 'boss';

// Silhuetas originais desenhadas em uma grade fixa, sem suavização.
const PIXELS: Record<Exclude<ActorKind, 'hero'>, string[]> = {
  chaser: [
    '...a.......a...', '..aba.....aba..', '.abbba...abbba.', '.abbbba.abbbba.',
    '..abbbbbbbbba..', '.abbbbbbbbbbba.', '.abbbweebwbbba.', '.abbbweebwbbba.',
    '.abbbbbbbbbbba.', '..abbbrrbbbba..', '..abbbbbbbbba..', '...abbbbbba...',
    '...aaabbb aaa..'.replace(/ /g, ''), '....aa..aa.....',
  ],
  shooter: [
    '......a........', '.....aba.......', '....abbba......', '...abbbbba.....',
    '..abbbbbbbba...', '.abbbbbbbbbba..', '.abbeeeebbbba..', '.abbewewbbbba..',
    '.abbeeeebbbba..', '.abbbbbbbbbba..', '..abbbbbbbba...', '..abbbbbbbba...',
    '...aaabbbaaa...', '....aa...aa....',
  ],
  sentry: [
    '..a.........a..', '.aba.......aba.', '.abbaaaaaaabba.', '.abbbbbbbbbbbba.',
    '.abbbbbbbbbbbba.', '.abbbaaaaabbba.', '.abbbaeeaabbba.', '.abbbaeeaabbba.',
    '.abbbaaaaabbba.', '.abbbbbbbbbbbba.', '.abbbrrrrbbbba.', '.abbbbbbbbbbbba.',
    '..aabbbbbbaa...', '...aa...aa.....',
  ],
  brute: [
    '...aaa...aaa...', '..abbaa.aabba..', '.abbbbbbbbbbbba.', 'abbbbbbbbbbbbba',
    'abbbbbbbbbbbbba', 'abbbbeeeebbbbba', 'abbbewwwebbbbba', 'abbbbeeeebbbbba',
    'abbbbbbbbbbbbba', 'abbbrrrrrrbbbba', 'abbbbbbbbbbbbba', '.abbbbbbbbbbbba.',
    '..aaabbbbbaaa..', '...aaa...aaa...',
  ],
  boss: [
    '...aa.......aa...', '..abba.....abba..', '.abbba.....abbba.', 'abbbbba...abbbbba',
    'abbbbbba.abbbbbba', 'abbbbbbbbbbbbbba', 'abbbbbbbbbbbbbba', 'abbbeeeeeeebbbba',
    'abbewweeeewwebba', 'abbbeeeeeeebbbba', 'abbbbbbbbbbbbbba', 'abbbrrrrrrrbbbba',
    'abbbbbbbbbbbbbba', '.abbbbbbbbbbbba.', '..aabbbbbbbbaa..', '...aaa...aaa...',
  ],
};

const PALETTES: Record<Exclude<ActorKind, 'hero'>, Record<string, number>> = {
  chaser: { a: 0x2c1a22, b: 0x8e4338, e: 0xffca71, w: 0xffedb3, r: 0xd27555 },
  shooter: { a: 0x281d29, b: 0x70516b, e: 0xc18b67, w: 0xf7d8a3, r: 0xc37a66 },
  sentry: { a: 0x352323, b: 0x946047, e: 0xf9a745, w: 0xffdc85, r: 0xc8814c },
  brute: { a: 0x312822, b: 0x957657, e: 0xc8a277, w: 0xf9df9d, r: 0xc4604a },
  boss: { a: 0x231b22, b: 0x78404b, e: 0xc17e60, w: 0xffcb92, r: 0xe4765a },
};

export function createActor(scene: Phaser.Scene, x: number, y: number, kind: ActorKind): Phaser.GameObjects.Container {
  const id = kind === 'hero' ? 'chaser' : kind;
  const rows = PIXELS[id];
  const palette = PALETTES[id];
  const pixel = kind === 'boss' ? 4 : kind === 'brute' ? 3.3 : 2.7;
  const g = scene.add.graphics();
  for (let row = 0; row < rows.length; row++) {
    for (let col = 0; col < rows[row].length; col++) {
      const color = palette[rows[row][col]];
      if (color === undefined) continue;
      g.fillStyle(color);
      g.fillRect(Math.floor((col - rows[row].length / 2) * pixel), Math.floor((row - rows.length / 2) * pixel), Math.ceil(pixel), Math.ceil(pixel));
    }
  }
  const shadow = scene.add.ellipse(2, kind === 'boss' ? 33 : 20, kind === 'boss' ? 70 : 40, 9, 0x0f0a09, 0.6);
  return scene.add.container(x, y, [shadow, g]);
}
