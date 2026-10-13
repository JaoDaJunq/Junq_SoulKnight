import type { BiomeId } from './biomes';
import type { Room } from '../core/run';

export type EnemyKind = 'chaser' | 'shooter' | 'sentry' | 'brute' | 'boss';
export type MonsterRank = 'normal' | 'elite' | 'boss';
export type BossPattern = 'ring-fan' | 'wide-fan' | 'double-ring' | 'aimed-sweep';

export type MonsterVariant = {
  id: string;
  name: string;
  kind: EnemyKind;
  rank: MonsterRank;
  tint: number;
  hpScale: number;
  speedScale: number;
  sizeScale: number;
  bossPattern?: BossPattern;
};

export type EncounterSpawn = { kind: EnemyKind; variant?: string };

export const SPAWNS: Record<EnemyKind, { x: number; y: number }> = {
  chaser: { x: 175, y: 155 }, shooter: { x: 780, y: 158 }, sentry: { x: 780, y: 158 },
  brute: { x: 762, y: 323 }, boss: { x: 760, y: 260 },
};

export const SPAWN_POINTS = [
  { x: 175, y: 155 }, { x: 780, y: 158 }, { x: 762, y: 323 },
  { x: 205, y: 390 }, { x: 600, y: 145 }, { x: 470, y: 195 },
];

function monster(
  id: string, name: string, kind: EnemyKind, rank: MonsterRank, tint: number,
  hpScale = 1, speedScale = 1, sizeScale = 1, bossPattern?: BossPattern,
): MonsterVariant {
  return { id, name, kind, rank, tint, hpScale, speedScale, sizeScale, ...(bossPattern ? { bossPattern } : {}) };
}

/** Cada mundo tem quatro comuns, dois elites e dois chefes próprios. */
export const MONSTER_ROSTERS: Partial<Record<BiomeId, {
  normal: MonsterVariant[];
  elite: MonsterVariant[];
  bosses: MonsterVariant[];
}>> = {
  grove: {
    normal: [
      monster('spore-puffling', 'Bolinha de Esporos', 'chaser', 'normal', 0xc9e58b, 0.75, 1.15, 0.86),
      monster('thorn-rootling', 'Raiz Espinhosa', 'chaser', 'normal', 0x88a95d, 1.05, 0.9, 1.02),
      monster('mossback-beetle', 'Besouro Musgoso', 'brute', 'normal', 0xb48c51, 1.35, 0.72, 1.12),
      monster('vine-imp', 'Diabrete de Cipó', 'shooter', 'normal', 0x73c785, 0.9, 0.94, 0.94),
    ],
    elite: [
      monster('bark-stag', 'Cervo de Casca', 'brute', 'elite', 0xc4dc72, 1.9, 0.92, 1.28),
      monster('spore-witch', 'Bruxa Micelial', 'sentry', 'elite', 0xa2dfad, 1.45, 0.72, 1.18),
    ],
    bosses: [
      monster('root-colossus', 'Colosso de Raízes', 'boss', 'boss', 0xa5c779, 1.2, 0.92, 1.16, 'ring-fan'),
      monster('mycelium-queen', 'Rainha Micelial', 'boss', 'boss', 0xf2d487, 1.02, 1.08, 1.1, 'wide-fan'),
    ],
  },
  crypt: {
    normal: [
      monster('skull-cluster', 'Enxame de Crânios', 'chaser', 'normal', 0xd4c6a6, 0.88, 1.12, 0.98),
      monster('shroud-wisp', 'Vulto de Mortalha', 'shooter', 'normal', 0x91c8ad, 0.82, 1.02, 0.92),
      monster('bone-hound', 'Cão de Ossos', 'chaser', 'normal', 0xc8c0a6, 1.12, 1.05, 1.05),
      monster('coffin-beetle', 'Besouro-Caixão', 'brute', 'normal', 0x917d74, 1.3, 0.74, 1.08),
    ],
    elite: [
      monster('tomb-sentinel', 'Sentinela Tumular', 'brute', 'elite', 0xc1a97e, 2.05, 0.78, 1.3),
      monster('grave-cantor', 'Cantor das Covas', 'sentry', 'elite', 0xb1a3d2, 1.42, 0.62, 1.17),
    ],
    bosses: [
      monster('ossuary-king', 'Rei Ossuário', 'boss', 'boss', 0xd2bf91, 1.18, 0.84, 1.16, 'double-ring'),
      monster('crypt-matriarch', 'Matriarca da Cripta', 'boss', 'boss', 0x9c8bbb, 1.04, 0.96, 1.14, 'aimed-sweep'),
    ],
  },
  tide: {
    normal: [
      monster('reef-crab', 'Caranguejo de Recife', 'chaser', 'normal', 0xd78a57, 1.05, 1.02, 1),
      monster('kelp-husk', 'Afogado de Algas', 'brute', 'normal', 0x6caa8e, 1.32, 0.77, 1.08),
      monster('lantern-fish', 'Peixe-Lanterna', 'shooter', 'normal', 0x82dbe0, 0.78, 1.08, 0.9),
      monster('shell-crawler', 'Rastejante de Concha', 'chaser', 'normal', 0x9ab5a7, 1.12, 0.88, 1.02),
    ],
    elite: [
      monster('coral-guardian', 'Guardião de Coral', 'brute', 'elite', 0xefa46d, 1.95, 0.82, 1.3),
      monster('brine-oracle', 'Oráculo Salino', 'sentry', 'elite', 0x69cbd2, 1.4, 0.7, 1.17),
    ],
    bosses: [
      monster('abyssal-ray', 'Raia Abissal', 'boss', 'boss', 0x74dce2, 1.1, 1.08, 1.18, 'wide-fan'),
      monster('tide-titan', 'Titã das Marés', 'boss', 'boss', 0xd58b60, 1.25, 0.8, 1.2, 'ring-fan'),
    ],
  },
  crystal: {
    normal: [
      monster('crystal-mite', 'Ácaro de Cristal', 'chaser', 'normal', 0xa9a2ff, 0.78, 1.2, 0.9),
      monster('pebble-mimic', 'Mímico de Cascalho', 'brute', 'normal', 0xa6c8d9, 1.3, 0.74, 1.08),
      monster('shard-moth', 'Mariposa de Estilhaço', 'shooter', 'normal', 0xd5a8ef, 0.82, 1.08, 0.94),
      monster('geode-grub', 'Larva Geódica', 'chaser', 'normal', 0x84c9d3, 1.05, 0.95, 1.02),
    ],
    elite: [
      monster('prism-sentinel', 'Sentinela Prismático', 'brute', 'elite', 0xbeb1ff, 1.95, 0.82, 1.3),
      monster('prism-wisp', 'Fagulha Prismática', 'sentry', 'elite', 0x91e1e8, 1.38, 0.68, 1.14),
    ],
    bosses: [
      monster('quartz-excavator', 'Escavador de Quartzo', 'boss', 'boss', 0x9da9ef, 1.25, 0.86, 1.2, 'double-ring'),
      monster('geode-heart', 'Coração Geódico', 'boss', 'boss', 0xe6b6ff, 1.02, 0.96, 1.1, 'aimed-sweep'),
    ],
  },
  eclipse: {
    normal: [
      monster('shadowling', 'Sombrio Faminto', 'chaser', 'normal', 0x7275cf, 0.82, 1.18, 0.94),
      monster('cracked-mask', 'Máscara Rachada', 'shooter', 'normal', 0xbebce8, 0.88, 0.92, 0.98),
      monster('void-tendril', 'Tentáculo do Vazio', 'chaser', 'normal', 0x6261a3, 1.08, 1.03, 1.04),
      monster('starved-wisp', 'Fagulha Faminta', 'sentry', 'normal', 0xb2a2ff, 0.82, 0.75, 0.92),
    ],
    elite: [
      monster('eclipse-knight', 'Cavaleiro do Eclipse', 'brute', 'elite', 0xb6b5e5, 2, 0.82, 1.3),
      monster('gravity-weaver', 'Tecelão Gravitacional', 'sentry', 'elite', 0x9288e8, 1.44, 0.67, 1.16),
    ],
    bosses: [
      monster('star-eater', 'Devorador de Estrelas', 'boss', 'boss', 0x7775ed, 1.18, 0.92, 1.2, 'double-ring'),
      monster('eclipse-beast', 'Fera do Eclipse', 'boss', 'boss', 0xc7c4ee, 1.1, 1.02, 1.18, 'aimed-sweep'),
    ],
  },
};

export const MONSTER_VARIANTS: Record<string, MonsterVariant> = Object.fromEntries(
  Object.values(MONSTER_ROSTERS).flatMap(roster =>
    [...roster!.normal, ...roster!.elite, ...roster!.bosses].map(variant => [variant.id, variant] as const),
  ),
);

function seededRandom(room: Room): () => number {
  let state = (room.encounterSeed ^ Math.imul(room.world, 0x45d9f3b)) >>> 0;
  state = Math.imul(state ^ (state >>> 16), 0x7feb352d);
  state = Math.imul(state ^ (state >>> 15), 0x846ca68b);
  state = (state ^ (state >>> 16)) >>> 0;
  if (state === 0) state = 0x9e3779b9;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 0x100000000;
  };
}

function sample<T>(values: T[], count: number, random: () => number): T[] {
  const shuffled = [...values];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

export function encounterFor(room: Room): EncounterSpawn[] {
  if (room.world === 1) {
    if (room.kind === 'boss') return [{ kind: 'boss' }];
    const enemies: EncounterSpawn[] = [{ kind: 'chaser' }, { kind: room.biome === 'forge' ? 'sentry' : 'shooter' }];
    if (room.kind !== 'start') enemies.push({ kind: 'brute' });
    return enemies;
  }

  const roster = MONSTER_ROSTERS[room.biome];
  if (!roster) return room.kind === 'boss' ? [{ kind: 'boss' }] : [{ kind: 'chaser' }, { kind: 'shooter' }, { kind: 'brute' }];
  const random = seededRandom(room);
  const pick = (variant: MonsterVariant): EncounterSpawn => ({ kind: variant.kind, variant: variant.id });
  if (room.kind === 'boss') return [pick(roster.bosses[Math.floor(random() * roster.bosses.length)])];

  const count = room.stage >= 4 ? 3 : 2;
  const enemies = sample(roster.normal, count, random).map(pick);
  if (room.stage >= 4) enemies.push(pick(roster.elite[Math.floor(random() * roster.elite.length)]));
  return enemies;
}
