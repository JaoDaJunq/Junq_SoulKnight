import type { OBSTACLES } from './arena';

export type Direction = 'north' | 'east' | 'south' | 'west';
export type Room = {
  id: number;
  x: number;
  y: number;
  neighbors: Partial<Record<Direction, number>>;
  obstacles: typeof OBSTACLES;
};

const DIRECTIONS: { direction: Direction; dx: number; dy: number; opposite: Direction }[] = [
  { direction: 'north', dx: 0, dy: -1, opposite: 'south' },
  { direction: 'east', dx: 1, dy: 0, opposite: 'west' },
  { direction: 'south', dx: 0, dy: 1, opposite: 'north' },
  { direction: 'west', dx: -1, dy: 0, opposite: 'east' },
];

function random(seed: number): () => number {
  let value = seed >>> 0;
  return () => {
    value = (Math.imul(value, 1664525) + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

export function generateRun(seed: number): Room[] {
  const rand = random(seed);
  const rooms: Room[] = Array.from({ length: 6 }, (_, id) => ({
    id, x: id % 3, y: Math.floor(id / 3), neighbors: {},
    obstacles: id % 2 === 0
      ? [{ x: 296, y: 206, w: 72, h: 68 }, { x: 610, y: 326, w: 72, h: 68 }]
      : [{ x: 296, y: 326, w: 72, h: 68 }, { x: 610, y: 206, w: 72, h: 68 }],
  }));
  const visited = new Set([0]);
  const stack = [0];
  while (stack.length) {
    const room = rooms[stack[stack.length - 1]];
    const choices = DIRECTIONS.filter(({ dx, dy }) =>
      rooms.some(candidate => candidate.x === room.x + dx && candidate.y === room.y + dy && !visited.has(candidate.id)));
    if (!choices.length) { stack.pop(); continue; }
    const edge = choices[Math.floor(rand() * choices.length)];
    const next = rooms.find(candidate => candidate.x === room.x + edge.dx && candidate.y === room.y + edge.dy)!;
    room.neighbors[edge.direction] = next.id;
    next.neighbors[edge.opposite] = room.id;
    visited.add(next.id);
    stack.push(next.id);
  }
  return rooms;
}
