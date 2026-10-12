export const BOUNDS = { left: 64, right: 896, top: 93, bottom: 473 };
export const OBSTACLES = [
  { x: 296, y: 206, w: 72, h: 68 },
  { x: 610, y: 326, w: 72, h: 68 },
];

export function blocked(x: number, y: number, radius: number, obstacles = OBSTACLES): boolean {
  if (x - radius < BOUNDS.left || x + radius > BOUNDS.right || y - radius < BOUNDS.top || y + radius > BOUNDS.bottom) return true;
  return obstacles.some(o => {
    const cx = Math.max(o.x, Math.min(x, o.x + o.w));
    const cy = Math.max(o.y, Math.min(y, o.y + o.h));
    return (x - cx) ** 2 + (y - cy) ** 2 < radius ** 2;
  });
}

export function normalizedMovement(x: number, y: number): { x: number; y: number } {
  const length = Math.hypot(x, y);
  return length > 1 ? { x: x / length, y: y / length } : { x, y };
}

export type EscapeStep = { dx: number; dy: number; remaining: number };

export function moveAroundObstacle(
  x: number, y: number, vx: number, vy: number, step: number, radius: number, obstacles = OBSTACLES,
  escape?: EscapeStep,
): { x: number; y: number; escape?: EscapeStep } {
  if (vx === 0 && vy === 0) return { x, y, escape };
  if (escape && escape.remaining > 0) {
    const escapeX = x + escape.dx * step, escapeY = y + escape.dy * step;
    if (!blocked(escapeX, escapeY, radius, obstacles)) {
      return { x: escapeX, y: escapeY,
        escape: { ...escape, remaining: Math.max(0, escape.remaining - step) } };
    }
  }
  let nextX = x, nextY = y;
  if (!blocked(x + vx * step, y, radius, obstacles)) nextX = x + vx * step;
  if (!blocked(nextX, y + vy * step, radius, obstacles)) nextY = y + vy * step;
  if (nextX !== x || nextY !== y) return { x: nextX, y: nextY };

  // Quando as duas direções diretas batem numa quina, dê um passo lateral seguro.
  const alternatives = [{ x: x + step, y }, { x: x - step, y }, { x, y: y + step }, { x, y: y - step }]
    .filter(candidate => !blocked(candidate.x, candidate.y, radius, obstacles))
    .sort((a, b) => (vx * (b.x - x) + vy * (b.y - y)) - (vx * (a.x - x) + vy * (a.y - y)));
  const chosen = alternatives[0];
  return chosen ? { ...chosen, escape: { dx: Math.sign(chosen.x - x), dy: Math.sign(chosen.y - y), remaining: radius + 8 - step } } : { x, y };
}
