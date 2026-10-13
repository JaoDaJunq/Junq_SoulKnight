import { blocked, type OBSTACLES } from './arena.ts';
import { emptyAffinities, type Affinities, type ElementId } from './affinities.ts';
import type { EnemyKind } from '../content/encounters.ts';

export type AdminForm = 'base' | Exclude<ElementId, 'wind'>;
export type AdminSpawnPoint = { x: number; y: number };
export type AdminOccupiedPoint = AdminSpawnPoint & { kind: EnemyKind };

export const ADMIN_FORMS: { id: AdminForm; label: string; element: Exclude<ElementId, 'wind'> | null }[] = [
  { id: 'base', label: 'BASE', element: null },
  { id: 'earth', label: 'TERRA', element: 'earth' },
  { id: 'water', label: 'ÁGUA', element: 'water' },
  { id: 'fire', label: 'FOGO', element: 'fire' },
  { id: 'lightning', label: 'RAIO', element: 'lightning' },
  { id: 'light', label: 'LUZ', element: 'light' },
  { id: 'shadow', label: 'SOMBRA', element: 'shadow' },
];

const enemyRadius: Record<EnemyKind, number> = {
  chaser: 17, shooter: 17, sentry: 17, brute: 22, boss: 34,
};

export function adminAffinitiesFor(form: AdminForm): Affinities {
  const affinities = emptyAffinities();
  const element = ADMIN_FORMS.find(option => option.id === form)?.element;
  if (element) affinities[element] = 5;
  return affinities;
}

/** Find a safe, separated spawn position on the current room's arena. */
export function adminSpawnPoint(
  origin: AdminSpawnPoint,
  kind: EnemyKind,
  obstacles: typeof OBSTACLES,
  occupied: AdminOccupiedPoint[],
  sequence: number,
): AdminSpawnPoint | null {
  const radius = enemyRadius[kind];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  for (let attempt = 0; attempt < 48; attempt++) {
    const ring = 105 + Math.floor(attempt / 8) * 34;
    const angle = (sequence + attempt) * goldenAngle;
    const point = {
      x: origin.x + Math.cos(angle) * ring,
      y: origin.y + Math.sin(angle) * ring * 0.74,
    };
    if (blocked(point.x, point.y, radius, obstacles)) continue;
    const overlaps = occupied.some(enemy => Math.hypot(enemy.x - point.x, enemy.y - point.y)
      < radius + enemyRadius[enemy.kind] + 16);
    if (!overlaps) return point;
  }
  return null;
}
