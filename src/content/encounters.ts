import type { Room } from '../core/run';

export type EnemyKind = 'chaser' | 'shooter' | 'sentry' | 'brute' | 'boss';

export const SPAWNS: Record<EnemyKind, { x: number; y: number }> = {
  chaser: { x: 175, y: 155 }, shooter: { x: 780, y: 158 }, sentry: { x: 780, y: 158 },
  brute: { x: 762, y: 323 }, boss: { x: 760, y: 260 },
};

export function encounterFor(room: Room): EnemyKind[] {
  if (room.kind === 'boss') return ['boss'];
  const enemies: EnemyKind[] = ['chaser', room.biome === 'forge' ? 'sentry' : 'shooter'];
  if (room.kind !== 'start') enemies.push('brute');
  return enemies;
}
