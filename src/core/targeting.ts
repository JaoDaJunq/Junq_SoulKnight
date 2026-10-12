import { blocked } from './arena.ts';

type Point = { x: number; y: number };
type Obstacle = { x: number; y: number; w: number; h: number };

export function closestTarget<T extends Point>(hero: Point, enemies: T[], obstacles: Obstacle[]): T | undefined {
  const sorted = [...enemies].sort((a, b) =>
    Math.hypot(a.x - hero.x, a.y - hero.y) - Math.hypot(b.x - hero.x, b.y - hero.y));
  return sorted.find(enemy => {
    const distance = Math.hypot(enemy.x - hero.x, enemy.y - hero.y);
    for (let step = 14; step < distance - 14; step += 12) {
      if (blocked(hero.x + (enemy.x - hero.x) * step / distance,
        hero.y + (enemy.y - hero.y) * step / distance, 5, obstacles)) return false;
    }
    return true;
  });
}
