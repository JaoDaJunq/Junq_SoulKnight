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
