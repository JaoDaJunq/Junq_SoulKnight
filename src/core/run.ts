import type { OBSTACLES } from './arena';

export type Direction = 'north' | 'east' | 'south' | 'west';
export type RoomKind = 'start' | 'combat' | 'reward' | 'boss';
export type Room = {
  id: number;
  x: number;
  y: number;
  neighbors: Partial<Record<Direction, number>>;
  obstacles: typeof OBSTACLES;
  kind: RoomKind;
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

export function parseRunSeed(value: string | null): number | null {
  if (value === null || !/^(0|[1-9]\d*)$/.test(value)) return null;
  const seed = Number(value);
  return Number.isSafeInteger(seed) && seed <= 0xffffffff ? seed : null;
}

export function generateRun(seed: number): Room[] {
  const rand = random(seed);
  const rooms: Room[] = Array.from({ length: 6 }, (_, id) => ({
    id, x: id % 3, y: Math.floor(id / 3), neighbors: {}, kind: id === 0 ? 'start' : 'combat',
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
  const distances = Array<number>(rooms.length).fill(-1);
  const parent = Array<number>(rooms.length).fill(-1);
  distances[0] = 0;
  const queue = [0];
  while (queue.length) {
    const id = queue.shift()!;
    for (const next of Object.values(rooms[id].neighbors)) {
      if (next === undefined || distances[next] !== -1) continue;
      distances[next] = distances[id] + 1;
      parent[next] = id;
      queue.push(next);
    }
  }
  const boss = rooms.slice(1).sort((a, b) => distances[b.id] - distances[a.id] || b.id - a.id)[0];
  boss.kind = 'boss';
  const rewardIds: number[] = [];
  for (let id = parent[boss.id]; id > 0 && rewardIds.length < 2; id = parent[id]) rewardIds.push(id);
  for (const room of rooms.slice(1).sort((a, b) => distances[a.id] - distances[b.id] || a.id - b.id)) {
    if (rewardIds.length === 2) break;
    if (room.id !== boss.id && !rewardIds.includes(room.id)) rewardIds.push(room.id);
  }
  for (const id of rewardIds) rooms[id].kind = 'reward';
  return rooms;
}
